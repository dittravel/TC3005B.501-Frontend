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
    <thead>
      <tr className="bg-gray-200">
        {columns.map((col) => (
            <th
              key={col.key}
              className={`px-4 py-3 font-bold text-md text-gray-700 ${
                col.key === 'action' ? 'text-center' : 'text-left'
              }`}
              >
              {col.label}
            </th>
        ))}
      </tr>
    </thead>
  );
}
