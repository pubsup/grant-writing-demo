import GrantOverviewDocumentsPage from "@/components/GrantOverviewDocumentsPage";

type PageProps = {
  params: {
    grant_id: string;
  };
};

export default async function OverviewDocumentsPage({ params }: PageProps) {
  const resolvedParams = await params;
  return <GrantOverviewDocumentsPage grantId={resolvedParams.grant_id} />;
}
