import { NextRequest, NextResponse } from 'next/server';
import { getSessionContext } from '@/lib/workspace/context';
import { generateDocumentContent } from '@/lib/create/generator';
import { createDocumentVersion } from '@/lib/create/signatures';
import { saveDocument } from '@/lib/workspace/db';
import { calculateReadinessScore } from '@/lib/workspace/readiness';
import { CreateDocumentType } from '@/lib/create/types';
import { WorkspaceDocument, Organization } from '@/lib/workspace/types';
import { getClientIdentifier, checkPublicRateLimit } from '@/lib/create/rate-limiter';
import { renderDocumentToPdfBuffer } from '@/lib/create/pdf';
import { assertCanGenerateDocument, getEntitlements } from '@/lib/billing/entitlements';
import { incrementMonthlyGenerationUsage } from '@/lib/billing/metering';

export const dynamic = 'force-dynamic';

const VALID_DOC_TYPES: CreateDocumentType[] = [
  'jha',
  'jsa',
  'safety_plan',
  'toolbox_talk',
  'quote',
  'change_order',
];

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ docType: string }> }
) {
  try {
    const { docType } = await context.params;

    if (!VALID_DOC_TYPES.includes(docType as CreateDocumentType)) {
      return NextResponse.json(
        { error: `Invalid document type: ${docType}. Must be one of: ${VALID_DOC_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { userInput, parent_document_id, title } = body;

    if (!userInput || typeof userInput !== 'object') {
      return NextResponse.json(
        { error: 'Invalid payload: userInput object is required.' },
        { status: 400 }
      );
    }

    // Determine whether this is an unauthenticated public tool request
    const hasOrgCookie = !!req.cookies.get('avorria_workspace_org')?.value;
    const hasSupaCookie = req.cookies.getAll().some((c) => c.name.startsWith('sb-'));
    const isExplicitPublic = body.isPublic === true || req.headers.get('x-public-tool') === 'true';
    const hasOrgHeader = !!req.headers.get('x-org-id') || !!body.orgId;
    const isPublic = isExplicitPublic || (!hasOrgCookie && !hasSupaCookie && !hasOrgHeader);

    if (isPublic) {
      // ── PUBLIC UNAUTHENTICATED PATH ──
      // 1. Strict rate limit check (max 3 generations per session/IP)
      const clientId = getClientIdentifier(req);
      const rateLimit = checkPublicRateLimit(clientId, true);

      if (!rateLimit.allowed) {
        return NextResponse.json(
          {
            error: "You've reached the free generation limit. Create a free account to generate unlimited documents with your company branding.",
            code: 'RATE_LIMIT_EXCEEDED',
            remaining: 0,
            limit: rateLimit.limit,
          },
          { status: 429 }
        );
      }

      const orgName =
        userInput.company_name ||
        userInput.contractor_name ||
        userInput.project_name ||
        'Avorria Contractor';

      // 2. Generate schema-validated document content
      const generationResult = await generateDocumentContent({
        docType: docType as CreateDocumentType,
        userInput,
        organizationName: orgName,
        forceMock: body.forceMock || process.env.NODE_ENV === 'test',
      });

      // 3. Construct ephemeral in-memory document (zero DB persistence)
      const ephemeralDoc: WorkspaceDocument = {
        id: `doc_pub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        org_id: 'public_unauthenticated',
        type: docType as any,
        title: title || `${orgName} - ${docType.replace('_', ' ').toUpperCase()}`,
        version: 1,
        generated_by: 'ai',
        created_by_user_id: 'public_guest',
        content: generationResult.content,
        is_signed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // 4. Render real, fully-formatted PDF buffer with Avorria public branding
      const publicOrg: Organization = {
        id: 'org_public_guest',
        name: orgName,
        legal_name: orgName,
        entity_type: 'LLC',
        ein: 'XX-XXXXXXX',
        primary_trade: userInput.trade || 'Commercial Specialty Trade',
        additional_trades: [],
        states_licensed: ['USA'],
        hq_address: {
          street: userInput.site_address || '100 Commercial Way',
          city: 'Austin',
          state: 'TX',
          zip: '78701',
        },
        subscription_tier: 'free',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const pdfBuffer = await renderDocumentToPdfBuffer({
        document: ephemeralDoc,
        organization: publicOrg,
        isPublic: true,
      });

      const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');

      return NextResponse.json({
        success: true,
        document: ephemeralDoc,
        pdfBase64,
        rateLimit: {
          remaining: rateLimit.remaining,
          limit: rateLimit.limit,
        },
        modelUsed: generationResult.modelUsed,
        retriesAttempted: generationResult.retriesAttempted,
      });
    }

    // ── AUTHENTICATED WORKSPACE PATH ──
    // When body.orgId / x-org-id header is present (internal/test calls), resolve
    // the org directly from the DB — avoids calling next/headers cookies() outside
    // a request scope during test execution.
    const injectOrgId = body.orgId || req.headers.get('x-org-id');
    let sessionOrg: import('@/lib/workspace/types').Organization;
    let sessionUser: import('@/lib/workspace/types').WorkspaceUser;

    if (injectOrgId) {
      const { getOrganization: getOrg } = await import('@/lib/workspace/db');
      const injectedOrg = await getOrg(injectOrgId);
      if (!injectedOrg) {
        return NextResponse.json({ error: `Unknown orgId: ${injectOrgId}` }, { status: 400 });
      }
      sessionOrg = injectedOrg;
      // Fabricate a minimal user for the test path
      sessionUser = {
        id: 'test-user',
        org_id: injectedOrg.id,
        role: 'owner',
        full_name: 'Test User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } else {
      const session = await getSessionContext();
      sessionOrg = session.organization;
      sessionUser = session.user;
    }

    // Strict server-side plan entitlement check
    const entitlementCheck = await assertCanGenerateDocument(
      sessionOrg.id,
      docType as CreateDocumentType
    );

    if (!entitlementCheck.allowed) {
      return NextResponse.json(
        {
          error: entitlementCheck.reason,
          code: 'ENTITLEMENT_RESTRICTED',
          upgradeTier: entitlementCheck.upgradeTier,
        },
        { status: 403 }
      );
    }

    const generationResult = await generateDocumentContent({
      docType: docType as CreateDocumentType,
      userInput,
      organizationName: sessionOrg.name,
      forceMock: body.forceMock || process.env.NODE_ENV === 'test',
    });

    let savedDocument: WorkspaceDocument;

    if (parent_document_id) {
      savedDocument = await createDocumentVersion(
        parent_document_id,
        generationResult.content,
        title,
        body.change_summary || 'AI-assisted version iteration'
      );
    } else {
      const now = new Date().toISOString();
      const defaultTitle =
        title ||
        `${sessionOrg.name} - ${docType.replace('_', ' ').toUpperCase()}`;

      savedDocument = await saveDocument({
        id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        org_id: sessionOrg.id,
        type: docType as any,
        title: defaultTitle,
        version: 1,
        generated_by: 'ai',
        created_by_user_id: sessionUser.id,
        content: generationResult.content,
        is_signed: false,
        created_at: now,
        updated_at: now,
      });
    }

    // Recalculate readiness score for authenticated org
    await calculateReadinessScore(sessionOrg.id);

    // Track monthly document generation usage for metering
    await incrementMonthlyGenerationUsage(sessionOrg.id);
    const updatedEntitlements = await getEntitlements(sessionOrg.id);

    let pdfBase64: string | undefined;
    if (body.includePdf) {
      const pdfBuffer = await renderDocumentToPdfBuffer({
        document: savedDocument,
        organization: sessionOrg,
        isPublic: false,
      });
      pdfBase64 = Buffer.from(pdfBuffer).toString('base64');
    }

    return NextResponse.json({
      success: true,
      document: savedDocument,
      pdfBase64,
      entitlements: {
        tier: updatedEntitlements.tier,
        remainingGenerations: updatedEntitlements.limits.remainingGenerationsThisMonth,
        usedGenerations: updatedEntitlements.limits.usedGenerationsThisMonth,
      },
      modelUsed: generationResult.modelUsed,
      retriesAttempted: generationResult.retriesAttempted,
    });
  } catch (err: any) {
    console.error('Document generation API error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to generate document' },
      { status: 500 }
    );
  }
}

