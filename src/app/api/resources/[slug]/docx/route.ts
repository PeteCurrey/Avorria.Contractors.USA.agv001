import { NextRequest, NextResponse } from 'next/server';
import { getResourceBySlug } from '@/lib/resources/catalogue';
import { renderResourceToDocxBuffer } from '@/lib/resources/docx-generator';

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

    const docxBuffer = await renderResourceToDocxBuffer({
      resource,
      formData: defaultFormData,
      checklists: resource.checklistItems,
      tableRows: resource.defaultTableRows,
    });

    const safeFilename = `${resource.code}_${resource.slug}.docx`;

    return new NextResponse(new Uint8Array(docxBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${safeFilename}"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err: any) {
    console.error('Resource DOCX GET error:', err);
    return NextResponse.json({ error: err.message || 'DOCX export failed' }, { status: 500 });
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

    const docxBuffer = await renderResourceToDocxBuffer({
      resource,
      formData,
      organization,
      checklists,
      tableRows,
      referenceNumber,
    });

    const safeFilename = `${resource.code}_${resource.slug}.docx`;

    return new NextResponse(new Uint8Array(docxBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${safeFilename}"`,
      },
    });
  } catch (err: any) {
    console.error('Resource DOCX POST error:', err);
    return NextResponse.json({ error: err.message || 'DOCX export failed' }, { status: 500 });
  }
}
