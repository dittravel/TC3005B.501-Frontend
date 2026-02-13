import { useState, useRef, useEffect } from "react";
import { apiRequest } from "@utils/apiClient";

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
    <div className="relative inline-block" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 bg-white text-primary-500 py-1 px-4 rounded-full font-bold text-sm cursor-pointer transition-all duration-200 hover:bg-primary-100"
      >
        {children}
      </button>
      
      {/* Dropdown Menu */}
      {showMenu && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-white shadow-xl rounded-lg p-4 z-100 border border-gray-200">
          <div className="flex flex-col gap-2">
            <button
              onClick={handleSettings}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Ajustes de Usuario
            </button>
            <button
              onClick={handleLogout}
              className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}