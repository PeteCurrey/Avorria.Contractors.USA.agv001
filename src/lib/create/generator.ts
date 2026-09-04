import Anthropic from '@anthropic-ai/sdk';
import { ZodSchema } from 'zod';
import {
  CreateDocumentType,
  JhaContentSchema,
  JsaContentSchema,
  SafetyPlanContentSchema,
  ToolboxTalkContentSchema,
  QuoteContentSchema,
  ChangeOrderContentSchema,
  AnyDocumentContent,
} from './types';
import { DOCUMENT_PROMPT_REGISTRY } from './prompts';
import { calculateQuoteFinancials, calculateChangeOrderFinancials } from './math';

const SCHEMA_MAP: Record<CreateDocumentType, ZodSchema<any>> = {
  jha: JhaContentSchema,
  jsa: JsaContentSchema,
  safety_plan: SafetyPlanContentSchema,
  toolbox_talk: ToolboxTalkContentSchema,
  quote: QuoteContentSchema,
  change_order: ChangeOrderContentSchema,
};

export interface GenerateDocOptions {
  docType: CreateDocumentType;
  userInput: Record<string, any>;
  organizationName?: string;
  forceMock?: boolean;
}

export interface GenerateDocResult {
  content: AnyDocumentContent;
  docType: CreateDocumentType;
  modelUsed: string;
  retriesAttempted: number;
}

/**
 * High-fidelity deterministic fallback mock generator for tests & offline development.
 */
