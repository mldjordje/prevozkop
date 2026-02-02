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
import type { Order, Product, Project } from "@/lib/api";
import { getProjects } from "@/lib/api";
import {
  ApiError,
  adminCreateProject,
  adminCreateProduct,
  adminDeleteProject,
  adminDeleteProduct,
  adminGetProject,
  adminGetProduct,
  adminListOrders,
  adminListProjects,
  adminListProducts,
  adminLogin,
  adminLogout,
  adminDeleteOrder,
  adminUpdateOrderStatus,
  adminUpdateProject,
  adminUpdateProduct,
  deleteProductGalleryImage,
  deleteGalleryImage,
  uploadProductDocument,
  uploadProductImage,
  uploadProductGalleryImage,
  uploadGalleryImage,
  uploadHeroImage,
} from "@/lib/admin-client";

const statusOptions = [
  { key: "draft", label: "Draft" },
  { key: "published", label: "Objavljeno" },
];

const productStatusOptions = [{ key: "all", label: "Sve" }, ...statusOptions];

const orderStatusOptions: { key: Order["status"]; label: string }[] = [
  { key: "new", label: "Nova" },
  { key: "in_progress", label: "U obradi" },
  { key: "done", label: "Zatvorena" },
];

const concreteTypeSet = new Set(
  [
    "MB 10",
    "MB 15",
    "MB 20",
    "MB 25 VODONEPROPUSTIV",
    "MB 30 VODONEPROPUSTIV",
    "MB 35 VODONEPROPUSTIV",
    "MB 40 VODONEPROPUSTIV",
    "V8 M150",
  ].map((item) => item.toLowerCase())
);

const orderServiceFilters = [
  { key: "all", label: "Sve" },
  { key: "beton", label: "Beton" },
  { key: "behaton", label: "Behaton" },
  { key: "other", label: "Ostalo" },
] as const;

type OrderServiceFilter = (typeof orderServiceFilters)[number]["key"];

type ViewState = "loading" | "login" | "ready";

type AdminPanelProps = {
  defaultSection?: "projects" | "orders" | "products";
  showSectionSwitcher?: boolean;
};

