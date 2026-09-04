import { NextRequest, NextResponse } from 'next/server';
import { getResourceBySlug } from '@/lib/resources/catalogue';
import { renderResourceToPdfBuffer } from '@/lib/resources/pdf-generator';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const resource = getResourceBySlug(slug);

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    const defaultFormData: Record<string, any> = {};
    for (const sec of resource.sections) {
      for (const field of sec.fields) {
        defaultFormData[field.id] = field.defaultValue ?? '';
      }
    }

    const pdfBuffer = await renderResourceToPdfBuffer({
      resource,
      formData: defaultFormData,
      checklists: resource.checklistItems,
      tableRows: resource.defaultTableRows,
    });

    const safeFilename = `${resource.code}_${resource.slug}.pdf`;

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${safeFilename}"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err: any) {
    console.error('Resource PDF GET error:', err);
    return NextResponse.json({ error: err.message || 'PDF export failed' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const resource = getResourceBySlug(slug);

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const formData = body.formData || {};
    const organization = body.organization;
    const checklists = body.checklists;
    const tableRows = body.tableRows;
    const referenceNumber = body.referenceNumber;

    const pdfBuffer = await renderResourceToPdfBuffer({
      resource,
      formData,
      organization,
      checklists,
      tableRows,
      referenceNumber,
    });

    const safeFilename = `${resource.code}_${resource.slug}.pdf`;

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeFilename}"`,
      },
    });
  } catch (err: any) {
    console.error('Resource PDF POST error:', err);
    return NextResponse.json({ error: err.message || 'PDF export failed' }, { status: 500 });
  }
}