export function generateMockContent(
  docType: CreateDocumentType,
  userInput: Record<string, any>
): AnyDocumentContent {
  const today = new Date().toISOString().split('T')[0];

  switch (docType) {
    case 'jha': {
      return {
        project_name: userInput.project_name || 'Commercial Facility Renovation',
        site_address: userInput.site_address || '100 Industrial Parkway, Suite 400',
        trade: userInput.trade || 'Electrical Contracting',
        date: userInput.date || today,
        competent_person: userInput.competent_person || 'Marcus Vance (Site Safety Lead)',
        general_site_conditions: 'Active multi-trade job site, 480V service feed present, temporary power active.',
        tasks: Array.isArray(userInput.tasks) && userInput.tasks.length > 0
          ? userInput.tasks.map((t: any, idx: number) => ({
              step_number: idx + 1,
              task_description: t.task_description || `Step ${idx + 1}: Execute trade work`,
              equipment_materials: t.equipment_materials || 'Hand tools, multimeter, insulated screwdrivers',
              hazards: [
                {
                  hazard_type: t.hazard_type || 'Electrical Shock / Arc Flash',
                  description: 'Exposure to energized conductors during panel hookup and lockout-tagout verification.',
                  severity: 'critical' as const,
                },
                {
                  hazard_type: 'Struck-By Falling Objects',
                  description: 'Overhead conduit installation risk to adjacent trades.',
                  severity: 'medium' as const,
                },
              ],
              controls: [
                {
                  control_type: 'engineering' as const,
                  description: 'Implement zero-energy state verification using calibrated multimeter before contact.',
                  osha_subpart_reference: 'OSHA 1926 Subpart K (Electrical)',
                },
                {
                  control_type: 'administrative' as const,
                  description: 'Establish 10ft controlled access zone with safety cones and danger signage.',
                  osha_subpart_reference: 'OSHA 1926 Subpart C (General Safety Provisions)',
                },
              ],
              required_ppe: ['Class E Hard Hat', 'NFPA 70E Arc Flash Face Shield', 'EH-Rated Safety Boots', 'Dielectric Gloves (Class 0)'],
            }))
          : [
              {
                step_number: 1,
                task_description: 'Lockout/Tagout of main 480V distribution switchgear',
                equipment_materials: 'Standard LOTO hasp, Master Lock padlocks, danger tags, Fluke multimeter',
                hazards: [
                  {
                    hazard_type: 'Electrical Arc Flash',
                    description: 'Accidental contact with live bus bars during isolation verification.',
                    severity: 'critical' as const,
                  },
                ],
                controls: [
                  {
                    control_type: 'engineering' as const,
                    description: 'De-energize upstream breaker and verify zero voltage across all three phases.',
                    osha_subpart_reference: 'OSHA 1926 Subpart K (Electrical)',
                  },
                ],
                required_ppe: ['NFPA 70E Category 2 Arc Flash Suit', 'Class 0 Insulated Gloves', 'Safety Glasses with Side Shields'],
              },
            ],
        emergency_procedures: 'Call 911 immediately in event of electrical shock. Deploy AED located at Safety Trailer B. Muster point: North Gate.',
        review_frequency: 'Daily at 06:45 AM toolbox briefing prior to permit issuance.',
      };
    }

    case 'jsa': {
      return {
        job_task_name: userInput.job_task_name || 'Rooftop HVAC Compressor Replacement',
        department_or_crew: userInput.department_or_crew || 'Mechanical Service Crew #4',
        location: userInput.location || 'Building 3 - North Roof Deck',
        date: userInput.date || today,
        supervisor: userInput.supervisor || 'David Miller (Mechanical Foreman)',
        steps: Array.isArray(userInput.steps) && userInput.steps.length > 0
          ? userInput.steps.map((s: any, idx: number) => ({
              step_number: idx + 1,
              step_description: s.step_description || `Task step ${idx + 1}`,
              potential_hazards: ['Fall from height > 15ft', 'Heavy pinch points during hoisting'],
              control_measures: ['100% tie-off to certified roof anchor', 'Tag lines on all crane loads'],
              required_ppe: ['Full body harness with shock absorber', 'ANSI hard hat', 'Cut level 4 gloves'],
              osha_subpart_reference: 'OSHA 1926 Subpart M (Fall Protection)',
            }))
          : [
              {
                step_number: 1,
                step_description: 'Rig and lift compressor unit to roof via boom crane',
                potential_hazards: ['Overhead suspended load', 'Pinch points on landing pad'],
                control_measures: ['Keep swing radius barricaded', 'Use two non-conductive tag lines', 'Qualified rigger signals crane operator'],
                required_ppe: ['High-visibility vest', 'Hard hat', 'Steel toe boots', 'Leather work gloves'],
                osha_subpart_reference: 'OSHA 1926 Subpart CC (Cranes and Derricks)',
              },
            ],
        crew_briefing_notes: 'Wind speeds must be verified below 20 mph before rigging commences. Roof hatch secured.',
      };
    }

    case 'safety_plan': {
      return {
        project_name: userInput.project_name || 'Civic Center Mechanical Modernization',
        company_name: userInput.company_name || 'Apex Mechanical Contractors',
        site_address: userInput.site_address || '500 Central Ave, Los Angeles, CA',
        project_scope: userInput.project_scope || 'Complete chiller plant overhaul, variable refrigerant flow installation, and hydronic piping.',
        duration_weeks: userInput.duration_weeks || 16,
        site_safety_officer: userInput.site_safety_officer || 'Marcus Vance, CSP',
        competent_persons: [
          { name: 'Marcus Vance', role: 'Fall Protection & Rigging', qualification: 'OSHA 30-Hour Construction / CSP' },
          { name: 'Frank Castillo', role: 'Electrical & LOTO', qualification: 'State Master Electrician / NFPA 70E Certified' },
        ],
        sections: [
          {
            category: 'Fall Protection Program',
            osha_subpart: 'OSHA 1926 Subpart M',
            policy_statement: 'Apex Mechanical enforces a strict 6-foot fall protection rule for all operations.',
            hazard_controls: [
              'All personal fall arrest systems (PFAS) must be inspected daily prior to donning.',
              'Anchor points must support at least 5,000 lbs per attached worker.',
              'Leading edge work requires warning lines positioned at least 6 feet back.',
            ],
            mandatory_rules: [
              'Zero tolerance: failure to tie off results in immediate site removal.',
              'Lanyards must be shock-absorbing and free of fraying or chemical burns.',
            ],
          },
          {
            category: 'Electrical Safety & Lockout/Tagout',
            osha_subpart: 'OSHA 1926 Subpart K',
            policy_statement: 'All electrical work must be performed in a de-energized state unless specifically permitted by client safety engineering.',
            hazard_controls: [
              'Standardized red LOTO padlocks with unique keys for each mechanic.',
              'Live-dead-live testing verification protocol.',
              'GFCI protection on all 120V temporary power outlets.',
            ],
            mandatory_rules: [
              'No live electrical work without approved energization permit.',
              'Cords with damaged jackets or missing ground pins must be cut and discarded.',
            ],
          },
        ],
        general_site_rules: [
          'Mandatory minimum PPE at all times: ANSI Z89.1 hard hat, ANSI Z87.1 glasses, high-visibility vest, safety-toe boots.',
          'Substance-free workplace: random screening enforced in accordance with company policy.',
          'All near-misses and incidents must be reported to the Site Safety Officer within 60 minutes.',
          'Housekeeping is a condition of employment: cleanup required at the end of each work shift.',
        ],
        emergency_action_plan: {
          nearest_hospital_address: 'Good Samaritan Hospital, 1225 Wilshire Blvd, Los Angeles, CA 90017',
          emergency_contacts: [
            { role: 'Site Safety Officer', name: 'Marcus Vance', phone: '+1-213-555-0182' },
            { role: 'Project Executive', name: 'Elena Rostova', phone: '+1-213-555-0199' },
            { role: 'Local Fire/EMS Dispatch', name: 'LAFD Station 11', phone: '911' },
          ],
          evacuation_route_summary: 'Exit via Stairwell A or South Loading Ramp. Assemble at North Parking Lot Flagpole.',
        },
        toolbox_talk_schedule: [
          { week: 1, topic: 'Site Onboarding, Evacuation Routes, and Mandatory PPE' },
          { week: 2, topic: 'Fall Protection: Harness Fit, Anchor Points, and Daily Inspections' },
          { week: 3, topic: 'Electrical Safety: LOTO Verification and GFCI Requirements' },
          { week: 4, topic: 'Material Handling, Crane Rigging, and Pinch Point Prevention' },
        ],
      };
    }

    case 'toolbox_talk': {
      return {
        topic: userInput.topic || 'Fall Protection & Leading Edge Awareness',
        trade: userInput.trade || 'Commercial Roofing & Mechanical',
        date: userInput.date || today,
        duration_minutes: userInput.duration_minutes || 10,
        osha_reference: 'OSHA 1926 Subpart M (1926.501 - Fall Protection)',
        summary: 'Reviewing essential fall arrest requirements, proper harness fit, and identifying leading edge hazards before commencing high-altitude roof mechanical work.',
        talking_points: [
          'Inspect your harness every single morning: look for broken stitching, UV discoloration, and distorted D-rings.',
          'Ensure your chest strap sits across the middle of your chest, not down near your stomach or up at your throat.',
          'Never tie off to electrical conduit, water pipes, or guardrails unless they are specifically stamped and engineered as certified anchorages.',
          'Maintain a minimum 6-foot setback distance from unprotected roof edges when not tied off.',
        ],
        crew_discussion_questions: [
          'What is the first step you take if you notice a tear in your lanyard webbing?',
          'Where are our approved anchor points on this specific roof zone today?',
        ],
        job_site_action_item: 'Every technician inspects their harness and lanyard with their buddy before stepping through the roof hatch today.',
      };
    }

    case 'quote': {
      const mathResult = calculateQuoteFinancials({
        line_items: userInput.line_items || [
          { description: 'Carrier 50-Ton Rooftop Air Handling Unit', quantity: 1, unit_cost: 32000 },
          { description: 'Galvanized Sheet Metal Ductwork & Fittings', quantity: 240, unit_cost: 45 },
          { description: 'Honeywell Commercial BACnet Digital Thermostats', quantity: 6, unit_cost: 420 },
        ],
        labor_hours: userInput.labor_hours || 120,
        labor_rate: userInput.labor_rate || 95,
        overhead_percentage: userInput.overhead_percentage ?? 15,
        target_margin_percentage: userInput.target_margin_percentage ?? 20,
      });

      return {
        project_name: userInput.project_name || 'Westside Medical Offices HVAC Overhaul',
        client_name: userInput.client_name || 'Pacific Healthcare Properties LLC',
        site_address: userInput.site_address || '742 Healthcare Blvd, Suite 200',
        date: userInput.date || today,
        valid_until_date: userInput.valid_until_date || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        financials: mathResult,
        executive_summary: 'Apex Mechanical Contractors is pleased to submit this comprehensive commercial proposal for the turnkey replacement and commissioning of the central air handling infrastructure at Westside Medical Offices.',
        scope_of_work: 'Demolition and environmentally certified recovery of legacy R-22 equipment, crane rigging and placement of new high-efficiency rooftop package unit, custom sheet metal duct transitions, balancing, BACnet control integration, and complete start-up testing.',
        line_items: (userInput.line_items || [
          { description: 'Carrier 50-Ton Rooftop Air Handling Unit', quantity: 1, unit_cost: 32000 },
          { description: 'Galvanized Sheet Metal Ductwork & Fittings', quantity: 240, unit_cost: 45 },
          { description: 'Honeywell Commercial BACnet Digital Thermostats', quantity: 6, unit_cost: 420 },
        ]).map((item: any) => ({
          description: item.description,
          quantity: item.quantity,
          unit_cost: item.unit_cost,
          total: item.quantity * item.unit_cost,
          specifications: 'ASHRAE 90.1 compliant with manufacturer factory warranty',
        })),
        labor_breakdown: {
          hours: userInput.labor_hours || 120,
          burden_rate: userInput.labor_rate || 95,
          total_labor: mathResult.subtotal_labor,
        },
        terms_and_assumptions: [
          'Work to be performed during standard business hours (Mon–Fri 07:00–15:30).',
          'Owner to provide clear unobstructed crane access to north parking courtyard.',
          'All existing electrical feeder wire and breaker capacity assumed adequate for new unit amperage.',
        ],
        exclusions: [
          'Structural roof truss reinforcement or deck replacement.',
          'Hazardous material abatement (asbestos/lead) if encountered in existing plenum.',
        ],
        payment_schedule: [
          { milestone: 'Mobilization & Equipment Order Deposit (30%)', percentage: 30, amount: Math.round(mathResult.contract_price * 0.30) },
          { milestone: 'Rough-in & Crane Rigging Completion (40%)', percentage: 40, amount: Math.round(mathResult.contract_price * 0.40) },
          { milestone: 'Final Commissioning, Balancing & City Sign-off (30%)', percentage: 30, amount: Math.round(mathResult.contract_price * 0.30) },
        ],
      };
    }

    case 'change_order': {
      const changeMath = calculateChangeOrderFinancials({
        original_contract_sum: userInput.original_contract_sum || 85000,
        prior_change_orders_sum: userInput.prior_change_orders_sum || 4200,
        added_items: userInput.added_items || [
          { description: 'Rerouting 4" chilled water lines around unforeseen structural beam', quantity: 40, unit_cost: 75 },
          { description: 'High-pressure isolation valves (flanged steel)', quantity: 2, unit_cost: 650 },
        ],
        added_labor_hours: userInput.added_labor_hours || 24,
        added_labor_rate: userInput.added_labor_rate || 110,
        added_overhead_margin_pct: userInput.added_overhead_margin_pct ?? 18,
        time_extension_calendar_days: userInput.time_extension_calendar_days ?? 5,
        original_completion_date: userInput.original_completion_date || '2026-11-15',
      });

      return {
        change_order_number: userInput.change_order_number || 'CO-003',
        project_name: userInput.project_name || 'Westside Medical Offices HVAC Overhaul',
        client_name: userInput.client_name || 'Pacific Healthcare Properties LLC',
        date: userInput.date || today,
        reason_for_change: userInput.reason_for_change || 'unforeseen_site_conditions',
        financials: changeMath,
        justification_narrative: 'During slab penetration for the main vertical chilled water riser on the 2nd floor, an undocumented post-tension concrete tendon pocket and cross-structural I-beam were uncovered, requiring an offset reroute of both supply and return pipe runs.',
        scope_modification_detail: 'Provide and install 40 linear feet of 4-inch flanged schedule 40 steel piping, four 90-degree elbows, two inline isolation gate valves, and seismic strut bracing.',
        schedule_impact_analysis: 'Pipe delivery and off-hours core drilling will require a 5 calendar day extension to the overall substantial completion date.',
        added_items: (userInput.added_items || [
          { description: 'Rerouting 4" chilled water lines around unforeseen structural beam', quantity: 40, unit_cost: 75 },
          { description: 'High-pressure isolation valves (flanged steel)', quantity: 2, unit_cost: 650 },
        ]).map((it: any) => ({
          description: it.description,
          quantity: it.quantity,
          unit_cost: it.unit_cost,
          total: it.quantity * it.unit_cost,
        })),
        terms_acceptance_clause: 'All provisions of the original contract dated 2026-03-01 remain in full force and effect, modified solely by this instrument upon execution by both authorized representatives.',
      };
    }
  }
}

