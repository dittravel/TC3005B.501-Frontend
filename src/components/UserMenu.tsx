/**
 * UserMenu component for displaying user options and settings.
 */

import { useState, useRef, useEffect } from "react";
import { apiRequest } from "@utils/apiClient";
import Button from "@components/Button";

interface UserMenuProps {
  children?: React.ReactNode;
}

export default function UserMenu({ children }: UserMenuProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Handle navigation to user settings
  const handleSettings = () => {
    window.location.href = "/perfil-usuario";
  };

  // Handle user logout
  const handleLogout = async () => {
    await apiRequest("/user/logout", {
      method: "GET",
    });
    window.location.href = "/login";
  };

  // Close menu when clicking outside
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
    // Container for the user menu button and dropdown
    <div className="relative h-full" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="h-full flex items-center gap-2 bg-white text-black py-1 px-3
                  rounded-full font-bold text-sm cursor-pointer
                  transition-all duration-200
                  hover:opacity-80"
        title="Menú de usuario"> {/* Tooltip */}
        {children}
      </button>
      
      {/* Dropdown Menu */}
      {showMenu && (
        <div className="absolute top-full right-0 mt-2 w-56
                       bg-card shadow-xl rounded-lg p-4 z-100
                       border border-border">
          <div className="flex flex-col gap-2">
            <Button onClick={handleSettings} color="secondary" className="w-full">
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