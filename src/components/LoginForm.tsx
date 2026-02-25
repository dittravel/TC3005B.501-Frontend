/**
 * LoginForm Component
 * 
 * Provides a login form for user authentication. Handles username and password submission,
 * sets authentication cookies on successful login, and displays error messages on failure.
 */

import React, { useState } from "react";
import Button from "@components/Button";
import { apiRequest } from "@utils/apiClient";

// Tailwind CSS classes for consistent input field styling
const inputStyle = `peer w-full h-[50px]
  border border-gray-400 rounded outline-none
  text-black text-sm px-3 placeholder-gray-400`;

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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
      document.cookie = `userId=${response.userId}; path=/`;
      document.cookie = `departmentId=${response.departmentId}; path=/`;
      window.location.href = "/dashboard";

    } catch (error: any) {
      // Extract error message from API response or use default message
      const msg = error?.response?.data?.error || "Error al iniciar sesión";
      setErrorMessage(msg);
    }
  };

  return (
    <div
      className="flex justify-center items-center
                h-screen w-full bg-primary-50"
    >
      {/* Logo */}
      <img
        src="/logo_texto_dittravel_color.png"
        className="h-20 w-auto drop-shadow-lg absolute top-5 left-10"
      />

      {/* Login Form Container */}
      <div className="px-10 py-10
                      bg-white flex flex-col justify-center items-center
                      rounded-xl shadow-lg gap-10
                      border-gray-400 border-1"
      >
        {/* Login Title */}
        <div className="w-full flex flex-col justify-center items-left">
          <h2 className="text-3xl font-bold text-black p-0 m-0">
            Iniciar Sesión
          </h2>
          <p className="text-sm text-gray-600">
            Ingresa tus credenciales para continuar
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="w-[310px] text-white flex flex-col gap-6">

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
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputStyle}
              placeholder="Contraseña"
              autoComplete="current-password"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="filled"
            color="primary"
            size="medium"
          >
            Login
          </Button>

          <div className="w-full border-t border-gray-200"></div>

          <p className="text-sm text-gray-400">
            ¿Olvidaste tu contraseña? Contacta a un administrador para restablecerla.
          </p>

          {/* Error Message Display */}
          {errorMessage && (
            <p className="text-center text-sm text-red-600">
              {errorMessage}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
