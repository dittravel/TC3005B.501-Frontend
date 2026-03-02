/**
 * Menu Button
 * 
 * A button that toggles the visibility of the sidebar.
 */

import { Menu } from "@mui/icons-material";

export default function MenuButton() {
  const handleMenuClick = () => {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) {
      sidebar.classList.toggle("hidden-sidebar");
    }
  };

  return (
    <button
      onClick={handleMenuClick}
      className="text-white cursor-pointer border-none bg-transparent p-0 hover:opacity-80 transition-opacity"
      aria-label="Toggle sidebar"
      type="button"
    >
      <Menu />
    </button>
  );
}
