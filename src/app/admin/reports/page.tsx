import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { api } from "~/trpc/server";
import { ReportPage } from "./report-page";

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ id: string }>;
}) {
  const data = await api.admin.reports();
  const { id } = await searchParams;

  return (
    <div className="container mx-auto py-10">
      <Dialog open={!!id}>
        <DialogHeader>
          <DialogTitle>Report</DialogTitle>
        </DialogHeader>
        <DialogContent>test</DialogContent>
      </Dialog>
      <ReportPage data={data} />
    </div>
  );
}
