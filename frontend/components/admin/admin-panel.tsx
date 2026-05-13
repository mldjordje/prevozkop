'use client';

import { useEffect, useMemo, useState } from "react";
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
import type { Order, OrderNote, OrderOffer, Product, Project } from "@/lib/api";
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
  adminUpdateOrder,
  adminCreateOrderNote,
  adminCreateOrderOffer,
  adminListOrderNotes,
  adminListOrderOffers,
  adminOfferPdfUrl,
  adminOfferPrintUrl,
  adminUpdateOrderOffer,
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

const orderPipelineOptions: { key: NonNullable<Order["pipeline_stage"]>; label: string }[] = [
  { key: "new", label: "Novi lead" },
  { key: "qualified", label: "Kvalifikovan" },
  { key: "offered", label: "Ponuda poslata" },
  { key: "negotiation", label: "Pregovori" },
  { key: "won", label: "Dobijen posao" },
  { key: "lost", label: "Izgubljen lead" },
];

const offerStatusOptions: { key: OrderOffer["status"]; label: string }[] = [
  { key: "draft", label: "Priprema" },
  { key: "sent", label: "Poslata" },
  { key: "accepted", label: "Prihvaćena" },
  { key: "paid", label: "Plaćena" },
  { key: "rejected", label: "Odbijena" },
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

const ADMIN_AUTH_STORAGE_KEY = "prevozkop-admin-authenticated";

type OrderServiceFilter = (typeof orderServiceFilters)[number]["key"];

type ViewState = "loading" | "login" | "ready";
type AdminSection = "overview" | "projects" | "orders" | "products";

type AdminPanelProps = {
  defaultSection?: AdminSection;
  showSectionSwitcher?: boolean;
  unauthenticatedMode?: "login" | "redirect";
};

export default function AdminPanel({
  defaultSection = "overview",
  showSectionSwitcher = true,
  unauthenticatedMode = "login",
}: AdminPanelProps) {
  const [view, setView] = useState<ViewState>("loading");
  const [section, setSection] = useState<AdminSection>(defaultSection);
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
  const [orderPipelineFilter, setOrderPipelineFilter] = useState<string>("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderFromDate, setOrderFromDate] = useState("");
  const [orderToDate, setOrderToDate] = useState("");
  const [orderFollowUpDrafts, setOrderFollowUpDrafts] = useState<Record<number, string>>({});
  const [orderLostReasonDrafts, setOrderLostReasonDrafts] = useState<Record<number, string>>({});
  const [orderNoteDrafts, setOrderNoteDrafts] = useState<Record<number, string>>({});
  const [orderNotes, setOrderNotes] = useState<Record<number, OrderNote[]>>({});
  const [orderNotesLoading, setOrderNotesLoading] = useState<Record<number, boolean>>({});
  const [orderOffers, setOrderOffers] = useState<Record<number, OrderOffer[]>>({});
  const [orderOffersLoading, setOrderOffersLoading] = useState<Record<number, boolean>>({});
  const [orderOfferDrafts, setOrderOfferDrafts] = useState<
    Record<
      number,
      {
        description: string;
        quantity: string;
        unit: string;
        unitPrice: string;
        taxRate: string;
        validUntil: string;
        paymentTerms: string;
        deliveryTerms: string;
        note: string;
      }
    >
  >({});
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

  const orderStats = useMemo(() => {
    const active = orders.filter((order) => order.status !== "done").length;
    const won = orders.filter((order) => order.pipeline_stage === "won").length;
    const followUps = orders.filter((order) => {
      if (!order.next_follow_up_at || order.status === "done") return false;
      return new Date(order.next_follow_up_at).getTime() <= Date.now() + 1000 * 60 * 60 * 24 * 3;
    }).length;
    const newest = orders[0]?.created_at ? new Date(orders[0].created_at).toLocaleDateString("sr-RS") : "-";

    return [
      { label: "Ukupno upita", value: orders.length, tone: "bg-gray-950 text-white" },
      { label: "Aktivno", value: active, tone: "bg-amber-100 text-amber-900" },
      { label: "Follow-up 3 dana", value: followUps, tone: "bg-sky-100 text-sky-900" },
      { label: "Dobijeni poslovi", value: won, tone: "bg-emerald-100 text-emerald-900" },
      { label: "Najnovija", value: newest, tone: "bg-white text-gray-900" },
    ];
  }, [orders]);

  const overviewAnalytics = useMemo(() => {
    const serviceCounts: Record<OrderServiceFilter, number> = {
      all: orders.length,
      beton: 0,
      behaton: 0,
      other: 0,
    };
    const statusCounts = orderStatusOptions.map((option) => ({
      ...option,
      count: orders.filter((order) => order.status === option.key).length,
    }));
    const pipelineCounts = orderPipelineOptions.map((option) => ({
      ...option,
      count: orders.filter((order) => (order.pipeline_stage || "new") === option.key).length,
    }));
    const sourceCounts = new Map<string, number>();
    let concreteM3 = 0;
    let behatonM2 = 0;

    orders.forEach((order) => {
      const service = resolveOrderService(order);
      serviceCounts[service] += 1;

      const quantity = parseOrderQuantity(order.quantity);
      const unit = (order.quantity_unit || "").toLowerCase();
      if (service === "beton" && (!unit || unit.includes("m3") || unit.includes("m³"))) {
        concreteM3 += quantity;
      }
      if (service === "behaton" && (!unit || unit.includes("m2") || unit.includes("m²"))) {
        behatonM2 += quantity;
      }

      const source =
        order.utm_campaign ||
        order.utm_source ||
        order.source_page ||
        "Direktno / bez izvora";
      sourceCounts.set(source, (sourceCounts.get(source) || 0) + 1);
    });

    const followUps = orders
      .filter((order) => order.next_follow_up_at && order.status !== "done")
      .sort(
        (a, b) =>
          new Date(a.next_follow_up_at || "").getTime() -
          new Date(b.next_follow_up_at || "").getTime()
      )
      .slice(0, 5);
    const latestOrders = [...orders]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
    const topSources = Array.from(sourceCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    const maxPipelineCount = Math.max(1, ...pipelineCounts.map((item) => item.count));

    return {
      serviceCounts,
      statusCounts,
      pipelineCounts,
      topSources,
      followUps,
      latestOrders,
      concreteM3,
      behatonM2,
      maxPipelineCount,
      activeOrders: orders.filter((order) => order.status !== "done").length,
      wonOrders: orders.filter((order) => order.pipeline_stage === "won").length,
      lostOrders: orders.filter((order) => order.pipeline_stage === "lost").length,
    };
  }, [orders]);

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
    if ((section === "orders" || section === "overview") && isAuthenticated) {
      refreshOrders();
    }
  }, [section, isAuthenticated]);

  useEffect(() => {
    if ((section === "orders" || section === "overview") && isAuthenticated) {
      refreshOrders();
    }
  }, [orderServiceFilter, orderPipelineFilter, orderSearch, orderFromDate, orderToDate]);

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
      localStorage.setItem(ADMIN_AUTH_STORAGE_KEY, "1");
      void loadProjectDetails(res.data);
      if (section === "orders" || section === "overview") {
        void refreshOrders(false, true);
      }
      if (section === "products") {
        void refreshProducts(false, true);
      }
    } catch (error) {
      setIsAuthenticated(false);
      if (error instanceof ApiError && error.status === 401) {
        localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
        if (unauthenticatedMode === "redirect") {
          window.location.href = "/admin";
          return;
        }
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

  async function refreshOrders(showLoader: boolean = true, force: boolean = false) {
    if (!force && !isAuthenticated) return;
    if (showLoader) setOrdersLoading(true);
    setMessage(null);
    try {
      const res = await adminListOrders({
        service_type: orderServiceFilter !== "all" ? orderServiceFilter : undefined,
        pipeline_stage: orderPipelineFilter !== "all" ? orderPipelineFilter : undefined,
        q: orderSearch || undefined,
        from: orderFromDate || undefined,
        to: orderToDate || undefined,
        limit: 300,
        offset: 0,
      });
      setOrders(res.data);
    } catch {
      setMessage("Neuspešno učitavanje porudžbina.");
    } finally {
      if (showLoader) setOrdersLoading(false);
    }
  }

  async function refreshProducts(showLoader: boolean = true, force: boolean = false) {
    if (!force && !isAuthenticated) return;
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
      setMessage("Neuspešno učitavanje proizvoda.");
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
      localStorage.setItem(ADMIN_AUTH_STORAGE_KEY, "1");
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
          : "Projekat je uspešno kreiran."
      );
    } catch (error) {
      if (error instanceof ApiError) {
        const apiMessage =
          typeof error.body === "string"
            ? error.body
            : (error.body as { error?: string } | undefined)?.error;
        const text = apiMessage
          ? `Greška (${error.status}): ${apiMessage}`
          : `Greška (${error.status}) prilikom čuvanja.`;
        setMessage(text);
      } else {
        setMessage("Greška prilikom čuvanja.");
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
          : "Proizvod je uspešno dodat."
      );
    } catch (error) {
      if (error instanceof ApiError) {
        const apiMessage =
          typeof error.body === "string"
            ? error.body
            : (error.body as { error?: string } | undefined)?.error;
        setMessage(apiMessage ? `Greška: ${apiMessage}` : "Greška pri dodavanju proizvoda.");
      } else {
        setMessage("Greška pri dodavanju proizvoda.");
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
      setMessage("Proizvod je sačuvan.");
    } catch {
      setMessage("Neuspešno čuvanje proizvoda.");
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
      setMessage("Nema izmena za čuvanje.");
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
      setMessage("Sve izmene su sačuvane.");
    } catch {
      setMessage("Greška pri grupnom čuvanju proizvoda.");
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
      setMessage("Neuspešno brisanje proizvoda.");
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
        setMessage(apiMessage ? `Greška: ${apiMessage}` : "Greška pri masovnom unosu behatona.");
      } else {
        setMessage("Greška pri masovnom unosu behatona.");
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
      setMessage("Galerija je ažurirana.");
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
      await adminUpdateOrder(order.id, { status });
      await refreshOrders(false);
      setMessage("Status porudžbine ažuriran.");
    } catch {
      setMessage("Greška pri ažuriranju porudžbine.");
    } finally {
      setOrdersLoading(false);
    }
  }

  async function handleOrderPipeline(order: Order, pipelineStage: NonNullable<Order["pipeline_stage"]>) {
    if (!isAuthenticated || order.pipeline_stage === pipelineStage) return;
    setOrdersLoading(true);
    setMessage(null);
    try {
      await adminUpdateOrder(order.id, { pipeline_stage: pipelineStage });
      await refreshOrders(false);
      setMessage("Faza lead-a je ažurirana.");
    } catch {
      setMessage("Greška pri ažuriranju faze.");
    } finally {
      setOrdersLoading(false);
    }
  }

  async function handleOrderFollowUp(order: Order) {
    if (!isAuthenticated) return;
    const next_follow_up_at =
      orderFollowUpDrafts[order.id] !== undefined
        ? orderFollowUpDrafts[order.id]
        : order.next_follow_up_at || "";
    const lost_reason =
      orderLostReasonDrafts[order.id] !== undefined
        ? orderLostReasonDrafts[order.id]
        : order.lost_reason || "";

    setOrdersLoading(true);
    setMessage(null);
    try {
      await adminUpdateOrder(order.id, {
        next_follow_up_at: next_follow_up_at || null,
        lost_reason: lost_reason || null,
      });
      await refreshOrders(false);
      setMessage("Lead podaci su sačuvani.");
    } catch {
      setMessage("Greška pri čuvanju lead podataka.");
    } finally {
      setOrdersLoading(false);
    }
  }

  async function loadOrderNotes(orderId: number) {
    if (!isAuthenticated) return;
    setOrderNotesLoading((prev) => ({ ...prev, [orderId]: true }));
    try {
      const res = await adminListOrderNotes(orderId);
      setOrderNotes((prev) => ({ ...prev, [orderId]: res.data || [] }));
    } catch {
      setMessage("Neuspešno učitavanje beleški.");
    } finally {
      setOrderNotesLoading((prev) => ({ ...prev, [orderId]: false }));
    }
  }

  async function handleCreateOrderNote(order: Order) {
    if (!isAuthenticated) return;
    const note = (orderNoteDrafts[order.id] || "").trim();
    if (!note) {
      setMessage("Unesite belešku pre čuvanja.");
      return;
    }
    setOrdersLoading(true);
    setMessage(null);
    try {
      await adminCreateOrderNote(order.id, note);
      setOrderNoteDrafts((prev) => ({ ...prev, [order.id]: "" }));
      await loadOrderNotes(order.id);
      setMessage("Beleška je sačuvana.");
    } catch {
      setMessage("Greška pri čuvanju beleške.");
    } finally {
      setOrdersLoading(false);
    }
  }

  function getOfferDraft(order: Order) {
    const service = resolveOrderService(order);
    return (
      orderOfferDrafts[order.id] || {
        description: order.subject || (service === "beton" ? "Isporuka betona" : service === "behaton" ? "Isporuka behatona" : "Građevinska usluga"),
        quantity: order.quantity || "1",
        unit: order.quantity_unit || (service === "beton" ? "m3" : service === "behaton" ? "m2" : "kom"),
        unitPrice: "",
        taxRate: "0",
        validUntil: "",
        paymentTerms: "Avans / plaćanje po dogovoru",
        deliveryTerms: "Rok isporuke po dogovoru",
        note: "",
      }
    );
  }

  function updateOfferDraft(order: Order, field: keyof ReturnType<typeof getOfferDraft>, value: string) {
    setOrderOfferDrafts((prev) => ({
      ...prev,
      [order.id]: {
        ...getOfferDraft(order),
        ...prev[order.id],
        [field]: value,
      },
    }));
  }

  async function loadOrderOffers(orderId: number) {
    if (!isAuthenticated) return;
    setOrderOffersLoading((prev) => ({ ...prev, [orderId]: true }));
    try {
      const res = await adminListOrderOffers(orderId);
      setOrderOffers((prev) => ({ ...prev, [orderId]: res.data || [] }));
    } catch {
      setMessage("Neuspešno učitavanje ponuda.");
    } finally {
      setOrderOffersLoading((prev) => ({ ...prev, [orderId]: false }));
    }
  }

  async function handleCreateOrderOffer(order: Order) {
    if (!isAuthenticated) return;
    const draft = getOfferDraft(order);
    const description = draft.description.trim();
    const quantity = Number(draft.quantity.replace(",", "."));
    const unitPrice = Number(draft.unitPrice.replace(",", "."));
    const taxRate = Number(draft.taxRate.replace(",", "."));

    if (!description || !quantity || !unitPrice) {
      setMessage("Unesite opis, količinu i cenu za ponudu.");
      return;
    }

    setOrdersLoading(true);
    setMessage(null);
    try {
      await adminCreateOrderOffer(order.id, {
        items: [
          {
            description,
            quantity,
            unit: draft.unit.trim() || "kom",
            unit_price: unitPrice,
          },
        ],
        tax_rate: Number.isFinite(taxRate) ? taxRate : 0,
        valid_until: draft.validUntil || null,
        payment_terms: draft.paymentTerms || null,
        delivery_terms: draft.deliveryTerms || null,
        note: draft.note || null,
      });
      setOrderOfferDrafts((prev) => {
        const next = { ...prev };
        delete next[order.id];
        return next;
      });
      await loadOrderOffers(order.id);
      await handleOrderPipeline(order, "offered");
      setMessage("Ponuda je kreirana i lead je prebačen u fazu ponude.");
    } catch {
      setMessage("Greška pri kreiranju ponude.");
    } finally {
      setOrdersLoading(false);
    }
  }

  async function handleOfferStatus(offer: OrderOffer, status: OrderOffer["status"]) {
    if (!isAuthenticated || offer.status === status) return;
    setOrderOffersLoading((prev) => ({ ...prev, [offer.order_id]: true }));
    setMessage(null);
    try {
      const updated = await adminUpdateOrderOffer(offer.id, { status });
      setOrderOffers((prev) => ({
        ...prev,
        [offer.order_id]: (prev[offer.order_id] || []).map((item) =>
          item.id === updated.id ? updated : item
        ),
      }));
      setMessage("Status ponude je ažuriran.");
    } catch {
      setMessage("Greška pri ažuriranju ponude.");
    } finally {
      setOrderOffersLoading((prev) => ({ ...prev, [offer.order_id]: false }));
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
    if (order.service_type === "beton" || order.service_type === "behaton" || order.service_type === "other") {
      return order.service_type;
    }

    const subject = (order.subject || "").trim().toLowerCase();
    const type = (order.concrete_type || "").trim().toLowerCase();

    const isBehaton =
      subject.includes("behaton") || (type !== "" && !concreteTypeSet.has(type));
    if (isBehaton) return "behaton";

    const isBeton = subject.includes("beton") || (type !== "" && concreteTypeSet.has(type));
    if (isBeton) return "beton";

    return "other";
  }

  function getOrderServiceLabel(service: OrderServiceFilter) {
    return orderServiceFilters.find((item) => item.key === service)?.label || service;
  }

  function parseOrderQuantity(value?: string | null) {
    if (!value) return 0;
    const normalized = value
      .replace(/\./g, "")
      .replace(",", ".")
      .match(/\d+(\.\d+)?/);
    return normalized ? Number(normalized[0]) || 0 : 0;
  }

  function formatMetricNumber(value: number, maximumFractionDigits: number = 1) {
    return new Intl.NumberFormat("sr-RS", {
      maximumFractionDigits,
    }).format(value);
  }

  function toTelHref(phone?: string | null) {
    if (!phone) return "";
    const digits = phone.replace(/\D/g, "");
    return digits ? `tel:+${digits}` : "";
  }

  function getOrderPipelineLabel(stage?: Order["pipeline_stage"] | null) {
    return orderPipelineOptions.find((item) => item.key === (stage || "new"))?.label || "Novi lead";
  }

  function getOrderStatusLabel(status: Order["status"]) {
    return orderStatusOptions.find((item) => item.key === status)?.label || status;
  }

  function getOrderStatusClasses(status: Order["status"]) {
    if (status === "done") return "border-emerald-200 bg-emerald-50 text-emerald-700";
    if (status === "in_progress") return "border-amber-200 bg-amber-50 text-amber-800";
    return "border-sky-200 bg-sky-50 text-sky-800";
  }

  function getOrderPipelineClasses(stage?: Order["pipeline_stage"] | null) {
    if (stage === "won") return "border-emerald-200 bg-emerald-50 text-emerald-800";
    if (stage === "lost") return "border-rose-200 bg-rose-50 text-rose-800";
    if (stage === "negotiation" || stage === "offered") {
      return "border-amber-200 bg-amber-50 text-amber-800";
    }
    return "border-gray-200 bg-white text-gray-700";
  }

  function formatOrderDate(value?: string | null) {
    if (!value) return "-";
    return new Date(value).toLocaleString("sr-RS", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatFollowUpDate(value?: string | null) {
    if (!value) return "Nije zakazano";
    return formatOrderDate(value);
  }

  async function handleLogout() {
    await adminLogout();
    localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
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
            variant={section === "overview" ? "solid" : "flat"}
            color="primary"
            onPress={() => setSection("overview")}
          >
            Pregled
          </Button>
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
          {section === "overview" && (
            <section className="space-y-6">
              <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                  <div className="max-w-3xl">
                    <h2 className="text-2xl font-semibold text-dark">Pregled poslovanja</h2>
                    <p className="mt-1 text-sm text-gray-600">
                      Analitika upita, količina i prodajnog toka za reklame, kontaktiranje i ponude.
                    </p>
                  </div>
                  <Button
                    color="primary"
                    onPress={() => refreshOrders()}
                    isDisabled={ordersLoading}
                    className="w-full sm:w-auto"
                  >
                    Osveži analitiku
                  </Button>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-xl bg-gray-950 px-4 py-4 text-white shadow-sm">
                    <p className="text-xs font-semibold uppercase">Ukupno porudžbina</p>
                    <p className="mt-2 text-3xl font-bold">{overviewAnalytics.serviceCounts.all}</p>
                    <p className="mt-1 text-xs text-gray-300">Aktivno: {overviewAnalytics.activeOrders}</p>
                  </div>
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-amber-950 shadow-sm">
                    <p className="text-xs font-semibold uppercase">Beton količina</p>
                    <p className="mt-2 text-3xl font-bold">
                      {formatMetricNumber(overviewAnalytics.concreteM3)} m3
                    </p>
                    <p className="mt-1 text-xs text-amber-800">Upita: {overviewAnalytics.serviceCounts.beton}</p>
                  </div>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-emerald-950 shadow-sm">
                    <p className="text-xs font-semibold uppercase">Behaton količina</p>
                    <p className="mt-2 text-3xl font-bold">
                      {formatMetricNumber(overviewAnalytics.behatonM2)} m2
                    </p>
                    <p className="mt-1 text-xs text-emerald-800">Upita: {overviewAnalytics.serviceCounts.behaton}</p>
                  </div>
                  <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-4 text-sky-950 shadow-sm">
                    <p className="text-xs font-semibold uppercase">Dobijeno / izgubljeno</p>
                    <p className="mt-2 text-3xl font-bold">
                      {overviewAnalytics.wonOrders} / {overviewAnalytics.lostOrders}
                    </p>
                    <p className="mt-1 text-xs text-sky-800">Pipeline rezultat</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-dark">Lead pipeline</h3>
                      <p className="text-sm text-gray-500">Gde se trenutno nalaze upiti.</p>
                    </div>
                    <Chip variant="flat">{orders.length} ukupno</Chip>
                  </div>
                  <div className="space-y-3">
                    {overviewAnalytics.pipelineCounts.map((item) => {
                      const width = `${Math.max(6, (item.count / overviewAnalytics.maxPipelineCount) * 100)}%`;
                      return (
                        <div key={item.key}>
                          <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                            <span className="font-medium text-gray-700">{item.label}</span>
                            <span className="font-semibold text-dark">{item.count}</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                            <div className="h-full rounded-full bg-primary" style={{ width }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
                  <h3 className="text-lg font-semibold text-dark">Izvori i reklame</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Prati UTM kampanju, izvor i stranicu dolaska.
                  </p>
                  <div className="mt-4 space-y-3">
                    {overviewAnalytics.topSources.length === 0 ? (
                      <p className="text-sm text-gray-500">Još nema izvora za prikaz.</p>
                    ) : (
                      overviewAnalytics.topSources.map(([source, count]) => (
                        <div
                          key={source}
                          className="flex items-center justify-between gap-3 rounded-xl border border-black/5 bg-gray-50 px-3 py-2 text-sm"
                        >
                          <span className="min-w-0 truncate text-gray-700">{source}</span>
                          <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-dark">
                            {count}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-5 xl:grid-cols-2">
                <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
                  <h3 className="text-lg font-semibold text-dark">Follow-up lista</h3>
                  <p className="mt-1 text-sm text-gray-500">Najbliži aktivni kontakti za zatvaranje posla.</p>
                  <div className="mt-4 divide-y divide-black/5">
                    {overviewAnalytics.followUps.length === 0 ? (
                      <p className="py-3 text-sm text-gray-500">Nema zakazanih follow-upova.</p>
                    ) : (
                      overviewAnalytics.followUps.map((order) => (
                        <div key={order.id} className="py-3">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-dark">{order.name}</p>
                              <p className="text-sm text-gray-600">{order.phone || order.email}</p>
                            </div>
                            <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800">
                              {formatFollowUpDate(order.next_follow_up_at)}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-gray-600">
                            {order.subject || getOrderServiceLabel(resolveOrderService(order))}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
                  <h3 className="text-lg font-semibold text-dark">Najnovije porudžbine</h3>
                  <p className="mt-1 text-sm text-gray-500">Brzi pogled pre ulaska u detaljan CRM.</p>
                  <div className="mt-4 divide-y divide-black/5">
                    {overviewAnalytics.latestOrders.length === 0 ? (
                      <p className="py-3 text-sm text-gray-500">Još nema porudžbina.</p>
                    ) : (
                      overviewAnalytics.latestOrders.map((order) => (
                        <div key={order.id} className="py-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="font-semibold text-dark">{order.name}</p>
                            <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${getOrderStatusClasses(order.status)}`}>
                              {getOrderStatusLabel(order.status)}
                            </span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                            <span>{formatOrderDate(order.created_at)}</span>
                            <span>{getOrderServiceLabel(resolveOrderService(order))}</span>
                            {order.quantity && (
                              <span>
                                {order.quantity} {order.quantity_unit || ""}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-dark">Prodajni sistem</h3>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {[
                    {
                      title: "Ponude iz porudžbine",
                      text: "Iz svakog lead-a napravite ponudu sa stavkama, cenom, rokom i statusom slanja.",
                    },
                    {
                      title: "PDF za slanje kupcu",
                      text: "Ponuda ima i pregled za štampu i direktan PDF download iz admin panela.",
                    },
                    {
                      title: "Naplata i zatvaranje",
                      text: "Statusi ponude, prihvaćeno i plaćeno čuvaju realan prodajni tok na jednom mestu.",
                    },
                  ].map((item) => (
                    <div key={item.title} className="rounded-xl border border-black/5 bg-gray-50 p-4">
                      <p className="font-semibold text-dark">{item.title}</p>
                      <p className="mt-2 text-sm text-gray-600">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

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
                          Sačuvaj
                        </Button>
                      </form>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardHeader className="font-semibold">Brzi unos (više behatona)</CardHeader>
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
                      Osveži
                    </Button>
                    <Button
                      color="primary"
                      variant="flat"
                      onPress={handleSaveAllProducts}
                      isDisabled={productsLoading || !hasProductDrafts}
                    >
                      Sačuvaj sve izmene
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
                        ? (draft[field] as Product[K])
                        : ((product[field] ?? fallback) as Product[K]);

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
                              Sačuvaj
                            </Button>
                            <Button
                              color="danger"
                              variant="light"
                              onPress={() => handleDeleteProduct(product)}
                              isDisabled={productsLoading}
                            >
                              Obriši
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

          {section === "orders" && (
            <section className="space-y-5">
              <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm sm:p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                  <div className="max-w-2xl">
                    <h2 className="text-2xl font-semibold text-dark">Porudžbine</h2>
                    <p className="mt-1 text-sm text-gray-600">
                      Pregled upita, lead faza, follow-up i beleške na jednom mestu.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      variant="flat"
                      onPress={() => {
                        setOrderServiceFilter("all");
                        setOrderPipelineFilter("all");
                        setOrderFromDate("");
                        setOrderToDate("");
                        setOrderSearch("");
                      }}
                      className="w-full sm:w-auto"
                    >
                      Reset filtera
                    </Button>
                    <Button
                      color="primary"
                      onPress={() => refreshOrders()}
                      isDisabled={ordersLoading}
                      className="w-full sm:w-auto"
                    >
                      Osveži porudžbine
                    </Button>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                  {orderStats.map((stat) => (
                    <div
                      key={stat.label}
                      className={`rounded-xl border border-black/5 px-4 py-3 shadow-sm ${stat.tone}`}
                    >
                      <p className="text-xs font-semibold uppercase">{stat.label}</p>
                      <p className="mt-1 text-2xl font-bold">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-black/5 bg-gray-50 p-4 shadow-sm sm:p-5">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_1fr_0.8fr_0.8fr_1.3fr]">
                  <Select
                    label="Usluga"
                    size="sm"
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
                  <Select
                    label="Faza"
                    size="sm"
                    items={[{ key: "all", label: "Sve faze" }, ...orderPipelineOptions] as {
                      key: string;
                      label: string;
                    }[]}
                    selectedKeys={[orderPipelineFilter]}
                    onSelectionChange={(keys) =>
                      setOrderPipelineFilter(Array.from(keys).at(0)?.toString() || "all")
                    }
                  >
                    {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
                  </Select>
                  <Input
                    label="Od datuma"
                    size="sm"
                    type="date"
                    value={orderFromDate}
                    onChange={(e) => setOrderFromDate(e.target.value)}
                  />
                  <Input
                    label="Do datuma"
                    size="sm"
                    type="date"
                    value={orderToDate}
                    onChange={(e) => setOrderToDate(e.target.value)}
                  />
                  <Input
                    label="Pretraga"
                    size="sm"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Ime, email, telefon..."
                  />
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-black/10 bg-white px-5 py-8 text-center">
                  <p className="text-sm font-semibold text-dark">Nema porudžbina za izabrane filtere.</p>
                  <p className="mt-1 text-sm text-gray-500">Promenite filtere ili osvežite listu.</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
                  <div className="hidden grid-cols-[1.25fr_1fr_1fr_1.15fr_0.9fr] gap-4 border-b border-black/5 bg-gray-50 px-5 py-3 text-xs font-semibold uppercase text-gray-500 xl:grid">
                    <span>Kontakt</span>
                    <span>Upit</span>
                    <span>Status</span>
                    <span>Lead rad</span>
                    <span>Akcije</span>
                  </div>

                  <div className="divide-y divide-black/5">
                    {orders.map((order) => {
                      const service = resolveOrderService(order);
                      const followUpValue =
                        orderFollowUpDrafts[order.id] ??
                        (order.next_follow_up_at
                          ? new Date(order.next_follow_up_at).toISOString().slice(0, 16)
                          : "");
                      const notes = orderNotes[order.id] || [];
                      const offers = orderOffers[order.id] || [];
                      const offerDraft = getOfferDraft(order);
                      const draftQuantity = Number(offerDraft.quantity.replace(",", ".")) || 0;
                      const draftUnitPrice = Number(offerDraft.unitPrice.replace(",", ".")) || 0;
                      const draftTaxRate = Number(offerDraft.taxRate.replace(",", ".")) || 0;
                      const draftSubtotal = draftQuantity * draftUnitPrice;
                      const draftTotal = draftSubtotal + draftSubtotal * (draftTaxRate / 100);

                      return (
                        <article
                          key={order.id}
                          className="grid gap-5 px-4 py-5 transition hover:bg-gray-50/80 sm:px-5 xl:grid-cols-[1.1fr_1fr_0.9fr_1fr_1.2fr] xl:gap-4"
                        >
                          <div className="min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-base font-semibold text-dark">{order.name}</p>
                                <p className="mt-1 text-xs text-gray-500">{formatOrderDate(order.created_at)}</p>
                              </div>
                              <span className="rounded-full border border-black/5 bg-white px-2 py-1 text-xs font-semibold text-gray-600">
                                #{order.id}
                              </span>
                            </div>
                            <div className="mt-3 space-y-1 text-sm">
                              <a href={`mailto:${order.email}`} className="block break-all text-gray-700 hover:text-primary">
                                {order.email}
                              </a>
                              {order.phone && (
                                <a href={toTelHref(order.phone)} className="block text-gray-700 hover:text-primary">
                                  {order.phone}
                                </a>
                              )}
                            </div>
                          </div>

                          <div className="min-w-0 text-sm text-gray-700">
                            <div className="mb-3 flex flex-wrap gap-2">
                              <span className="rounded-full border border-black/5 bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                                {getOrderServiceLabel(service)}
                              </span>
                              {order.city_slug && (
                                <span className="rounded-full border border-black/5 bg-white px-2.5 py-1 text-xs font-semibold text-gray-600">
                                  {order.city_slug}
                                </span>
                              )}
                            </div>
                            {order.subject && <p className="font-medium text-dark">{order.subject}</p>}
                            {order.concrete_type && <p className="mt-1">Tip: {order.concrete_type}</p>}
                            {order.quantity && (
                              <p className="mt-1">
                                Količina: {order.quantity} {order.quantity_unit || ""}
                              </p>
                            )}
                            <details className="mt-3">
                              <summary className="cursor-pointer text-xs font-semibold text-primary">
                                Prikaži poruku
                              </summary>
                              <p className="mt-2 max-h-36 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-gray-50 p-3 text-sm text-gray-700">
                                {order.message || "Nema poruke."}
                              </p>
                            </details>
                          </div>

                          <div className="min-w-0 space-y-3">
                            <div className="flex flex-wrap gap-2">
                              <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getOrderStatusClasses(order.status)}`}>
                                {getOrderStatusLabel(order.status)}
                              </span>
                              <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getOrderPipelineClasses(order.pipeline_stage)}`}>
                                {getOrderPipelineLabel(order.pipeline_stage)}
                              </span>
                            </div>
                            <Select
                              label="Lead faza"
                              size="sm"
                              selectedKeys={[order.pipeline_stage || "new"]}
                              onSelectionChange={(keys) =>
                                handleOrderPipeline(
                                  order,
                                  (Array.from(keys).at(0)?.toString() as NonNullable<Order["pipeline_stage"]>) || "new"
                                )
                              }
                            >
                              {orderPipelineOptions.map((item) => (
                                <SelectItem key={item.key}>{item.label}</SelectItem>
                              ))}
                            </Select>
                            <div className="flex flex-wrap gap-2">
                              {orderStatusOptions.map((opt) => (
                                <Button
                                  key={opt.key}
                                  size="sm"
                                  variant={order.status === opt.key ? "solid" : "flat"}
                                  color={order.status === opt.key ? "primary" : "default"}
                                  onPress={() => handleOrderStatus(order, opt.key)}
                                  isDisabled={ordersLoading}
                                  className="min-w-[5.5rem] px-3 text-xs"
                                >
                                  {opt.label}
                                </Button>
                              ))}
                            </div>
                          </div>

                          <div className="min-w-0 space-y-3">
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-gray-700">Sledeći follow-up</p>
                              <Input
                                aria-label="Sledeći follow-up"
                                size="sm"
                                type="datetime-local"
                                value={followUpValue}
                                onChange={(e) =>
                                  setOrderFollowUpDrafts((prev) => ({
                                    ...prev,
                                    [order.id]: e.target.value,
                                  }))
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-gray-700">Razlog izgubljenog lead-a</p>
                              <Input
                                aria-label="Razlog izgubljenog lead-a"
                                size="sm"
                                value={orderLostReasonDrafts[order.id] ?? order.lost_reason ?? ""}
                                onChange={(e) =>
                                  setOrderLostReasonDrafts((prev) => ({
                                    ...prev,
                                    [order.id]: e.target.value,
                                  }))
                                }
                                placeholder="Cena, konkurencija, odloženo..."
                              />
                            </div>
                            <div className="rounded-xl border border-black/5 bg-gray-50 px-3 py-2 text-xs text-gray-600">
                              Follow-up: <span className="font-semibold text-dark">{formatFollowUpDate(order.next_follow_up_at)}</span>
                            </div>
                            <Button
                              size="sm"
                              color="primary"
                              variant="flat"
                              onPress={() => handleOrderFollowUp(order)}
                              isDisabled={ordersLoading}
                              className="w-full"
                            >
                              Sačuvaj lead polja
                            </Button>
                          </div>

                          <div className="min-w-0 space-y-3">
                            <div className="grid gap-2 sm:grid-cols-2">
                              <Button
                                as="a"
                                href={`mailto:${order.email}`}
                                size="sm"
                                variant="flat"
                                className="min-w-0"
                              >
                                Email
                              </Button>
                              {order.phone ? (
                                <Button
                                  as="a"
                                  href={toTelHref(order.phone)}
                                  size="sm"
                                  variant="flat"
                                  className="min-w-0"
                                >
                                  Poziv
                                </Button>
                              ) : (
                                <Button size="sm" variant="flat" isDisabled className="min-w-0">
                                  Poziv
                                </Button>
                              )}
                            </div>
                            <details className="rounded-xl border border-black/5 bg-gray-50 p-3">
                              <summary className="cursor-pointer text-sm font-semibold text-dark">
                                Beleške {notes.length > 0 ? `(${notes.length})` : ""}
                              </summary>
                              <div className="mt-3 space-y-3">
                                <Textarea
                                  label="Nova beleška"
                                  size="sm"
                                  value={orderNoteDrafts[order.id] || ""}
                                  onChange={(e) =>
                                    setOrderNoteDrafts((prev) => ({
                                      ...prev,
                                      [order.id]: e.target.value,
                                    }))
                                  }
                                  minRows={2}
                                />
                                <div className="grid gap-2 sm:grid-cols-3">
                                  <Button
                                    size="sm"
                                    variant="flat"
                                    onPress={() => loadOrderNotes(order.id)}
                                    isDisabled={orderNotesLoading[order.id]}
                                  >
                                    Učitaj
                                  </Button>
                                  <Button
                                    size="sm"
                                    color="primary"
                                    onPress={() => handleCreateOrderNote(order)}
                                    isDisabled={ordersLoading}
                                  >
                                    Dodaj
                                  </Button>
                                </div>
                                {notes.length > 0 && (
                                  <div className="space-y-2">
                                    {notes.map((note) => (
                                      <div
                                        key={note.id}
                                        className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
                                      >
                                        <p className="whitespace-pre-wrap text-gray-700">{note.note}</p>
                                        <p className="mt-1 text-xs text-gray-400">{formatOrderDate(note.created_at)}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </details>
                            <details className="rounded-xl border border-black/5 bg-gray-50 p-3">
                              <summary className="cursor-pointer text-sm font-semibold text-dark">
                                Ponude {offers.length > 0 ? `(${offers.length})` : ""}
                              </summary>
                              <div className="mt-3 space-y-3">
                                <div className="grid gap-2">
                                  <Input
                                    label="Opis stavke"
                                    size="sm"
                                    value={offerDraft.description}
                                    onChange={(e) => updateOfferDraft(order, "description", e.target.value)}
                                  />
                                  <div className="grid gap-2">
                                    <Input
                                      label="Količina"
                                      size="sm"
                                      value={offerDraft.quantity}
                                      onChange={(e) => updateOfferDraft(order, "quantity", e.target.value)}
                                    />
                                    <Input
                                      label="Jedinica"
                                      size="sm"
                                      value={offerDraft.unit}
                                      onChange={(e) => updateOfferDraft(order, "unit", e.target.value)}
                                    />
                                    <Input
                                      label="Cena"
                                      size="sm"
                                      value={offerDraft.unitPrice}
                                      onChange={(e) => updateOfferDraft(order, "unitPrice", e.target.value)}
                                    />
                                  </div>
                                  <div className="grid gap-2 sm:grid-cols-2">
                                    <Input
                                      label="PDV %"
                                      size="sm"
                                      value={offerDraft.taxRate}
                                      onChange={(e) => updateOfferDraft(order, "taxRate", e.target.value)}
                                    />
                                    <Input
                                      label="Važi do"
                                      size="sm"
                                      type="date"
                                      value={offerDraft.validUntil}
                                      onChange={(e) => updateOfferDraft(order, "validUntil", e.target.value)}
                                    />
                                  </div>
                                  <Input
                                    label="Uslovi plaćanja"
                                    size="sm"
                                    value={offerDraft.paymentTerms}
                                    onChange={(e) => updateOfferDraft(order, "paymentTerms", e.target.value)}
                                  />
                                  <Input
                                    label="Uslovi isporuke"
                                    size="sm"
                                    value={offerDraft.deliveryTerms}
                                    onChange={(e) => updateOfferDraft(order, "deliveryTerms", e.target.value)}
                                  />
                                  <Textarea
                                    label="Napomena za ponudu"
                                    size="sm"
                                    minRows={2}
                                    value={offerDraft.note}
                                    onChange={(e) => updateOfferDraft(order, "note", e.target.value)}
                                  />
                                  <div className="rounded-lg border border-black/5 bg-white px-3 py-2 text-sm">
                                    <div className="flex justify-between gap-2">
                                      <span className="text-gray-600">Ukupno za ponudu</span>
                                      <span className="font-semibold text-dark">
                                        {formatMetricNumber(draftTotal, 2)} RSD
                                      </span>
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    color="primary"
                                    onPress={() => handleCreateOrderOffer(order)}
                                    isDisabled={ordersLoading}
                                  >
                                    Kreiraj ponudu
                                  </Button>
                                </div>

                                <div className="grid gap-2 sm:grid-cols-3">
                                  <Button
                                    size="sm"
                                    variant="flat"
                                    onPress={() => loadOrderOffers(order.id)}
                                    isDisabled={orderOffersLoading[order.id]}
                                  >
                                    Učitaj
                                  </Button>
                                  <Button
                                    as="a"
                                    href={offers[0] ? adminOfferPrintUrl(offers[0].id) : undefined}
                                    target="_blank"
                                    rel="noreferrer"
                                    size="sm"
                                    variant="flat"
                                    isDisabled={!offers[0]}
                                  >
                                    Otvori PDF prikaz
                                  </Button>
                                  <Button
                                    as="a"
                                    href={offers[0] ? adminOfferPdfUrl(offers[0].id) : undefined}
                                    size="sm"
                                    variant="flat"
                                    isDisabled={!offers[0]}
                                  >
                                    Preuzmi PDF
                                  </Button>
                                </div>

                                {offers.length > 0 && (
                                  <div className="space-y-2">
                                    {offers.map((offer) => (
                                      <div key={offer.id} className="rounded-lg border border-black/10 bg-white p-3 text-sm">
                                        <div className="flex flex-wrap items-start justify-between gap-2">
                                          <div>
                                            <p className="font-semibold text-dark">{offer.offer_number}</p>
                                            <p className="text-xs text-gray-500">{formatOrderDate(offer.created_at)}</p>
                                          </div>
                                          <p className="font-semibold text-dark">
                                            {formatMetricNumber(offer.total, 2)} {offer.currency}
                                          </p>
                                        </div>
                                        <Select
                                          label="Status ponude"
                                          size="sm"
                                          className="mt-2"
                                          selectedKeys={[offer.status]}
                                          onSelectionChange={(keys) =>
                                            handleOfferStatus(
                                              offer,
                                              (Array.from(keys).at(0)?.toString() as OrderOffer["status"]) || "draft"
                                            )
                                          }
                                        >
                                          {offerStatusOptions.map((item) => (
                                            <SelectItem key={item.key}>{item.label}</SelectItem>
                                          ))}
                                        </Select>
                                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                                          <Button
                                            as="a"
                                            href={adminOfferPrintUrl(offer.id)}
                                            target="_blank"
                                            rel="noreferrer"
                                            size="sm"
                                            variant="flat"
                                            className="w-full"
                                          >
                                            Otvori PDF prikaz
                                          </Button>
                                          <Button
                                            as="a"
                                            href={adminOfferPdfUrl(offer.id)}
                                            size="sm"
                                            variant="flat"
                                            className="w-full"
                                          >
                                            Preuzmi PDF
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </details>
                            <Button
                              size="sm"
                              color="danger"
                              variant="light"
                              onPress={() => handleDeleteOrder(order)}
                              isDisabled={ordersLoading}
                              className="w-full"
                            >
                              Obriši porudžbinu
                            </Button>
                          </div>
                        </article>
                      );
                    })}
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



