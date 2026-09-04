import React from 'react';
import { notFound } from 'next/navigation';
import { getSessionContext } from '@/lib/workspace/context';
import { CreateDocumentType } from '@/lib/create/types';
import { CreateWizardClient } from './CreateWizardClient';

export const dynamic = 'force-dynamic';

const VALID_TYPES: CreateDocumentType[] = [
  'jha',
  'jsa',
  'safety_plan',
  'toolbox_talk',
  'quote',
  'change_order',
];

interface PageProps {
  params: Promise<{ type: string }>;
}

export default async function CreateWizardPage({ params }: PageProps) {
  const session = await getSessionContext();
  const { type } = await params;

  if (!VALID_TYPES.includes(type as CreateDocumentType)) {
    notFound();
  }

  return (
    <CreateWizardClient
      docType={type as CreateDocumentType}
      organization={session.organization}
      user={session.user}
    />
  );
}
