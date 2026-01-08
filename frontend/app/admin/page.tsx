'use client';

import { useEffect, useRef, useState } from "react";
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
import type { Order, Project } from "@/lib/api";
import { getProjects } from "@/lib/api";
import {
  ApiError,
  adminCreateProject,
  adminDeleteProject,
  adminGetProject,
  adminListOrders,
  adminListProjects,
  adminLogin,
  adminLogout,
  adminUpdateOrderStatus,
  adminUpdateProject,
  deleteGalleryImage,
  uploadGalleryImage,
  uploadHeroImage,
} from "@/lib/admin-client";

const statusOptions = [
  { key: "draft", label: "Draft" },
  { key: "published", label: "Objavljeno" },
];

const orderStatusOptions: { key: Order["status"]; label: string }[] = [
  { key: "new", label: "Nova" },
  { key: "in_progress", label: "U obradi" },
  { key: "done", label: "Zatvorena" },
];

type ViewState = "loading" | "login" | "ready";

export default function AdminPage() {
  const [view, setView] = useState<ViewState>("loading");
  const [section, setSection] = useState<"projects" | "orders">("projects");
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectDetails, setProjectDetails] = useState<Record<number, Project>>({});
  const [detailsLoading, setDetailsLoading] = useState<Record<number, boolean>>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
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
  const [newProjectHero, setNewProjectHero] = useState<File | null>(null);
  const [newProjectGallery, setNewProjectGallery] = useState<FileList | null>(null);
  const heroInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    refreshProjects();
  }, []);

  useEffect(() => {
    if (section === "orders" && isAuthenticated) {
      refreshOrders();
    }
  }, [section, isAuthenticated]);

  async function refreshProjects() {
    setIsFetching(true);
    setMessage(null);
    try {
      const res = await adminListProjects();
      setProjects(res.data);
      setIsAuthenticated(true);
      setView("ready");
      void loadProjectDetails(res.data);
      if (section === "orders") {
        void refreshOrders(false);
      }
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

  async function refreshOrders(showLoader: boolean = true) {
    if (!isAuthenticated) return;
    if (showLoader) setOrdersLoading(true);
    setMessage(null);
    try {
      const res = await adminListOrders();
      setOrders(res.data);
    } catch {
      setMessage("Neuspešno učitavanje porudžbina.");
    } finally {
      if (showLoader) setOrdersLoading(false);
    }
  }

  async function loadProjectDetails(list: Project[]) {
    if (!list.length) return;
    setDetailsLoading((prev) => {
      const next = { ...prev };
      list.forEach((proj) => {
        next[proj.id] = true;
      });
      return next;
    });

    const details = await Promise.all(
      list.map(async (proj) => {
        try {
          return await adminGetProject(proj.id);
        } catch {
          return null;
        }
      })
    );

    setProjectDetails((prev) => {
      const next = { ...prev };
      details.forEach((item) => {
        if (item) next[item.id] = item;
      });
      return next;
    });

    setDetailsLoading((prev) => {
      const next = { ...prev };
      list.forEach((proj) => delete next[proj.id]);
      return next;
    });
  }

  async function refreshProjectDetail(id: number) {
    setDetailsLoading((prev) => ({ ...prev, [id]: true }));
    try {
      const detail = await adminGetProject(id);
      setProjectDetails((prev) => ({ ...prev, [id]: detail }));
    } catch {
      // ignore
    } finally {
      setDetailsLoading((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
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
      const created = await adminCreateProject({
        title: newProject.title,
        slug: newProject.slug || undefined,
        excerpt: newProject.excerpt,
        body: newProject.body,
        status: newProject.status,
      });
      if (newProjectHero) {
        await uploadHeroImage(created.id, newProjectHero);
      }
      if (newProjectGallery?.length) {
        for (const file of Array.from(newProjectGallery)) {
          await uploadGalleryImage(created.id, file);
        }
      }
      setNewProject({ title: "", slug: "", excerpt: "", body: "", status: "draft" });
      setNewProjectHero(null);
      setNewProjectGallery(null);
      if (heroInputRef.current) heroInputRef.current.value = "";
      if (galleryInputRef.current) galleryInputRef.current.value = "";
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
      await refreshProjectDetail(projectId);
      setMessage("Hero fotografija je postavljena.");
    } catch {
      setMessage("Nije uspelo postavljanje hero fotografije.");
    } finally {
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
      await refreshProjectDetail(projectId);
      setMessage("Galerija je ažurirana.");
    } catch {
      setMessage("Nije uspelo slanje galerije.");
    } finally {
      setUploading(null);
    }
  }

  async function handleGalleryDelete(projectId: number, mediaId: number) {
    if (!isAuthenticated) return;
    setIsFetching(true);
    setMessage(null);
    try {
      await deleteGalleryImage(projectId, mediaId);
      await refreshProjectDetail(projectId);
      setMessage("Slika iz galerije je obrisana.");
    } catch {
      setMessage("Brisanje slike nije uspelo.");
    } finally {
      setIsFetching(false);
    }
  }

  async function handleOrderStatus(order: Order, status: Order["status"]) {
    if (!isAuthenticated || order.status === status) return;
    setOrdersLoading(true);
    setMessage(null);
    try {
      await adminUpdateOrderStatus(order.id, status);
      await refreshOrders(false);
      setMessage("Status porudžbine ažuriran.");
    } catch {
      setMessage("Greška pri ažuriranju porudžbine.");
    } finally {
      setOrdersLoading(false);
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
          <h1 className="text-3xl font-bold">Kontrolna tabla</h1>
        </div>
        {view === "ready" && (
          <Button color="primary" variant="flat" onPress={handleLogout}>
            Odjava
          </Button>
        )}
      </div>

      {view === "ready" && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant={section === "projects" ? "solid" : "flat"}
            color="primary"
            onPress={() => setSection("projects")}
          >
            Projekti
          </Button>
          <Button
            variant={section === "orders" ? "solid" : "flat"}
            color="primary"
            onPress={() => setSection("orders")}
          >
            Porudžbine
          </Button>
        </div>
      )}

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
          {section === "projects" && (
            <>
              {isAuthenticated ? (
                <Card>
                  <CardHeader className="font-semibold">Kreiraj novi projekat</CardHeader>
                  <CardBody>
                    <form className="grid gap-4" onSubmit={handleCreateProject}>
                      <Input
                        label="Naslov"
                        value={newProject.title}
                        onChange={(e) =>
                          setNewProject((prev) => ({ ...prev, title: e.target.value }))
                        }
                        isRequired
                      />
                      <Input
                        label="Slug"
                        description="Ako se ne unese, biće generisan automatski."
                        value={newProject.slug}
                        onChange={(e) =>
                          setNewProject((prev) => ({ ...prev, slug: e.target.value }))
                        }
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
                        onChange={(e) =>
                          setNewProject((prev) => ({ ...prev, body: e.target.value }))
                        }
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
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                          Hero fotografija
                        </p>
                        <input
                          ref={heroInputRef}
                          type="file"
                          accept="image/*"
                          disabled={isFetching}
                          onChange={(event) => setNewProjectHero(event.target.files?.[0] ?? null)}
                          className="w-full cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-xs file:font-semibold file:text-dark"
                        />
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                          Galerija
                        </p>
                        <p className="text-[11px] text-gray-600">
                          Možete odabrati više fajlova odjednom (na telefonu otvorite Foto biblioteku
                          i tapnite “Odaberi”).
                        </p>
                        <input
                          ref={galleryInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          disabled={isFetching}
                          onChange={(event) => setNewProjectGallery(event.target.files)}
                          className="w-full cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-xs file:font-semibold file:text-dark"
                        />
                      </div>
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
                  <div className="flex gap-2">
                    <Button variant="flat" onPress={refreshProjects} isDisabled={isFetching}>
                      Osveži
                    </Button>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {projects.map((project) => {
                    const isUploadingHero =
                      uploading?.id === project.id && uploading.type === "hero";
                    const isUploadingGallery =
                      uploading?.id === project.id && uploading.type === "gallery";
                    const gallery = projectDetails[project.id]?.gallery || [];
                    const isLoadingGallery = !!detailsLoading[project.id];

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
                                <input
                                  type="file"
                                  accept="image/*"
                                  disabled={isUploadingHero}
                                  onChange={(event) =>
                                    handleHeroUpload(project.id, event.target.files)
                                  }
                                  className="w-full cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-xs file:font-semibold file:text-dark"
                                />
                                {isUploadingHero && (
                                  <p className="text-xs text-gray-500">
                                    Otpremanje hero fotografije...
                                  </p>
                                )}
                              </div>
                              <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                                  Galerija
                                </p>
                                {isLoadingGallery && (
                                  <p className="text-xs text-gray-500">Učitavanje galerije...</p>
                                )}
                                {gallery.length > 0 && (
                                  <div className="grid grid-cols-3 gap-2">
                                    {gallery.map((img) => (
                                      <div
                                        key={img.id ?? img.src}
                                        className="relative h-20 overflow-hidden rounded-md border border-gray-200 bg-gray-50"
                                      >
                                        <img
                                          src={img.src}
                                          alt={img.alt || project.title}
                                          className="h-full w-full object-cover"
                                        />
                                        {img.id && (
                                          <button
                                            type="button"
                                            onClick={() => handleGalleryDelete(project.id, img.id!)}
                                            className="absolute right-1 top-1 rounded bg-white/80 px-2 py-1 text-[10px] font-semibold text-red-600 shadow-sm hover:bg-white"
                                            disabled={isFetching}
                                          >
                                            Obriši
                                          </button>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <p id={`gallery-help-${project.id}`} className="text-[11px] text-gray-600">
                                  Možete odabrati više fajlova odjednom (na telefonu otvorite Foto
                                  biblioteku i tapnite “Odaberi”).
                                </p>
                                <input
                                  type="file"
                                  id={`gallery-upload-${project.id}`}
                                  name="galleryImages"
                                  accept="image/*"
                                  multiple
                                  aria-describedby={`gallery-help-${project.id}`}
                                  disabled={isUploadingGallery}
                                  onChange={(event) =>
                                    handleGalleryUpload(project.id, event.target.files)
                                  }
                                  className="w-full cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-xs file:font-semibold file:text-dark"
                                />
                                {isUploadingGallery && (
                                  <p className="text-xs text-gray-500">Otpremanje slika galerije...</p>
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

          {section === "orders" && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">Porudžbine</h2>
                  <p className="text-sm text-gray-600">
                    Pregled online porudžbina sa forme (status: nova / u obradi / zatvorena).
                  </p>
                </div>
                <Button variant="flat" onPress={() => refreshOrders()} isDisabled={ordersLoading}>
                  Osveži
                </Button>
              </div>

              {orders.length === 0 ? (
                <p className="text-sm text-gray-600">Još uvek nema porudžbina.</p>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
                  <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr_0.8fr] gap-4 border-b border-black/5 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                    <span>Kontakt</span>
                    <span>Detalji</span>
                    <span>Poruka</span>
                    <span>Status</span>
                    <span>Akcije</span>
                  </div>
                  <div className="divide-y divide-black/5">
                    {orders.map((order) => (
                      <div key={order.id} className="grid grid-cols-[1.4fr_1fr_1fr_1fr_0.8fr] gap-4 px-4 py-3 text-sm">
                        <div className="space-y-1">
                          <p className="font-semibold">{order.name}</p>
                          <p className="text-gray-600">{order.email}</p>
                          {order.phone && <p className="text-gray-600">{order.phone}</p>}
                          <p className="text-xs text-gray-400">
                            {new Date(order.created_at).toLocaleString("sr-RS")}
                          </p>
                        </div>
                        <div className="space-y-1 text-gray-700">
                          {order.subject && <p>{order.subject}</p>}
                          {order.concrete_type && (
                            <p className="text-xs text-gray-500">Beton: {order.concrete_type}</p>
                          )}
                        </div>
                        <div className="text-gray-700">
                          <p className="line-clamp-4 whitespace-pre-wrap">{order.message}</p>
                        </div>
                        <div className="flex items-center">
                          <Chip
                            color={
                              order.status === "done"
                                ? "success"
                                : order.status === "in_progress"
                                ? "warning"
                                : "default"
                            }
                            variant="flat"
                          >
                            {orderStatusOptions.find((o) => o.key === order.status)?.label ||
                              order.status}
                          </Chip>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {orderStatusOptions.map((opt) => (
                            <Button
                              key={opt.key}
                              size="sm"
                              variant={order.status === opt.key ? "solid" : "flat"}
                              onPress={() => handleOrderStatus(order, opt.key)}
                              isDisabled={ordersLoading}
                            >
                              {opt.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
