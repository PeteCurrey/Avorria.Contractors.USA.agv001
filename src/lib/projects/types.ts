/**
 * Lightweight Project / Job Context for Document Generation
 * Strictly non-ERP: no scheduling, timesheets, or accounting ledgers.
 */
export interface ProjectContext {
  id?: string;
  name: string;
  clientName: string;
  clientContact?: string;
  clientEmail?: string;
  siteLocation: string;
  projectReference?: string;
  jobDescription?: string;
  startDate?: string;
  expectedCompletionDate?: string;
  trade?: string;
  scopeNotes?: string;
}
