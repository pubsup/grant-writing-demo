import GrantOverviewTeamPage from "@/components/GrantOverviewTeamPage";

type PageProps = {
  params: {
    grant_id: string;
  };
};

export default async function OverviewTeamPage({ params }: PageProps) {
  const resolvedParams = await params;
  return <GrantOverviewTeamPage grantId={resolvedParams.grant_id} />;
}
