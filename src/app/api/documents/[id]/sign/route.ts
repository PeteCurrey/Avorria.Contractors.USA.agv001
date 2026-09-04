import { NextRequest, NextResponse } from 'next/server';
import { getSessionContext } from '@/lib/workspace/context';
import { signDocument } from '@/lib/create/signatures';
import { getDocument } from '@/lib/workspace/db';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionContext();
    const { id } = await context.params;

    const doc = await getDocument(id);
    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (doc.org_id !== session.organization.id) {
      return NextResponse.json({ error: 'Unauthorized access to document' }, { status: 403 });
    }

    const body = await req.json();
    const { signerName, signatureImage } = body;

    if (!signerName || !signatureImage) {
      return NextResponse.json(
        { error: 'signerName and signatureImage are required' },
        { status: 400 }
      );
    }

    // Extract IP safely from headers
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const clientIp = (forwardedFor ? forwardedFor.split(',')[0].trim() : realIp) || '127.0.0.1';

    const signedDoc = await signDocument({
      documentId: id,
      signerName,
      signatureImage,
      signerIp: clientIp,
    });

    return NextResponse.json({
      success: true,
      document: signedDoc,
      message: 'Document digitally executed and locked.',
    });
  } catch (err: any) {
    console.error('Digital signature error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to sign document' },
      { status: 400 }
    );
  }
}
