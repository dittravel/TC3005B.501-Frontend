/**
 * This component renders a paginated list of authorization requests for an authorizer.
 * It receives the list of requests as a prop and displays them in a table format.
 * The component also handles pagination logic to show a limited number of requests per page.
 */

import { useState, useEffect } from 'react';
import DataTable from '@components/Table/DataTable';
import Pagination from '@components/Table/Pagination';
import type { UserRole } from "@type/roles";

interface Props {
  data: any[];
  type?: string;
  role: UserRole;
}

interface Column {
  key: string;
  label: string;
}

// Define the columns for the data table
const columns: Column[] = [
  { key: 'request_id', label: 'ID Viaje' },
  { key: 'status', label: 'Status' },
  { key: 'destination', label: 'Destino' },
  { key: 'departure_date', label: 'Fecha Salida' },
  { key: 'arrival_date', label: 'Fecha Llegada' },
  { key: 'action', label: 'Acciones' },
];

/**
 * Maps a request object to the format expected by the DataTable component.
 * @param request - The original request object from the API.
 * @returns An object with keys corresponding to the DataTable columns.
 */
function mapRequestToTableRow(request: Record<string, any>): Record<string, any> {
  return {
    status: request.request_status,
    request_id: request.request_id,
    destination: request.destination_country,
    arrival_date: request.ending_date,
    departure_date: request.beginning_date
  };
}

/**
 * AuthorizerRequestsList component renders a paginated list of authorization requests.
 * @param data - The array of request objects to display.
 * @param type - An optional string to specify the type of requests (e.g., "autorizaciones").
 * @param role - The user role to determine available actions.
 * @returns A React component that displays the requests in a table with pagination controls.
 */
export default function AuthorizerRequestsList({ data, type, role }: Props) {
  const requestsPerPage = 10;
  const [page, setPage] = useState(1);
  const [visibleRequests, setVisibleRequests] = useState<Record<string, any>[]>([]);
  const totalPages = Math.ceil(data.length / requestsPerPage);
  
  useEffect(() => {
    const start = (page - 1) * requestsPerPage;
    const end = start + requestsPerPage;
    
    const paged = data.slice(start, end).map(mapRequestToTableRow);
    setVisibleRequests(paged);
  }, [page, data]);
  
  return (
    <div>
      <div className="flex flex-col w-full gap-4 min-h-160">
        <DataTable columns={columns} rows={visibleRequests} type={type} role={role}/>
      </div>
      <Pagination
        totalPages={totalPages}
        page={page}
        setPage={setPage}
        maxVisible={5}
      />
    </div>
  );
}
