'use client';

import { useEffect, useState } from "react";
import { Button, Card, CardBody, CardHeader, Input } from "@heroui/react";
import { ApiError, adminListProjects, adminLogin, adminLogout } from "@/lib/admin-client";

const ADMIN_AUTH_STORAGE_KEY = "prevozkop-admin-authenticated";

type AuthState = "loading" | "login" | "ready";

export default function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>("loading");
  const [message, setMessage] = useState<string | null>(null);
  const [email, setEmail] = useState("admin@prevozkop.rs");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        await adminListProjects();
        if (!cancelled) {
          localStorage.setItem(ADMIN_AUTH_STORAGE_KEY, "1");
          setState("ready");
        }
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError && error.status === 401) {
          localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
        } else {
          setMessage("Neuspesna provera admin sesije.");
        }
        setState("login");
      }
    }

    void checkSession();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    try {
      await adminLogin(email, password);
      localStorage.setItem(ADMIN_AUTH_STORAGE_KEY, "1");
      setPassword("");
      setState("ready");
    } catch (error) {
      setMessage(
        error instanceof ApiError && error.status === 401
          ? "Pogresan email ili lozinka."
          : "Greska pri prijavi."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogout() {
    await adminLogout();
    localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
    setState("login");
  }

  if (state === "loading") {
    return (
      <div className="content-section py-10">
        <div className="rounded-xl border border-black/10 bg-white p-4 text-sm text-dark shadow-sm">
          Provera admin pristupa...
        </div>
      </div>
    );
  }

  if (state === "login") {
    return (
      <div className="content-section py-10 space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-primary">Admin</p>
          <h1 className="text-3xl font-bold text-dark">Prijava</h1>
        </div>
        {message && (
          <div className="rounded-xl border border-black/10 bg-white p-4 text-sm text-dark shadow-sm">
            {message}
          </div>
        )}
        <Card className="max-w-xl">
          <CardHeader className="font-semibold">Admin pristup</CardHeader>
          <CardBody>
            <form className="space-y-4" onSubmit={handleLogin}>
              <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} isRequired />
              <Input label="Lozinka" type="password" value={password} onChange={(event) => setPassword(event.target.value)} isRequired />
              <Button color="primary" type="submit" isDisabled={isSubmitting}>
                Prijavi se
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="content-section py-8 sm:py-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="flex justify-end">
          <Button color="primary" variant="flat" onPress={handleLogout}>
            Odjava
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
