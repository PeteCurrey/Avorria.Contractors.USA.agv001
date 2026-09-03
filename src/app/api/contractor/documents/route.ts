import { NextResponse, type NextRequest } from 'next/server';
import { getTenantContext } from '@/lib/tenant/context';
import { addDocument, addDocumentVersion, archiveDocument, getContractorWorkspace } from '@/lib/tenant/repository';

export async function GET() {
  try {
    const tenant = await getTenantContext();
    const ws = await getContractorWorkspace(tenant.organisation.id);
    return NextResponse.json({ documents: ws.documents });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to fetch documents';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenant = await getTenantContext();
    const body = await request.json();

    if (body.parentDocumentId) {
      // New version creation
      const versionDoc = await addDocumentVersion(tenant.organisation.id, body.parentDocumentId, {
        title: body.title,
        filePath: body.filePath || `/storage/org_${tenant.organisation.id}/${Date.now()}_v2.pdf`,
        expiresAt: body.expiresAt,
        notes: body.notes,
      });
      return NextResponse.json({ success: true, document: versionDoc });
    }

    // Standard document addition
    const newDoc = await addDocument(tenant.organisation.id, {
      title: body.title,
      documentType: body.documentType,
      filePath: body.filePath || `/storage/org_${tenant.organisation.id}/${Date.now()}_${encodeURIComponent(body.title)}.pdf`,
      fileSizeBytes: body.fileSizeBytes || 1024 * 320,
      mimeType: body.mimeType || 'application/pdf',
      expiresAt: body.expiresAt,
      issuingOrg: body.issuingOrg,
      notes: body.notes,
      associatedRequirementId: body.associatedRequirementId,
    });

    return NextResponse.json({ success: true, document: newDoc });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to save document';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const tenant = await getTenantContext();
    const { searchParams } = new URL(request.url);
    const docId = searchParams.get('id');
    if (!docId) return NextResponse.json({ error: 'Missing document id' }, { status: 400 });

    const archived = await archiveDocument(tenant.organisation.id, docId);
    return NextResponse.json({ success: archived });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to archive document';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
