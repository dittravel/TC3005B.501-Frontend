/**
 * This component renders a data table with dynamic columns and rows.
 */

import TableHeader from '@components/Table/TableHeader.tsx';
import TableRow from '@components/Table/TableRow.tsx';
import type { UserRole } from "@type/roles";

interface Column {
  key: string;
  label: string;
}

interface Props {
  columns: Column[];
  rows: Record<string, any>[];
  role: UserRole; 
  type?: string;
}

// Mapping of user roles to their corresponding href values for action buttons in the table
const roleDictionary = {
  'N1': "autorizar-solicitud",
  'N2': "autorizar-solicitud",
  'Cuentas por pagar': "cotizar-solicitud",
  'Agencia de viajes': "atender-solicitud",
} as const;

type ValidRole = keyof typeof roleDictionary;

// Determines the href for action buttons based on the user's role and an optional type parameter
function getRoleHref(role: UserRole, type: string): string {
  if (type) {
    return type;
  }
  if (role in roleDictionary) {
    return roleDictionary[role as ValidRole];
  }
  return "error";
}

/**
 * DataTable component that renders a table based on the provided columns and rows.
 * @param columns - An array of column definitions, each with a key and label.
 * @param rows - An array of data objects representing the rows of the table.
 * @param type - An optional parameter that can override the default href for action buttons.
 * @param role - The user's role, used to determine action button links.
 * @returns A JSX element representing the data table.
 */
export default function DataTable({ columns, rows, type, role }: Props) {
  const isLoading = rows.length === 0;
  const roleHref = getRoleHref(role, type ?? "");

  if (isLoading) {
    return (
      <div className="p-4 text-center text-gray-500">
        Cargando datos...
      </div>
    );
  }

  return (
    <div className="rounded-md shadow-md overflow-hidden">
      <table className="min-w-full bg-white">
        <TableHeader columns={columns} />
        <tbody>
          {rows.map((row, index) => (
            <TableRow key={index} row={row} columns={columns} index={index} role_href={roleHref}/>
          ))}
        </tbody>
      </table>
    </div>
  );
}