export default function AdminPanel({
  defaultSection = "projects",
  showSectionSwitcher = true,
}: AdminPanelProps) {
  const [view, setView] = useState<ViewState>("loading");
  const [section, setSection] = useState<"projects" | "orders" | "products">(defaultSection);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectDetails, setProjectDetails] = useState<Record<number, Project>>({});
  const [detailsLoading, setDetailsLoading] = useState<Record<number, boolean>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [productDrafts, setProductDrafts] = useState<Record<number, Partial<Product>>>({});
  const [productSpecsDrafts, setProductSpecsDrafts] = useState<Record<number, string>>({});
  const [productsLoading, setProductsLoading] = useState(false);
  const [productUploading, setProductUploading] = useState<{ id: number; type: "image" | "document" | "gallery" } | null>(null);
  const [productQuery, setProductQuery] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("behaton");
  const [productStatusFilter, setProductStatusFilter] = useState("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderServiceFilter, setOrderServiceFilter] = useState<OrderServiceFilter>("all");
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
  const [newProjectGallery, setNewProjectGallery] = useState<File[]>([]);
  const [newProjectFormKey, setNewProjectFormKey] = useState(0);

  const [newProduct, setNewProduct] = useState({
    name: "",
    slug: "",
    category: "behaton",
    product_type: "",
    short_description: "",
    description: "",
    applications: "",
    status: "published",
    sort_order: 0,
    specsText: "",
  });
  const [newProductImage, setNewProductImage] = useState<File | null>(null);
  const [newProductGallery, setNewProductGallery] = useState<File[]>([]);
  const [newProductDocument, setNewProductDocument] = useState<File | null>(null);
  const [newProductFormKey, setNewProductFormKey] = useState(0);
  const [bulkProducts, setBulkProducts] = useState("");

  const hasProductDrafts =
    Object.keys(productDrafts).length > 0 || Object.keys(productSpecsDrafts).length > 0;

  function extractApiErrorMessage(error: unknown): string | null {
    if (!(error instanceof ApiError)) {
      return null;
    }
    if (typeof error.body === "string") {
      return error.body || null;
    }
    if (error.body && typeof error.body === "object") {
      const message = (error.body as { error?: string }).error;
      return typeof message === "string" && message.trim() ? message : null;
    }
    return null;
  }

  useEffect(() => {
    refreshProjects();
  }, []);

  useEffect(() => {
    if (section === "orders" && isAuthenticated) {
      refreshOrders();
    }
  }, [section, isAuthenticated]);

  useEffect(() => {
    if (section === "products" && isAuthenticated) {
      refreshProducts();
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
      if (section === "products") {
        void refreshProducts(false);
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
        setMessage("NeuspeÅ¡no uÄitavanje projekata.");
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
      setMessage("NeuspeÅ¡no uÄitavanje porudÅ¾bina.");
    } finally {
      if (showLoader) setOrdersLoading(false);
    }
  }

  async function refreshProducts(showLoader: boolean = true) {
    if (!isAuthenticated) return;
    if (showLoader) setProductsLoading(true);
    setMessage(null);
    try {
      const res = await adminListProducts({
        status: productStatusFilter,
        category: productCategoryFilter || undefined,
        q: productQuery || undefined,
        limit: 200,
        offset: 0,
      });
      setProducts(res.data);
      setProductDrafts({});
      setProductSpecsDrafts({});
    } catch {
      setMessage("NeuspeÅ¡no uÄitavanje proizvoda.");
    } finally {
      if (showLoader) setProductsLoading(false);
    }
  }

  async function refreshProductDetail(id: number) {
    try {
      const detail = await adminGetProduct(id);
      setProducts((prev) => prev.map((item) => (item.id === id ? detail : item)));
    } catch {
      // ignore
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
          ? "PogreÅ¡an email ili lozinka."
          : "GreÅ¡ka pri prijavi.";
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
      const uploadNotes: string[] = [];
      if (newProjectHero) {
        try {
          await uploadHeroImage(created.id, newProjectHero);
        } catch (error) {
          const detail = extractApiErrorMessage(error);
          uploadNotes.push(
            detail ? `Hero slika nije poslata (${detail}).` : "Hero slika nije poslata."
          );
        }
      }
      if (newProjectGallery.length > 0) {
        try {
          for (const file of newProjectGallery) {
            await uploadGalleryImage(created.id, file);
          }
        } catch (error) {
          const detail = extractApiErrorMessage(error);
          uploadNotes.push(
            detail ? `Galerija nije kompletno poslata (${detail}).` : "Galerija nije kompletno poslata."
          );
        }
      }
      setNewProject({ title: "", slug: "", excerpt: "", body: "", status: "draft" });
      setNewProjectHero(null);
      setNewProjectGallery([]);
      setNewProjectFormKey((prev) => prev + 1);
      await refreshProjects();
      setMessage(
        uploadNotes.length > 0
          ? `Projekat je kreiran. ${uploadNotes.join(" ")}`
          : "Projekat je uspeÅ¡no kreiran."
      );
    } catch (error) {
      if (error instanceof ApiError) {
        const apiMessage =
          typeof error.body === "string"
            ? error.body
            : (error.body as { error?: string } | undefined)?.error;
        const text = apiMessage
          ? `GreÅ¡ka (${error.status}): ${apiMessage}`
          : `GreÅ¡ka (${error.status}) prilikom Äuvanja.`;
        setMessage(text);
      } else {
        setMessage("GreÅ¡ka prilikom Äuvanja.");
      }
    } finally {
      setIsFetching(false);
    }
  }

  function handleProductChange(id: number, field: keyof Product, value: string | number | null) {
    setProductDrafts((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: field === "sort_order" ? Number(value) : value,
      },
    }));
  }

  function handleProductSpecsChange(id: number, value: string) {
    setProductSpecsDrafts((prev) => ({ ...prev, [id]: value }));
  }

  function buildProductPayload(productId: number) {
    const draft = productDrafts[productId];
    const specsText = productSpecsDrafts[productId];

    if (!draft && specsText === undefined) {
      return { payload: null, error: null };
    }

    const payload: Partial<Product> = { ...(draft || {}) };

    if (specsText !== undefined) {
      const trimmed = specsText.trim();
      if (trimmed === "") {
        payload.specs = null;
      } else {
        try {
          payload.specs = JSON.parse(trimmed);
        } catch {
          return { payload: null, error: "Specifikacije nisu validan JSON." };
        }
      }
    }

    return { payload, error: null };
  }

  async function handleCreateProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newProduct.name.trim() || !newProduct.category.trim()) {
      setMessage("Naziv i kategorija su obavezni.");
      return;
    }

    let specs: Record<string, string | number | string[]> | null = null;
    if (newProduct.specsText.trim()) {
      try {
        specs = JSON.parse(newProduct.specsText.trim());
      } catch {
        setMessage("Specifikacije moraju biti validan JSON.");
        return;
      }
    }

    setProductsLoading(true);
    setMessage(null);
    try {
      const normalizedCategory = newProduct.category.trim().toLowerCase() || "behaton";
      const created = await adminCreateProduct({
        name: newProduct.name,
        slug: newProduct.slug || undefined,
        category: normalizedCategory,
        product_type: newProduct.product_type || undefined,
        short_description: newProduct.short_description,
        description: newProduct.description,
        applications: newProduct.applications,
        status: newProduct.status,
        sort_order: newProduct.sort_order,
        specs: specs || undefined,
      });
      const uploadNotes: string[] = [];
      if (newProductImage) {
        try {
          await uploadProductImage(created.id, newProductImage);
        } catch (error) {
          const detail = extractApiErrorMessage(error);
          uploadNotes.push(detail ? `Slika nije poslata (${detail}).` : "Slika nije poslata.");
        }
      }
      if (newProductGallery.length > 0) {
        try {
          for (const file of newProductGallery) {
            await uploadProductGalleryImage(created.id, file);
          }
        } catch (error) {
          const detail = extractApiErrorMessage(error);
          uploadNotes.push(
            detail ? `Galerija nije kompletno poslata (${detail}).` : "Galerija nije kompletno poslata."
          );
        }
      }
      if (newProductDocument) {
        try {
          await uploadProductDocument(created.id, newProductDocument);
        } catch (error) {
          const detail = extractApiErrorMessage(error);
          uploadNotes.push(
            detail ? `Dokument nije poslat (${detail}).` : "Dokument nije poslat."
          );
        }
      }
      setNewProduct({
        name: "",
        slug: "",
        category: "behaton",
        product_type: "",
        short_description: "",
        description: "",
        applications: "",
        status: "published",
        sort_order: 0,
        specsText: "",
      });
      setNewProductImage(null);
      setNewProductGallery([]);
      setNewProductDocument(null);
      setNewProductFormKey((prev) => prev + 1);
      await refreshProducts(false);
      setMessage(
        uploadNotes.length > 0
          ? `Proizvod je dodat. ${uploadNotes.join(" ")}`
          : "Proizvod je uspeÅ¡no dodat."
      );
    } catch (error) {
      if (error instanceof ApiError) {
        const apiMessage =
          typeof error.body === "string"
            ? error.body
            : (error.body as { error?: string } | undefined)?.error;
        setMessage(apiMessage ? `GreÅ¡ka: ${apiMessage}` : "GreÅ¡ka pri dodavanju proizvoda.");
      } else {
        setMessage("GreÅ¡ka pri dodavanju proizvoda.");
      }
    } finally {
      setProductsLoading(false);
    }
  }

  async function handleSaveProduct(product: Product) {
    const { payload, error } = buildProductPayload(product.id);
    if (error) {
      setMessage(error);
      return;
    }
    if (!payload) {
      setMessage("Nema izmena za ovaj proizvod.");
      return;
    }

    setProductsLoading(true);
    setMessage(null);
    try {
      await adminUpdateProduct(product.id, payload);
      await refreshProducts(false);
      setMessage("Proizvod je saÄuvan.");
    } catch {
      setMessage("NeuspeÅ¡no Äuvanje proizvoda.");
    } finally {
      setProductsLoading(false);
    }
  }

  async function handleSaveAllProducts() {
    const ids = new Set([
      ...Object.keys(productDrafts).map(Number),
      ...Object.keys(productSpecsDrafts).map(Number),
    ]);
    if (ids.size === 0) {
      setMessage("Nema izmena za Äuvanje.");
      return;
    }

    setProductsLoading(true);
    setMessage(null);
    try {
      for (const id of ids) {
        const { payload, error } = buildProductPayload(id);
        if (error) {
          setMessage(error);
          setProductsLoading(false);
          return;
        }
        if (!payload) continue;
        await adminUpdateProduct(id, payload);
      }
      await refreshProducts(false);
      setMessage("Sve izmene su saÄuvane.");
    } catch {
      setMessage("GreÅ¡ka pri grupnom Äuvanju proizvoda.");
    } finally {
      setProductsLoading(false);
    }
  }

  async function handleDeleteProduct(product: Product) {
    if (!isAuthenticated) return;
    if (!confirm(`Obrisati proizvod "${product.name}"?`)) return;
    setProductsLoading(true);
    setMessage(null);
    try {
      await adminDeleteProduct(product.id);
      await refreshProducts(false);
      setMessage("Proizvod je obrisan.");
    } catch {
      setMessage("NeuspeÅ¡no brisanje proizvoda.");
    } finally {
      setProductsLoading(false);
    }
  }

  async function handleProductImageUpload(productId: number, files: FileList | null) {
    if (!isAuthenticated || !files?.length) return;
    setProductUploading({ id: productId, type: "image" });
    setMessage(null);
    try {
      await uploadProductImage(productId, files[0]);
      await refreshProducts(false);
      setMessage("Slika proizvoda je sacuvana.");
    } catch (error) {
      const detail = extractApiErrorMessage(error);
      setMessage(detail ? `Greska: ${detail}` : "Neuspesno slanje slike.");
    } finally {
      setProductUploading(null);
    }
  }

  async function handleProductGalleryUpload(productId: number, files: FileList | null) {
    if (!isAuthenticated || !files?.length) return;
    setProductUploading({ id: productId, type: "gallery" });
    setMessage(null);
    try {
      for (const file of Array.from(files)) {
        await uploadProductGalleryImage(productId, file);
      }
      await refreshProductDetail(productId);
      setMessage("Galerija proizvoda je sacuvana.");
    } catch (error) {
      const detail = extractApiErrorMessage(error);
      setMessage(detail ? `Greska: ${detail}` : "Neuspesno slanje galerije.");
    } finally {
      setProductUploading(null);
    }
  }

  async function handleDeleteProductGalleryImage(productId: number, mediaId?: number) {
    if (!isAuthenticated || !mediaId) return;
    if (!confirm("Obrisati sliku iz galerije?")) return;
    setProductUploading({ id: productId, type: "gallery" });
    setMessage(null);
    try {
      await deleteProductGalleryImage(productId, mediaId);
      await refreshProductDetail(productId);
      setMessage("Slika iz galerije je obrisana.");
    } catch (error) {
      const detail = extractApiErrorMessage(error);
      setMessage(detail ? `Greska: ${detail}` : "Neuspesno brisanje slike.");
    } finally {
      setProductUploading(null);
    }
  }

  async function handleProductDocumentUpload(productId: number, files: FileList | null) {
    if (!isAuthenticated || !files?.length) return;
    setProductUploading({ id: productId, type: "document" });
    setMessage(null);
    try {
      await uploadProductDocument(productId, files[0]);
      await refreshProducts(false);
      setMessage("Dokument je sacuvan.");
    } catch (error) {
      const detail = extractApiErrorMessage(error);
      setMessage(detail ? `Greska: ${detail}` : "Neuspesno slanje dokumenta.");
    } finally {
      setProductUploading(null);
    }
  }

  async function handleBulkProducts(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const lines = bulkProducts
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      setMessage("Unesite barem jedan proizvod.");
      return;
    }

    setProductsLoading(true);
    setMessage(null);
    let created = 0;
    try {
      for (const line of lines) {
        const parts = line.split("|").map((part) => part.trim());
        const [name, category = "behaton", productType = "", shortDesc = ""] = parts;
        if (!name) continue;
        const normalizedCategory = (category || "behaton").trim().toLowerCase();
        await adminCreateProduct({
          name,
          category: normalizedCategory,
          product_type: productType || undefined,
          short_description: shortDesc,
          status: "draft",
        });
        created += 1;
      }
      setBulkProducts("");
      await refreshProducts(false);
      setMessage(`Dodato proizvoda: ${created}.`);
    } catch (error) {
      if (error instanceof ApiError) {
        const apiMessage =
          typeof error.body === "string"
            ? error.body
            : (error.body as { error?: string } | undefined)?.error;
        setMessage(apiMessage ? `GreÅ¡ka: ${apiMessage}` : "GreÅ¡ka pri masovnom unosu behatona.");
      } else {
        setMessage("GreÅ¡ka pri masovnom unosu behatona.");
      }
    } finally {
      setProductsLoading(false);
    }
  }

  async function handleStatusChange(project: Project, status: string) {
    if (!isAuthenticated) return;
    setIsFetching(true);
    setMessage(null);
    try {
      await adminUpdateProject(project.id, { status });
      await refreshProjects();
      setMessage("Status aÅ¾uriran.");
    } catch {
      setMessage("NeuspeÅ¡no aÅ¾uriranje statusa.");
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
      setMessage("NeuspeÅ¡no brisanje.");
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
    } catch (error) {
      const detail = extractApiErrorMessage(error);
      setMessage(
        detail ? `Greska: ${detail}` : "Nije uspelo postavljanje hero fotografije."
      );
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
      setMessage("Galerija je aÅ¾urirana.");
    } catch (error) {
      const detail = extractApiErrorMessage(error);
      setMessage(detail ? `Greska: ${detail}` : "Nije uspelo slanje galerije.");
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
      setMessage("Status porudÅ¾bine aÅ¾uriran.");
    } catch {
      setMessage("GreÅ¡ka pri aÅ¾uriranju porudÅ¾bine.");
    } finally {
      setOrdersLoading(false);
    }
  }

  async function handleDeleteOrder(order: Order) {
    if (!isAuthenticated) return;
    if (!confirm(`Obrisati porudžbinu "${order.name}"?`)) return;
    setOrdersLoading(true);
    setMessage(null);
    try {
      await adminDeleteOrder(order.id);
      await refreshOrders(false);
      setMessage("Porudžbina je obrisana.");
    } catch {
      setMessage("Neuspešno brisanje porudžbine.");
    } finally {
      setOrdersLoading(false);
    }
  }

  function resolveOrderService(order: Order): OrderServiceFilter {
    const subject = (order.subject || "").trim().toLowerCase();
    const type = (order.concrete_type || "").trim().toLowerCase();

    const isBehaton =
      subject.includes("behaton") || (type !== "" && !concreteTypeSet.has(type));
    if (isBehaton) return "behaton";

    const isBeton = subject.includes("beton") || (type !== "" && concreteTypeSet.has(type));
    if (isBeton) return "beton";

    return "other";
  }

  function toTelHref(phone?: string | null) {
    if (!phone) return "";
    const digits = phone.replace(/\D/g, "");
    return digits ? `tel:+${digits}` : "";
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

      {view === "ready" && showSectionSwitcher && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant={section === "projects" ? "solid" : "flat"}
            color="primary"
            onPress={() => setSection("projects")}
          >
            Projekti
          </Button>
          <Button
            variant={section === "products" ? "solid" : "flat"}
            color="primary"
            onPress={() => setSection("products")}
          >
            Behaton
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
                    <form key={newProjectFormKey} className="grid gap-4" onSubmit={handleCreateProject}>
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
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                            Hero slika (odmah)
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(event) => setNewProjectHero(event.target.files?.[0] || null)}
                            className="w-full cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-xs file:font-semibold file:text-dark"
                          />
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                            Galerija (vise slika)
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(event) =>
                              setNewProjectGallery(Array.from(event.target.files || []))
                            }
                            className="w-full cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-xs file:font-semibold file:text-dark"
                          />
                        </div>
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
                                <p className="text-[11px] text-gray-600">
                                  Možete odabrati više fajlova odjednom (držite Ctrl/Shift ili označite
                                  više slika).
                                </p>
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  disabled={isUploadingGallery}
                                  onChange={(event) =>
                                    handleGalleryUpload(project.id, event.target.files)
                                  }
                                  className="w-full cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-xs file:font-semibold file:text-dark"
                                />
                                {isUploadingGallery && (
                                  <p className="text-xs text-gray-500">Otpremanje galerije...</p>
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

          {section === "products" && (
            <>
              {isAuthenticated ? (
                <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                  <Card>
                    <CardHeader className="font-semibold">Novi behaton proizvod</CardHeader>
                    <CardBody>
                      <form key={newProductFormKey} className="grid gap-4" onSubmit={handleCreateProduct}>
                        <Input
                          label="Naziv"
                          value={newProduct.name}
                          onChange={(e) =>
                            setNewProduct((prev) => ({ ...prev, name: e.target.value }))
                          }
                          isRequired
                        />
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Input
                            label="Slug"
                            value={newProduct.slug}
                            onChange={(e) =>
                              setNewProduct((prev) => ({ ...prev, slug: e.target.value }))
                            }
                          />
                          <div className="rounded-2xl border border-black/5 bg-gray-50 px-4 py-3 text-xs text-gray-600">
                            Kategorija: <span className="font-semibold text-dark">behaton</span>
                          </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Input
                            label="Tip / kolekcija"
                            value={newProduct.product_type}
                            onChange={(e) =>
                              setNewProduct((prev) => ({ ...prev, product_type: e.target.value }))
                            }
                          />
                          <Input
                            label="Redosled"
                            type="number"
                            value={String(newProduct.sort_order)}
                            onChange={(e) =>
                              setNewProduct((prev) => ({
                                ...prev,
                                sort_order: Number(e.target.value) || 0,
                              }))
                            }
                          />
                        </div>
                        <Textarea
                          label="Kratak opis"
                          value={newProduct.short_description}
                          onChange={(e) =>
                            setNewProduct((prev) => ({
                              ...prev,
                              short_description: e.target.value,
                            }))
                          }
                          minRows={2}
                        />
                        <Textarea
                          label="Detaljan opis"
                          value={newProduct.description}
                          onChange={(e) =>
                            setNewProduct((prev) => ({ ...prev, description: e.target.value }))
                          }
                          minRows={3}
                        />
                        <Textarea
                          label="Primena"
                          value={newProduct.applications}
                          onChange={(e) =>
                            setNewProduct((prev) => ({ ...prev, applications: e.target.value }))
                          }
                          minRows={2}
                        />
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                              Slika proizvoda (odmah)
                            </p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(event) =>
                                setNewProductImage(event.target.files?.[0] || null)
                              }
                              className="w-full cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-xs file:font-semibold file:text-dark"
                            />
                          </div>
                          <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                              Dokument (PDF/DOC)
                            </p>
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx,.xls,.xlsx"
                              onChange={(event) =>
                                setNewProductDocument(event.target.files?.[0] || null)
                              }
                              className="w-full cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-xs file:font-semibold file:text-dark"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                            Galerija proizvoda (vise slika)
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(event) =>
                              setNewProductGallery(Array.from(event.target.files || []))
                            }
                            className="w-full cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-xs file:font-semibold file:text-dark"
                          />
                        </div>
                        <Textarea
                          label="Specifikacije (JSON)"
                          value={newProduct.specsText}
                          onChange={(e) =>
                            setNewProduct((prev) => ({ ...prev, specsText: e.target.value }))
                          }
                          minRows={3}
                        />
                        <Select
                          label="Status"
                          selectedKeys={[newProduct.status]}
                          onSelectionChange={(keys) => {
                            const value = Array.from(keys).at(0)?.toString() || "draft";
                            setNewProduct((prev) => ({ ...prev, status: value }));
                          }}
                        >
                          {statusOptions.map((item) => (
                            <SelectItem key={item.key}>{item.label}</SelectItem>
                          ))}
                        </Select>
                        <Button color="primary" type="submit" isDisabled={productsLoading}>
                          SaÄuvaj
                        </Button>
                      </form>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardHeader className="font-semibold">Brzi unos (viÅ¡e behatona)</CardHeader>
                    <CardBody>
                      <form className="grid gap-3" onSubmit={handleBulkProducts}>
                        <Textarea
                          label="Spisak behatona"
                          placeholder="Naziv | kategorija | tip | kratak opis"
                          value={bulkProducts}
                          onChange={(e) => setBulkProducts(e.target.value)}
                          minRows={6}
                        />
                        <p className="text-xs text-gray-500">
                          Format po liniji: Naziv | kategorija | tip | kratak opis. Kategorija i tip
                          mogu biti prazni.
                        </p>
                        <Button color="primary" type="submit" isDisabled={productsLoading}>
                          Dodaj behatone
                        </Button>
                      </form>
                    </CardBody>
                  </Card>
                </div>
              ) : (
                <Card className="border border-dashed border-primary bg-white/60">
                  <CardBody>
                    <p className="text-sm text-gray-600">
                      Za upravljanje behaton proizvodima potrebno je da se prijavite u admin panel.
                    </p>
                  </CardBody>
                </Card>
              )}

              <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-semibold">Behaton proizvodi</h2>
                    <p className="text-sm text-gray-600">
                      Pregled svih behatona iz baze (brza izmena, upload i status).
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="flat"
                      onPress={() => refreshProducts()}
                      isDisabled={productsLoading}
                    >
                      OsveÅ¾i
                    </Button>
                    <Button
                      color="primary"
                      variant="flat"
                      onPress={handleSaveAllProducts}
                      isDisabled={productsLoading || !hasProductDrafts}
                    >
                      SaÄuvaj sve izmene
                    </Button>
                  </div>
                </div>

                {products.length > 0 && (
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      { label: "Ukupno", value: products.length },
                      {
                        label: "Objavljeno",
                        value: products.filter((item) => item.status === "published").length,
                      },
                      {
                        label: "Draft",
                        value: products.filter((item) => item.status !== "published").length,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-2xl border border-black/5 bg-white px-4 py-4 text-sm shadow-sm"
                      >
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                          {item.label}
                        </p>
                        <p className="mt-1 text-2xl font-bold text-dark">{item.value}</p>
                      </div>
                    ))}
                  </div>
                )}

                <Card>
                  <CardBody className="grid gap-4 md:grid-cols-[1.3fr_0.9fr_auto]">
                    <Input
                      label="Pretraga"
                      placeholder="Naziv ili opis"
                      value={productQuery}
                      onChange={(e) => setProductQuery(e.target.value)}
                    />
                    <div className="rounded-2xl border border-black/5 bg-gray-50 px-4 py-3 text-xs text-gray-600">
                      Kategorija: <span className="font-semibold text-dark">behaton</span>
                    </div>
                    <Select
                      label="Status"
                      items={productStatusOptions}
                      selectedKeys={[productStatusFilter]}
                      onSelectionChange={(keys) =>
                        setProductStatusFilter(Array.from(keys).at(0)?.toString() || "all")
                      }
                    >
                      {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
                    </Select>
                    <Button
                      color="primary"
                      variant="flat"
                      onPress={() => refreshProducts()}
                      isDisabled={productsLoading}
                    >
                      Primeni
                    </Button>
                  </CardBody>
                </Card>

                {products.length > 0 && (
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                    {products.map((product) => (
                      <a
                        key={product.id}
                        href={`#product-${product.id}`}
                        className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white p-3 shadow-sm transition hover:-translate-y-1"
                      >
                        <div className="h-12 w-12 overflow-hidden rounded-xl border border-black/10 bg-gray-50">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-400">
                              Nema slike
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-dark">{product.name}</p>
                          <p className="text-xs text-gray-500">
                            {product.status === "published" ? "Objavljeno" : "Draft"}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                )}

                <div className="grid gap-4">
                  {products.map((product) => {
                    const draft = productDrafts[product.id];
                    const specsValue =
                      productSpecsDrafts[product.id] ??
                      (product.specs ? JSON.stringify(product.specs, null, 2) : "");
                    const isDirty = Boolean(draft) || productSpecsDrafts[product.id] !== undefined;
                    const value = <K extends keyof Product>(
                      field: K,
                      fallback: NonNullable<Product[K]>
                    ): Product[K] =>
                      draft && draft[field] !== undefined
                        ? (draft[field] ?? fallback)
                        : (product[field] ?? fallback);

                    return (
                      <div key={product.id} id={`product-${product.id}`}>
                        <Card>
                          <CardHeader className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold">{value("name", "")}</p>
                              <p className="text-xs text-gray-500">{value("slug", "")}</p>
                            </div>
                            <Chip
                              color={value("status", "draft") === "published" ? "success" : "default"}
                              variant="flat"
                            >
                              {value("status", "draft") === "published" ? "Objavljeno" : "Draft"}
                            </Chip>
                          </CardHeader>
                          <CardBody className="space-y-4">
                          <div className="grid gap-3 md:grid-cols-2">
                            <Input
                              label="Naziv"
                              value={String(value("name", ""))}
                              onChange={(e) => handleProductChange(product.id, "name", e.target.value)}
                            />
                            <Input
                              label="Slug"
                              value={String(value("slug", ""))}
                              onChange={(e) => handleProductChange(product.id, "slug", e.target.value)}
                            />
                            <div className="rounded-2xl border border-black/5 bg-gray-50 px-4 py-3 text-xs text-gray-600">
                              Kategorija: <span className="font-semibold text-dark">behaton</span>
                            </div>
                            <Input
                              label="Tip / kolekcija"
                              value={String(value("product_type", ""))}
                              onChange={(e) =>
                                handleProductChange(product.id, "product_type", e.target.value)
                              }
                            />
                            <div className="space-y-2">
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                                Slika proizvoda
                              </p>
                              {product.image && (
                                <div className="h-28 overflow-hidden rounded-xl border border-black/10 bg-gray-50">
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                disabled={productUploading?.id === product.id && productUploading.type === "image"}
                                onChange={(event) =>
                                  handleProductImageUpload(product.id, event.target.files)
                                }
                                className="w-full cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-xs file:font-semibold file:text-dark"
                              />
                            </div>
                            <div className="space-y-2">
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                                Galerija proizvoda
                              </p>
                              {product.gallery === undefined ? (
                                <div className="flex items-center justify-between rounded-xl border border-dashed border-black/10 bg-gray-50 px-3 py-2 text-xs text-gray-500">
                                  <span>Galerija nije ucitana.</span>
                                  <Button
                                    size="sm"
                                    variant="flat"
                                    onPress={() => refreshProductDetail(product.id)}
                                  >
                                    Ucitaj
                                  </Button>
                                </div>
                              ) : product.gallery.length > 0 ? (
                                <div className="grid gap-2 sm:grid-cols-3">
                                  {product.gallery.map((item) => (
                                    <div
                                      key={item.id ?? item.src}
                                      className="relative overflow-hidden rounded-xl border border-black/10 bg-gray-50"
                                    >
                                      <img
                                        src={item.src}
                                        alt={item.alt || product.name}
                                        className="h-24 w-full object-cover"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteProductGalleryImage(product.id, item.id)}
                                        className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-dark shadow"
                                      >
                                        Obrisi
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-gray-500">Nema slika u galeriji.</p>
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                disabled={productUploading?.id === product.id && productUploading.type === "gallery"}
                                onChange={(event) =>
                                  handleProductGalleryUpload(product.id, event.target.files)
                                }
                                className="w-full cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-xs file:font-semibold file:text-dark"
                              />
                            </div>
                            <Input
                              label="Redosled"
                              type="number"
                              value={String(value("sort_order", 0))}
                              onChange={(e) =>
                                handleProductChange(product.id, "sort_order", e.target.value)
                              }
                            />
                          </div>

                          <div className="grid gap-3 md:grid-cols-2">
                            <div className="space-y-2">
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                                Dokument (PDF/DOC)
                              </p>
                              {product.document && (
                                <a
                                  href={product.document}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex text-sm font-semibold text-primary"
                                >
                                  Pogledaj dokument
                                </a>
                              )}
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx,.xls,.xlsx"
                                disabled={
                                  productUploading?.id === product.id && productUploading.type === "document"
                                }
                                onChange={(event) =>
                                  handleProductDocumentUpload(product.id, event.target.files)
                                }
                                className="w-full cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-xs file:font-semibold file:text-dark"
                              />
                            </div>
                          </div>

                          <Textarea
                            label="Kratak opis"
                            value={String(value("short_description", ""))}
                            onChange={(e) =>
                              handleProductChange(product.id, "short_description", e.target.value)
                            }
                            minRows={2}
                          />

                          <details className="rounded-2xl border border-black/10 bg-gray-50 px-4 py-3">
                            <summary className="cursor-pointer text-sm font-semibold text-gray-700">
                              Detalji (opis, primena, specifikacije)
                            </summary>
                            <div className="mt-3 grid gap-3">
                              <Textarea
                                label="Opis"
                                value={String(value("description", ""))}
                                onChange={(e) =>
                                  handleProductChange(product.id, "description", e.target.value)
                                }
                                minRows={3}
                              />
                              <Textarea
                                label="Primena"
                                value={String(value("applications", ""))}
                                onChange={(e) =>
                                  handleProductChange(product.id, "applications", e.target.value)
                                }
                                minRows={2}
                              />
                              <Textarea
                                label="Specifikacije (JSON)"
                                value={specsValue}
                                onChange={(e) => handleProductSpecsChange(product.id, e.target.value)}
                                minRows={3}
                              />
                            </div>
                          </details>

                          <div className="flex flex-wrap items-center gap-3">
                            <Select
                              label="Status"
                              selectedKeys={[String(value("status", "draft"))]}
                              onSelectionChange={(keys) =>
                                handleProductChange(
                                  product.id,
                                  "status",
                                  Array.from(keys).at(0)?.toString() || "draft"
                                )
                              }
                              className="max-w-[220px]"
                            >
                              {statusOptions.map((item) => (
                                <SelectItem key={item.key}>{item.label}</SelectItem>
                              ))}
                            </Select>
                            <Button
                              color="primary"
                              variant={isDirty ? "solid" : "flat"}
                              onPress={() => handleSaveProduct(product)}
                              isDisabled={productsLoading}
                            >
                              SaÄuvaj
                            </Button>
                            <Button
                              color="danger"
                              variant="light"
                              onPress={() => handleDeleteProduct(product)}
                              isDisabled={productsLoading}
                            >
                              ObriÅ¡i
                            </Button>
                          </div>
                        </CardBody>
                        </Card>
                      </div>
                    );
                  })}
                </div>

                {products.length === 0 && (
                  <p className="text-sm text-gray-600">
                    Nema proizvoda. Dodajte prvi proizvod putem forme iznad.
                  </p>
                )}
              </section>
            </>
          )}

          {section === "orders" && (() => {
            const filteredOrders = orders.filter((order) => {
              if (orderServiceFilter === "all") return true;
              return resolveOrderService(order) === orderServiceFilter;
            });

            return (
              <section className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-semibold">Porudžbine</h2>
                    <p className="text-sm text-gray-600">
                      Pregled online porudžbina sa forme (status: nova / u obradi / zatvorena).
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Select
                      label="Filter"
                      items={orderServiceFilters as unknown as { key: string; label: string }[]}
                      selectedKeys={[orderServiceFilter]}
                      onSelectionChange={(keys) =>
                        setOrderServiceFilter(
                          (Array.from(keys).at(0)?.toString() as OrderServiceFilter) || "all"
                        )
                      }
                    >
                      {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
                    </Select>
                    <Button variant="flat" onPress={() => refreshOrders()} isDisabled={ordersLoading}>
                      Osveži
                    </Button>
                  </div>
                </div>

                {filteredOrders.length === 0 ? (
                  <p className="text-sm text-gray-600">Još uvek nema porudžbina.</p>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
                    <div className="hidden md:grid md:grid-cols-[1.4fr_1fr_1fr_1fr_0.8fr] md:gap-4 border-b border-black/5 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                      <span>Kontakt</span>
                      <span>Detalji</span>
                      <span>Poruka</span>
                      <span>Status</span>
                      <span>Akcije</span>
                    </div>
                    <div className="divide-y divide-black/5">
                      {filteredOrders.map((order) => (
                        <div
                          key={order.id}
                          className="grid gap-4 px-4 py-4 text-sm md:grid-cols-[1.4fr_1fr_1fr_1fr_0.8fr]"
                        >
                          <div className="space-y-1">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400 md:hidden">
                              Kontakt
                            </p>
                            <p className="font-semibold">{order.name}</p>
                            <p className="text-gray-600">
                              <a
                                href={`mailto:${order.email}`}
                                className="hover:text-primary"
                              >
                                {order.email}
                              </a>
                            </p>
                            {order.phone && (
                              <p className="text-gray-600">
                                <a
                                  href={toTelHref(order.phone)}
                                  className="hover:text-primary"
                                >
                                  {order.phone}
                                </a>
                              </p>
                            )}
                            <p className="text-xs text-gray-400">
                              {new Date(order.created_at).toLocaleString("sr-RS")}
                            </p>
                          </div>
                          <div className="space-y-1 text-gray-700">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400 md:hidden">
                              Detalji
                            </p>
                            {order.subject && <p>{order.subject}</p>}
                            {order.concrete_type && (
                              <p className="text-xs text-gray-500">Beton: {order.concrete_type}</p>
                            )}
                          </div>
                          <div className="text-gray-700">
                            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400 md:hidden">
                              Poruka
                            </p>
                            <p className="line-clamp-4 whitespace-pre-wrap">{order.message}</p>
                          </div>
                          <div className="flex items-center">
                            <p className="mr-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400 md:hidden">
                              Status
                            </p>
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
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="mr-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400 md:hidden">
                              Akcije
                            </p>
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
                            <Button
                              size="sm"
                              color="danger"
                              variant="light"
                              onPress={() => handleDeleteOrder(order)}
                              isDisabled={ordersLoading}
                            >
                              Obriši
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            );
          })()}
        </>
      )}
    </div>
  );
}



