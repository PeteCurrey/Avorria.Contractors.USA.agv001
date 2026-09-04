import { z } from 'zod';

// ============================================================================
// 1. JHA (JOB HAZARD ANALYSIS) SCHEMA
// ============================================================================

export const JhaTaskStepSchema = z.object({
  step_number: z.number().int().positive(),
  task_description: z.string().min(2),
  equipment_materials: z.string().min(1),
  hazards: z.array(z.object({
    hazard_type: z.string(),
    description: z.string(),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
  })).min(1),
  controls: z.array(z.object({
    control_type: z.enum(['elimination', 'substitution', 'engineering', 'administrative', 'ppe']),
    description: z.string(),
    osha_subpart_reference: z.string(),
  })).min(1),
  required_ppe: z.array(z.string()).min(1),
});

export const JhaContentSchema = z.object({
  project_name: z.string().min(1),
  site_address: z.string().min(1),
  trade: z.string().min(1),
  date: z.string(),
  competent_person: z.string().optional(),
  general_site_conditions: z.string().optional(),
  tasks: z.array(JhaTaskStepSchema).min(1),
  emergency_procedures: z.string().min(1),
  review_frequency: z.string().optional(),
});

export type JhaDocumentContent = z.infer<typeof JhaContentSchema>;

// ============================================================================
// 2. JSA (JOB SAFETY ANALYSIS) SCHEMA
// ============================================================================

export const JsaStepSchema = z.object({
  step_number: z.number().int().positive(),
  step_description: z.string().min(2),
  potential_hazards: z.array(z.string()).min(1),
  control_measures: z.array(z.string()).min(1),
  required_ppe: z.array(z.string()).min(1),
  osha_subpart_reference: z.string().optional(),
});

export const JsaContentSchema = z.object({
  job_task_name: z.string().min(1),
  department_or_crew: z.string().min(1),
  location: z.string().min(1),
  date: z.string(),
  supervisor: z.string().optional(),
  steps: z.array(JsaStepSchema).min(1),
  crew_briefing_notes: z.string().optional(),
});

export type JsaDocumentContent = z.infer<typeof JsaContentSchema>;

// ============================================================================
// 3. CONSTRUCTION SAFETY PLAN SCHEMA
// ============================================================================

export const SafetyPlanSectionSchema = z.object({
  category: z.string().min(1),
  osha_subpart: z.string().optional(),
  policy_statement: z.string().min(1),
  hazard_controls: z.array(z.string()).min(1),
  mandatory_rules: z.array(z.string()).min(1),
});

export const SafetyPlanContentSchema = z.object({
  project_name: z.string().min(1),
  company_name: z.string().min(1),
  site_address: z.string().min(1),
  project_scope: z.string().min(1),
  duration_weeks: z.number().int().positive(),
  site_safety_officer: z.string().min(1),
  competent_persons: z.array(z.object({
    name: z.string(),
    role: z.string(),
    qualification: z.string(),
  })),
  sections: z.array(SafetyPlanSectionSchema).min(1),
  general_site_rules: z.array(z.string()).min(3),
  emergency_action_plan: z.object({
    nearest_hospital_address: z.string(),
    emergency_contacts: z.array(z.object({
      role: z.string(),
      name: z.string(),
      phone: z.string(),
    })),
    evacuation_route_summary: z.string(),
  }),
  toolbox_talk_schedule: z.array(z.object({
    week: z.number().int(),
    topic: z.string(),
  })),
});

export type SafetyPlanDocumentContent = z.infer<typeof SafetyPlanContentSchema>;

// ============================================================================
// 4. TOOLBOX TALK SCHEMA
// ============================================================================

export const ToolboxTalkContentSchema = z.object({
  topic: z.string().min(1),
  trade: z.string().min(1),
  date: z.string(),
  duration_minutes: z.number().int().min(5).max(30),
  osha_reference: z.string().optional(),
  summary: z.string().min(1),
  talking_points: z.array(z.string()).min(3),
  crew_discussion_questions: z.array(z.string()).min(2),
  job_site_action_item: z.string().min(1),
});

