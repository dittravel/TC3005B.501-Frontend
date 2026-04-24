/**
 * This component renders a data table with dynamic columns and rows.
 */

import TableHeader from '@components/Table/TableHeader.tsx';
import TableRow from '@components/Table/TableRow.tsx';

interface Column {
  key: string;
  label: string;
}

interface Props {
  columns: Column[];
  rows: Record<string, any>[];
}

/**
 * DataTable component that renders a table based on the provided columns and rows.
 * @param columns - An array of column definitions, each with a key and label.
 * @param rows - An array of data objects representing the rows of the table.
 * @returns A JSX element representing the data table.
 */
export default function DataTable({ columns, rows }: Readonly<Props>) {
  const isLoading = rows.length === 0;

  if (isLoading) {
    return (
      <div className="p-4 text-center text-text-secondary">
        Cargando datos...
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-border rounded-lg">
      <table className="min-w-full bg-card">
        <TableHeader columns={columns} />
        <tbody className="divide-y divide-border">
          {rows.map((row, index) => (
            <TableRow key={String(row.request_id ?? row.id ?? index)} row={row} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
