import { NextResponse, type NextRequest } from 'next/server';
import { getTenantContext } from '@/lib/tenant/context';
import {
  getGeneratedDocument,
  updateGeneratedDocument,
  finalizeGeneratedDocument,
  createGeneratedDocumentVersion,
} from '@/lib/tenant/repository';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const tenant = await getTenantContext();
    const { id } = await params;
    const doc = await getGeneratedDocument(tenant.organisation.id, id);
    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    return NextResponse.json({ document: doc });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to fetch document';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// PUT: Updates editable draft content
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const tenant = await getTenantContext();
    const { id } = await params;
    const body = await request.json();

    const updated = await updateGeneratedDocument(tenant.organisation.id, id, {
      title: body.title,
      documentPayload: body.documentPayload,
    });

    return NextResponse.json({ success: true, document: updated });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to update document';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// PATCH: Enforces mandatory human review sign-off and finalization
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const tenant = await getTenantContext();
    const { id } = await params;
    const body = await request.json();
    const { reviewerName, acknowledged } = body;

    if (!acknowledged) {
      return NextResponse.json(
        { error: 'Human review acknowledgment is required before finalising.' },
        { status: 400 }
      );
    }

    const finalized = await finalizeGeneratedDocument(
      tenant.organisation.id,
      id,
      reviewerName || 'Field Safety Lead'
    );

    return NextResponse.json({ success: true, document: finalized });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to finalize document';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// POST: Creates a new version (v2.0)
export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const tenant = await getTenantContext();
    const { id } = await params;
    const newVersion = await createGeneratedDocumentVersion(tenant.organisation.id, id);
    return NextResponse.json({ success: true, document: newVersion });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to create document version';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