export type ToolboxTalkDocumentContent = z.infer<typeof ToolboxTalkContentSchema>;

// ============================================================================
// 5. QUOTE / PROPOSAL SCHEMA (DETERMINISTIC NUMBERS + AI NARRATIVE)
// ============================================================================

export const QuoteFinancialsSchema = z.object({
  subtotal_materials: z.number(),
  subtotal_labor: z.number(),
  direct_cost: z.number(),
  overhead_percentage: z.number(),
  overhead_amount: z.number(),
  total_cost: z.number(),
  target_margin_percentage: z.number(),
  profit_amount: z.number(),
  contract_price: z.number(),
});

export const QuoteContentSchema = z.object({
  project_name: z.string().min(1),
  client_name: z.string().min(1),
  site_address: z.string().min(1),
  date: z.string(),
  valid_until_date: z.string(),
  financials: QuoteFinancialsSchema,
  executive_summary: z.string().min(1),
  scope_of_work: z.string().min(1),
  line_items: z.array(z.object({
    description: z.string(),
    quantity: z.number(),
    unit_cost: z.number(),
    total: z.number(),
    specifications: z.string().optional(),
  })),
  labor_breakdown: z.object({
    hours: z.number(),
    burden_rate: z.number(),
    total_labor: z.number(),
  }),
  terms_and_assumptions: z.array(z.string()).min(2),
  exclusions: z.array(z.string()).min(1),
  payment_schedule: z.array(z.object({
    milestone: z.string(),
    percentage: z.number(),
    amount: z.number(),
  })),
});

export type QuoteDocumentContent = z.infer<typeof QuoteContentSchema>;

// ============================================================================
// 6. CHANGE ORDER SCHEMA (DETERMINISTIC NUMBERS + AI NARRATIVE)
// ============================================================================

export const ChangeOrderFinancialsSchema = z.object({
  original_contract_sum: z.number(),
  prior_change_orders_sum: z.number(),
  revised_contract_sum_before: z.number(),
  net_change_amount: z.number(),
  new_contract_sum: z.number(),
  time_extension_calendar_days: z.number().int(),
  original_completion_date: z.string(),
  revised_completion_date: z.string(),
});

export const ChangeOrderContentSchema = z.object({
  change_order_number: z.string().min(1),
  project_name: z.string().min(1),
  client_name: z.string().min(1),
  date: z.string(),
  reason_for_change: z.enum([
    'unforeseen_site_conditions',
    'owner_revision',
    'architectural_bulletin',
    'code_compliance',
    'other',
  ]),
  financials: ChangeOrderFinancialsSchema,
  justification_narrative: z.string().min(1),
  scope_modification_detail: z.string().min(1),
  schedule_impact_analysis: z.string().min(1),
  added_items: z.array(z.object({
    description: z.string(),
    quantity: z.number(),
    unit_cost: z.number(),
    total: z.number(),
  })),
  terms_acceptance_clause: z.string(),
});

export type ChangeOrderDocumentContent = z.infer<typeof ChangeOrderContentSchema>;

// ============================================================================
// 7. UNION & DISCRIMINATED SCHEMA
// ============================================================================

export type CreateDocumentType =
  | 'jha'
  | 'jsa'
  | 'safety_plan'
  | 'toolbox_talk'
  | 'quote'
  | 'change_order';

export const DocumentContentUnion = z.union([
  JhaContentSchema,
  JsaContentSchema,
  SafetyPlanContentSchema,
  ToolboxTalkContentSchema,
  QuoteContentSchema,
  ChangeOrderContentSchema,
]);

export type AnyDocumentContent =
  | JhaDocumentContent
  | JsaDocumentContent
  | SafetyPlanDocumentContent
  | ToolboxTalkDocumentContent
  | QuoteDocumentContent
  | ChangeOrderDocumentContent;
