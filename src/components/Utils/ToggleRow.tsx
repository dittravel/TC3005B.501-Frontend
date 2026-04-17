interface ToggleRowProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export default function ToggleRow({
  label,
  name,
  checked,
  onChange,
  disabled = false,
}: ToggleRowProps) {
  return (
    <label className="flex items-center justify-between w-full p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition">
      <span className="text-text-primary font-medium">
        {label}
      </span>

      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="w-6 h-6 accent-primary cursor-pointer"
      />
    </label>
  );
}