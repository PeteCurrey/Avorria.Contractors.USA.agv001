import { CreateDocumentType } from './types';

export interface PromptDefinition {
  systemPrompt: string;
  toolName: string;
  toolDescription: string;
  toolInputSchema: Record<string, any>;
}

export const DOCUMENT_PROMPT_REGISTRY: Record<CreateDocumentType, PromptDefinition> = {
  // ── 1. JOB HAZARD ANALYSIS (JHA) ──
  jha: {
    toolName: 'save_jha_document',
    toolDescription: 'Output the structured OSHA-aligned Job Hazard Analysis (JHA) JSON.',
    systemPrompt: `You are an expert US construction safety engineer and OSHA compliance specialist.
Your role is to produce a structured, thorough, and job-ready Job Hazard Analysis (JHA).

CRITICAL INSTRUCTIONS:
1. Break down every task step into specific hazards, OSHA-aligned controls, and required PPE.
2. For control measures, prioritize the OSHA Hierarchy of Controls (Elimination, Substitution, Engineering, Administrative, PPE).
3. REFERENCE OSHA SUBPARTS:
   - Fall Protection: OSHA 1926 Subpart M
   - Electrical Safety: OSHA 1926 Subpart K
   - Excavations & Trenching: OSHA 1926 Subpart P
   - Scaffolding: OSHA 1926 Subpart L
   - Ladders & Stairways: OSHA 1926 Subpart X
   - Cranes & Rigging: OSHA 1926 Subpart CC
   - Personal Protective Equipment: OSHA 1926 Subpart E
   - General Safety Provisions: OSHA 1926 Subpart C
4. IMPORTANT: NEVER fabricate or invent precise section paragraph numbers (e.g. do not guess 1926.502(d)(16)(iii)). Reference the reliable general subpart title (e.g. "OSHA 1926 Subpart M (Fall Protection)").
5. Output MUST be returned via the tool 'save_jha_document'. Do not output any markdown prose outside the tool call.`,
    toolInputSchema: {
      type: 'object',
      properties: {
        project_name: { type: 'string' },
        site_address: { type: 'string' },
        trade: { type: 'string' },
        date: { type: 'string' },
        competent_person: { type: 'string' },
        general_site_conditions: { type: 'string' },
        tasks: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              step_number: { type: 'integer' },
              task_description: { type: 'string' },
              equipment_materials: { type: 'string' },
              hazards: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    hazard_type: { type: 'string' },
                    description: { type: 'string' },
                    severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] }
                  },
                  required: ['hazard_type', 'description', 'severity']
                }
              },
              controls: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    control_type: { type: 'string', enum: ['elimination', 'substitution', 'engineering', 'administrative', 'ppe'] },
                    description: { type: 'string' },
                    osha_subpart_reference: { type: 'string' }
                  },
                  required: ['control_type', 'description', 'osha_subpart_reference']
                }
              },
              required_ppe: { type: 'array', items: { type: 'string' } }
            },
            required: ['step_number', 'task_description', 'equipment_materials', 'hazards', 'controls', 'required_ppe']
          }
        },
        emergency_procedures: { type: 'string' },
        review_frequency: { type: 'string' }
      },
      required: ['project_name', 'site_address', 'trade', 'date', 'tasks', 'emergency_procedures']
    }
  },

  // ── 2. JOB SAFETY ANALYSIS (JSA) ──
  jsa: {
    toolName: 'save_jsa_document',
    toolDescription: 'Output the structured task-level Job Safety Analysis (JSA) JSON.',
    systemPrompt: `You are an expert US construction safety supervisor.
Generate a focused Job Safety Analysis (JSA) specifically scoped to a single distinct work task or crew operation.

CRITICAL INSTRUCTIONS:
1. Provide actionable, concise step-by-step safety controls for field crews.
2. Focus on physical site realities (pinch points, line of fire, tool inspection, PPE).
3. Reference general OSHA 1926 subparts where applicable. Never fabricate uncertain citations.
4. Output strictly through the 'save_jsa_document' tool call.`,
    toolInputSchema: {
      type: 'object',
      properties: {
        job_task_name: { type: 'string' },
        department_or_crew: { type: 'string' },
        location: { type: 'string' },
        date: { type: 'string' },
        supervisor: { type: 'string' },
        steps: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              step_number: { type: 'integer' },
              step_description: { type: 'string' },
              potential_hazards: { type: 'array', items: { type: 'string' } },
              control_measures: { type: 'array', items: { type: 'string' } },
              required_ppe: { type: 'array', items: { type: 'string' } },
              osha_subpart_reference: { type: 'string' }
            },
            required: ['step_number', 'step_description', 'potential_hazards', 'control_measures', 'required_ppe']
          }
        },
        crew_briefing_notes: { type: 'string' }
      },
      required: ['job_task_name', 'department_or_crew', 'location', 'date', 'steps']
    }
  },

  // ── 3. CONSTRUCTION SAFETY PLAN ──
  safety_plan: {
    toolName: 'save_safety_plan_document',
    toolDescription: 'Output the comprehensive project-level Construction Safety Plan JSON.',
    systemPrompt: `You are an OSHA Compliance Director writing a formal, project-specific Site Safety & Health Plan (HASP).
This is a long-form governing document establishing high standards of safety leadership.

CRITICAL INSTRUCTIONS:
1. Group policies into well-defined sections (Fall Protection, Electrical, Excavation, Hazard Communication, PPE, Emergency).
2. Detail competent persons, emergency hospital address, evacuation routes, and 4-week toolbox talk rotation.
3. Use authoritative, professional US commercial construction terminology.
4. Output strictly through the 'save_safety_plan_document' tool call.`,
    toolInputSchema: {
      type: 'object',
      properties: {
        project_name: { type: 'string' },
        company_name: { type: 'string' },
        site_address: { type: 'string' },
        project_scope: { type: 'string' },
        duration_weeks: { type: 'integer' },
        site_safety_officer: { type: 'string' },
        competent_persons: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              role: { type: 'string' },
              qualification: { type: 'string' }
            },
            required: ['name', 'role', 'qualification']
          }
        },
        sections: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              category: { type: 'string' },
              osha_subpart: { type: 'string' },
              policy_statement: { type: 'string' },
              hazard_controls: { type: 'array', items: { type: 'string' } },
              mandatory_rules: { type: 'array', items: { type: 'string' } }
            },
            required: ['category', 'policy_statement', 'hazard_controls', 'mandatory_rules']
          }
        },
        general_site_rules: { type: 'array', items: { type: 'string' } },
        emergency_action_plan: {
          type: 'object',
          properties: {
            nearest_hospital_address: { type: 'string' },
            emergency_contacts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  role: { type: 'string' },
                  name: { type: 'string' },
                  phone: { type: 'string' }
                },
                required: ['role', 'name', 'phone']
              }
            },
            evacuation_route_summary: { type: 'string' }
          },
          required: ['nearest_hospital_address', 'emergency_contacts', 'evacuation_route_summary']
        },
        toolbox_talk_schedule: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              week: { type: 'integer' },
              topic: { type: 'string' }
            },
            required: ['week', 'topic']
          }
        }
      },
      required: [
        'project_name', 'company_name', 'site_address', 'project_scope', 'duration_weeks',
        'site_safety_officer', 'competent_persons', 'sections', 'general_site_rules',
        'emergency_action_plan', 'toolbox_talk_schedule'
      ]
    }
  },

  // ── 4. TOOLBOX TALK ──
  toolbox_talk: {
    toolName: 'save_toolbox_talk_document',
    toolDescription: 'Output the 5-10 minute crew Toolbox Safety Talk JSON.',
    systemPrompt: `You are an experienced construction field superintendent giving a morning tailgate or toolbox safety talk.
Keep the content concise, practical, and conversational (5-10 minutes speaking length).

CRITICAL INSTRUCTIONS:
1. Provide a sharp summary of the safety topic.
2. 3-5 bulleted practical talking points focused on immediate job site hazards.
3. 2-3 interactive crew questions to prompt engagement from tradespeople.
4. One concrete daily action item for the site.
5. Output strictly via the 'save_toolbox_talk_document' tool call.`,
    toolInputSchema: {
      type: 'object',
      properties: {
        topic: { type: 'string' },
        trade: { type: 'string' },
        date: { type: 'string' },
        duration_minutes: { type: 'integer', minimum: 5, maximum: 30 },
        osha_reference: { type: 'string' },
        summary: { type: 'string' },
        talking_points: { type: 'array', items: { type: 'string' } },
        crew_discussion_questions: { type: 'array', items: { type: 'string' } },
        job_site_action_item: { type: 'string' }
      },
      required: ['topic', 'trade', 'date', 'duration_minutes', 'summary', 'talking_points', 'crew_discussion_questions', 'job_site_action_item']
    }
  },

  // ── 5. QUOTE / PROPOSAL ──
  quote: {
    toolName: 'save_quote_narrative',
    toolDescription: 'Output the commercial scope and terms narrative wrapper for a contractor quote.',
    systemPrompt: `You are a senior commercial construction estimator and proposal writer.
You are generating the professional narrative wrapper for a trade contractor proposal.

ABSOLUTE FINANCIAL RULES:
1. The server has ALREADY calculated all math (subtotals, labor, overhead, profit margin, contract price).
2. You MUST NOT calculate or alter any monetary numbers. The financial numbers passed in the prompt are final and immutable.
3. Your job is SOLELY to write the compelling executive summary, formal scope of work narrative, detailed specifications, commercial assumptions, exclusions, and milestone descriptions.
4. Output strictly through the 'save_quote_narrative' tool call.`,
    toolInputSchema: {
      type: 'object',
      properties: {
        project_name: { type: 'string' },
        client_name: { type: 'string' },
        site_address: { type: 'string' },
        date: { type: 'string' },
        valid_until_date: { type: 'string' },
        executive_summary: { type: 'string' },
        scope_of_work: { type: 'string' },
        line_items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              description: { type: 'string' },
              quantity: { type: 'number' },
              unit_cost: { type: 'number' },
              total: { type: 'number' },
              specifications: { type: 'string' }
            },
            required: ['description', 'quantity', 'unit_cost', 'total']
          }
        },
        terms_and_assumptions: { type: 'array', items: { type: 'string' } },
        exclusions: { type: 'array', items: { type: 'string' } },
        payment_schedule: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              milestone: { type: 'string' },
              percentage: { type: 'number' },
              amount: { type: 'number' }
            },
            required: ['milestone', 'percentage', 'amount']
          }
        }
      },
      required: [
        'project_name', 'client_name', 'site_address', 'date', 'valid_until_date',
        'executive_summary', 'scope_of_work', 'line_items', 'terms_and_assumptions',
        'exclusions', 'payment_schedule'
      ]
    }
  },

  // ── 6. CHANGE ORDER ──
  change_order: {
    toolName: 'save_change_order_narrative',
    toolDescription: 'Output the contractual justification and scope delta narrative for a Change Order.',
    systemPrompt: `You are a commercial construction contract administrator.
You are preparing a formal, legally sound Change Order justification document.

ABSOLUTE FINANCIAL RULES:
1. The server has ALREADY computed all cost deltas, net adjustment, and revised completion dates.
2. Do not recalculate or modify numbers. Embed the server-supplied financial figures directly into your response.
3. Write rigorous justification narrative explaining the contract necessity (unforeseen site condition, owner revision, architectural bulletin, or code compliance).
4. Output strictly through the 'save_change_order_narrative' tool call.`,
    toolInputSchema: {
      type: 'object',
      properties: {
        change_order_number: { type: 'string' },
        project_name: { type: 'string' },
        client_name: { type: 'string' },
        date: { type: 'string' },
        reason_for_change: {
          type: 'string',
          enum: ['unforeseen_site_conditions', 'owner_revision', 'architectural_bulletin', 'code_compliance', 'other']
        },
        justification_narrative: { type: 'string' },
        scope_modification_detail: { type: 'string' },
        schedule_impact_analysis: { type: 'string' },
        added_items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              description: { type: 'string' },
              quantity: { type: 'number' },
              unit_cost: { type: 'number' },
              total: { type: 'number' }
            },
            required: ['description', 'quantity', 'unit_cost', 'total']
          }
        },
        terms_acceptance_clause: { type: 'string' }
      },
      required: [
        'change_order_number', 'project_name', 'client_name', 'date', 'reason_for_change',
        'justification_narrative', 'scope_modification_detail', 'schedule_impact_analysis',
        'added_items', 'terms_acceptance_clause'
      ]
    }
  }
};
