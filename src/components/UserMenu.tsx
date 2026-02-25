/**
 * UserMenu Component
 * Dropdown menu component for user account actions (settings and logout).
 * Displays a customizable button that toggles a dropdown menu on click
 * and automatically closes when clicking outside the component.
 */

import { useState, useRef, useEffect } from "react";
import { apiRequest } from "@utils/apiClient";
import Button from "@components/Button";

interface UserMenuProps {
  children?: React.ReactNode;
}

/**
 * UserMenu
 * @param {React.ReactNode} [children] - Content to display inside the menu button
 * @returns {React.ReactNode} User menu button with dropdown functionality
 */
export default function UserMenu({ children }: UserMenuProps) {
  // State for dropdown visibility
  const [showMenu, setShowMenu] = useState(false);
  // Reference to menu container for click-outside detection
  const menuRef = useRef<HTMLDivElement>(null);

  /**
   * Navigates to user profile/settings page
   */
  const handleSettings = () => {
    window.location.href = "/perfil-usuario";
  };

  /**
   * Logs out the user by calling the logout API endpoint
   * and redirects to login page
   */
  const handleLogout = async () => {
    await apiRequest("/user/logout", {
      method: "GET",
    });
    window.location.href = "/login";
  };

  /**
   * Effect hook to handle clicking outside the menu
   * Closes the dropdown when user clicks anywhere outside the component
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    // Container for user menu button and dropdown
    <div className="relative inline-block" ref={menuRef}>
      {/* Menu toggle button */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 bg-white text-primary-500 py-1 px-4
                  rounded-full font-bold text-sm cursor-pointer
                  transition-all duration-200
                  hover:bg-primary-100"
        title="Menú de usuario"
      >
        {children}
      </button>

      {/* Dropdown menu - conditionally rendered */}
      {showMenu && (
        <div className="absolute top-full right-0 mt-2 w-56
                       bg-white shadow-xl rounded-lg p-4 z-100
                       border border-gray-200">
          <div className="flex flex-col gap-2">
            <Button onClick={handleSettings} color="primary" className="w-full">
              Ajustes de Usuario
            </Button>
            <Button onClick={handleLogout} color="warning" className="w-full">
              Cerrar Sesión
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}