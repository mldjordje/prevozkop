'use client';

import { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Input,
  Select,
  SelectItem,
  Textarea,
} from "@heroui/react";
import type { Project } from "@/lib/api";
import {
  ApiError,
  adminCreateProject,
  adminDeleteProject,
  adminListProjects,
  adminLogin,
  adminLogout,
  adminUpdateProject,
} from "@/lib/admin-client";

const statusOptions = [
  { key: "draft", label: "Draft" },
  { key: "published", label: "Objavljeno" },
];

type ViewState = "loading" | "login" | "ready";

export default function AdminPage() {
  const [view, setView] = useState<ViewState>("loading");
  const [projects, setProjects] = useState<Project[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [loginEmail, setLoginEmail] = useState("admin@prevozkop.rs");
  const [loginPassword, setLoginPassword] = useState("");

  const [newProject, setNewProject] = useState({
    title: "",
    slug: "",
    excerpt: "",
    body: "",
    status: "draft",
  });

  useEffect(() => {
    refreshProjects();
  }, []);

  async function refreshProjects() {
    setIsFetching(true);
    setMessage(null);
    try {
      const res = await adminListProjects();
      setProjects(res.data);
      setView("ready");
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setView("login");
        setProjects([]);
      } else {
        setMessage("Neuspešno učitavanje projekata.");
      }
    } finally {
      setIsFetching(false);
    }
  }

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsFetching(true);
    setMessage(null);
    try {
      await adminLogin(loginEmail, loginPassword);
      setLoginPassword("");
      await refreshProjects();
    } catch (error) {
      const text =
        error instanceof ApiError && error.status === 401
          ? "Pogrešan email ili lozinka."
          : "Greška pri prijavi.";
      setMessage(text);
    } finally {
      setIsFetching(false);
    }
  }

  async function handleCreateProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newProject.title.trim()) {
      setMessage("Naslov je obavezan.");
      return;
    }
    setIsFetching(true);
    setMessage(null);
    try {
      await adminCreateProject({
        title: newProject.title,
        slug: newProject.slug || undefined,
        excerpt: newProject.excerpt,
        body: newProject.body,
        status: newProject.status,
      });
      setNewProject({ title: "", slug: "", excerpt: "", body: "", status: "draft" });
      await refreshProjects();
      setMessage("Projekat je uspešno kreiran.");
    } catch (error) {
      const text =
        error instanceof ApiError
          ? `Greška (${error.status}) prilikom čuvanja.`
          : "Greška prilikom čuvanja.";
      setMessage(text);
    } finally {
      setIsFetching(false);
    }
  }

  async function handleStatusChange(project: Project, status: string) {
    setIsFetching(true);
    setMessage(null);
    try {
      await adminUpdateProject(project.id, { status });
      await refreshProjects();
      setMessage("Status ažuriran.");
    } catch {
      setMessage("Neuspešno ažuriranje statusa.");
      setIsFetching(false);
    }
  }

  async function handleDeleteProject(project: Project) {
    if (!confirm(`Obrisati projekat "${project.title}"?`)) return;
    setIsFetching(true);
    setMessage(null);
    try {
      await adminDeleteProject(project.id);
      await refreshProjects();
      setMessage("Projekat obrisan.");
    } catch {
      setMessage("Neuspešno brisanje.");
      setIsFetching(false);
    }
  }

  async function handleLogout() {
    await adminLogout();
    setView("login");
  }

  return (
    <div className="content-section py-10 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-primary">Admin</p>
          <h1 className="text-3xl font-bold">Upravljanje projektima</h1>
        </div>
        {view === "ready" && (
          <Button color="primary" variant="flat" onPress={handleLogout}>
            Odjava
          </Button>
        )}
      </div>

      {message && (
        <div className="rounded-xl border border-black/10 bg-white p-4 text-sm text-dark shadow-sm">
          {message}
        </div>
      )}

      {view === "login" ? (
        <Card className="max-w-xl">
          <CardHeader className="font-semibold">Prijava</CardHeader>
          <CardBody>
            <form className="space-y-4" onSubmit={handleLogin}>
              <Input
                label="Email"
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                isRequired
              />
              <Input
                label="Lozinka"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                isRequired
              />
              <Button color="primary" type="submit" isDisabled={isFetching}>
                Prijavi se
              </Button>
            </form>
          </CardBody>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader className="font-semibold">Kreiraj novi projekat</CardHeader>
            <CardBody>
              <form className="grid gap-4" onSubmit={handleCreateProject}>
                <Input
                  label="Naslov"
                  value={newProject.title}
                  onChange={(e) => setNewProject((prev) => ({ ...prev, title: e.target.value }))}
                  isRequired
                />
                <Input
                  label="Slug"
                  description="Ako se ne unese, biće generisan automatski."
                  value={newProject.slug}
                  onChange={(e) => setNewProject((prev) => ({ ...prev, slug: e.target.value }))}
                />
                <Textarea
                  label="Kratki opis"
                  value={newProject.excerpt}
                  onChange={(e) => setNewProject((prev) => ({ ...prev, excerpt: e.target.value }))}
                  minRows={2}
                />
                <Textarea
                  label="Detaljan opis"
                  value={newProject.body}
                  onChange={(e) => setNewProject((prev) => ({ ...prev, body: e.target.value }))}
                  minRows={4}
                />
                <Select
                  label="Status"
                  selectedKeys={[newProject.status]}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys).at(0)?.toString() || "draft";
                    setNewProject((prev) => ({ ...prev, status: value }));
                  }}
                >
                  {statusOptions.map((item) => (
                    <SelectItem key={item.key}>{item.label}</SelectItem>
                  ))}
                </Select>
                <Button color="primary" type="submit" isDisabled={isFetching}>
                  Sačuvaj
                </Button>
              </form>
            </CardBody>
          </Card>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Projekti</h2>
              <Button variant="flat" onPress={refreshProjects} isDisabled={isFetching}>
                Osveži
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {projects.map((project) => (
                <Card key={project.id}>
                  <CardHeader className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">{project.title}</p>
                      <p className="text-xs text-gray-500">{project.slug}</p>
                    </div>
                    <Chip
                      color={project.published_at ? "success" : "default"}
                      variant="flat"
                    >
                      {project.published_at ? "Objavljeno" : "Draft"}
                    </Chip>
                  </CardHeader>
                  <CardBody className="space-y-4">
                    <p className="text-sm text-gray-600">{project.excerpt || "Bez opisa."}</p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="flat"
                        size="sm"
                        onPress={() =>
                          handleStatusChange(
                            project,
                            project.published_at ? "draft" : "published"
                          )
                        }
                        isDisabled={isFetching}
                      >
                        {project.published_at ? "Postavi kao draft" : "Objavi"}
                      </Button>
                      <Button
                        color="danger"
                        variant="light"
                        size="sm"
                        onPress={() => handleDeleteProject(project)}
                        isDisabled={isFetching}
                      >
                        Obriši
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
            {projects.length === 0 && (
              <p className="text-sm text-gray-600">
                Nema projekata. Dodajte prvi projekat putem forme iznad.
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
