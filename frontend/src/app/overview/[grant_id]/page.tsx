import GrantOverviewPage from "@/components/GrantOverviewPage";

type Grant = {
  id?: string;
  name?: string;
  department?: string;
  county?: string;
  due_date?: string;
  status?: string;
};

type PageProps = {
  params: {
    grant_id: string;
  };
};

export default async function OverviewPage({ params }: PageProps) {
  const resolvedParams = await params;
  let grant: Grant | undefined;

  try {
    const response = await fetch("http://localhost:8000/api/all_grants", {
      cache: "no-store",
    });
    if (response.ok) {
      const data = await response.json();
      const grants = Array.isArray(data?.grants) ? data.grants : [];
      grant = grants.find((item: Grant) => item.id === resolvedParams.grant_id);
    }
  } catch (error) {
    grant = undefined;
  }

  return <GrantOverviewPage grantId={resolvedParams.grant_id} grant={grant} />;
}
