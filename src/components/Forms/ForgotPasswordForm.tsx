/**
 * ForgotPasswordForm Component
 *
 * Accepts a username and calls POST /user/forgot-password.
 * Always shows a neutral confirmation message after submit to avoid
 * revealing whether the account exists.
 */

import React, { useState } from "react";
import Button from "@/components/Buttons/Button";
import Input from "@/components/Utils/Input";
import { apiRequest } from "@utils/apiClient";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      await apiRequest("/user/forgot-password", {
        method: "POST",
        data: { email },
      });
      setSubmitted(true);
    } catch {
      setErrorMessage("Ocurrió un error. Intenta de nuevo más tarde.");
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
              Recuperar contraseña
            </h2>
            <p className="text-sm text-text-secondary">
              Ingresa tu correo electrónico y te enviaremos un enlace de recuperación.
            </p>
          </div>

          {submitted ? (
            <div className="w-full flex flex-col gap-4">
              <p className="text-sm text-text-secondary">
                Si existe una cuenta asociada a ese usuario, recibirás un correo con instrucciones para restablecer tu contraseña.
              </p>
              <a
                href="/login"
                className="text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                ← Volver al inicio de sesión
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
              <Input
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Correo electrónico"
              />

              <Button
                type="submit"
                variant="filled"
                color="secondary"
                size="medium"
                disabled={loading}
              >
                {loading ? "Enviando..." : "Enviar enlace"}
              </Button>

              {errorMessage && (
                <p className="text-center text-sm text-warning-500">
                  {errorMessage}
                </p>
              )}

              <div className="w-full border-t border-border"></div>

              <a
                href="/login"
                className="text-sm text-text-secondary hover:text-text-primary transition-colors text-center"
              >
                ← Volver al inicio de sesión
              </a>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
