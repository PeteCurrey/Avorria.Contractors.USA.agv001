/**
 * DETERMINISTIC FINANCIAL ARITHMETIC ENGINE
 *
 * All quote, proposal, and change order mathematical calculations take place here in code.
 * AI models are NEVER permitted to compute or alter monetary figures.
 */

export function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export interface QuoteMathInput {
  line_items: Array<{ description: string; quantity: number; unit_cost: number }>;
  labor_hours: number;
  labor_rate: number;
  overhead_percentage: number;
  target_margin_percentage: number;
}

export interface QuoteFinancialResult {
  subtotal_materials: number;
  subtotal_labor: number;
  direct_cost: number;
  overhead_percentage: number;
  overhead_amount: number;
  total_cost: number;
  target_margin_percentage: number;
  profit_amount: number;
  contract_price: number;
}

export function calculateQuoteFinancials(input: QuoteMathInput): QuoteFinancialResult {
  const subtotal_materials = round2(
    input.line_items.reduce((acc, item) => acc + (item.quantity * item.unit_cost), 0)
  );
  const subtotal_labor = round2(input.labor_hours * input.labor_rate);
  const direct_cost = round2(subtotal_materials + subtotal_labor);
  
  const overhead_percentage = Math.max(0, input.overhead_percentage);
  const overhead_amount = round2(direct_cost * (overhead_percentage / 100));
  const total_cost = round2(direct_cost + overhead_amount);
  
  const target_margin_percentage = Math.max(0, Math.min(99.9, input.target_margin_percentage));
  // Commercial margin formula: Margin % = (Price - Cost) / Price => Price = Cost / (1 - Margin %)
  const contract_price = target_margin_percentage >= 100 
    ? total_cost 
    : round2(total_cost / (1 - (target_margin_percentage / 100)));
  const profit_amount = round2(contract_price - total_cost);

  return {
    subtotal_materials,
    subtotal_labor,
    direct_cost,
    overhead_percentage,
    overhead_amount,
    total_cost,
    target_margin_percentage,
    profit_amount,
    contract_price,
  };
}

export interface ChangeOrderMathInput {
  original_contract_sum: number;
  prior_change_orders_sum: number;
  added_items: Array<{ description: string; quantity: number; unit_cost: number }>;
  added_labor_hours: number;
  added_labor_rate: number;
  added_overhead_margin_pct: number;
  time_extension_calendar_days: number;
  original_completion_date: string;
}

export interface ChangeOrderFinancialResult {
  original_contract_sum: number;
  prior_change_orders_sum: number;
  revised_contract_sum_before: number;
  items_subtotal: number;
  labor_subtotal: number;
  direct_delta: number;
  markup_amount: number;
  net_change_amount: number;
  new_contract_sum: number;
  time_extension_calendar_days: number;
  original_completion_date: string;
  revised_completion_date: string;
}

export function calculateChangeOrderFinancials(input: ChangeOrderMathInput): ChangeOrderFinancialResult {
  const original_contract_sum = round2(input.original_contract_sum);
  const prior_change_orders_sum = round2(input.prior_change_orders_sum);
  const revised_contract_sum_before = round2(original_contract_sum + prior_change_orders_sum);

  const items_subtotal = round2(
    input.added_items.reduce((acc, item) => acc + (item.quantity * item.unit_cost), 0)
  );
  const labor_subtotal = round2(input.added_labor_hours * input.added_labor_rate);
  const direct_delta = round2(items_subtotal + labor_subtotal);

  const markup_pct = Math.max(0, input.added_overhead_margin_pct);
  const markup_amount = round2(direct_delta * (markup_pct / 100));
  const net_change_amount = round2(direct_delta + markup_amount);
  const new_contract_sum = round2(revised_contract_sum_before + net_change_amount);

  // Calculate new date by adding calendar days
  let revised_completion_date = input.original_completion_date;
  try {
    const origDate = new Date(input.original_completion_date);
    if (!isNaN(origDate.getTime())) {
      origDate.setDate(origDate.getDate() + input.time_extension_calendar_days);
      revised_completion_date = origDate.toISOString().split('T')[0];
    }
  } catch {
    revised_completion_date = input.original_completion_date;
  }

  return {
    original_contract_sum,
    prior_change_orders_sum,
    revised_contract_sum_before,
    items_subtotal,
    labor_subtotal,
    direct_delta,
    markup_amount,
    net_change_amount,
    new_contract_sum,
    time_extension_calendar_days: input.time_extension_calendar_days,
    original_completion_date: input.original_completion_date,
    revised_completion_date,
  };
}
