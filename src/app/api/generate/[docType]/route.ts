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
    const isPublic = isExplicitPublic || (!hasOrgCookie && !hasSupaCookie);

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
    const session = await getSessionContext();

    const generationResult = await generateDocumentContent({
      docType: docType as CreateDocumentType,
      userInput,
      organizationName: session.organization.name,
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
        `${session.organization.name} - ${docType.replace('_', ' ').toUpperCase()}`;

      savedDocument = await saveDocument({
        id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        org_id: session.organization.id,
        type: docType as any,
        title: defaultTitle,
        version: 1,
        generated_by: 'ai',
        created_by_user_id: session.user.id,
        content: generationResult.content,
        is_signed: false,
        created_at: now,
        updated_at: now,
      });
    }

    // Recalculate readiness score for authenticated org
    await calculateReadinessScore(session.organization.id);

    let pdfBase64: string | undefined;
    if (body.includePdf) {
      const pdfBuffer = await renderDocumentToPdfBuffer({
        document: savedDocument,
        organization: session.organization,
        isPublic: false,
      });
      pdfBase64 = Buffer.from(pdfBuffer).toString('base64');
    }

    return NextResponse.json({
      success: true,
      document: savedDocument,
      pdfBase64,
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

