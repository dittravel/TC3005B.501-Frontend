/**
 * ResetPasswordForm Component
 *
 * Reads the token from the URL query string and calls
 * POST /user/reset-password with the new password.
 */

import React, { useState, useEffect } from "react";
import Button from "@/components/Buttons/Button";
import Input from "@/components/Utils/Input";
import { apiRequest } from "@utils/apiClient";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const visibleIconStyle = `
  absolute right-3 top-2.5
  cursor-pointer text-text-secondary
`;

export default function ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [token, setToken] = useState("");

  useEffect(() => {
  setToken(new URLSearchParams(window.location.search).get("token") ?? "");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (newPassword.length < 8) {
      setErrorMessage("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden.");
      return;
    }

    if (!token) {
      setErrorMessage("Enlace de recuperación inválido o expirado.");
      return;
    }

    setLoading(true);
    try {
      await apiRequest("/user/reset-password", {
        method: "POST",
        data: { token, new_password: newPassword },
      });
      setDone(true);
    } catch (error: any) {
      const msg = error?.response?.data?.error || "Enlace inválido o expirado. Solicita uno nuevo.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen w-full bg-background px-5">
      <div className="w-full md:w-100">
        <div className="p-2 md:p-8 flex flex-col justify-center items-center rounded-xl gap-8 md:shadow-lg md:bg-card md:border-border md:border-1">

          <div className="w-full flex flex-col gap-1">
            <h2 className="text-3xl font-bold text-text-primary">
              Nueva contraseña
            </h2>
            <p className="text-sm text-text-secondary">
              Elige una contraseña segura de al menos 8 caracteres.
            </p>
          </div>

          {done ? (
            <div className="w-full flex flex-col gap-4">
              <p className="text-sm text-text-secondary">
                Tu contraseña fue actualizada correctamente.
              </p>
              <a
                href="/login"
                className="text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                ← Iniciar sesión
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">

              <div className="relative">
                <Input
                  name="new_password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nueva contraseña"
                />
                {showPassword ? (
                  <Visibility className={visibleIconStyle} onClick={() => setShowPassword(false)} />
                ) : (
                  <VisibilityOff className={visibleIconStyle} onClick={() => setShowPassword(true)} />
                )}
              </div>

              <Input
                name="confirm_password"
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmar contraseña"
              />

              <Button
                type="submit"
                variant="filled"
                color="secondary"
                size="medium"
                disabled={loading}
              >
                {loading ? "Guardando..." : "Guardar contraseña"}
              </Button>

              {errorMessage && (
                <p className="text-center text-sm text-warning-500">
                  {errorMessage}
                </p>
              )}

              <div className="w-full border-t border-border"></div>

              <a
                href="/forgot-password"
                className="text-sm text-text-secondary hover:text-text-primary transition-colors text-center"
              >
                Solicitar un nuevo enlace
              </a>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
