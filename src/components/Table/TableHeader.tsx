/**
 * TableHeader component
 */

interface Column {
  key: string;
  label: string;
}

interface Props {
  columns: Column[];
}

/**
 * TableHeader component that renders the header of a table based on the provided columns.
 * @param columns - An array of column definitions, each with a key and label.
 * @returns A JSX element representing the table header.
 */
export default function TableHeader({ columns }: Props) {
  return (
    <thead className="bg-secondary">
      <tr>
        {columns.map((col) => (
            <th
              key={col.key}
              className={`px-4 py-3 text-left text-xs font-medium text-white ${
                col.key === 'action' ? 'text-center' : ''
              }`}
              >
              {col.label}
            </th>
        ))}
      </tr>
    </thead>
  );
}
