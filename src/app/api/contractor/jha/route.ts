import { NextResponse, type NextRequest } from 'next/server';
import { getTenantContext } from '@/lib/tenant/context';
import { generateJhaDocumentDraft } from '@/lib/ai/jha-generator';
import { saveGeneratedDocument, finalizeGeneratedDocument } from '@/lib/tenant/repository';

export async function POST(request: NextRequest) {
  try {
    const tenant = await getTenantContext();
    const input = await request.json();

    // Generate draft using provider-agnostic JHA engine
    const result = await generateJhaDocumentDraft(input);

    // Persist as draft in generated_documents
    const saved = await saveGeneratedDocument(tenant.organisation.id, {
      title: result.documentTitle,
      documentType: 'jha',
      documentPayload: result.payload as unknown as Record<string, unknown>,
      aiAssisted: result.generationMethod === 'ai',
      generationMethod: result.generationMethod,
      generationModel: result.generationModel,
    });

    return NextResponse.json({
      success: true,
      document: saved,
      disclaimer: result.disclaimer,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to generate JHA';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const tenant = await getTenantContext();
    const body = await request.json();
    const { documentId, reviewerName, acknowledged } = body;

    if (!documentId) return NextResponse.json({ error: 'Missing documentId' }, { status: 400 });
    if (!acknowledged) {
      return NextResponse.json(
        { error: 'Mandatory human review gate: Contractor must confirm document review before finalising.' },
        { status: 400 }
      );
    }

    const finalized = await finalizeGeneratedDocument(
      tenant.organisation.id,
      documentId,
      reviewerName || 'Field Safety Lead'
    );

    return NextResponse.json({ success: true, document: finalized });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to finalize JHA';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
