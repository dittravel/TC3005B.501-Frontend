/**
 * LoginForm Component
 * 
 * Provides a login form for user authentication. Handles username and password submission,
 * sets authentication cookies on successful login, and displays error messages on failure.
 */

import React, { useState, useEffect } from "react";
import Button from "@/components/Buttons/Button";
import { apiRequest } from "@utils/apiClient";
import ThemeButton from "@/components/Buttons/ThemeButton";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useTheme } from "@hooks/useTheme";
import Input from "@/components/Utils/Input";
import Reminder from "@/components/Utils/Reminder";

// Styles for the password input icon
const visibleIconStyle = `
  absolute right-3 top-1/2
  cursor-pointer text-text-secondary
`;

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('expired') === 'true') {
        setSessionExpiredMessage('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  /**
   * Handles the login form submission.
   * Clears previous session, authenticates the user, sets cookies with user credentials,
   * and redirects to dashboard on success.
   * @param {React.FormEvent} e - The form submission event
   * @returns {Promise<void>}
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiRequest("/user/login", {
        method: "POST",
        data: { username, password },
      });

      // Clear error message on successful login
      setErrorMessage("");

      // Persist session cookies in the frontend domain for Astro/React reads.
      const isHttps = window.location.protocol === "https:";
      const secureAttr = isHttps ? "; Secure" : "";
      const commonAttrs = `; Path=/; SameSite=Lax${secureAttr}`;
      const oneHour = 60 * 60;

      document.cookie = `token=${encodeURIComponent(response.token)}${commonAttrs}; Max-Age=${oneHour}`;
      document.cookie = `role=${encodeURIComponent(response.role)}${commonAttrs}; Max-Age=${oneHour}`;
      document.cookie = `username=${encodeURIComponent(response.username)}${commonAttrs}; Max-Age=${oneHour}`;
      document.cookie = `id=${encodeURIComponent(response.user_id)}${commonAttrs}; Max-Age=${oneHour}`;
      document.cookie = `department_id=${encodeURIComponent(response.department_id)}${commonAttrs}; Max-Age=${oneHour}`;
      window.location.href = "/dashboard";

    } catch (error: any) {
      // Extract error message from API response or use default message
      const msg = error?.response?.error || "Error al iniciar sesión";
      setErrorMessage(msg);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen w-screen md:p-6">
      {/* Main Container */}
      <div className="
        w-full h-full
        grid grid-cols-1 md:grid-cols-2
        gap-4 items-center justify-center
        bg-background-secondary
        md:border md:border-border md:rounded-lg md:shadow-2xl
        "
      >
        {/* Left Section */}
        <div className="
          hidden md:flex flex-col justify-end 
          gap-2 p-12 
          w-full h-full border-border rounded-l-lg
          relative
          "
        >
          {
          /**
           * Backgorund Image
           * Ref:
           * Alghozy. (s.f.). Elementos esenciales de viaje como maleta, pasaporte y cámara. Unsplash.
           * https://unsplash.com/es/ilustraciones/elementos-esenciales-de-viaje-como-maleta-pasaporte-y-camara-3FmAo4JBvLM
           */
          }
          <img
            src="login-bg.png"
            alt="Background"
            className="absolute inset-0 w-full h-full 
            object-cover rounded-l-lg opacity-50"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-secondary to-transparent rounded-l-lg"></div>
          {/* Text */}
          <div className="text-white text-4xl relative z-10">
            <h2 className="font-serif italic">Cada viaje,</h2>
            <h2 className="font-bold">gestionado sin fricción.</h2>
          </div>
          <h3 className="text-white/50 text-lg relative z-10">
            Sistema de Gestión de Viajes
          </h3>
          <a 
            href="https://unsplash.com/es/ilustraciones/elementos-esenciales-de-viaje-como-maleta-pasaporte-y-camara-3FmAo4JBvLM"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/50 text-xs hover:text-white/70 transition-colors relative z-10 underline"
          >
            Ilustración de Alghozy en Unsplash
          </a>
        </div>

        {/* Right Section */}
        <div className="
          flex flex-col items-center justify-between 
          p-10 gap-4
          w-full h-full
          "
        >
          {/* Logo and Theme Toggle */}
          <div className="w-full flex items-center justify-between">
            {/* Logo */}
            {theme === "light" ? (
              <img
                src="/logo_texto_dittravel_color.png"
                className="h-15 w-auto drop-shadow-lg"
                alt="Logo Dittravel"
              />
            ) : (
              <img
                src="/logo_texto_dittravel_blanco.png"
                className="h-15 w-auto drop-shadow-lg"
                alt="Logo Dittravel"
              />
            )}
            {/* Theme Toggle Button */}
            <ThemeButton />
          </div>
          {/* Main Form */}
          <div>
            {/* Session Expired Reminder */}
            {sessionExpiredMessage && (
              <Reminder text={sessionExpiredMessage} type="alert" />
            )}

          </div>
          {/* Login Form */}
          {/* Login Form */}
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">

            {/* Form Title */}
            <div className="w-full flex flex-col justify-center items-left">
              <h2 className="text-3xl font-bold text-secondary p-0 m-0">
                Iniciar Sesión
              </h2>
              <p className="text-sm text-text-secondary">
                Ingresa tus credenciales para continuar
              </p>
            </div>
            
            {/* Username Field */}
            <Input
              name="username"
              label="Usuario"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="nombre.usuario"
            />

            {/* Password Field */}
            <div className="relative">
              <Input
                name="password"
                label="Contraseña"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="*****"
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
            {/* Error Message */}
            {errorMessage && (
              <p className="text-center text-sm text-warning-500">
                {errorMessage}
              </p>
            )}
          </form>
          {/* Footer */}
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="flex items-center gap-4 w-full">
              <div className="flex-1 border-t border-border"></div>
              <p className="text-sm text-text-secondary whitespace-nowrap">
                ¿Olvidaste tu contraseña?
              </p>
              <div className="flex-1 border-t border-border"></div>
            </div>
            <a href="/forgot-password" className="text-sm text-secondary underline">
              Recupérala aquí
            </a>
            <p className="text-xs text-text-secondary mt-4">
              {new Date().getFullYear()} Dittravel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
