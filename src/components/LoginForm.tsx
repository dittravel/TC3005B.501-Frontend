/**
 * LoginForm component for user authentication.
 */

import React, { useState } from "react";
import Button from "@components/Button";
import { apiRequest } from "@utils/apiClient";
import ThemeButton from "@components/ThemeButton";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useTheme } from "@hooks/useTheme";

const inputStyle = `peer w-full h-[50px]
  border border-border rounded outline-none
  text-sm px-3 placeholder-text-secondary
  text-text-primary
  `;

const visibleIconStyle = `absolute right-3 top-1/2 transform -translate-y-1/2
  cursor-pointer text-text-secondary`;

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { theme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiRequest("/user/logout", {
      method: "GET",
    });

    try {

      const response = await apiRequest("/user/login", {
        method: "POST",
        data: { username, password },
      });

      setErrorMessage("");
    
      alert("Inicio de sesión exitoso");

      // Set cookies manually on client side to ensure they're available immediately
      document.cookie = `token=${response.token}; path=/; secure; SameSite=Strict`;
      document.cookie = `role=${response.role}; path=/`;
      document.cookie = `username=${response.username}; path=/`;
      document.cookie = `user_id=${response.user_id}; path=/`;
      document.cookie = `department_id=${response.department_id}; path=/`;
      window.location.href = "/dashboard";

    } catch (error: any) {
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
      <div className="w-full max-w-md">
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
            <div className="relative">
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={inputStyle}
                placeholder="Usuario"
                autoComplete="username"
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputStyle}
                placeholder="Contraseña"
                autoComplete="current-password"
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
              Login
            </Button>

            <div className="w-full border-t border-border"></div>

            <p className="text-sm text-text-secondary">
              ¿Olvidaste tu contraseña? Contacta a un administrador para restablecerla.
            </p>

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
