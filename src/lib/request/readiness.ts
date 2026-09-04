/**
 * AVORRIA REQUEST READINESS EVALUATOR
 * Phase 9: Deterministic checklist and conflict assessment for Requirement Packs.
 *
 * Rules:
 * - 100% deterministic rules. No opaque "AI scores".
 * - Validates essential project definition, location, trades, timing, and requirements.
 * - Identifies conflicts (e.g. requirement jurisdiction != project state).
 * - Clear status message: "Ready to identify contractors" vs "Needs information before contractors can be identified".
 */

import { RequirementPack, RequestReadinessResult, ReadinessCheckItem, ReadinessConflict } from './types';

export function evaluateRequestReadiness(pack: RequirementPack): RequestReadinessResult {
  const checklist: ReadinessCheckItem[] = [];
  const conflicts: ReadinessConflict[] = [];

  // 1. Project Definition Check
  const hasTitle = Boolean(pack.title && pack.title.trim().length >= 5);
  const hasScope = Boolean((pack.scope && pack.scope.trim().length >= 10) || (pack.description && pack.description.trim().length >= 10));
  const hasProjectType = Boolean(pack.project_type && pack.project_type.trim().length > 0);
  const projectDefined = hasTitle && hasScope;

  checklist.push({
    key: 'project_defined',
    label: 'Project scope & description clearly specified',
    passed: projectDefined,
    detail: projectDefined
      ? `Project "${pack.title}" defined with detailed scope.`
      : 'Provide a descriptive title (at least 5 chars) and scope/description (at least 10 chars).',
  });

  // 2. Location Check
  const hasState = Boolean(pack.state && pack.state.trim().length === 2);
  const hasCity = Boolean(pack.city && pack.city.trim().length > 0);
  const locationDefined = hasState && hasCity;

  checklist.push({
    key: 'location_defined',
    label: 'Operating jurisdiction (State & City) specified',
    passed: locationDefined,
    detail: locationDefined
      ? `Target location: ${pack.city}, ${pack.state}`
      : 'Select valid US State (2-letter code) and City.',
  });

  // 3. Trade Selection Check
  const trades = pack.trades || [];
  const tradeSelected = trades.length > 0;

  checklist.push({
    key: 'trades_selected',
    label: 'Standardized trade classification assigned',
    passed: tradeSelected,
    detail: tradeSelected
      ? `${trades.length} trade(s) selected: ${trades.map((t) => t.trade_name).join(', ')}`
      : 'Assign at least one standardized trade from the taxonomy.',
  });

  // 4. Timing & Urgency Check
  const hasStartDate = Boolean(pack.target_start_date && pack.target_start_date.trim().length > 0);
  const hasUrgency = Boolean(pack.urgency && pack.urgency !== 'undefined');
  const timingDefined = hasStartDate || hasUrgency;

  checklist.push({
    key: 'timing_defined',
    label: 'Project schedule or urgency timeframe defined',
    passed: timingDefined,
    detail: timingDefined
      ? (hasStartDate ? `Target start: ${pack.target_start_date}` : `Urgency: ${pack.urgency}`)
      : 'Specify a target start date or select an urgency timeframe.',
  });

  // 5. Requirements Definition Check
  const requirements = pack.requirements || [];
  const hasRequirements = requirements.length > 0;

  checklist.push({
    key: 'requirements_defined',
    label: 'Structured compliance or qualification criteria added',
    passed: hasRequirements,
    detail: hasRequirements
      ? `${requirements.length} requirement(s) added (${requirements.filter((r) => r.strength === 'required').length} mandatory).`
      : 'Add at least one structured qualification, insurance, or safety requirement.',
  });

  // 6. Evidence Requirements Defined
  const evidenceReqs = requirements.filter((r) => r.evidence_required);
  const hasEvidenceCriteria = evidenceReqs.length > 0 || (hasRequirements && requirements.some((r) => ['insurance', 'licence', 'safety'].includes(r.category)));

  checklist.push({
    key: 'evidence_criteria',
    label: 'Documentary evidence criteria defined',
    passed: hasEvidenceCriteria,
    detail: hasEvidenceCriteria
      ? `${evidenceReqs.length} requirement(s) flag documentary verification required.`
      : 'Indicate which qualifications require published documentary evidence (e.g. COI, License).',
  });

  // 7. Conflict Detection
  // Check for jurisdiction mismatches (e.g. requirement state != project state)
  if (pack.state) {
    const projectStateUpper = pack.state.toUpperCase();
    for (const req of requirements) {
      if (req.jurisdiction && req.jurisdiction.trim().length === 2) {
        const reqJurisdictionUpper = req.jurisdiction.toUpperCase();
        if (reqJurisdictionUpper !== projectStateUpper) {
          conflicts.push({
            code: 'JURISDICTION_MISMATCH',
            message: `Requirement "${req.title}" specifies jurisdiction ${reqJurisdictionUpper}, but project is located in ${projectStateUpper}.`,
            affectedRequirementIds: [req.id],
          });
        }
      }
    }
  }

  // Check for completion date before start date
  if (pack.target_start_date && pack.target_completion_date) {
    const start = new Date(pack.target_start_date).getTime();
    const completion = new Date(pack.target_completion_date).getTime();
    if (completion < start) {
      conflicts.push({
        code: 'TIMELINE_INVERSION',
        message: 'Target completion date cannot precede target start date.',
      });
    }
  }

  // Summary evaluation
  const passedCount = checklist.filter((item) => item.passed).length;
  const completionPercent = Math.round((passedCount / checklist.length) * 100);
  const isReady = checklist.every((item) => item.passed) && conflicts.length === 0;

  let statusMessage: string;
  if (isReady) {
    statusMessage = 'Ready to identify contractors';
  } else if (conflicts.length > 0) {
    statusMessage = 'Conflicts detected — resolve before identifying contractors';
  } else {
    statusMessage = 'Needs information before contractors can be identified';
  }

  return {
    isReady,
    completionPercent,
    checklist,
    conflicts,
    statusMessage,
  };
}
