"use client";

import { SoundReport } from "@prisma/client";
import { useRouter } from "next/navigation";
import { columns } from "./columns";
import { DataTable } from "./data-table";

export function ReportPage({ data }: { data: SoundReport[] }) {
  const router = useRouter();

  const onRowClick = (row: SoundReport) => {
    router.push(`/admin/reports?id=${row.id}`);
  };

  return <DataTable columns={columns} data={data} onRowClick={onRowClick} />;
}
