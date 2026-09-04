import { NextResponse, type NextRequest } from 'next/server';
import { getTenantContext } from '@/lib/tenant/context';
import { generateUniversalDocumentDraft } from '@/lib/documents/engine';
import { saveGeneratedDocument, getContractorWorkspace } from '@/lib/tenant/repository';

export async function GET() {
  try {
    const tenant = await getTenantContext();
    const ws = await getContractorWorkspace(tenant.organisation.id);
    const docs = (ws.generatedDocuments || []).map((d) => ({
      id: d.id,
      title: d.title,
      document_type: d.document_type,
      document_status: d.document_status,
      generation_method: d.generation_method,
      version_number: d.version_number,
      created_at: d.created_at,
    }));
    return NextResponse.json({ documents: docs });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to fetch documents';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenant = await getTenantContext();
    const ws = await getContractorWorkspace(tenant.organisation.id);
    const body = await request.json();

    const contractorContext = {
      name: ws.organisation.name,
      legalName: ws.organisation.legal_name ?? undefined,
      phone: ws.organisation.phone ?? undefined,
      email: ws.organisation.email ?? undefined,
      website: ws.organisation.website ?? undefined,
      primaryTrade: ws.trades[0] || 'general-contracting',
      primaryState: ws.serviceAreas.primaryState || 'TX',
      licenseNumber: ws.baselineCredentials.hasTradeLicense ? 'Verified State License' : undefined,
    };

    const result = await generateUniversalDocumentDraft(body, contractorContext);

    const saved = await saveGeneratedDocument(tenant.organisation.id, {
      title: result.title,
      documentType: result.documentType,
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
    const errorMessage = err instanceof Error ? err.message : 'Failed to generate document';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
