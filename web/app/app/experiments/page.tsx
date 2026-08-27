import { ExperimentManager } from '../../../components/experiment-manager';

export default async function ExperimentsPage({ searchParams }: { searchParams: Promise<{ opportunity?: string }> }) {
  const { opportunity } = await searchParams;
  return <ExperimentManager initialOpportunityId={opportunity} />;
}
