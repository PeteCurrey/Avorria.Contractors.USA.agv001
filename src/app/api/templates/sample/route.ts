import { NextRequest, NextResponse } from 'next/server';
import { generateDocumentContent } from '@/lib/create/generator';
import { renderDocumentToPdfBuffer } from '@/lib/create/pdf';
import { CreateDocumentType } from '@/lib/create/types';
import { WorkspaceDocument, Organization } from '@/lib/workspace/types';

export const dynamic = 'force-dynamic';

const DEFAULT_SAMPLE_INPUTS: Record<CreateDocumentType, Record<string, any>> = {
  jha: {
    project_name: 'Metro Center Commercial Electrical Feeder Pull',
    trade: 'Electrical Contracting',
    site_address: '400 Congress Ave, Austin TX',
    competent_person: 'Marcus Vance, Lead Safety Supervisor',
    tasks: [
      { task_description: 'Lockout/Tagout isolation of main 480V switchgear' },
      { task_description: 'Overhead conduit installation from scissor lift' },
    ],
  },
  jsa: {
    job_task_name: 'Rooftop Package Chiller Crane Rigging & Placement',
    department_or_crew: 'Mechanical Service Crew #2',
    location: 'Building B - North Roof Deck',
    supervisor: 'David Miller, Rigging Supervisor',
    steps: [
      { step_description: 'Inspect synthetic slings, shackles, and crane outrigger pads' },
      { step_description: 'Establish 20ft exclusion zone beneath aerial swing radius' },
      { step_description: 'Hoist unit to roof curb and secure mechanical vibration isolators' },
    ],
  },
  safety_plan: {
    project_name: 'Southwest Logistics Hub Facility Construction',
    site_safety_officer: 'Marcus Vance, CHST',
    duration_weeks: 24,
    general_contractor: 'Turnkey Commercial Builders LLC',
    jurisdiction: 'Texas / OSHA Region 6',
  },
  toolbox_talk: {
    topic: 'Fall Protection: 100% Tie-Off & Leading Edge Awareness',
    trade: 'Commercial Roofing & Steel Framing',
    duration_minutes: 10,
    osha_reference: 'OSHA 1926 Subpart M (1926.501)',
  },
  quote: {
    project_name: 'Centennial Medical Clinic Switchgear Replacement',
    client_name: 'Pacific Healthcare Real Estate LLC',
    site_address: '742 Medical Way, Suite 300, Austin TX',
    line_items: [
      { description: '480V 800A Main Distribution Panel & Shunt Trip Breaker', quantity: 1, unit_cost: 16500 },
      { description: 'Copper Conductor 500kcmil THHN (Spools)', quantity: 4, unit_cost: 3400 },
      { description: 'Rigid Galvanized Conduit 4" with Fittings', quantity: 80, unit_cost: 72 },
    ],
    labor_hours: 140,
    labor_rate: 95,
    overhead_percentage: 15,
    target_margin_percentage: 20,
  },
  change_order: {
    project_name: 'Westside Logistics Distribution Hub',
    change_order_number: 'CO-003',
    reason_for_change: 'unforeseen_conditions',
    added_items: [
      { description: 'Rerouting feeder raceway around unforeseen structural grade beam', quantity: 45, unit_cost: 85 },
      { description: 'Heavy-duty steel pull box with NEMA 3R enclosure', quantity: 2, unit_cost: 950 },
    ],
    added_labor_hours: 28,
    added_labor_rate: 105,
    added_overhead_margin_pct: 18,
    time_extension_calendar_days: 4,
  },
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const typeParam = (searchParams.get('type') || 'jha').toLowerCase();

    const docType: CreateDocumentType =
      typeParam === 'job-hazard-analysis-jha' || typeParam === 'jha'
        ? 'jha'
        : typeParam === 'job-safety-analysis-jsa' || typeParam === 'jsa'
        ? 'jsa'
        : typeParam === 'construction-safety-plan' || typeParam === 'safety_plan'
        ? 'safety_plan'
        : typeParam === 'toolbox-talk' || typeParam === 'toolbox_talk'
        ? 'toolbox_talk'
        : typeParam === 'contractor-quote-calculator' || typeParam === 'quote'
        ? 'quote'
        : 'jha';

    const sampleInputs = DEFAULT_SAMPLE_INPUTS[docType];
    const orgName = 'Avorria Commercial Safety Standard';

    // 1. Generate real structured document content
    const genResult = await generateDocumentContent({
      docType,
      userInput: sampleInputs,
      organizationName: orgName,
      forceMock: true,
    });

    // 2. Build ephemeral sample document
    const sampleDoc: WorkspaceDocument = {
      id: `sample_${docType}_${Date.now().toString().slice(-6)}`,
      org_id: 'public_sample',
      type: docType as any,
      title: `SAMPLE: ${docType.replace(/_/g, ' ').toUpperCase()}`,
      version: 1,
      generated_by: 'ai',
      created_by_user_id: 'public_sample',
      content: genResult.content,
      is_signed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const sampleOrg: Organization = {
      id: 'org_sample_public',
      name: 'Avorria Contractor Operating System',
      legal_name: 'Avorria Contractor Operating System',
      entity_type: 'LLC',
      ein: 'XX-XXXXXXX',
      primary_trade: sampleInputs.trade || 'Commercial Specialty Trade',
      additional_trades: [],
      states_licensed: ['USA'],
      hq_address: {
        street: '100 Construction Way',
        city: 'Austin',
        state: 'TX',
        zip: '78701',
      },
      subscription_tier: 'free',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 3. Render real branded PDF
    const pdfBuffer = await renderDocumentToPdfBuffer({
      document: sampleDoc,
      organization: sampleOrg,
      isPublic: true,
    });

    const filename = `avorria_sample_${docType}.pdf`;

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err: any) {
    console.error('Template sample generation error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to render sample template' },
      { status: 500 }
    );
  }
}
