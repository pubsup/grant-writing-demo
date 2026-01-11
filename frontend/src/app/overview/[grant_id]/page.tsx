import GrantOverviewPage from "@/components/GrantOverviewPage";

type PageProps = {
  params: {
    grant_id: string;
  };
};

export default async function OverviewPage({ params }: PageProps) {
  const resolvedParams = await params;
  return <GrantOverviewPage grantId={resolvedParams.grant_id} />;
}
