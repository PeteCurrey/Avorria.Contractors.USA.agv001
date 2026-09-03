import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { analytics } from '@/lib/analytics';

const LeadSchema = z.object({
  email: z.string().email(),
  fullName: z.string().optional(),
  companyName: z.string().optional(),
  phone: z.string().optional(),
  trade: z.string().optional(),
  stateProvince: z.string().optional(),
  funnelStage: z.enum([
    'visitor',
    'tool_interaction',
    'lead',
    'signup',
    'onboarding',
    'first_document',
    'compliance_setup',
    'passport_creation',
    'verification',
    'subscription',
  ]).default('lead'),
  sourceUrl: z.string().optional(),
  utmParams: z.record(z.unknown()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const result = LeadSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid lead payload', details: result.error.format() },
        { status: 400 }
      );
    }

    const leadData = result.data;

    // Track lead capture event in analytics bus
    await analytics.trackLeadCapture(
      leadData.funnelStage,
      leadData.sourceUrl || request.url,
      {
        email: leadData.email,
        companyName: leadData.companyName,
        trade: leadData.trade,
        state: leadData.stateProvince,
      }
    );

    // Return sanitized acknowledgement (Never expose internal tenant credentials or private data)
    return NextResponse.json(
      {
        success: true,
        message: 'Lead captured successfully',
        funnelStage: leadData.funnelStage,
      },
      {
        status: 201,
        headers: {
          'X-Robots-Tag': 'noindex, nofollow',
        },
      }
    );
  } catch (err) {
    console.error('[API /api/leads] Error processing lead:', err);
    return NextResponse.json(
      { error: 'Internal server error processing lead' },
      { status: 500 }
    );
  }
}
