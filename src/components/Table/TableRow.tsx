/**
 * Table row
 **/

import Button from '@components/Button';

interface Column {
  key: string;
  label: string;
}

interface Props {
  row: Record<string, any>;
  columns: Column[];
  index: number;
  role_href: string;
}

/**
 * TableRow component that renders a single row of a table based on the provided data and column definitions.
 * @param row - An object representing the data for the current row, where keys correspond to column keys.
 * @param columns - An array of column definitions, each with a key and label.
 * @param index - The index of the current row, used for styling purposes (e.g., alternating row colors).
 * @param role_href - A string that determines the href for action buttons in the row based on the user's role.
 * @returns A JSX element representing a table row.
 */
export default function TableRow({ row, columns, index, role_href }: Props) {
  return (
    <tr className={index % 2 === 0 ? 'bg-card' : 'bg-card'}>
      {columns.map((col) => (
        <td key={col.key} className={`px-4 py-4 text-sm text-text-primary ${
          col.key === 'action' ? 'text-center' : ''
        }`}>
          {col.key === 'action' ? (
            <Button color="secondary" href={`/${role_href}/${row.request_id}`} variant="filled" size="small">
              Ver más
            </Button>
          ) : (
            <span>{row[col.key]}</span>
          )}
        </td>
      ))}
    </tr>
  );
}

