/**
 * LoginForm Component
 * 
 * Provides a login form for user authentication. Handles username and password submission,
 * sets authentication cookies on successful login, and displays error messages on failure.
 */

import React, { useState } from "react";
import Button from "@/components/Buttons/Button";
import { apiRequest } from "@utils/apiClient";
import ThemeButton from "@/components/Buttons/ThemeButton";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useTheme } from "@hooks/useTheme";
import Input from "@/components/Utils/Input";

// Styles for the password input icon
const visibleIconStyle = `
  absolute right-3 top-2.5
  cursor-pointer text-text-secondary
`;

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { theme } = useTheme();

  /**
   * Handles the login form submission.
   * Clears previous session, authenticates the user, sets cookies with user credentials,
   * and redirects to dashboard on success.
   * @param {React.FormEvent} e - The form submission event
   * @returns {Promise<void>}
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Clear any existing session before login
    await apiRequest("/user/logout", {
      method: "GET",
    });

    try {

      const response = await apiRequest("/user/login", {
        method: "POST",
        data: { username, password },
      });

      // Clear error message on successful login
      setErrorMessage("");
    
      alert("Inicio de sesión exitoso");

      // Set authentication cookies to persist user session and credentials
      document.cookie = `token=${response.token}; path=/; secure; SameSite=Strict`;
      document.cookie = `role=${response.role}; path=/`;
      document.cookie = `username=${response.username}; path=/`;
      document.cookie = `user_id=${response.user_id}; path=/`;
      document.cookie = `department_id=${response.department_id}; path=/`;
      window.location.href = "/dashboard";

    } catch (error: any) {
      // Extract error message from API response or use default message
      const msg = error?.response?.data?.error || "Error al iniciar sesión";
      setErrorMessage(msg);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen w-full bg-background px-5">
      {/* Header */}
      <div className="flex justify-between items-center w-full absolute top-0 left-0 p-5 md:px-16 md:py-8">
        {/* Logo */}
        {theme === "light" ? (
          <img
            src="/logo_texto_dittravel_color.png"
            className="h-20 w-auto drop-shadow-lg"
            alt="Logo Dittravel"
          />
        ) : (
          <img
            src="/logo_texto_dittravel_blanco.png"
            className="h-20 w-auto drop-shadow-lg"
            alt="Logo Dittravel"
          />
        )}
        {/* Theme Toggle Button */}
        <ThemeButton />
      </div>
      
      {/* Main Container */}
      <div className="w-full md:w-100">
        {/* Login Form Container */}
        <div className="p-2 md:p-8
                        flex flex-col justify-center items-center
                        rounded-xl gap-10
                        md:shadow-lg md:bg-card md:border-border md:border-1"
        >
          {/* Login Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">

            {/* Form Title */}
            <div className="w-full flex flex-col justify-center items-left">
              <h2 className="text-3xl font-bold text-text-primary p-0 m-0">
                Iniciar Sesión
              </h2>
              <p className="text-sm text-text-secondary">
                Ingresa tus credenciales para continuar
              </p>
            </div>
            
            {/* Username Field */}
            <Input
              name="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Usuario"
            />

            {/* Password Field */}
            <div className="relative">
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
              />
              {showPassword ? (
                <Visibility
                  className={visibleIconStyle}
                  onClick={() => setShowPassword(false)}
                />
              ) : (
                <VisibilityOff
                  className={visibleIconStyle}
                  onClick={() => setShowPassword(true)}
                />
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="filled"
              color="secondary"
              size="medium"
            >
              Ingresar
            </Button>

            <div className="w-full border-t border-border"></div>

            <a className="text-sm text-text-secondary"
              href="forgot-password"
            >
              ¿Olvidaste tu contraseña? <span className="text-secondary hover:text-secondary-400 transition-colors">Entra aquí para recuperarla</span>
            </a>

            {/* Error Message */}
            {errorMessage && (
              <p className="text-center text-sm text-warning-500">
                {errorMessage}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
