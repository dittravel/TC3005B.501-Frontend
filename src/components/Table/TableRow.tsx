/**
 * Table row
 **/

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
    <tr className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
      {columns.map((col) => (
        <td key={col.key} className={`py-2 border-b border-gray-200 ${col.key === 'action' ? 'text-center' : 'px-3'}`}>
          {col.key === 'action' ? (
            <a href={`/${role_href}/${row.request_id}`} className="text-blue-500 hover:text-blue-700">
              <button className="bg-primary-300 hover:bg-secondary-500 text-white font-bold py-2 px-6 rounded-md shadow-sm transition duration-300 ease-in-out">
                Ver más
              </button>
            </a>
          ) : (
            <span>{row[col.key]}</span>
          )}
        </td>
      ))}
    </tr>
  );
}

