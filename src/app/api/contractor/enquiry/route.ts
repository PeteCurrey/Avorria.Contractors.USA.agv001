import { NextResponse, type NextRequest } from 'next/server';
import { submitContractorEnquiry } from '@/lib/enquiry/service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const forwardedFor = request.headers.get('x-forwarded-for');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

    const result = await submitContractorEnquiry(body, clientIp);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: result.message.includes('Too many') ? 429 : 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      enquiryId: result.enquiryId,
    });
  } catch {
    return NextResponse.json(
      { error: 'An unexpected error occurred while delivering your enquiry.' },
      { status: 500 }
    );
  }
}
