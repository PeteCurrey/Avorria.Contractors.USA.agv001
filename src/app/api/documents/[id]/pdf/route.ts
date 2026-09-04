import { NextRequest, NextResponse } from 'next/server';
import { getDocument, getOrganization } from '@/lib/workspace/db';
import { renderDocumentToPdfBuffer } from '@/lib/create/pdf';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const doc = await getDocument(id);

    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const org = await getOrganization(doc.org_id);
    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Optional watermark query param (e.g. for preview)
    const watermark = req.nextUrl.searchParams.get('watermark') || undefined;

    const pdfBuffer = await renderDocumentToPdfBuffer({
      document: doc,
      organization: org,
      watermark,
    });

    const safeTitle = (doc.title || 'document').replace(/[^a-zA-Z0-9-_]/g, '_');

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${safeTitle}_v${doc.version}.pdf"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err: any) {
    console.error('PDF generation error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