/**
 * Main document content generation pipeline.
 * Forces Claude Messages API tool-use, validates with Zod, and retries once on schema error.
 */
export async function generateDocumentContent(
  options: GenerateDocOptions
): Promise<GenerateDocResult> {
  const { docType, userInput, forceMock } = options;
  const promptDef = DOCUMENT_PROMPT_REGISTRY[docType];
  const schema = SCHEMA_MAP[docType];

  if (!promptDef || !schema) {
    throw new Error(`Unsupported document type for generation: ${docType}`);
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  // Use high-fidelity deterministic generator if offline, test mode, or API key not set
  if (forceMock || !apiKey || apiKey.trim().length === 0 || apiKey.startsWith('mock_')) {
    const mockContent = generateMockContent(docType, userInput);
    const parsed = schema.safeParse(mockContent);
    if (!parsed.success) {
      throw new Error(`Mock generator schema mismatch: ${JSON.stringify(parsed.error.format())}`);
    }
    return {
      content: parsed.data,
      docType,
      modelUsed: 'mock-deterministic-v1',
      retriesAttempted: 0,
    };
  }

  const anthropic = new Anthropic({ apiKey });
  const modelName = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';

  // For Quotes and Change Orders, enforce server-side arithmetic BEFORE building prompt
  let precalculatedContext = '';
  if (docType === 'quote') {
    const quoteFinancials = calculateQuoteFinancials({
      line_items: userInput.line_items || [],
      labor_hours: userInput.labor_hours || 0,
      labor_rate: userInput.labor_rate || 0,
      overhead_percentage: userInput.overhead_percentage || 0,
      target_margin_percentage: userInput.target_margin_percentage || 0,
    });
    precalculatedContext = `\nIMMUTABLE SERVER-CALCULATED FINANCIALS (DO NOT ALTER):\n${JSON.stringify(quoteFinancials, null, 2)}`;
  } else if (docType === 'change_order') {
    const coFinancials = calculateChangeOrderFinancials({
      original_contract_sum: userInput.original_contract_sum || 0,
      prior_change_orders_sum: userInput.prior_change_orders_sum || 0,
      added_items: userInput.added_items || [],
      added_labor_hours: userInput.added_labor_hours || 0,
      added_labor_rate: userInput.added_labor_rate || 0,
      added_overhead_margin_pct: userInput.added_overhead_margin_pct || 0,
      time_extension_calendar_days: userInput.time_extension_calendar_days || 0,
      original_completion_date: userInput.original_completion_date || new Date().toISOString().split('T')[0],
    });
    precalculatedContext = `\nIMMUTABLE SERVER-CALCULATED FINANCIALS (DO NOT ALTER):\n${JSON.stringify(coFinancials, null, 2)}`;
  }

  const userMessageContent = `Generate the structured ${docType} document based on these specifications:\n${JSON.stringify(userInput, null, 2)}${precalculatedContext}`;

  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: userMessageContent }
  ];

  let retriesAttempted = 0;
  const maxRetries = 1;

  while (retriesAttempted <= maxRetries) {
    try {
      const response = await anthropic.messages.create({
        model: modelName,
        max_tokens: 4096,
        system: promptDef.systemPrompt,
        tools: [
          {
            name: promptDef.toolName,
            description: promptDef.toolDescription,
            input_schema: promptDef.toolInputSchema as Anthropic.Tool.InputSchema,
          },
        ],
        tool_choice: { type: 'tool', name: promptDef.toolName },
        messages,
      });

      // Extract tool call output
      const toolUseBlock = response.content.find((block) => block.type === 'tool_use');
      if (!toolUseBlock || toolUseBlock.type !== 'tool_use') {
        throw new Error('Claude did not return a structured tool response.');
      }

      const rawJson = toolUseBlock.input as Record<string, any>;

      // Inject server-calculated financials into quotes and change orders
      if (docType === 'quote') {
        rawJson.financials = calculateQuoteFinancials({
          line_items: userInput.line_items || [],
          labor_hours: userInput.labor_hours || 0,
          labor_rate: userInput.labor_rate || 0,
          overhead_percentage: userInput.overhead_percentage || 0,
          target_margin_percentage: userInput.target_margin_percentage || 0,
        });
      } else if (docType === 'change_order') {
        rawJson.financials = calculateChangeOrderFinancials({
          original_contract_sum: userInput.original_contract_sum || 0,
          prior_change_orders_sum: userInput.prior_change_orders_sum || 0,
          added_items: userInput.added_items || [],
          added_labor_hours: userInput.added_labor_hours || 0,
          added_labor_rate: userInput.added_labor_rate || 0,
          added_overhead_margin_pct: userInput.added_overhead_margin_pct || 0,
          time_extension_calendar_days: userInput.time_extension_calendar_days || 0,
          original_completion_date: userInput.original_completion_date || new Date().toISOString().split('T')[0],
        });
      }

      // Validate with Zod
      const parseResult = schema.safeParse(rawJson);
      if (parseResult.success) {
        return {
          content: parseResult.data,
          docType,
          modelUsed: response.model,
          retriesAttempted,
        };
      }

      // Validation failed: if we have retries left, append error and retry
      if (retriesAttempted < maxRetries) {
        retriesAttempted++;
        const errorMessage = `Schema validation failed on attempt ${retriesAttempted}: ${JSON.stringify(parseResult.error.format())}. Please fix the JSON structure strictly to match the tool schema.`;
        messages.push({
          role: 'assistant',
          content: response.content,
        });
        messages.push({
          role: 'user',
          content: [
            {
              type: 'tool_result',
              tool_use_id: toolUseBlock.id,
              content: errorMessage,
              is_error: true,
            },
          ],
        });
        continue;
      }

      // Max retries exceeded without passing validation
      throw new Error(`Generated document failed schema validation after ${retriesAttempted} retry: ${JSON.stringify(parseResult.error.format())}`);
    } catch (err: any) {
      if (retriesAttempted >= maxRetries) {
        throw new Error(`Generation failed permanently: ${err.message}`);
      }
      retriesAttempted++;
    }
  }

  throw new Error('Failed to generate document: maximum validation retries exceeded.');
}
