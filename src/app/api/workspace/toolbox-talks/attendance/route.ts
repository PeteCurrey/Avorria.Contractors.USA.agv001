import { NextRequest, NextResponse } from 'next/server';
import { getSessionContext } from '@/lib/workspace/context';
import { saveToolboxTalkAttendance } from '@/lib/workspace/db';
import { calculateReadinessScore } from '@/lib/workspace/readiness';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionContext();
    const body = await req.json();

    const { topic, date, attendee_names, document_id } = body;

    if (!topic || !attendee_names || !Array.isArray(attendee_names) || attendee_names.length === 0) {
      return NextResponse.json(
        { error: 'Topic and at least one attendee name are required.' },
        { status: 400 }
      );
    }

    const attendanceRecord = await saveToolboxTalkAttendance({
      id: `tba_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      org_id: session.organization.id,
      topic,
      date: date || new Date().toISOString().split('T')[0],
      attendee_names,
      document_id: document_id || undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Recalculate readiness score (toolbox talk logs boost Document readiness score by +10 pts)
    await calculateReadinessScore(session.organization.id);

    return NextResponse.json({
      success: true,
      attendance: attendanceRecord,
      message: 'Toolbox talk crew attendance recorded successfully.',
    });
  } catch (err: any) {
    console.error('Toolbox talk attendance error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to record attendance' },
      { status: 500 }
    );
  }
}
