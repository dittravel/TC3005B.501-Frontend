/**
 * Notifications Button
 * 
 * A button that toggles the visibility of the notifications sidebar.
 */

import { Notifications } from "@mui/icons-material";

export default function NotificationsButton() {
  const handleNotificationsClick = () => {
    const notificationsSidebar = document.getElementById("messages");
    if (notificationsSidebar) {
      notificationsSidebar.classList.toggle("open");
    }
  };

  return (
    <button
      onClick={handleNotificationsClick}
      className="text-white cursor-pointer border-none bg-transparent p-0 hover:opacity-80 transition-opacity"
      aria-label="Toggle notifications sidebar"
      type="button"
    >
      <Notifications />
    </button>
  );
}
