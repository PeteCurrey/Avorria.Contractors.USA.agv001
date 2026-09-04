import { NextRequest, NextResponse } from 'next/server';
import { getSessionContext } from '@/lib/workspace/context';
import { generateDocumentContent } from '@/lib/create/generator';
import { createDocumentVersion } from '@/lib/create/signatures';
import { saveDocument } from '@/lib/workspace/db';
import { calculateReadinessScore } from '@/lib/workspace/readiness';
import { CreateDocumentType } from '@/lib/create/types';
import { WorkspaceDocument } from '@/lib/workspace/types';

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
    const session = await getSessionContext();
    const { docType } = await context.params;

    if (!VALID_DOC_TYPES.includes(docType as CreateDocumentType)) {
      return NextResponse.json(
        { error: `Invalid document type: ${docType}. Must be one of: ${VALID_DOC_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { userInput, parent_document_id, title } = body;

    if (!userInput || typeof userInput !== 'object') {
      return NextResponse.json(
        { error: 'Invalid payload: userInput object is required.' },
        { status: 400 }
      );
    }

    // Generate structured content via Claude Messages API with forced tool-use & Zod validation
    const generationResult = await generateDocumentContent({
      docType: docType as CreateDocumentType,
      userInput,
      organizationName: session.organization.name,
      forceMock: body.forceMock || process.env.NODE_ENV === 'test',
    });

    let savedDocument: WorkspaceDocument;

    // If regenerating an existing document, increment version and preserve prior version
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

    // Automatically trigger readiness score recalculation
    await calculateReadinessScore(session.organization.id);

    return NextResponse.json({
      success: true,
      document: savedDocument,
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
