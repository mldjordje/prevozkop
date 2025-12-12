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
import { getProjects } from "@/lib/api";
import {
  ApiError,
  adminCreateProject,
  adminDeleteProject,
  adminListProjects,
  adminLogin,
  adminLogout,
  adminUpdateProject,
  uploadGalleryImage,
  uploadHeroImage,
} from "@/lib/admin-client";

const statusOptions = [
  { key: "draft", label: "Draft" },
  { key: "published", label: "Objavljeno" },
];

type ViewState = "loading" | "login" | "ready";

export default function AdminPage() {
  const [view, setView] = useState<ViewState>("loading");
  const [projects, setProjects] = useState<Project[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [uploading, setUploading] = useState<{ id: number; type: "hero" | "gallery" } | null>(
    null
  );

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
      setIsAuthenticated(true);
      setView("ready");
    } catch (error) {
      setIsAuthenticated(false);
      if (error instanceof ApiError && error.status === 401) {
        try {
          const published = await getProjects(50, 0);
          setProjects(published.data);
        } catch {
          setProjects([]);
        }
        setView("login");
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
    if (!isAuthenticated) return;
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
    if (!isAuthenticated) return;
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

  async function handleHeroUpload(projectId: number, files: FileList | null) {
    if (!isAuthenticated || !files?.length) return;
    setUploading({ id: projectId, type: "hero" });
    setMessage(null);
    try {
      await uploadHeroImage(projectId, files[0]);
      await refreshProjects();
      setMessage("Hero fotografija je postavljena.");
    } catch {
      setMessage("Nije uspelo postavljanje hero fotografije.");
      setUploading(null);
    }
  }

  async function handleGalleryUpload(projectId: number, files: FileList | null) {
    if (!isAuthenticated || !files?.length) return;
    setUploading({ id: projectId, type: "gallery" });
    setMessage(null);
    try {
      for (const file of Array.from(files)) {
        await uploadGalleryImage(projectId, file);
      }
      await refreshProjects();
      setMessage("Galerija je ažurirana.");
    } catch {
      setMessage("Nije uspelo slanje galerije.");
      setUploading(null);
    }
  }

  async function handleLogout() {
    await adminLogout();
    setView("login");
    setIsAuthenticated(false);
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
          {isAuthenticated ? (
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
                    onChange={(e) =>
                      setNewProject((prev) => ({ ...prev, excerpt: e.target.value }))
                    }
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
          ) : (
            <Card className="border border-dashed border-primary bg-white/60">
              <CardBody>
                <p className="text-sm text-gray-600">
                  Za kreiranje novih projekata potrebno je da se prijavite. Trenutno prikazujemo
                  samo objavljene projekte sa sajta.
                </p>
              </CardBody>
            </Card>
          )}

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Projekti</h2>
              <Button variant="flat" onPress={refreshProjects} isDisabled={isFetching}>
                Osveži
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {projects.map((project) => {
                const isUploadingHero =
                  uploading?.id === project.id && uploading.type === "hero";
                const isUploadingGallery =
                  uploading?.id === project.id && uploading.type === "gallery";

                return (
                  <Card key={project.id}>
                    <CardHeader className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold">{project.title}</p>
                        <p className="text-xs text-gray-500">{project.slug}</p>
                      </div>
                      <Chip color={project.published_at ? "success" : "default"} variant="flat">
                        {project.published_at ? "Objavljeno" : "Draft"}
                      </Chip>
                    </CardHeader>
                    <CardBody className="space-y-4">
                      {project.hero_image && (
                        <img
                          src={project.hero_image}
                          alt={project.title}
                          className="h-40 w-full rounded-lg object-cover"
                        />
                      )}
                      <p className="text-sm text-gray-600">{project.excerpt || "Bez opisa."}</p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="flat"
                          size="sm"
                          onPress={() =>
                            handleStatusChange(project, project.published_at ? "draft" : "published")
                          }
                          isDisabled={isFetching || !isAuthenticated}
                        >
                          {project.published_at ? "Postavi kao draft" : "Objavi"}
                        </Button>
                        <Button
                          color="danger"
                          variant="light"
                          size="sm"
                          onPress={() => handleDeleteProject(project)}
                          isDisabled={isFetching || !isAuthenticated}
                        >
                          Obriši
                        </Button>
                      </div>

                      {isAuthenticated && (
                        <div className="space-y-3 border-t border-black/5 pt-3">
                          <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                              Hero fotografija
                            </p>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(event) => handleHeroUpload(project.id, event.target.files)}
                              isDisabled={isUploadingHero}
                            />
                            {isUploadingHero && (
                              <p className="text-xs text-gray-500">Otpremanje hero fotografije...</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                              Galerija
                            </p>
                            <Input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(event) =>
                                handleGalleryUpload(project.id, event.target.files)
                              }
                              isDisabled={isUploadingGallery}
                            />
                            {isUploadingGallery && (
                              <p className="text-xs text-gray-500">
                                Otpremanje slika galerije...
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </CardBody>
                  </Card>
                );
              })}
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
