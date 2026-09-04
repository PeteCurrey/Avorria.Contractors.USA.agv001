import { listEvidence } from '@/lib/prove/prove-store';
import { getWorkspaceContext } from '@/lib/workspace/context';
import { VerificationHub } from './VerificationHub';

export const dynamic = 'force-dynamic';

export default async function VerificationPage() {
  const { organization } = await getWorkspaceContext();
  const evidenceItems = await listEvidence(organization.id);

  return (
    <VerificationHub
      orgId={organization.id}
      orgName={organization.name}
      evidenceItems={evidenceItems}
    />
  );
}
