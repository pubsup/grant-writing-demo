import GrantOverviewQuestionsPage from "@/components/GrantOverviewQuestionsPage";

type PageProps = {
  params: {
    grant_id: string;
  };
};

export default async function OverviewQuestionsPage({ params }: PageProps) {
  const resolvedParams = await params;
  return <GrantOverviewQuestionsPage grantId={resolvedParams.grant_id} />;
}
