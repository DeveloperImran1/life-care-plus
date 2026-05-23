import TablePagination from "@/components/table/TablePagination";
import { TableSkeleton } from "@/components/table/TableSkeleton";
import { queryStringFormatter } from "@/lib/helpers/formatters";
import { Suspense } from "react";
import { getLogs, getLogStats } from "./_services";
import MonitoringHeader from "./_components/MonitoringHeader";
import MonitoringStats from "./_components/MonitoringStats";
import MonitoringFilters from "./_components/MonitoringFilters";
import LogsTable from "./_components/LogsTable";

const SystemMonitoringPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const searchParamsObj = await searchParams;
  const queryString = queryStringFormatter(searchParamsObj);

  const [logsResult, statsResult] = await Promise.all([
    getLogs(queryString),
    getLogStats(),
  ]);

  const totalPages = Math.ceil(
    (logsResult?.meta?.total || 1) / (logsResult?.meta?.limit || 10),
  );

  return (
    <div className="space-y-6">
      {/* <MonitoringHeader /> */}
      <MonitoringStats stats={statsResult} />
      <MonitoringFilters />

      <Suspense fallback={<TableSkeleton columns={9} rows={10} />}>
        <LogsTable logs={logsResult?.data || []} />

        {logsResult?.meta?.total > 0 && (
          <div className="mt-4">
            <TablePagination
              currentPage={logsResult?.meta?.page || 1}
              totalPages={totalPages || 1}
            />
          </div>
        )}
      </Suspense>
    </div>
  );
};

export default SystemMonitoringPage;
