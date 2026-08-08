"use client";
import React, { useState, useEffect } from "react";
import { 
  Package, 
  MapPin, 
  Tag, 
  Layers, 
  FileText, 
  Plus, 
  Trash2, 
  Search, 
  SlidersHorizontal, 
  RefreshCw, 
  TrendingUp, 
  AlertTriangle, 
  Database,
  ArrowUpDown,
  ArrowLeftRight,
  ShoppingBag,
  Sparkles,
  X,
  FileSpreadsheet,
  Check,
  Sun,
  Moon,
  Image,
  ChevronDown,
  History,
  LayoutDashboard,
  Edit,
  Bell,
  CheckCircle,
  Calendar
} from "lucide-react";
import { localDB, Product, Stock, Invoice, Category, SubType, StorageLocation, Additive, JarCustomization, DamagedStock } from "@/lib/mockData";
import { isSupabaseConfigured } from "@/lib/supabase";
export default function Dashboard() {
  // DB States
  const [categories, setCategories] = useState<Category[]>([]);
  const [subTypes, setSubTypes] = useState<SubType[]>([]);
  const [locations, setLocations] = useState<StorageLocation[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stock, setStock] = useState<Stock[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [additives, setAdditives] = useState<Additive[]>([]);
  const [damagedStockList, setDamagedStockList] = useState<DamagedStock[]>([]);
  const [isDamagedStockModalOpen, setIsDamagedStockModalOpen] = useState(false);
  // Deleted lists for Restore Manager
  const [deletedCategories, setDeletedCategories] = useState<Category[]>([]);
  const [deletedSubTypes, setDeletedSubTypes] = useState<SubType[]>([]);
  const [deletedLocations, setDeletedLocations] = useState<StorageLocation[]>([]);
  const [deletedProducts, setDeletedProducts] = useState<Product[]>([]);
  const [deletedInvoices, setDeletedInvoices] = useState<Invoice[]>([]);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [archiveTab, setArchiveTab] = useState<"categories" | "sub_types" | "locations" | "products" | "invoices">("categories");
  // App UI States
  const [activeTab, setActiveTab] = useState<"stock" | "products" | "setup">("stock");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [selectedLocationFilter, setSelectedLocationFilter] = useState("all");
  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [setupModalType, setSetupModalType] = useState<"category" | "subtype" | "location" | "additive">("category");
  // Form States
  const [newProductName, setNewProductName] = useState("");
  const [newProductCategory, setNewProductCategory] = useState("");
  const [newProductSubtype, setNewProductSubtype] = useState("");
  const [newProductPhotos, setNewProductPhotos] = useState("");
  const [newProductPrice, setNewProductPrice] = useState(0);
  const [newProductSupplierCode, setNewProductSupplierCode] = useState("");
  const [showDiscountFields, setShowDiscountFields] = useState(false);
  const [initialLocationId, setInitialLocationId] = useState("");
  const [initialQuantity, setInitialQuantity] = useState(0);
  const [isEditProductMode, setIsEditProductMode] = useState(false);
  const [editProductId, setEditProductId] = useState("");
  const [stockProductId, setStockProductId] = useState("");
  const [stockLocationId, setStockLocationId] = useState("");
  const [stockQuantity, setStockQuantity] = useState(0);
  const [isMultiLocationStock, setIsMultiLocationStock] = useState(false);
  const [initialStocks, setInitialStocks] = useState<{ locationId: string; quantity: number }[]>([
    { locationId: "", quantity: 0 }
  ]);
  const [isMoveStockModalOpen, setIsMoveStockModalOpen] = useState(false);
  const [detailProductId, setDetailProductId] = useState("");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [moveProductId, setMoveProductId] = useState("");
  const [moveSourceLocationId, setMoveSourceLocationId] = useState("");
  const [moveDestinationLocationId, setMoveDestinationLocationId] = useState("");
  const [moveQuantity, setMoveQuantity] = useState(0);
  const [moveModalCategoryFilter, setMoveModalCategoryFilter] = useState("all");
  const [moveModalSearchQuery, setMoveModalSearchQuery] = useState("");
  const [productsPage, setProductsPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState<number>(12);
  const [stockPage, setStockPage] = useState(1);
  const [stockPerPage, setStockPerPage] = useState<number>(10);
  const [dryfruitSearchQuery, setDryfruitSearchQuery] = useState("");
  const [dryfruitLocationFilter, setDryfruitLocationFilter] = useState("all");
  const [kanbanDaysFilter, setKanbanDaysFilter] = useState<string>("all");
  const [kanbanDateFilter, setKanbanDateFilter] = useState<string>("");
  const [kanbanSortOrder, setKanbanSortOrder] = useState<"delivery" | "order">("delivery");
  const [activeKanbanMobileTab, setActiveKanbanMobileTab] = useState<"ordered" | "preparing" | "completed" | "delivered">("ordered");
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<string[]>([]);
  const [appMode, setAppMode] = useState<"billing" | "inventory" | "admin">("billing");
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [sellerAddress, setSellerAddress] = useState("");
  const [sellerGstin, setSellerGstin] = useState("");
  const [sellerPan, setSellerPan] = useState("");
  const [sellerShowGst, setSellerShowGst] = useState(false);
  const [adminCurrentPassword, setAdminCurrentPassword] = useState("");
  const [adminNewPassword, setAdminNewPassword] = useState("");
  const [previewInvoiceId, setPreviewInvoiceId] = useState("");
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [invoiceHistorySearchQuery, setInvoiceHistorySearchQuery] = useState("");
  const [invoiceHistorySortOrder, setInvoiceHistorySortOrder] = useState<"latest" | "oldest">("latest");
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [activeDropdownIndex, setActiveDropdownIndex] = useState<number | null>(null);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [productVariants, setProductVariants] = useState<{ subTypeId: string; subTypeName: string; price: number; locationId: string; quantity: number; selected: boolean }[]>([]);
  const [stockModalCategoryFilter, setStockModalCategoryFilter] = useState("all");
  const [stockModalSearchQuery, setStockModalSearchQuery] = useState("");
  const [showAssetSelector, setShowAssetSelector] = useState(false);
  const [invoiceCustomerName, setInvoiceCustomerName] = useState("");
  const [invoiceCustomerPhone, setInvoiceCustomerPhone] = useState("");
  const [invoiceCustomerStatus, setInvoiceCustomerStatus] = useState<"ordered" | "preparing" | "completed" | "delivered">("ordered");
  const [invoicePaymentMode, setInvoicePaymentMode] = useState<string>("Cash");
  const [invoiceHistoryStatusFilter, setInvoiceHistoryStatusFilter] = useState<string>("all");
  const [billingTab, setBillingTab] = useState<"form" | "kanban">("form");
  const [materialScope, setMaterialScope] = useState<"today" | "tomorrow" | "both" | "all">("today");
  const [simulationDate, setSimulationDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [isOperationsPanelExpanded, setIsOperationsPanelExpanded] = useState(false);
  const [isUrgentAlertExpanded, setIsUrgentAlertExpanded] = useState(false);
  const [additiveStockQty, setAdditiveStockQty] = useState("");
  const [stockModalType, setStockModalType] = useState<"product" | "additive">("product");
  const [stockAdditiveId, setStockAdditiveId] = useState("");
  const [activeStockAdditiveDropdown, setActiveStockAdditiveDropdown] = useState(false);
  const [stockAdditiveSearchQuery, setStockAdditiveSearchQuery] = useState("");
  const [moveModalType, setMoveModalType] = useState<"product" | "additive">("product");
  const [moveAdditiveId, setMoveAdditiveId] = useState("");
  const [damagedModalType, setDamagedModalType] = useState<"product" | "additive">("product");
  const [damagedAdditiveId, setDamagedAdditiveId] = useState("");
  const [isEditingInvoice, setIsEditingInvoice] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [isPreOrder, setIsPreOrder] = useState(false);
  const [invoiceDeliveryDate, setInvoiceDeliveryDate] = useState("");
  const [invoiceAdvancePaid, setInvoiceAdvancePaid] = useState("");
  const [invoiceItems, setInvoiceItems] = useState<{ productId: string | null; additiveId?: string | null; quantity: number; unitPrice: number; discount: number; customizations?: JarCustomization[] }[]>([
    { productId: "", quantity: 1, unitPrice: 0, discount: 0 }
  ]);
  const [isOnlyDryfruits, setIsOnlyDryfruits] = useState(false);
  const [setupName, setSetupName] = useState("");
  const [setupCategoryId, setSetupCategoryId] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editItemId, setEditItemId] = useState("");
  const [additivePrice, setAdditivePrice] = useState("");
  const [additivePriceOption, setAdditivePriceOption] = useState<"100g" | "1kg">("1kg");
  const [activeJarConfigIndex, setActiveJarConfigIndex] = useState<number | null>(null);
  const [activeJarDropdown, setActiveJarDropdown] = useState<{ rowIndex: number; jarNumber: number } | null>(null);
  const [additiveSearchQuery, setAdditiveSearchQuery] = useState("");
  const [damagedProductId, setDamagedProductId] = useState("");
  const [damagedLocationId, setDamagedLocationId] = useState("");
  const [damagedQuantity, setDamagedQuantity] = useState("");
  const [damagedSearchQuery, setDamagedSearchQuery] = useState("");
  const [isDamagedLogExpanded, setIsDamagedLogExpanded] = useState(false);
  // Hydration state
  const [isLoaded, setIsLoaded] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("j_creation_theme", nextTheme);
  };
  // Load Data
  const loadData = () => {
    setCategories(localDB.getCategories());
    setSubTypes(localDB.getSubTypes());
    setLocations(localDB.getLocations());
    setProducts(localDB.getProducts());
    setStock(localDB.getStock());
    setInvoices(localDB.getInvoices());
    setAdditives(localDB.getAdditives());
    setDamagedStockList(localDB.getDamagedStock());
    const settings = localDB.getSellerSettings();
    setSellerName(settings.seller_name);
    setSellerAddress(settings.seller_address);
    setSellerGstin(settings.gstin);
    setSellerPan(settings.pan);
    setSellerShowGst(settings.show_gst_pan);
    // Load deleted elements for restore tracking
    setDeletedCategories(localDB.getDeletedCategories());
    setDeletedSubTypes(localDB.getDeletedSubTypes());
    setDeletedLocations(localDB.getDeletedLocations());
    setDeletedProducts(localDB.getDeletedProducts());
    setDeletedInvoices(localDB.getDeletedInvoices());
  };
  useEffect(() => {
    loadData();
    const saved = localStorage.getItem("j_creation_theme") as "light" | "dark";
    if (saved) {
      setTheme(saved);
    }
    setIsLoaded(true);
  }, []);
  useEffect(() => {
    setProductsPage(1);
  }, [searchQuery, selectedCategoryFilter, selectedLocationFilter]);
  useEffect(() => {
    if (!newProductCategory || isEditProductMode) {
      setProductVariants([]);
      return;
    }
    const filtered = subTypes.filter(s => s.category_id === newProductCategory && s.deleted_at === null);
    setProductVariants(
      filtered.map(s => ({
        subTypeId: s.id,
        subTypeName: s.name,
        price: newProductPrice || 0,
        locationId: initialLocationId || "",
        quantity: initialQuantity || 0,
        selected: true
      }))
    );
  }, [newProductCategory, subTypes, isEditProductMode]);
  // Dynamic chronological stock shortage calculator & general notifications builder
  const notifications = React.useMemo(() => {
    const alerts: { id: string; invoiceId?: string; type: "shortage" | "low_stock" | "delivery_today"; title: string; message: string; severity: "critical" | "warning" | "info"; dueDate?: string }[] = [];

    // 1. Dynamic chronological stock shortage calculator
    const activeInvoices = invoices.filter(
      (inv) => inv.deleted_at === null && inv.status !== "delivered" && inv.status !== "completed"
    );
    const sortedInvoices = [...activeInvoices].sort((a, b) => {
      const dateA = a.delivery_date || "";
      const dateB = b.delivery_date || "";
      return dateA.localeCompare(dateB);
    });
    const productStock: { [productId: string]: number } = {};
    products.forEach((p) => {
      const activeLocStocks = stock.filter((st) => st.product_id === p.id && st.deleted_at === null);
      productStock[p.id] = activeLocStocks.reduce((sum, s) => sum + s.quantity, 0);
    });
    const dryfruitStock: { [additiveId: string]: number } = {};
    additives.forEach((a) => {
      dryfruitStock[a.id] = a.stock_qty_kg || 0;
    });

    sortedInvoices.forEach((inv) => {
      if (!inv.delivery_date) return;
      const shortageItems: string[] = [];
      inv.items?.forEach((item) => {
        if (item.product_id) {
          const needed = item.quantity;
          const currentAvail = productStock[item.product_id] || 0;
          if (currentAvail < needed) {
            const deficit = needed - currentAvail;
            const prod = products.find((p) => p.id === item.product_id);
            shortageItems.push(`${deficit} pcs ${prod ? prod.name : "Box"}`);
            productStock[item.product_id] = 0;
          } else {
            productStock[item.product_id] -= needed;
          }
          item.customizations?.forEach((jar) => {
            if (jar.additive_id !== "empty" && jar.weight_grams > 0) {
              const neededKg = (jar.weight_grams * item.quantity) / 1000;
              const currentAddAvail = dryfruitStock[jar.additive_id] || 0;
              if (currentAddAvail < neededKg) {
                const addDeficit = neededKg - currentAddAvail;
                const addObj = additives.find((a) => a.id === jar.additive_id);
                shortageItems.push(`${addDeficit.toFixed(2)} kg ${addObj ? addObj.name : "Dryfruit"}`);
                dryfruitStock[jar.additive_id] = 0;
              } else {
                dryfruitStock[jar.additive_id] -= neededKg;
              }
            }
          });
        } else if (item.additive_id) {
          const neededKg = item.quantity;
          const currentAddAvail = dryfruitStock[item.additive_id] || 0;
          if (currentAddAvail < neededKg) {
            const addDeficit = neededKg - currentAddAvail;
            const addObj = additives.find((a) => a.id === item.additive_id);
            shortageItems.push(`${addDeficit.toFixed(2)} kg loose ${addObj ? addObj.name : "Dryfruit"}`);
            dryfruitStock[item.additive_id] = 0;
          } else {
            dryfruitStock[item.additive_id] -= neededKg;
          }
        }
      });
      if (shortageItems.length > 0) {
        const delDate = new Date(inv.delivery_date);
        const simDateObj = new Date(simulationDate);
        const diffTime = delDate.getTime() - simDateObj.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 2) {
          alerts.push({
            id: `alert-shortage-${inv.id}`,
            invoiceId: inv.id,
            type: "shortage",
            title: `ORD-${inv.invoice_number || inv.order_id} Shortage`,
            message: `${inv.customer_name} scheduled on ${inv.delivery_date} needs: ${shortageItems.join(", ")}. Please restock!`,
            dueDate: inv.delivery_date,
            severity: "critical"
          });
        }
      }
    });

    // 2. Low General Stock Warning
    products.forEach(p => {
      const activeLocStocks = stock.filter(st => st.product_id === p.id && st.deleted_at === null);
      const totalQty = activeLocStocks.reduce((sum, s) => sum + s.quantity, 0);
      if (totalQty < 5) {
        alerts.push({
          id: `alert-lowstock-prod-${p.id}`,
          type: "low_stock",
          title: `Low Product Stock: ${p.name}`,
          message: `Only ${totalQty} units left in combined storage. Consider preparing more boxes!`,
          severity: "warning"
        });
      }
    });

    additives.forEach(a => {
      if ((a.stock_qty_kg || 0) < 5) {
        alerts.push({
          id: `alert-lowstock-add-${a.id}`,
          type: "low_stock",
          title: `Low Dryfruit Stock: ${a.name}`,
          message: `Only ${a.stock_qty_kg?.toFixed(2) || 0} kg left in inventory. Consider buying more raw materials!`,
          severity: "warning"
        });
      }
    });

    // 3. Deliveries Scheduled for Today
    const todayStr = simulationDate;
    const todayInvoices = invoices.filter(i => i.deleted_at === null && i.status !== "delivered" && i.delivery_date === todayStr);
    todayInvoices.forEach(inv => {
      alerts.push({
        id: `alert-today-${inv.id}`,
        invoiceId: inv.id,
        type: "delivery_today",
        title: `Dispatch Today: ${inv.order_id}`,
        message: `${inv.customer_name} order (₹${inv.total_amount.toLocaleString("en-IN")}) is scheduled for delivery today!`,
        severity: "info",
        dueDate: inv.delivery_date
      });
    });

    // Filter out dismissed notification alerts
    return alerts.filter(a => !dismissedNotificationIds.includes(a.id));
  }, [invoices, products, stock, additives, simulationDate, dismissedNotificationIds]);
  if (!isLoaded) {
    return (
      <div className={`flex h-screen items-center justify-center ${theme === "dark" ? "bg-zinc-950 text-white" : "bg-zinc-50 text-zinc-800"}`}>
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-10 w-10 animate-spin text-indigo-400" />
          <p className="text-zinc-500 font-medium">Loading JENNY CREATION Control Center...</p>
        </div>
      </div>
    );
  }
  // Derived statistics
  const totalProducts = products.length;
  const totalStockQuantity = stock.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockCount = stock.filter(item => item.quantity < 10).length;
  const totalInvoices = invoices.length;
  const totalRevenue = invoices.reduce((sum, item) => sum + item.total_amount, 0);
  const handleLocalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== "jpg" && ext !== "jpeg" && ext !== "png") {
      alert("Validation Error: Please select a JPG or PNG image file.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setNewProductPhotos(base64String);
    };
    reader.readAsDataURL(file);
  };
  // Handlers
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName || !newProductCategory) return;
    if (newProductPhotos) {
      const urls = newProductPhotos.split(",").map(url => url.trim());
      const allValid = urls.every(url => url.startsWith("data:image/") || url.match(/\.(jpg|jpeg|png)$/i));
      if (!allValid) {
        alert("Validation Error: Please ensure all image paths end with a valid format (.jpg, .jpeg, or .png) or are uploaded from drive.");
        return;
      }
    }
    const photoUrls = newProductPhotos 
      ? newProductPhotos.split(",").map(url => url.trim()) 
      : [];
    if (isEditProductMode) {
      if (!newProductSubtype) return;
      localDB.updateProduct(editProductId, newProductName, newProductCategory, newProductSubtype, photoUrls, Number(newProductPrice), newProductSupplierCode);
    } else {
      // Bulk create variants if sub-types exist
      if (productVariants.length > 0) {
        const selectedVariants = productVariants.filter(v => v.selected);
        if (selectedVariants.length === 0) {
          alert("Please select at least one sub-type variant to create.");
          return;
        }
        selectedVariants.forEach(variant => {
          // Format full variant name: e.g. "Luxury Gift Box (2 Jar)"
          const fullName = `${newProductName} (${variant.subTypeName})`;
          const newP = localDB.addProduct(fullName, newProductCategory, variant.subTypeId, photoUrls, Number(variant.price), newProductSupplierCode);
          if (variant.locationId && variant.quantity > 0) {
            localDB.updateStock(newP.id, variant.locationId, Number(variant.quantity));
          }
        });
      } else {
        // Fallback: single product creation
        if (!newProductSubtype) return;
        const newP = localDB.addProduct(newProductName, newProductCategory, newProductSubtype, photoUrls, Number(newProductPrice), newProductSupplierCode);
        if (isMultiLocationStock) {
          initialStocks.forEach(st => {
            if (st.locationId && st.quantity > 0) {
              localDB.updateStock(newP.id, st.locationId, Number(st.quantity));
            }
          });
        } else {
          if (initialLocationId && initialQuantity > 0) {
            localDB.updateStock(newP.id, initialLocationId, Number(initialQuantity));
          }
        }
      }
    }
    loadData();
    // Reset
    setNewProductName("");
    setNewProductCategory("");
    setNewProductSubtype("");
    setNewProductPhotos("");
    setNewProductPrice(0);
    setNewProductSupplierCode("");
    setInitialLocationId("");
    setInitialQuantity(0);
    setIsMultiLocationStock(false);
    setInitialStocks([{ locationId: "", quantity: 0 }]);
    setProductVariants([]);
    setIsEditProductMode(false);
    setEditProductId("");
    setShowAssetSelector(false);
    setIsProductModalOpen(false);
  };
  const closeProductModal = () => {
    setNewProductName("");
    setNewProductCategory("");
    setNewProductSubtype("");
    setNewProductPhotos("");
    setNewProductPrice(0);
    setInitialLocationId("");
    setInitialQuantity(0);
    setIsMultiLocationStock(false);
    setInitialStocks([{ locationId: "", quantity: 0 }]);
    setProductVariants([]);
    setIsEditProductMode(false);
    setEditProductId("");
    setShowAssetSelector(false);
    setIsProductModalOpen(false);
  };
  const handleUpdateStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (stockModalType === "product") {
      if (!stockProductId || !stockLocationId) return;
      localDB.updateStock(stockProductId, stockLocationId, Number(stockQuantity), null);
    } else {
      if (!stockAdditiveId || !stockLocationId) return;
      localDB.updateStock(null, stockLocationId, Number(stockQuantity), stockAdditiveId);
    }
    loadData();
    // Reset
    setStockProductId("");
    setStockAdditiveId("");
    setStockLocationId("");
    setStockQuantity(0);
    setStockModalCategoryFilter("all");
    setStockModalSearchQuery("");
    setIsStockModalOpen(false);
  };
  const handleMoveStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (moveModalType === "product") {
      if (!moveProductId || !moveSourceLocationId || !moveDestinationLocationId || moveQuantity <= 0) {
        alert("Please fill in all move parameters.");
        return;
      }
      try {
        localDB.moveStock(moveProductId, moveSourceLocationId, moveDestinationLocationId, Number(moveQuantity), null);
      } catch (err: any) {
        alert(err.message || "Error moving stock");
        return;
      }
    } else {
      if (!moveAdditiveId || !moveSourceLocationId || !moveDestinationLocationId || moveQuantity <= 0) {
        alert("Please fill in all move parameters.");
        return;
      }
      try {
        localDB.moveStock(null, moveSourceLocationId, moveDestinationLocationId, Number(moveQuantity), moveAdditiveId);
      } catch (err: any) {
        alert(err.message || "Error moving stock");
        return;
      }
    }
    loadData();
    // Reset
    setMoveProductId("");
    setMoveAdditiveId("");
    setMoveSourceLocationId("");
    setMoveDestinationLocationId("");
    setMoveQuantity(0);
    setMoveModalCategoryFilter("all");
    setMoveModalSearchQuery("");
    setIsMoveStockModalOpen(false);
  };
  const handleAddSetupItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupName.trim()) return;
    try {
      if (isEditMode) {
        if (setupModalType === "category") {
          localDB.updateCategory(editItemId, setupName);
        } else if (setupModalType === "subtype") {
          if (!setupCategoryId) return;
          localDB.updateSubType(editItemId, setupName, setupCategoryId);
        } else if (setupModalType === "location") {
          localDB.updateLocation(editItemId, setupName);
        } else if (setupModalType === "additive") {
          const enteredPrice = Number(additivePrice);
          const pricePerKg = additivePriceOption === "100g" ? enteredPrice * 10 : enteredPrice;
          const stockVal = Number(additiveStockQty) || 0;
          localDB.updateAdditive(editItemId, setupName, pricePerKg, stockVal);
        }
      } else {
        if (setupModalType === "category") {
          localDB.addCategory(setupName);
        } else if (setupModalType === "subtype") {
          if (!setupCategoryId) return;
          localDB.addSubType(setupName, setupCategoryId);
        } else if (setupModalType === "location") {
          localDB.addLocation(setupName);
        } else if (setupModalType === "additive") {
          const enteredPrice = Number(additivePrice);
          const pricePerKg = additivePriceOption === "100g" ? enteredPrice * 10 : enteredPrice;
          const stockVal = Number(additiveStockQty) || 0;
          localDB.addAdditive(setupName, pricePerKg, stockVal);
        }
      }
      loadData();
      setSetupName("");
      setSetupCategoryId("");
      setAdditivePrice("");
      setAdditivePriceOption("1kg");
      setAdditiveStockQty("");
      setIsEditMode(false);
      setEditItemId("");
      setIsSetupModalOpen(false);
    } catch (error: any) {
      alert(error.message);
    }
  };
  const handlePrintPrepSheet = (scope: "today" | "tomorrow" | "both" | "all") => {
    const todayStr = simulationDate;
    const tomorrow = new Date(simulationDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];
    const scopeInvoices = invoices.filter(inv => {
      if (inv.deleted_at !== null) return false;
      if (inv.status === "delivered") return false;
      if (!inv.delivery_date) return false;
      if (scope === "today") return inv.delivery_date === todayStr;
      if (scope === "tomorrow") return inv.delivery_date === tomorrowStr;
      if (scope === "both") return inv.delivery_date === todayStr || inv.delivery_date === tomorrowStr;
      return true;
    });
    if (scopeInvoices.length === 0) {
      alert("No pre-orders found for the selected scope to print.");
      return;
    }
    const boxSummary: { [key: string]: number } = {};
    const additiveSummary: { [key: string]: number } = {};
    scopeInvoices.forEach(inv => {
      inv.items?.forEach(item => {
        if (item.product_id) {
          const prod = products.find(p => p.id === item.product_id);
          if (prod) {
            boxSummary[prod.name] = (boxSummary[prod.name] || 0) + item.quantity;
          }
        } else if (item.additive_id) {
          const addObj = additives.find(a => a.id === item.additive_id);
          if (addObj) {
            additiveSummary[item.additive_id] = (additiveSummary[item.additive_id] || 0) + (item.quantity * 1000);
          }
        }
        if (item.customizations && item.customizations.length > 0) {
          item.customizations.forEach(jar => {
            if (jar.additive_id !== "empty" && jar.weight_grams > 0) {
              const gramsNeeded = jar.weight_grams * item.quantity;
              additiveSummary[jar.additive_id] = (additiveSummary[jar.additive_id] || 0) + gramsNeeded;
            }
          });
        }
      });
    });
    const scopeLabel = scope === "today" ? "TODAY (" + todayStr + ")" :
                       scope === "tomorrow" ? "TOMORROW (" + tomorrowStr + ")" :
                       scope === "both" ? "TODAY & TOMORROW" : "ALL PENDING PRE-ORDERS";
    let printHtml = `
      <html>
        <head>
          <title>Production Prep & Dispatch Sheet - ${scopeLabel}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #111; padding: 20px; font-size: 12px; line-height: 1.5; }
            h1 { font-size: 18px; font-weight: bold; margin-bottom: 2px; text-transform: uppercase; letter-spacing: 0.5px; }
            h2 { font-size: 14px; font-weight: bold; margin-top: 20px; border-bottom: 2px solid #111; padding-bottom: 4px; text-transform: uppercase; }
            .date-badge { font-family: monospace; font-size: 11px; color: #555; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; }
            th { border-bottom: 1px solid #111; padding: 6px 8px; font-weight: bold; text-align: left; font-size: 10px; text-transform: uppercase; }
            td { padding: 6px 8px; border-bottom: 1px dotted #ccc; vertical-align: top; }
            .total-row { font-weight: bold; border-top: 1px solid #111; }
            .badge { display: inline-block; padding: 2px 5px; font-size: 9px; font-weight: bold; border: 1px solid #111; border-radius: 3px; text-transform: uppercase; }
            .text-right { text-align: right; }
            .font-mono { font-family: monospace; }
            .checklist-box { width: 12px; height: 12px; border: 1px solid #111; display: inline-block; margin-right: 6px; vertical-align: middle; }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <h1>Jenny's Creation</h1>
              <div class="date-badge">PRODUCTION PREP & DISPATCH SHEET • SCOPE: ${scopeLabel}</div>
            </div>
            <button onclick="window.print()" style="padding: 6px 12px; font-weight: bold; background: #000; color: #fff; border: none; border-radius: 4px; cursor: pointer;">Print Page</button>
          </div>
          <h2>1. Gifting Box Materials Summary</h2>
          <table>
            <thead>
              <tr>
                <th style="width: 50px;">Check</th>
                <th>Box Type / Item Name</th>
                <th class="text-right" style="width: 100px;">Total Qty</th>
              </tr>
            </thead>
            <tbody>
    `;
    Object.entries(boxSummary).forEach(([name, qty]) => {
      printHtml += `
        <tr>
          <td><span class="checklist-box"></span></td>
          <td style="font-weight: 600;">${name}</td>
          <td class="text-right font-mono font-bold" style="font-size: 13px;">${qty} pcs</td>
        </tr>
      `;
    });
    if (Object.keys(boxSummary).length === 0) {
      printHtml += `<tr><td colspan="3" style="text-align: center; color: #666; font-style: italic;">No items requested in this scope.</td></tr>`;
    }
    printHtml += `
            </tbody>
          </table>
          <h2>2. Ingredient / Dryfruit Additives Total Weights</h2>
          <table>
            <thead>
              <tr>
                <th style="width: 50px;">Check</th>
                <th>Dryfruit Name</th>
                <th class="text-right" style="width: 150px;">Required Weight (kg)</th>
                <th class="text-right" style="width: 120px;">Weight (grams)</th>
              </tr>
            </thead>
            <tbody>
    `;
    Object.entries(additiveSummary).forEach(([additiveId, grams]) => {
      const addObj = additives.find(a => a.id === additiveId);
      const kgValue = (grams / 1000).toFixed(2);
      printHtml += `
        <tr>
          <td><span class="checklist-box"></span></td>
          <td style="font-weight: 600;">${addObj?.name || "Additive"}</td>
          <td class="text-right font-mono font-bold" style="font-size: 13px;">${kgValue} kg</td>
          <td class="text-right font-mono text-zinc-600">${grams.toLocaleString()} g</td>
        </tr>
      `;
    });
    if (Object.keys(additiveSummary).length === 0) {
      printHtml += `<tr><td colspan="4" style="text-align: center; color: #666; font-style: italic;">No customized additives requested in this scope.</td></tr>`;
    }
    printHtml += `
            </tbody>
          </table>
          <h2>3. Billed Orders & Deliveries Dispatch Checklist</h2>
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer / Contact Details</th>
                <th>Scheduled Delivery</th>
                <th>Billed Items List</th>
                <th class="text-right">Total Price</th>
                <th class="text-right">Balance Due</th>
              </tr>
            </thead>
            <tbody>
    `;
    scopeInvoices.forEach(inv => {
      const itemsList = inv.items?.map(item => {
        if (item.product_id) {
          const prod = products.find(p => p.id === item.product_id);
          let details = `${prod?.name || "Unknown"} (x${item.quantity})`;
          if (item.customizations && item.customizations.filter(c => c.additive_id !== "empty").length > 0) {
            const fillings = item.customizations.filter(c => c.additive_id !== "empty").map(c => {
              const addName = additives.find(a => a.id === c.additive_id)?.name || "Additive";
              return `Jar ${c.jar_number}: ${addName} (${c.weight_grams}g)`;
            }).join(", ");
            details += ` [${fillings}]`;
          }
          return details;
        } else if (item.additive_id) {
          const add = additives.find(a => a.id === item.additive_id);
          return `${add?.name || "Dryfruit"} (Loose: ${item.quantity.toFixed(2)} kg)`;
        }
        return "Unknown";
      }).join("<br/>") || "No items";
      const advance = inv.advance_paid || 0;
      const balance = inv.total_amount - advance;
      printHtml += `
        <tr>
          <td class="font-mono" style="font-weight: 600;">
            <div style="display:flex; align-items:center; gap:4px;">
              <span class="checklist-box"></span>
              <span>${inv.order_id}</span>
            </div>
            <div style="font-size: 9px; color: #666; margin-top:2px;">${inv.invoice_number}</div>
          </td>
          <td>
            <div style="font-weight: 600;">${inv.customer_name}</div>
            <div style="font-size: 10px; color: #555; margin-top: 2px;">Phone: ${inv.customer_phone || "Not specified"}</div>
          </td>
          <td class="font-mono font-bold" style="font-size: 11px;">
            ${inv.delivery_date}
            <div style="font-size: 8px; font-weight: normal; margin-top: 2px; text-transform: uppercase;">Stage: ${inv.status}</div>
          </td>
          <td style="font-size: 10px; line-height: 1.3;">${itemsList}</td>
          <td class="text-right font-mono">₹${inv.total_amount.toLocaleString("en-IN")}</td>
          <td class="text-right font-mono" style="font-weight: 600; color: ${balance > 0 ? "#b91c1c" : "#047857"};">
            ₹${balance.toLocaleString("en-IN")}
            <div style="font-size: 9px; font-weight: normal; color: #555; margin-top: 1px;">Paid Adv: ₹${advance.toLocaleString("en-IN")}</div>
          </td>
        </tr>
      `;
    });
    printHtml += `
            </tbody>
          </table>
          <div style="margin-top: 40px; border-top: 1px solid #111; padding-top: 10px; display: flex; justify-content: space-between; font-size: 9px; color: #555;">
            <span>Report generated on: ${new Date().toLocaleString()}</span>
            <span>Jenny's Creation Studio App</span>
          </div>
        </body>
      </html>
    `;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printHtml);
      printWindow.document.close();
    } else {
      alert("Please allow pop-ups to open the print dispatch sheet.");
    }
  };
  const updateJarFilling = (index: number, jarNumber: number, additiveId: string, weightGrams: number) => {
    const item = invoiceItems[index];
    const updatedJars = [...(item.customizations || [])];
    const jarIdxInState = updatedJars.findIndex(c => c.jar_number === jarNumber);
    const newJar = { jar_number: jarNumber, additive_id: additiveId, weight_grams: weightGrams };
    if (jarIdxInState >= 0) {
      updatedJars[jarIdxInState] = newJar;
    } else {
      updatedJars.push(newJar);
    }
    const updatedItems = [...invoiceItems];
    updatedItems[index].customizations = updatedJars;
    // Recalculate price
    const basePrice = products.find(p => p.id === item.productId)?.price || 0;
    let extraJarsPrice = 0;
    updatedJars.forEach(jar => {
      if (jar.additive_id !== "empty") {
        const addPriceKg = additives.find(a => a.id === jar.additive_id)?.price_per_kg || 0;
        extraJarsPrice += (addPriceKg / 1000) * jar.weight_grams;
      }
    });
    updatedItems[index].unitPrice = Math.round(basePrice + extraJarsPrice);
    setInvoiceItems(updatedItems);
  };
  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceCustomerName.trim()) return;
    // Filter out invalid items
    const validItems = invoiceItems.filter(item => item.productId && item.quantity > 0);
    if (validItems.length === 0) return;
    try {
      let activeId = "";
      const deliveryDateParam = isPreOrder ? invoiceDeliveryDate : undefined;
      const advancePaidParam = isPreOrder && invoiceAdvancePaid ? Number(invoiceAdvancePaid) : undefined;
      if (isEditingInvoice && editingInvoiceId) {
        const res = localDB.updateInvoice(
          editingInvoiceId, 
          invoiceCustomerName, 
          invoiceCustomerPhone, 
          validItems, 
          invoiceCustomerStatus,
          deliveryDateParam,
          advancePaidParam,
          invoicePaymentMode
        );
        if (res) activeId = res.id;
        alert("Order updated successfully!");
      } else {
        const res = localDB.createInvoice(
          invoiceCustomerName, 
          invoiceCustomerPhone, 
          validItems, 
          invoiceCustomerStatus,
          deliveryDateParam,
          advancePaidParam,
          invoicePaymentMode
        );
        if (res) activeId = res.id;
      }
      loadData();
      // Reset
      setInvoiceCustomerName("");
      setInvoiceCustomerPhone("");
      setInvoiceCustomerStatus("ordered");
      setInvoicePaymentMode("Cash");
      setInvoiceItems([{ productId: "", quantity: 1, unitPrice: 0, discount: 0 }]);
      setIsPreOrder(false);
      setInvoiceDeliveryDate("");
      setInvoiceAdvancePaid("");
      setIsEditingInvoice(false);
      setEditingInvoiceId(null);
      setIsInvoiceModalOpen(false);
      // Automatically show the generated bill in its proper format
      if (activeId) {
        setPreviewInvoiceId(activeId);
        setIsPreviewModalOpen(true);
      }
    } catch (error: any) {
      alert(error.message);
    }
  };
  const handleSoftDelete = (table: string, id: string) => {
    if (confirm(`Are you sure you want to soft delete this item from ${table}?`)) {
      localDB.softDelete(table, id);
      loadData();
    }
  };
  const handleRestore = (table: string, id: string) => {
    localDB.restore(table, id);
    loadData();
    alert(`Successfully restored item back from archive.`);
  };
  // Helper resolvers
  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || "Unknown";
  const getSubTypeName = (id: string) => subTypes.find(s => s.id === id)?.name || "Unknown";
  const getLocationName = (id: string) => locations.find(l => l.id === id)?.name || "Unknown";
  const getProduct = (id: string) => products.find(p => p.id === id);
  const getProductStock = (productId: string) => {
    return stock
      .filter(st => st.product_id === productId && st.deleted_at === null)
      .reduce((sum, item) => sum + item.quantity, 0);
  };
  const getProductMaxJars = (productId: string): number => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return 0;
    const sub = subTypes.find(s => s.id === prod.sub_type_id);
    const cat = categories.find(c => c.id === prod.category_id);
    const searchStr = `${prod.name} ${sub?.name || ""} ${cat?.name || ""}`.toLowerCase();
    const match = searchStr.match(/(\d+)\s*jar/);
    if (match) return parseInt(match[1]);
    if (sub?.name.toLowerCase().includes("jar") || prod.name.toLowerCase().includes("jar")) {
      const digitMatch = searchStr.match(/(\d+)/);
      return digitMatch ? parseInt(digitMatch[1]) : 3;
    }
    return 0;
  };
  const filteredProducts = products.filter(prod => {
    const matchesSearch = searchQuery === "" || 
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      getCategoryName(prod.category_id).toLowerCase().includes(searchQuery.toLowerCase()) || 
      getSubTypeName(prod.sub_type_id).toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.supplier_code && prod.supplier_code.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategoryFilter === "all" || prod.category_id === selectedCategoryFilter;
    let matchesLocation = true;
    if (selectedLocationFilter !== "all") {
      matchesLocation = stock.some(
        st => st.product_id === prod.id && 
              st.storage_location_id === selectedLocationFilter && 
              st.quantity > 0 && 
              st.deleted_at === null
      );
    }
    return matchesSearch && matchesCategory && matchesLocation;
  });
  const filteredStockProducts = products.filter(prod => {
    const matchesCategory = stockModalCategoryFilter === "all" || prod.category_id === stockModalCategoryFilter;
    const matchesSearch = stockModalSearchQuery === "" || 
      prod.name.toLowerCase().includes(stockModalSearchQuery.toLowerCase()) ||
      (prod.supplier_code && prod.supplier_code.toLowerCase().includes(stockModalSearchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });
  const filteredMoveProducts = products.filter(prod => {
    const matchesCategory = moveModalCategoryFilter === "all" || prod.category_id === moveModalCategoryFilter;
    const matchesSearch = moveModalSearchQuery === "" || 
      prod.name.toLowerCase().includes(moveModalSearchQuery.toLowerCase()) ||
      (prod.supplier_code && prod.supplier_code.toLowerCase().includes(moveModalSearchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });
  const detailProduct = products.find(p => p.id === detailProductId);
  const similarProducts = detailProduct 
    ? products.filter(p => p.sub_type_id === detailProduct.sub_type_id && p.id !== detailProduct.id && p.deleted_at === null) 
    : [];
  const totalProductsPages = Math.ceil(filteredProducts.length / productsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (productsPage - 1) * productsPerPage,
    productsPage * productsPerPage
  );
  const filteredStock = stock.filter(st => {
    if (!st.product_id) return false;
    const prod = getProduct(st.product_id);
    if (!prod) return false;
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategoryFilter === "all" || prod.category_id === selectedCategoryFilter;
    const matchesLocation = selectedLocationFilter === "all" || st.storage_location_id === selectedLocationFilter;
    return matchesSearch && matchesCategory && matchesLocation;
  });
  const totalStockPages = Math.ceil(filteredStock.length / stockPerPage) || 1;
  const paginatedStock = filteredStock.slice(
    (stockPage - 1) * stockPerPage,
    stockPage * stockPerPage
  );

  const getKanbanInvoices = (status: string) => {
    let list = invoices.filter(i => i.deleted_at === null && i.status === status);

    if (kanbanDateFilter) {
      list = list.filter(i => i.delivery_date === kanbanDateFilter);
    }

    if (kanbanDaysFilter !== "all") {
      const today = new Date(simulationDate);
      today.setHours(0,0,0,0);
      list = list.filter(i => {
        if (!i.delivery_date) return false;
        const delivDate = new Date(i.delivery_date);
        delivDate.setHours(0,0,0,0);
        const diffTime = delivDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (kanbanDaysFilter === "overdue") {
          return diffDays < 0 && i.status !== "delivered";
        } else {
          const limit = Number(kanbanDaysFilter);
          if (limit === 0) return diffDays === 0;
          if (limit === 1) return diffDays === 1;
          return diffDays >= 0 && diffDays <= limit;
        }
      });
    }

    list.sort((a, b) => {
      if (kanbanSortOrder === "delivery") {
        if (!a.delivery_date) return 1;
        if (!b.delivery_date) return -1;
        return new Date(a.delivery_date).getTime() - new Date(b.delivery_date).getTime();
      } else {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
    });

    return list;
  };
  const isDark = theme === "dark";
  const bgClass = isDark 
    ? "bg-zinc-950 bg-radial-[at_top_center,_var(--tw-gradient-stops)] from-indigo-950/15 via-zinc-950 to-zinc-950 text-zinc-200" 
    : "bg-slate-100 text-slate-800";
  const cardClass = isDark
    ? "bg-zinc-900 border border-zinc-800"
    : "bg-white border border-slate-200 shadow-sm shadow-slate-100/50";
  const inputClass = isDark
    ? "bg-zinc-950 border border-zinc-850 text-zinc-200 focus:border-zinc-700"
    : "bg-white border border-slate-200 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/5 transition duration-150";
  const setupItemClass = isDark
    ? "bg-zinc-950/45 border border-zinc-808"
    : "bg-slate-50/50 border border-slate-150";
  const btnOutlineClass = isDark
    ? "bg-zinc-900/60 hover:bg-zinc-850 border border-zinc-800 text-zinc-300"
    : "bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-sm";
  // Day-End Closure Summary Report PDF Generator
  const handleGenerateDaySummary = () => {
    const todayStr = simulationDate;
    const todayInvoices = invoices.filter(
      (i) => i.deleted_at === null && i.delivery_date === todayStr
    );
    const totalAmount = todayInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
    const boxes: { [key: string]: number } = {};
    const additivesNeeded: { [key: string]: number } = {};
    todayInvoices.forEach(inv => {
      inv.items?.forEach(item => {
        const prod = products.find(p => p.id === item.product_id);
        if (!prod) return;
        boxes[prod.name] = (boxes[prod.name] || 0) + item.quantity;
        if (item.customizations && item.customizations.length > 0) {
          item.customizations.forEach(jar => {
            if (jar.additive_id !== "empty" && jar.weight_grams > 0) {
              const grams = jar.weight_grams * item.quantity;
              additivesNeeded[jar.additive_id] = (additivesNeeded[jar.additive_id] || 0) + grams;
            }
          });
        }
      });
    });
    const sevenDaysLater = new Date(simulationDate);
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    const sevenDaysLaterStr = sevenDaysLater.toISOString().split("T")[0];
    const upcomingInvoices = invoices.filter(inv => {
      if (inv.deleted_at !== null) return false;
      if (inv.status === "delivered") return false;
      if (!inv.delivery_date) return false;
      return inv.delivery_date >= todayStr && inv.delivery_date <= sevenDaysLaterStr;
    });
    const runningProductStock: { [id: string]: number } = {};
    products.forEach(p => {
      const activeLocStocks = stock.filter(st => st.product_id === p.id && st.deleted_at === null);
      runningProductStock[p.id] = activeLocStocks.reduce((sum, s) => sum + s.quantity, 0);
    });
    const runningDryfruitStock: { [id: string]: number } = {};
    additives.forEach(a => {
      runningDryfruitStock[a.id] = a.stock_qty_kg || 0;
    });
    const boxShortages: { [name: string]: number } = {};
    const dryfruitShortages: { [name: string]: number } = {};
    const sortedUpcoming = [...upcomingInvoices].sort((a, b) => (a.delivery_date || "").localeCompare(b.delivery_date || ""));
    sortedUpcoming.forEach(inv => {
      inv.items?.forEach(item => {
        if (item.product_id) {
          const prod = products.find(p => p.id === item.product_id);
          if (!prod) return;
          if (runningProductStock[item.product_id] < item.quantity) {
            const deficit = item.quantity - runningProductStock[item.product_id];
            boxShortages[prod.name] = (boxShortages[prod.name] || 0) + deficit;
            runningProductStock[item.product_id] = 0;
          } else {
            runningProductStock[item.product_id] -= item.quantity;
          }
          item.customizations?.forEach(jar => {
            if (jar.additive_id !== "empty" && jar.weight_grams > 0) {
              const neededKg = (jar.weight_grams * item.quantity) / 1000;
              const currentAddAvail = runningDryfruitStock[jar.additive_id] || 0;
              const addObj = additives.find(a => a.id === jar.additive_id);
              if (!addObj) return;
              if (currentAddAvail < neededKg) {
                const deficitKg = neededKg - currentAddAvail;
                dryfruitShortages[addObj.name] = (dryfruitShortages[addObj.name] || 0) + deficitKg;
                runningDryfruitStock[jar.additive_id] = 0;
              } else {
                runningDryfruitStock[jar.additive_id] -= neededKg;
              }
            }
          });
        } else if (item.additive_id) {
          const neededKg = item.quantity;
          const currentAddAvail = runningDryfruitStock[item.additive_id] || 0;
          const addObj = additives.find(a => a.id === item.additive_id);
          if (!addObj) return;
          if (currentAddAvail < neededKg) {
            const deficitKg = neededKg - currentAddAvail;
            dryfruitShortages[addObj.name] = (dryfruitShortages[addObj.name] || 0) + deficitKg;
            runningDryfruitStock[item.additive_id] = 0;
          } else {
            runningDryfruitStock[item.additive_id] -= neededKg;
          }
        }
      });
    });
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const sellerSettings = localDB.getSellerSettings();
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Day-End Summary Report - ${todayStr}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #334155; line-height: 1.5; }
            .header { border-bottom: 2px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 800; text-transform: uppercase; color: #1e1b4b; }
            .header p { margin: 5px 0 0 0; font-size: 12px; color: #64748b; }
            .meta-grid { display: grid; grid-template-cols: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0; }
            .meta-item { display: flex; flex-direction: column; }
            .meta-label { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; }
            .meta-value { font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 3px; }
            h2 { font-size: 14px; font-weight: 800; text-transform: uppercase; color: #4338ca; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-top: 30px; margin-bottom: 15px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
            th { text-align: left; padding: 10px; background: #f1f5f9; font-weight: 700; text-transform: uppercase; font-size: 10px; border-bottom: 1px solid #cbd5e1; }
            td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
            .text-right { text-align: right; }
            .font-mono { font-family: monospace; font-size: 11px; }
            .badge { font-size: 9px; font-weight: 700; text-transform: uppercase; padding: 3px 8px; border-radius: 9999px; }
            .badge-cash { background: #dcfce7; color: #166534; }
            .badge-upi { background: #e0f2fe; color: #0369a1; }
            .badge-other { background: #f1f5f9; color: #475569; }
            .shortage-warning { background: #fef2f2; border-left: 3px solid #ef4444; padding: 12px; font-size: 11px; color: #991b1b; border-radius: 6px; margin-bottom: 10px; }
            .footer-branding { text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px dashed #e2e8f0; margin-top: 60px; padding-top: 20px; }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <h1>${sellerSettings.seller_name}</h1>
                <p>Day-End Closure Operations & Procurement Report</p>
              </div>
              <button onclick="window.print()" style="padding: 8px 16px; background: #6366f1; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 11px;">Print / Save PDF</button>
            </div>
          </div>
          <div class="meta-grid">
            <div class="meta-item">
              <span class="meta-label">Selected Date</span>
              <span class="meta-value">${todayStr}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Total Bills Generated</span>
              <span class="meta-value">${todayInvoices.length}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Day Gross Sales Revenue</span>
              <span class="meta-value">₹${totalAmount.toFixed(2)}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Report Compiled At</span>
              <span class="meta-value font-mono">${new Date().toLocaleTimeString()}</span>
            </div>
          </div>
          <h2>1. Detailed Billing Registers & Invoices</h2>
          ${todayInvoices.length === 0 ? `
            <p style="font-size: 12px; color: #64748b; font-style: italic;">No transactions recorded for this simulation date.</p>
          ` : `
            <table>
              <thead>
                <tr>
                  <th>Invoice Number</th>
                  <th>Customer Name</th>
                  <th>Status</th>
                  <th>Payment Mode</th>
                  <th class="text-right">Invoice Value</th>
                </tr>
              </thead>
              <tbody>
                ${todayInvoices.map(inv => `
                  <tr>
                    <td class="font-mono font-bold">${inv.invoice_number}</td>
                    <td>${inv.customer_name}</td>
                    <td style="text-transform: capitalize;">${inv.status}</td>
                    <td>
                      <span class="badge ${inv.payment_mode === "Cash" ? "badge-cash" : inv.payment_mode === "UPI" ? "badge-upi" : "badge-other"}">
                        ${inv.payment_mode || "Cash"}
                      </span>
                    </td>
                    <td class="text-right font-mono font-bold">₹${inv.total_amount.toFixed(2)}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          `}
          <h2>2. Box & Packaging Checklist Summary</h2>
          ${Object.keys(boxes).length === 0 ? `
            <p style="font-size: 12px; color: #64748b; font-style: italic;">No packaging items dispatched today.</p>
          ` : `
            <table>
              <thead>
                <tr>
                  <th>Box / Product Name</th>
                  <th class="text-right">Quantity Ordered</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(boxes).map(([name, qty]) => `
                  <tr>
                    <td style="font-weight: 600;">${name}</td>
                    <td class="text-right font-mono font-bold">${qty} units</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          `}
          <h2>3. Dryfruits Filling Ingredients Summary</h2>
          ${Object.keys(additivesNeeded).length === 0 ? `
            <p style="font-size: 12px; color: #64748b; font-style: italic;">No custom dryfruits fillings used today.</p>
          ` : `
            <table>
              <thead>
                <tr>
                  <th>Dryfruit Additive Name</th>
                  <th class="text-right">Total Weight Required</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(additivesNeeded).map(([id, grams]) => {
                  const addObj = additives.find(a => a.id === id);
                  const name = addObj ? addObj.name : "Unknown Additive";
                  return `
                    <tr>
                      <td style="font-weight: 600;">${name}</td>
                      <td class="text-right font-mono font-bold">${(grams / 1000).toFixed(2)} kg</td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
          `}
          <h2>4. Procurement / Purchase Planner (Upcoming 7-Day Shortages)</h2>
          ${Object.keys(boxShortages).length === 0 && Object.keys(dryfruitShortages).length === 0 ? `
            <p style="font-size: 12px; color: #22c55e; font-weight: bold; font-style: italic;">✓ No stock shortages forecasted over the next 7 days. Storage is fully restocked!</p>
          ` : `
            <div style="margin-bottom: 20px;">
              <p style="font-size: 12px; margin-bottom: 12px;">The following shortages exist relative to outstanding future pre-orders scheduled within the next 7 days:</p>
              ${Object.entries(boxShortages).map(([name, qty]) => `
                <div class="shortage-warning">
                  <strong>⚠️ Shortage Alert:</strong> Need to order / pack <strong>${qty} pcs</strong> of <strong>${name}</strong>
                </div>
              `).join("")}
              ${Object.entries(dryfruitShortages).map(([name, qtyKg]) => `
                <div class="shortage-warning">
                  <strong>⚠️ Shortage Alert:</strong> Need to purchase <strong>${qtyKg.toFixed(2)} kg</strong> of dryfruit ingredient <strong>${name}</strong>
                </div>
              `).join("")}
            </div>
          `}
          <div style="display: flex; justify-content: space-between; margin-top: 60px; font-size: 12px; padding: 0 40px;">
            <div style="text-align: center; width: 200px;">
              <div style="border-bottom: 1px solid #475569; height: 40px;"></div>
              <p style="margin-top: 8px; font-weight: bold; color: #475569;">Checked By (Supervisor)</p>
            </div>
            <div style="text-align: center; width: 200px;">
              <div style="border-bottom: 1px solid #475569; height: 40px;"></div>
              <p style="margin-top: 8px; font-weight: bold; color: #475569;">Approved By (Manager)</p>
            </div>
          </div>
          <div class="footer-branding">
            System developed by <span style="font-weight: 800; color: #4f46e5;">Lecharme</span> • Jenny's Creation ERP Console
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };
  return (
    <div className={`min-h-screen ${isDark ? "text-zinc-200" : "text-slate-800"} font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden pb-16`}>
      {/* Solid Background Color Layer behind everything */}
      <div className={`absolute inset-0 -z-30 ${isDark ? "bg-zinc-950 bg-radial-[at_top_center,_var(--tw-gradient-stops)] from-indigo-950/15 via-zinc-950 to-zinc-950" : "bg-slate-100"}`} />
      {/* Background Image with blur & opacity overlay */}
      <div 
        className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat transition-all duration-300 pointer-events-none"
        style={{ 
          backgroundImage: "url('/gifting_bg_image.jpg')",
          filter: "blur(18px) brightness(0.95)",
          opacity: isDark ? 0.08 : 0.04
        }}
      />
      {/* Top glowing line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 opacity-80" />
      {/* Subtle top spotlight glow */}
      <div className={`absolute top-0 left-1/4 right-1/4 h-[120px] ${isDark ? "bg-indigo-500/10" : "bg-indigo-500/5"} blur-[100px] pointer-events-none rounded-full`} />
      {/* Container */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header Section */}
        <header className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 pb-6 border-b ${isDark ? "border-zinc-900" : "border-slate-200"}`}>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${isDark ? "bg-indigo-950/50 text-indigo-300 border-indigo-900/40" : "bg-indigo-50 text-indigo-700 border-indigo-100"}`}>
                Studio App
              </span>
              <span className={`flex items-center gap-1 text-xs ${isDark ? "text-zinc-500" : "text-slate-500"}`}>
                <Database className="h-3 w-3" />
                {isSupabaseConfigured ? "Supabase Cloud" : "Local Mock Sandbox"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className={`text-3xl font-extrabold tracking-tight ${isDark ? "text-white bg-clip-text bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400" : "text-zinc-800"}`}>
                JENNY CREATION
              </h1>
              <button 
                onClick={toggleTheme}
                className={`p-1.5 rounded-lg border transition duration-150 ${isDark ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white" : "bg-white border-zinc-200 text-zinc-650 hover:text-zinc-800 shadow-sm"}`}
                title="Toggle Theme style preference"
              >
                {isDark ? (
                  <Sun className="h-4 w-4 text-amber-400" />
                ) : (
                  <Moon className="h-4 w-4 text-indigo-500" />
                )}
              </button>
            </div>
            <p className={`text-sm mt-1 ${isDark ? "text-zinc-400" : "text-zinc-550"}`}>
              High-fidelity Inventory & Order Management System
            </p>
            {!isSupabaseConfigured && (
              <div className="flex items-center gap-2 mt-2">
                <button 
                  onClick={() => {
                    if (confirm("Are you sure you want to clear all mock data to start fresh?")) {
                      localDB.clearAll();
                      loadData();
                    }
                  }}
                  className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded bg-rose-950/30 hover:bg-rose-950/50 text-rose-450 border border-rose-900/20 transition duration-150"
                >
                  Clear Sandbox
                </button>
                <button 
                  onClick={() => {
                    if (confirm("Restore preloaded demo categories, products, stock, and invoices?")) {
                      localDB.resetSeed();
                      loadData();
                    }
                  }}
                  className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded border transition duration-150 ${isDark ? "bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border-zinc-800" : "bg-white hover:bg-slate-50 text-slate-600 border-slate-200 shadow-sm"}`}
                >
                  Restore Demo Seeds
                </button>
              </div>
            )}
          </div>
          {/* Mode Switcher Segment */}
          <div className={`flex items-center p-1.5 rounded-2xl border shrink-0 ${isDark ? "bg-zinc-950 border-zinc-808/80" : "bg-slate-100 border-slate-205"}`}>
            <button
              onClick={() => setAppMode("billing")}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition duration-200 flex items-center gap-1.5 whitespace-nowrap select-none ${
                appMode === "billing"
                  ? "bg-indigo-600 text-white shadow-sm font-extrabold"
                  : (isDark ? "text-zinc-450 hover:text-zinc-250" : "text-slate-550 hover:text-slate-800")
              }`}
            >
              <FileText className="h-4 w-4" /> Billing Station
            </button>
            <button
              onClick={() => setAppMode("inventory")}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition duration-200 flex items-center gap-1.5 whitespace-nowrap select-none ${
                appMode === "inventory"
                  ? "bg-indigo-600 text-white shadow-sm font-extrabold"
                  : (isDark ? "text-zinc-450 hover:text-zinc-250" : "text-slate-550 hover:text-slate-800")
              }`}
            >
              <Layers className="h-4 w-4" /> Inventory Hub
            </button>
            <button
              onClick={() => setAppMode("admin")}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition duration-200 flex items-center gap-1.5 whitespace-nowrap select-none ${
                appMode === "admin"
                  ? "bg-indigo-600 text-white shadow-sm font-extrabold"
                  : (isDark ? "text-zinc-450 hover:text-zinc-250" : "text-slate-550 hover:text-slate-800")
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" /> Admin Controls
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* 🔔 Facebook/Instagram Style Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className={`p-2 rounded-xl border relative transition duration-200 flex items-center justify-center cursor-pointer ${
                  isDark 
                    ? "bg-zinc-900/40 border-zinc-808/60 hover:bg-zinc-800 text-zinc-300 hover:text-white" 
                    : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800 shadow-sm"
                }`}
                title="System Notifications"
              >
                <Bell className="h-4 w-4" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[8px] font-black text-white ring-2 ring-white dark:ring-zinc-950 animate-bounce">
                    {notifications.length}
                  </span>
                )}
              </button>
              {isNotificationOpen && (
                <div className={`absolute right-0 mt-2 w-80 max-w-sm rounded-2xl border p-4 shadow-2xl z-55 flex flex-col gap-3 transition duration-150 ${
                  isDark ? "bg-zinc-950 border-zinc-808/80 text-zinc-300 shadow-zinc-950/50" : "bg-white border-slate-205 text-slate-800 shadow-slate-100/50"
                }`}>
                  <div className="flex items-center justify-between border-b pb-2 border-zinc-808/20">
                    <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                      <Bell className="h-3.5 w-3.5 text-indigo-500" /> Notifications
                    </h4>
                    <div className="flex items-center gap-1.5">
                      {dismissedNotificationIds.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setDismissedNotificationIds([])}
                          className="text-[9px] font-bold text-indigo-500 hover:underline cursor-pointer"
                        >
                          Reset Dismissed
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-500">
                          {notifications.length} Active
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
                    {notifications.length === 0 ? (
                      <div className="text-center py-8 text-zinc-500 italic text-[11px] flex flex-col items-center justify-center gap-1.5">
                        <CheckCircle className="h-6 w-6 text-emerald-500" />
                        <span>No active alerts. Operational state healthy!</span>
                      </div>
                    ) : (
                      notifications.map(n => {
                        let severityClass = "";
                        let textClass = "";
                        let icon = null;

                        if (n.severity === "critical") {
                          severityClass = isDark ? "bg-rose-500/5 border-rose-500/30" : "bg-rose-50 border-rose-100";
                          textClass = "text-rose-500";
                          icon = <AlertTriangle className="h-3.5 w-3.5 text-rose-500 shrink-0" />;
                        } else if (n.severity === "warning") {
                          severityClass = isDark ? "bg-amber-500/5 border-amber-500/30" : "bg-amber-50 border-amber-100";
                          textClass = "text-amber-555 dark:text-amber-400";
                          icon = <Package className="h-3.5 w-3.5 text-amber-500 shrink-0" />;
                        } else {
                          severityClass = isDark ? "bg-indigo-500/5 border-indigo-500/30" : "bg-indigo-50 border-indigo-100";
                          textClass = "text-indigo-500";
                          icon = <Calendar className="h-3.5 w-3.5 text-indigo-500 shrink-0" />;
                        }

                        return (
                          <div
                            key={n.id}
                            className={`p-3 rounded-xl border text-[11px] leading-relaxed relative flex flex-col gap-1 text-left transition ${severityClass}`}
                          >
                            {/* Dismiss button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDismissedNotificationIds([...dismissedNotificationIds, n.id]);
                              }}
                              className="absolute top-2 right-2 p-0.5 rounded text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition duration-150 cursor-pointer"
                              title="Dismiss Alert"
                            >
                              <X className="h-3 w-3" />
                            </button>

                            {/* Header row */}
                            <div className="flex items-center gap-1.5 font-bold mb-0.5 pr-4">
                              {icon}
                              <span className={textClass}>{n.title}</span>
                              {n.dueDate && (
                                <span className="text-[8px] font-mono uppercase px-1 py-0.5 rounded bg-zinc-500/10 text-zinc-500 ml-auto font-black">
                                  {n.dueDate}
                                </span>
                              )}
                            </div>

                            {/* Message content */}
                            <p className="text-zinc-550 dark:text-zinc-400 font-medium">{n.message}</p>

                            {/* Details Action trigger */}
                            {n.invoiceId && (
                              <button
                                type="button"
                                onClick={() => {
                                  setPreviewInvoiceId(n.invoiceId || "");
                                  setIsPreviewModalOpen(true);
                                  setIsNotificationOpen(false);
                                }}
                                className="text-[9px] text-indigo-500 hover:underline mt-1 text-left font-bold cursor-pointer"
                              >
                                View Order Details &rarr;
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
            <button 
              onClick={() => setIsArchiveModalOpen(true)}
              className={`px-3.5 py-2 text-sm border rounded-lg flex items-center gap-2 transition duration-200 cursor-pointer ${isDark ? "bg-zinc-900/40 border-amber-950/40 text-amber-500/90 hover:text-amber-400 hover:bg-zinc-850" : "bg-white border-amber-200 text-amber-600 hover:text-amber-700 shadow-sm"}`}
            >
              <Trash2 className="h-4 w-4" /> Archive Bin
            </button>
          </div>
        </header>
        {/* Main Dashboard / Billing Console Content */}
        {appMode === "billing" ? (
          <div className="w-full max-w-[1650px] mx-auto mb-8 relative">
            {/* Sub-tab selection bar for Billing Console */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b pb-4 border-zinc-808/30 print:hidden">
              <div className={`flex p-1 rounded-xl border ${isDark ? "bg-zinc-950/60 border-zinc-808/60" : "bg-slate-100/80 border-slate-205"}`}>
                <button
                  type="button"
                  onClick={() => {
                    setBillingTab("form");
                    setIsEditingInvoice(false);
                    setEditingInvoiceId(null);
                    setInvoiceCustomerName("");
                    setInvoiceCustomerPhone("");
                    setInvoiceCustomerStatus("ordered");
                    setInvoiceItems([{ productId: "", quantity: 1, unitPrice: 0, discount: 0 }]);
                  }}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition duration-150 flex items-center gap-1.5 cursor-pointer ${
                    billingTab === "form" && !isEditingInvoice
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                      : (isDark ? "text-zinc-400 hover:text-white" : "text-slate-500 hover:text-slate-800")
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>New Invoice Form</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBillingTab("kanban");
                    setIsEditingInvoice(false);
                    setEditingInvoiceId(null);
                  }}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition duration-150 flex items-center gap-1.5 cursor-pointer ${
                    billingTab === "kanban"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                      : (isDark ? "text-zinc-400 hover:text-white" : "text-slate-500 hover:text-slate-800")
                  }`}
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  <span>Order Kanban Board</span>
                </button>
                {isEditingInvoice && (
                  <div className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-amber-500 text-white rounded-lg flex items-center gap-1.5 animate-pulse">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Editing Order {invoices.find(i => i.id === editingInvoiceId)?.order_id}</span>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsHistoryDrawerOpen(true)}
                className={`px-4 py-2 border rounded-xl text-xs font-bold transition duration-150 flex items-center gap-2 select-none shrink-0 cursor-pointer ${
                  isDark 
                    ? "bg-zinc-950 hover:bg-zinc-850 border-zinc-808 text-indigo-400 hover:text-indigo-300" 
                    : "bg-slate-50 hover:bg-slate-100 border-slate-205 text-indigo-650 hover:text-indigo-700 shadow-xs"
                }`}
              >
                <History className="h-4 w-4" /> View Invoice History ({invoices.length})
              </button>
            </div>
            {/* Pre-Order Alert Center Banner */}
            {billingTab === "kanban" && (() => {
              const activePreOrders = invoices.filter(inv => inv.delivery_date && inv.status !== "delivered" && inv.status !== "completed");
              const urgentPreOrders = activePreOrders.map(inv => {
                const today = new Date(simulationDate);
                today.setHours(0, 0, 0, 0);
                const deliveryDate = new Date(inv.delivery_date!);
                deliveryDate.setHours(0, 0, 0, 0);
                const diffTime = deliveryDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return { inv, diffDays };
              }).filter(item => item.diffDays <= 3); // 3 days before
              if (urgentPreOrders.length === 0) return null;
              return (
                <div className="mb-5 flex flex-col gap-2.5">
                  <div className={`p-4 rounded-2xl border flex flex-col gap-3 shadow-md ${
                    isDark 
                      ? "bg-rose-950/15 border-rose-500/30 text-rose-200 shadow-rose-950/20" 
                      : "bg-rose-50 border-rose-200 text-rose-900 shadow-rose-100/50"
                  }`}>
                    <div className="flex items-center justify-between border-b pb-2 border-rose-500/10">
                      <div className="flex items-center gap-2">
                        <span className="animate-bounce">🚨</span>
                        <h3 className="text-sm font-extrabold uppercase tracking-wider">Urgent Pre-Order Dispatch Schedule Alert</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isDark ? "bg-rose-500/20 text-rose-300" : "bg-rose-100 text-rose-700"
                        }`}>
                          {urgentPreOrders.length} pending orders
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsUrgentAlertExpanded(!isUrgentAlertExpanded)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                            isDark ? "border-rose-500/30 text-rose-300 hover:bg-rose-500/10" : "border-rose-200 text-rose-700 hover:bg-rose-100"
                          }`}
                        >
                          {isUrgentAlertExpanded ? "Collapse" : "Expand"}
                        </button>
                      </div>
                    </div>
                    {isUrgentAlertExpanded && (
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1 animate-fadeIn">
                        {urgentPreOrders.map(({ inv, diffDays }) => {
                          const advance = inv.advance_paid || 0;
                          const balance = inv.total_amount - advance;
                          let badgeColor = "";
                          let countdownText = "";
                          if (diffDays === 0) {
                            badgeColor = "bg-rose-500 text-white animate-pulse font-black";
                            countdownText = "🔥 DELIVER TODAY!";
                          } else if (diffDays < 0) {
                            badgeColor = "bg-rose-600 text-white font-black";
                            countdownText = `⚠️ OVERDUE by ${Math.abs(diffDays)} days!`;
                          } else if (diffDays === 1) {
                            badgeColor = "bg-amber-500 text-white font-extrabold";
                            countdownText = "⏳ 1 day remaining";
                          } else {
                            badgeColor = "bg-blue-500 text-white font-extrabold";
                            countdownText = `📅 ${diffDays} days remaining`;
                          }
                          return (
                            <div 
                              key={inv.id} 
                              onClick={() => {
                                setPreviewInvoiceId(inv.id);
                                setIsPreviewModalOpen(true);
                              }}
                              className={`flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-xl border text-xs transition duration-150 cursor-pointer ${
                                isDark 
                                  ? "bg-zinc-950/60 border-zinc-808/50 hover:bg-zinc-900/60 hover:border-zinc-700" 
                                  : "bg-white border-slate-205 hover:bg-slate-50 hover:border-slate-300 shadow-2xs"
                              }`}
                            >
                              <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 text-[9px] rounded ${badgeColor}`}>
                                    {countdownText}
                                  </span>
                                  <span className={`font-mono font-bold ${isDark ? "text-zinc-300" : "text-zinc-800"}`}>
                                    {inv.order_id}
                                  </span>
                                  <span className="font-semibold">{inv.customer_name}</span>
                                </div>
                                <p className={`text-[10px] ${isDark ? "text-zinc-500" : "text-slate-455"} mt-0.5`}>
                                  Needs items by <span className="underline font-bold font-mono">{inv.delivery_date}</span> • Adv Paid: <span className="font-bold text-emerald-500">₹{advance}</span> • Balance: <span className="font-bold text-indigo-500">₹{balance}</span>
                                </p>
                              </div>
                              <div className="flex items-center gap-3 mt-2 sm:mt-0">
                                <span className={`text-[10px] font-mono border border-dashed rounded px-1.5 py-0.5 ${
                                  isDark ? "border-zinc-808 text-zinc-400" : "border-slate-200 text-slate-500"
                                }`}>
                                  Status: <span className="font-bold capitalize">{inv.status}</span>
                                </span>
                                <span className="font-mono font-black text-[13px] text-emerald-500">
                                  ₹{inv.total_amount.toLocaleString("en-IN")}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
            {billingTab === "form" || isEditingInvoice ? (
              /* Dedicated Invoice Form Card */
              <div className={`${cardClass} p-6 pb-24 lg:pb-6 flex flex-col gap-6 rounded-2xl relative shadow-lg`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className={`text-xl font-bold mb-1 flex items-center gap-2 ${isDark ? "text-zinc-100" : "text-zinc-800"}`}>
                      <FileText className="h-5 w-5 text-indigo-500" /> {isEditingInvoice ? `Modify Order ${invoices.find(i => i.id === editingInvoiceId)?.order_id}` : "New Billing Invoice"}
                    </h2>
                    <p className={`text-xs ${isDark ? "text-zinc-400" : "text-zinc-550"}`}>
                      {isEditingInvoice ? "Adjust details, pricing, discount, items, or status of this active order card." : "Generate client dispatch vouchers. Stock levels deplete automatically from corresponding locations."}
                    </p>
                  </div>
                </div>
              <form id="invoice-form" onSubmit={handleCreateInvoice} className="space-y-5">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Customer Details & Settings */}
                  <div className="lg:col-span-4 space-y-5">
                    <div className={`${cardClass} p-5 rounded-2xl border flex flex-col gap-4 ${isDark ? "bg-zinc-950/20" : "bg-white"}`}>
                      <h3 className={`text-sm font-bold uppercase tracking-wider border-b pb-2 ${isDark ? "text-zinc-300 border-zinc-808/30" : "text-zinc-700 border-slate-205"}`}>
                        Customer & Order Settings
                      </h3>
                      <div className="space-y-4">
                        {/* Global Toggle: Only Dryfruits Invoice */}
                        <div className="flex items-center gap-2 p-2.5 rounded-xl border border-dashed border-indigo-500/20 bg-indigo-500/5">
                          <input
                            type="checkbox"
                            id="only-dryfruits-checkbox"
                            checked={isOnlyDryfruits}
                            onChange={(e) => {
                              const val = e.target.checked;
                              setIsOnlyDryfruits(val);
                              setInvoiceItems([{
                                productId: val ? null : "",
                                additiveId: val ? "" : null,
                                quantity: 1,
                                unitPrice: 0,
                                discount: 0
                              }]);
                            }}
                            className="h-4 w-4 text-indigo-650 focus:ring-indigo-500 border-zinc-300 rounded cursor-pointer"
                          />
                          <label htmlFor="only-dryfruits-checkbox" className="text-xs font-bold text-indigo-600 select-none cursor-pointer">
                            Only Dryfruits Invoice 🍯
                          </label>
                        </div>
                        <div>
                          <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Customer Full Name</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. Aryan Sharma"
                            value={invoiceCustomerName}
                            onChange={e => setInvoiceCustomerName(e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${inputClass}`}
                          />
                        </div>
                        <div>
                          <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                            Customer Phone <span className={`text-[10px] lowercase font-normal ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>(optional)</span>
                          </label>
                          <input 
                            type="text" 
                            placeholder="e.g. +91 98765 43210"
                            value={invoiceCustomerPhone}
                            onChange={e => setInvoiceCustomerPhone(e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${inputClass}`}
                          />
                        </div>
                        <div>
                          <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                            Initial Order Stage
                          </label>
                          <select
                            value={invoiceCustomerStatus}
                            onChange={e => setInvoiceCustomerStatus(e.target.value as any)}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none font-bold capitalize ${
                              invoiceCustomerStatus === "ordered" ? "text-blue-500" :
                              invoiceCustomerStatus === "preparing" ? "text-amber-500" :
                              invoiceCustomerStatus === "completed" ? "text-indigo-500" :
                              "text-emerald-500"
                            } ${inputClass}`}
                          >
                            <option value="ordered" className="text-blue-500 font-bold">Ordered (Awaiting Work)</option>
                            <option value="preparing" className="text-amber-500 font-bold">Preparing (In Production)</option>
                            <option value="completed" className="text-indigo-500 font-bold">Completed (Dispatched)</option>
                            <option value="delivered" className="text-emerald-500 font-bold">Delivered (Handed Over)</option>
                          </select>
                        </div>
                        <div>
                          <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                            Payment Mode
                          </label>
                          <select
                            value={invoicePaymentMode}
                            onChange={e => setInvoicePaymentMode(e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none font-bold ${inputClass}`}
                          >
                            <option value="Cash">Cash</option>
                            <option value="UPI">UPI</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="Card">Card</option>
                            <option value="Cheque">Cheque</option>
                          </select>
                        </div>
                      </div>
                    </div>
                {/* Pre-order configurations */}
                <div className={`p-4 rounded-xl border flex flex-col gap-3 ${isDark ? "bg-zinc-950/40 border-zinc-808" : "bg-slate-50 border-slate-205"}`}>
                  <label className="flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={isPreOrder}
                      onChange={e => setIsPreOrder(e.target.checked)}
                      className="rounded border-zinc-350 text-indigo-650 focus:ring-indigo-500 h-3.5 w-3.5"
                    />
                    <span className="flex items-center gap-1.5">
                      📅 This is a Scheduled Pre-Order (Requires Future Delivery & Advance Payment)
                    </span>
                  </label>
                  {isPreOrder && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                      <div>
                        <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? "text-zinc-400" : "text-zinc-550"}`}>
                          Scheduled Delivery Date <span className="text-rose-500">*</span>
                        </label>
                        <input 
                          type="date"
                          required={isPreOrder}
                          value={invoiceDeliveryDate}
                          onChange={e => setInvoiceDeliveryDate(e.target.value)}
                          className={`w-full px-3 py-1.5 text-xs border rounded-lg focus:outline-none ${inputClass}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? "text-zinc-400" : "text-zinc-550"}`}>
                          Advance Deposit Amount Paid (₹)
                        </label>
                        <input 
                          type="text"
                          placeholder="e.g. 5000"
                          value={invoiceAdvancePaid}
                          onChange={e => {
                            // Only allow positive numbers
                            const val = e.target.value.replace(/[^0-9]/g, "");
                            setInvoiceAdvancePaid(val);
                          }}
                          className={`w-full px-3 py-1.5 text-xs border rounded-lg focus:outline-none ${inputClass}`}
                        />
                      </div>
                    </div>
                  )}
                </div>
                  </div>
                  {/* Right Column: Invoice Line Items */}
                  <div className="lg:col-span-8 space-y-5">
                    <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className={`text-xs font-semibold uppercase tracking-wider ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Invoice Line Items</label>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-400 cursor-pointer select-none">
                      <input 
                        type="checkbox"
                        checked={showDiscountFields}
                        onChange={e => {
                          setShowDiscountFields(e.target.checked);
                          if (!e.target.checked) {
                            const updated = invoiceItems.map(item => ({ ...item, discount: 0 }));
                            setInvoiceItems(updated);
                          }
                        }}
                        className="rounded border-zinc-350 text-indigo-650 focus:ring-indigo-500 h-3.5 w-3.5"
                      />
                      <span>Apply Item Discounts</span>
                    </label>
                  </div>
                  <div className="space-y-3">
                    {invoiceItems.map((item, index) => {
                      const isDryfruitRow = isOnlyDryfruits || (item.additiveId !== null && item.productId === null);
                      const currentAdditive = isDryfruitRow ? additives.find(a => a.id === item.additiveId) : null;
                      const currentProduct = !isDryfruitRow && item.productId ? products.find(p => p.id === item.productId) : null;
                      const maxJars = item.productId ? getProductMaxJars(item.productId) : 0;
                      return (
                        <div key={index} className="space-y-3">
                          <div className={`grid grid-cols-12 gap-3 items-start p-3 rounded-xl border ${isDark ? "bg-zinc-950/40 border-zinc-808/80" : "bg-slate-50/50 border-slate-205"}`}>
                          {/* Custom Autocomplete Search Selector */}
                          <div className={`${showDiscountFields ? "col-span-12 md:col-span-4" : "col-span-12 md:col-span-5"} relative`}>
                            <label className="block text-[10px] font-semibold text-zinc-500 mb-1 flex justify-between">
                              <span className="flex items-center gap-1.5">
                                <span>{isDryfruitRow ? "Dryfruit Selection" : "Product Selection"}</span>
                                {!isOnlyDryfruits && (
                                  <label className="inline-flex items-center gap-1 text-[9px] font-black text-indigo-500 cursor-pointer select-none">
                                    <input 
                                      type="checkbox"
                                      checked={isDryfruitRow}
                                      onChange={(e) => {
                                        const isDry = e.target.checked;
                                        const updated = [...invoiceItems];
                                        updated[index].productId = isDry ? null : "";
                                        updated[index].additiveId = isDry ? "" : null;
                                        updated[index].unitPrice = 0;
                                        updated[index].quantity = 1;
                                        updated[index].customizations = [];
                                        setInvoiceItems(updated);
                                      }}
                                      className="rounded border-indigo-350 text-indigo-650 h-3 w-3"
                                    />
                                    <span>Loose Dryfruit</span>
                                  </label>
                                )}
                              </span>
                              {isDryfruitRow ? (
                                item.additiveId && (
                                  <span className="text-emerald-500 font-medium font-mono">
                                    {(currentAdditive?.stock_qty_kg || 0).toFixed(2)} kg avl
                                  </span>
                                )
                              ) : (
                                item.productId && (
                                  <span className={getProductStock(item.productId) > 0 ? "text-emerald-500 font-medium font-mono" : "text-rose-505 font-medium font-mono"}>
                                    {getProductStock(item.productId)} avl
                                  </span>
                                )
                              )}
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                if (activeDropdownIndex === index) {
                                  setActiveDropdownIndex(null);
                                } else {
                                  setActiveDropdownIndex(index);
                                  setProductSearchQuery(""); // Reset search query
                                }
                              }}
                              className={`w-full px-2.5 py-1.5 border rounded-lg text-left text-xs flex items-center justify-between transition duration-150 cursor-pointer ${
                                isDark ? "bg-zinc-950 border-zinc-850 text-zinc-200" : "bg-white border-slate-200 text-slate-800"
                              }`}
                            >
                              <span className="truncate">
                                {isDryfruitRow ? (
                                  item.additiveId 
                                    ? (currentAdditive?.name || "Unknown Dryfruit") 
                                    : "Select Dryfruit..."
                                ) : (
                                  item.productId 
                                    ? (currentProduct?.name || "Unknown Product") 
                                    : "Select Product..."
                                )}
                              </span>
                              <ChevronDown className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                            </button>
                            {activeDropdownIndex === index && (
                              <>
                                <div className="fixed inset-0 z-20" onClick={() => setActiveDropdownIndex(null)} />
                                <div className={`absolute left-0 right-0 mt-1.5 p-2 rounded-xl border z-35 flex flex-col gap-2 shadow-xl ${
                                  isDark ? "bg-zinc-950 border-zinc-808 shadow-zinc-950/80" : "bg-white border-slate-205 shadow-slate-200/50"
                                }`}>
                                  <div className="relative">
                                    <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-500" />
                                    <input
                                      type="text"
                                      placeholder={isDryfruitRow ? "Search by dryfruit name..." : "Search by product name..."}
                                      value={productSearchQuery}
                                      autoFocus
                                      onChange={e => setProductSearchQuery(e.target.value)}
                                      className={`w-full pl-8 pr-2 py-1 text-xs border rounded-md focus:outline-none ${inputClass}`}
                                    />
                                  </div>
                                  <div className="max-h-48 overflow-y-auto space-y-1 scrollbar-thin">
                                    {isDryfruitRow ? (
                                      additives
                                        .filter(a => a.deleted_at === null)
                                        .filter(a => !productSearchQuery || a.name.toLowerCase().includes(productSearchQuery.toLowerCase()))
                                        .length === 0 ? (
                                          <div className="text-[10px] text-zinc-500 italic p-2 text-center">
                                            No matching dryfruits found
                                          </div>
                                        ) : (
                                          additives
                                            .filter(a => a.deleted_at === null)
                                            .filter(a => !productSearchQuery || a.name.toLowerCase().includes(productSearchQuery.toLowerCase()))
                                            .map(add => {
                                              const isSelected = item.additiveId === add.id;
                                              const isOutOfStock = add.stock_qty_kg <= 0;
                                              return (
                                                <div
                                                  key={add.id}
                                                  onClick={() => {
                                                    if (isOutOfStock && !isPreOrder) return;
                                                    const updated = [...invoiceItems];
                                                    updated[index].additiveId = add.id;
                                                    updated[index].productId = null;
                                                    updated[index].unitPrice = add.price_per_kg;
                                                    updated[index].discount = 0;
                                                    updated[index].customizations = [];
                                                    updated[index].quantity = 1;
                                                    setInvoiceItems(updated);
                                                    setActiveDropdownIndex(null);
                                                  }}
                                                  className={`p-1.5 rounded-lg text-left transition duration-150 flex items-center justify-between text-[11px] cursor-pointer ${
                                                    isSelected 
                                                      ? "bg-indigo-600 text-white font-semibold cursor-pointer" 
                                                      : (isDark ? "hover:bg-zinc-850 text-zinc-300 cursor-pointer" : "hover:bg-slate-100 text-slate-700 cursor-pointer")
                                                  }`}
                                                >
                                                  <div className="flex flex-col">
                                                    <span className="font-semibold">{add.name}</span>
                                                    <span className={`text-[9px] ${isSelected ? "text-indigo-200" : "text-zinc-505"}`}>
                                                      Stock: {add.stock_qty_kg.toFixed(2)} kg
                                                    </span>
                                                  </div>
                                                  <span className="font-mono text-[10px] shrink-0 text-emerald-500 font-bold">
                                                    ₹{add.price_per_kg}/kg
                                                  </span>
                                                </div>
                                              );
                                            })
                                        )
                                    ) : (
                                      products
                                        .filter(p => p.deleted_at === null)
                                        .filter(p => {
                                          if (!productSearchQuery) return true;
                                          const q = productSearchQuery.toLowerCase();
                                          return p.name.toLowerCase().includes(q) || 
                                                 (p.price && String(p.price).includes(q)) ||
                                                 getCategoryName(p.category_id).toLowerCase().includes(q) ||
                                                 getSubTypeName(p.sub_type_id).toLowerCase().includes(q);
                                        })
                                        .slice(0, 50)
                                        .length === 0 ? (
                                          <div className="text-[10px] text-zinc-500 italic p-2 text-center">
                                            No matching products found
                                          </div>
                                        ) : (
                                          products
                                            .filter(p => p.deleted_at === null)
                                            .filter(p => {
                                              if (!productSearchQuery) return true;
                                              const q = productSearchQuery.toLowerCase();
                                              return p.name.toLowerCase().includes(q) || 
                                                     (p.price && String(p.price).includes(q)) ||
                                                     getCategoryName(p.category_id).toLowerCase().includes(q) ||
                                                     getSubTypeName(p.sub_type_id).toLowerCase().includes(q);
                                            })
                                            .slice(0, 50)
                                            .map(p => {
                                              const isSelected = item.productId === p.id;
                                              const stockCount = getProductStock(p.id);
                                              const isOutOfStock = stockCount <= 0;
                                              return (
                                                <div
                                                  key={p.id}
                                                  onClick={() => {
                                                    if (isOutOfStock && !isPreOrder) return;
                                                    const updated = [...invoiceItems];
                                                    updated[index].productId = p.id;
                                                    updated[index].additiveId = null;
                                                    updated[index].unitPrice = p.price || 0;
                                                    updated[index].discount = 0;
                                                    updated[index].customizations = [];
                                                    const maxStock = getProductStock(p.id);
                                                    updated[index].quantity = Math.min(updated[index].quantity, maxStock);
                                                    if (updated[index].quantity === 0 && maxStock > 0) {
                                                      updated[index].quantity = 1;
                                                    }
                                                    setInvoiceItems(updated);
                                                    setActiveDropdownIndex(null);
                                                    setActiveJarConfigIndex(null);
                                                  }}
                                                  className={`p-1.5 rounded-lg text-left transition duration-150 flex items-center justify-between text-[11px] cursor-pointer ${
                                                    isSelected 
                                                      ? "bg-indigo-600 text-white font-semibold cursor-pointer" 
                                                      : (isDark ? "hover:bg-zinc-850 text-zinc-300 cursor-pointer" : "hover:bg-slate-100 text-slate-700 cursor-pointer")
                                                  }`}
                                                >
                                                  <div className="flex flex-col">
                                                    <span className="truncate font-medium flex items-center gap-1.5">
                                                      <span>{p.name}</span>
                                                      {p.supplier_code && (
                                                        <span className={`text-[9px] font-mono rounded px-1 shrink-0 ${isSelected ? "bg-white/20 text-white" : "bg-zinc-808 text-zinc-400 dark:bg-zinc-950/60 dark:text-zinc-550 border border-zinc-808/30"}`}>
                                                          {p.supplier_code}
                                                        </span>
                                                      )}
                                                    </span>
                                                    <span className={`text-[9px] ${isSelected ? "text-indigo-200" : "text-zinc-505"}`}>
                                                      Stock: {stockCount} units
                                                    </span>
                                                  </div>
                                                  <span className="font-mono text-[10px] ml-2 shrink-0">
                                                    ₹{p.price || 0}
                                                  </span>
                                                </div>
                                              );
                                            })
                                        )
                                    )}
                                  </div>
                                </div>
                              </>
                            )}
                            {isDryfruitRow ? (
                              <span className="text-[10px] text-indigo-500 font-semibold italic bg-indigo-500/5 px-2 py-1.5 rounded-lg border border-indigo-500/10 block mt-1.5 text-center">
                                Loose Dryfruit Sale (No packaging)
                              </span>
                            ) : (
                              item.productId && getProductMaxJars(item.productId) > 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (activeJarConfigIndex === index) {
                                      setActiveJarConfigIndex(null);
                                    } else {
                                      setActiveJarConfigIndex(index);
                                    }
                                  }}
                                  className={`mt-1.5 w-full px-2 py-1.5 text-[10px] font-extrabold rounded-lg border transition flex items-center justify-between cursor-pointer select-none ${
                                    item.customizations && item.customizations.length > 0
                                      ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-500 hover:bg-emerald-500/20"
                                      : "bg-indigo-500/10 border-indigo-500/25 text-indigo-550 hover:bg-indigo-500/20"
                                  }`}
                                >
                                  <span className="flex items-center gap-1">
                                    <span>🍯</span>
                                    <span>
                                      {item.customizations && item.customizations.length > 0 
                                        ? `Jars Packed (${item.customizations.filter(c => c.additive_id !== "empty").length}/${getProductMaxJars(item.productId)})` 
                                        : `Pack Jars (${getProductMaxJars(item.productId)} max)`}
                                    </span>
                                  </span>
                                  <ChevronDown className="h-3 w-3 opacity-60" />
                                </button>
                              )
                            )}
                          </div>
                          {/* Qty/Weight Input */}
                          <div className={showDiscountFields ? "col-span-4 md:col-span-2" : "col-span-6 md:col-span-2"}>
                            <label className="block text-[10px] font-semibold text-zinc-500 mb-1">
                              {isDryfruitRow ? "Weight (kg)" : "Qty"}
                            </label>
                            <input 
                              type="text" 
                              required
                              value={item.quantity}
                              onFocus={e => e.target.select()}
                              onChange={e => {
                                const regex = isDryfruitRow ? /[^0-9.]/g : /[^0-9]/g;
                                const val = e.target.value.replace(regex, '');
                                let enteredQty = val ? Number(val) : 0;
                                if (!isPreOrder) {
                                  if (isDryfruitRow && item.additiveId) {
                                    const maxAvailable = additives.find(a => a.id === item.additiveId)?.stock_qty_kg || 0;
                                    if (enteredQty > maxAvailable) {
                                      alert(`Only ${maxAvailable.toFixed(2)} kg of dryfruit is available in stock.`);
                                      enteredQty = maxAvailable;
                                    }
                                  } else if (!isDryfruitRow && item.productId) {
                                    const maxAvailable = getProductStock(item.productId);
                                    if (enteredQty > maxAvailable) {
                                      alert(`Only ${maxAvailable} units are available in stock.`);
                                      enteredQty = maxAvailable;
                                    }
                                  }
                                }
                                const updated = [...invoiceItems];
                                updated[index].quantity = enteredQty;
                                setInvoiceItems(updated);
                              }}
                              className={`w-full px-2 py-1.5 border rounded-lg focus:outline-none text-xs font-mono text-left ${inputClass}`}
                            />
                          </div>
                          {/* Price Input */}
                          <div className={showDiscountFields ? "col-span-4 md:col-span-2" : "col-span-6 md:col-span-2"}>
                            <label className="block text-[10px] font-semibold text-zinc-550 mb-1">
                              {isDryfruitRow ? "Price per kg (₹)" : "Price (₹)"}
                            </label>
                            <input 
                              type="text" 
                              required
                              value={item.unitPrice}
                              onFocus={e => e.target.select()}
                              onChange={e => {
                                const val = e.target.value.replace(/[^0-9.]/g, '');
                                const updated = [...invoiceItems];
                                updated[index].unitPrice = val ? Number(val) : 0;
                                setInvoiceItems(updated);
                              }}
                              className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none text-xs font-mono text-left ${inputClass}`}
                            />
                          </div>
                          {/* Discount Input */}
                          {showDiscountFields && (
                            <div className="col-span-4 md:col-span-2">
                              <label className="block text-[10px] font-semibold text-zinc-500 mb-1">Discount (%)</label>
                              <input 
                                type="text" 
                                required
                                value={item.discount || 0}
                                onFocus={e => e.target.select()}
                                onChange={e => {
                                  const val = e.target.value.replace(/[^0-9.]/g, '');
                                  const num = val ? Number(val) : 0;
                                  const updated = [...invoiceItems];
                                  updated[index].discount = Math.min(num, 100);
                                  setInvoiceItems(updated);
                                }}
                                className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none text-xs font-mono text-left ${inputClass}`}
                              />
                            </div>
                          )}
                          {/* Total paid display */}
                          <div className="col-span-6 md:col-span-2">
                            <label className="block text-[10px] font-semibold text-zinc-500 mb-1 text-right">Total (₹)</label>
                            <div className={`w-full px-2 py-1.5 border rounded-lg text-xs font-mono text-right flex items-center justify-end h-[32px] ${isDark ? "bg-zinc-900/50 border-zinc-808/80 text-zinc-355" : "bg-white border-zinc-205 text-zinc-700 shadow-xs"}`}>
                              ₹{Math.round(item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100)).toLocaleString("en-IN")}
                            </div>
                          </div>
                          {/* Action trigger */}
                          <div className="col-span-6 md:col-span-1 text-right md:text-center pt-6">
                            <button 
                              type="button" 
                              onClick={() => {
                                if (invoiceItems.length === 1) return;
                                setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
                              }}
                              className={`p-1.5 text-rose-500 rounded transition duration-150 cursor-pointer ${isDark ? "hover:bg-rose-950/20" : "hover:bg-rose-100/40"}`}
                            >
                              <Trash2 className="h-4 w-4 inline" />
                            </button>
                          </div>

                          </div>

                          {/* Jar Customizer Panel */}
                          {!isDryfruitRow && item.productId && maxJars > 0 && activeJarConfigIndex === index && (
                            <div className={`p-4 rounded-xl border flex flex-col gap-4 animate-slideDown ${
                              isDark ? "bg-zinc-950/40 border-zinc-808/80" : "bg-slate-100/50 border-slate-250 shadow-inner"
                            }`}>
                              <div className="flex justify-between items-center border-b pb-2 border-zinc-808/20">
                                <h4 className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${isDark ? "text-zinc-200" : "text-slate-700"}`}>
                                  <span>🍯 Jar Filling Customization</span>
                                  <span className="text-[10px] lowercase font-normal text-zinc-500">
                                    (up to {maxJars} jars)
                                  </span>
                                </h4>
                                <button
                                  type="button"
                                  onClick={() => setActiveJarConfigIndex(null)}
                                  className="text-[10px] font-bold text-indigo-500 hover:underline cursor-pointer"
                                >
                                  Close Panel
                                </button>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                                {Array.from({ length: maxJars }).map((_, jarIdx) => {
                                  const jarNumber = jarIdx + 1;
                                  const existingConfig = (item.customizations || []).find(c => c.jar_number === jarNumber) || { jar_number: jarNumber, additive_id: "empty", weight_grams: 0 };
                                  const addObj = additives.find(a => a.id === existingConfig.additive_id);
                                  const addPriceKg = addObj?.price_per_kg || 0;
                                  const extraCost = Math.round((addPriceKg / 1000) * existingConfig.weight_grams);
                                  
                                  return (
                                    <div key={jarIdx} className={`p-3.5 rounded-xl border flex flex-col gap-3.5 ${
                                      isDark ? "bg-zinc-900/40 border-zinc-808/50" : "bg-white border-slate-205 shadow-sm"
                                    }`}>
                                      <div className="flex justify-between items-center text-xs font-bold text-zinc-600 dark:text-zinc-400">
                                        <span>Jar #{jarNumber}</span>
                                        {extraCost > 0 && (
                                          <span className="text-emerald-500 font-mono font-black text-[10px]">
                                            +₹{extraCost}
                                          </span>
                                        )}
                                      </div>
                                      
                                      <div className="grid grid-cols-2 gap-3.5 items-end">
                                        {/* Additive Autocomplete Selector */}
                                        <div className="relative">
                                          <label className="block text-[10px] text-zinc-550 dark:text-zinc-450 font-bold uppercase tracking-wider mb-1.5">Filling</label>
                                          
                                          <button
                                            type="button"
                                            onClick={() => {
                                              if (activeJarDropdown?.rowIndex === index && activeJarDropdown?.jarNumber === jarNumber) {
                                                setActiveJarDropdown(null);
                                              } else {
                                                setActiveJarDropdown({ rowIndex: index, jarNumber: jarNumber });
                                                setAdditiveSearchQuery("");
                                              }
                                            }}
                                            className={`w-full px-2.5 py-1.5 border rounded-lg text-left text-xs flex items-center justify-between transition duration-150 cursor-pointer ${
                                              isDark ? "bg-zinc-950 border-zinc-850 text-zinc-200" : "bg-white border-slate-200 text-slate-800"
                                            }`}
                                          >
                                            <span className="truncate font-semibold text-[11px]">
                                              {existingConfig.additive_id === "empty" 
                                                ? "Empty / None" 
                                                : (addObj?.name || "Empty / None")}
                                            </span>
                                            <ChevronDown className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                                          </button>

                                          {activeJarDropdown?.rowIndex === index && activeJarDropdown?.jarNumber === jarNumber && (
                                            <>
                                              <div className="fixed inset-0 z-30" onClick={() => setActiveJarDropdown(null)} />
                                              
                                              <div className={`absolute left-0 right-0 mt-1.5 p-2 rounded-xl border z-45 flex flex-col gap-2 shadow-xl min-w-[200px] ${
                                                isDark ? "bg-zinc-950 border-zinc-808 shadow-zinc-950/80" : "bg-white border-slate-205 shadow-slate-200/50"
                                              }`}>
                                                <div className="relative">
                                                  <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-500" />
                                                  <input
                                                    type="text"
                                                    placeholder="Search dryfruit..."
                                                    value={additiveSearchQuery}
                                                    autoFocus
                                                    onChange={e => setAdditiveSearchQuery(e.target.value)}
                                                    className={`w-full pl-8 pr-2 py-1 text-xs border rounded-md focus:outline-none ${inputClass}`}
                                                  />
                                                </div>

                                                <div className="max-h-36 overflow-y-auto space-y-1 scrollbar-thin">
                                                  <div
                                                    onClick={() => {
                                                      updateJarFilling(index, jarNumber, "empty", existingConfig.weight_grams);
                                                      setActiveJarDropdown(null);
                                                    }}
                                                    className={`p-1.5 rounded-lg text-left transition duration-150 text-[11px] font-medium cursor-pointer ${
                                                      existingConfig.additive_id === "empty"
                                                        ? "bg-indigo-600 text-white font-semibold"
                                                        : (isDark ? "hover:bg-zinc-850 text-zinc-300" : "hover:bg-slate-100 text-slate-700")
                                                    }`}
                                                  >
                                                    Empty / None
                                                  </div>

                                                  {additives
                                                    .filter(a => a.deleted_at === null && a.name.toLowerCase().includes(additiveSearchQuery.toLowerCase()))
                                                    .map(add => {
                                                      const isSelected = existingConfig.additive_id === add.id;
                                                      return (
                                                        <div
                                                          key={add.id}
                                                          onClick={() => {
                                                            updateJarFilling(index, jarNumber, add.id, existingConfig.weight_grams);
                                                            setActiveJarDropdown(null);
                                                          }}
                                                          className={`p-1.5 rounded-lg text-left transition duration-150 flex items-center justify-between text-[11px] font-medium cursor-pointer ${
                                                            isSelected
                                                              ? "bg-indigo-600 text-white font-semibold"
                                                              : (isDark ? "hover:bg-zinc-850 text-zinc-300" : "hover:bg-slate-100 text-slate-700")
                                                          }`}
                                                        >
                                                          <span>{add.name}</span>
                                                          <span className={`font-mono text-[9px] ${isSelected ? "text-indigo-200" : "text-zinc-505"}`}>
                                                            ₹{add.price_per_kg}/kg
                                                          </span>
                                                        </div>
                                                      );
                                                    })}
                                                </div>
                                              </div>
                                            </>
                                          )}
                                        </div>
                                        
                                        {/* Weight Input */}
                                        <div>
                                          <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5">Weight (g)</label>
                                          <input
                                            type="text"
                                            disabled={existingConfig.additive_id === "empty"}
                                            placeholder="e.g. 100"
                                            value={existingConfig.additive_id === "empty" ? "" : existingConfig.weight_grams}
                                            onChange={(e) => {
                                              const val = e.target.value.replace(/[^0-9]/g, "");
                                              const weight = val ? Number(val) : 0;
                                              updateJarFilling(index, jarNumber, existingConfig.additive_id, weight);
                                            }}
                                            className={`w-full px-2.5 py-1.5 border rounded-lg text-xs font-mono text-left focus:outline-none ${inputClass} ${
                                              existingConfig.additive_id === "empty" ? "opacity-50 cursor-not-allowed" : ""
                                            }`}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {/* Add Row Item Button - Placed at the bottom of rows list for better user accessibility */}
                  <button 
                    type="button" 
                    onClick={() => setInvoiceItems([...invoiceItems, { productId: "", quantity: 1, unitPrice: 0, discount: 0 }])}
                    className="mt-3.5 px-4 py-2.5 border border-dashed rounded-xl text-xs font-bold transition duration-150 flex items-center justify-center gap-1.5 w-full select-none hover:bg-slate-50 dark:hover:bg-zinc-850/20 text-indigo-500 border-indigo-500/30 hover:border-indigo-500/60"
                  >
                    <Plus className="h-4 w-4" /> Add Row Item
                  </button>
                </div>
                {/* Form Bottom Total & Action Triggers */}
                <div className={`pt-6 flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-dashed ${isDark ? "border-zinc-808" : "border-slate-205"}`}>
                  <div className={`text-sm font-medium ${isDark ? "text-zinc-400" : "text-slate-550"}`}>
                    Grand Estimated Total: <span className="font-mono font-black text-xl text-emerald-500">₹{
                      invoiceItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100)), 0).toLocaleString("en-IN")
                    }</span>
                  </div>
                  <div className="flex gap-2">
                    {isEditingInvoice ? (
                      <button 
                        type="button" 
                        onClick={() => {
                          setIsEditingInvoice(false);
                          setEditingInvoiceId(null);
                          setInvoiceCustomerName("");
                          setInvoiceCustomerPhone("");
                          setInvoiceCustomerStatus("ordered");
                          setInvoiceItems([{ productId: "", quantity: 1, unitPrice: 0, discount: 0 }]);
                          setBillingTab("kanban");
                        }}
                        className="px-4 py-2 text-sm border border-rose-500 hover:bg-rose-500 hover:text-white text-rose-500 rounded-lg transition duration-150 font-bold"
                      >
                        Cancel Edit
                      </button>
                    ) : (
                      <button 
                        type="button" 
                        onClick={() => {
                          setInvoiceCustomerName("");
                          setInvoiceCustomerPhone("");
                          setInvoiceItems([{ productId: "", quantity: 1, unitPrice: 0, discount: 0 }]);
                        }}
                        className={`px-4 py-2 text-sm border rounded-lg transition duration-150 font-bold ${isDark ? "bg-zinc-950 hover:bg-zinc-855 border-zinc-850 text-zinc-400" : "bg-white hover:bg-zinc-100 border-zinc-205 text-zinc-650 hover:text-zinc-850 shadow-xs"}`}
                      >
                        Reset Form
                      </button>
                    )}
                    <button 
                      type="submit" 
                      className={`px-5 py-2 text-sm text-white font-bold rounded-lg shadow-md transition duration-150 flex items-center gap-1.5 ${
                        isEditingInvoice ? "bg-amber-600 hover:bg-amber-505 shadow-amber-600/10" : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/10"
                      }`}
                    >
                      <FileText className="h-4 w-4" /> {isEditingInvoice ? "Save Order Changes" : "Generate Invoice & Billed"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
          
          {/* Sticky Bottom Total & Action Bar on Mobile Viewports */}
          <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden p-4 border-t shadow-lg flex items-center justify-between gap-3 animate-slideUp bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-808">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Estimated Total</span>
              <span className="font-mono font-black text-lg text-emerald-500">
                ₹{invoiceItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100)), 0).toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                form="invoice-form"
                className={`px-5 py-2.5 text-xs text-white font-bold rounded-xl shadow-md transition duration-150 flex items-center gap-1.5 cursor-pointer ${
                  isEditingInvoice ? "bg-amber-600 hover:bg-amber-500 shadow-amber-600/10" : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/10"
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>{isEditingInvoice ? "Save Changes" : "Generate Bill"}</span>
              </button>
            </div>
          </div>
            </div>
            ) : (
              /* ORDER KANBAN BOARD */
              <div className="w-full relative space-y-6">
                {/* ⏰ Daily Dispatch & Ingredient Prep Tasks Panel */}
                {(() => {
                  const todayStr = simulationDate;
                  const tomorrow = new Date(simulationDate);
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  const tomorrowStr = tomorrow.toISOString().split("T")[0];
                  const todayInvoices = invoices.filter(i => i.deleted_at === null && i.status !== "delivered" && i.delivery_date === todayStr);
                  const tomorrowInvoices = invoices.filter(i => i.deleted_at === null && i.status !== "delivered" && i.delivery_date === tomorrowStr);
                  // Calculate forecast for the chosen scope
                  const scopeInvoicesForForecast = invoices.filter(inv => {
                    if (inv.deleted_at !== null) return false;
                    if (inv.status === "delivered") return false;
                    if (!inv.delivery_date) return false;
                    if (materialScope === "today") return inv.delivery_date === todayStr;
                    if (materialScope === "tomorrow") return inv.delivery_date === tomorrowStr;
                    if (materialScope === "both") return inv.delivery_date === todayStr || inv.delivery_date === tomorrowStr;
                    return true;
                  });
                  const { boxSummary, additiveSummary } = (() => {
                    const boxes: { [key: string]: number } = {};
                    const additivesNeeded: { [key: string]: number } = {};
                    scopeInvoicesForForecast.forEach(inv => {
                      inv.items?.forEach(item => {
                        const prod = products.find(p => p.id === item.product_id);
                        if (!prod) return;
                        boxes[prod.name] = (boxes[prod.name] || 0) + item.quantity;
                        if (item.customizations && item.customizations.length > 0) {
                          item.customizations.forEach(jar => {
                            if (jar.additive_id !== "empty" && jar.weight_grams > 0) {
                              const grams = jar.weight_grams * item.quantity;
                              additivesNeeded[jar.additive_id] = (additivesNeeded[jar.additive_id] || 0) + grams;
                            }
                          });
                        }
                      });
                    });
                    return { boxSummary: boxes, additiveSummary: additivesNeeded };
                  })();
                  return (
                    <div className={`${cardClass} p-5 rounded-2xl shadow-md border ${
                      isDark ? "bg-zinc-900/60 border-zinc-808/80" : "bg-white border-slate-205"
                    }`}>
                      {/* Title Bar with Expand/Collapse and Print options */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3 border-zinc-808/25">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">⏰</span>
                          <div>
                            <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? "text-zinc-100" : "text-zinc-800"}`}>
                              Daily Dispatch & Ingredient Prep Tasks
                            </h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? "text-zinc-500" : "text-slate-455"}`}>Simulation Date:</span>
                              <input 
                                type="date"
                                value={simulationDate}
                                onChange={e => setSimulationDate(e.target.value)}
                                className={`px-2 py-0.5 text-[10px] rounded border font-mono font-bold focus:outline-none transition duration-150 ${
                                  isDark ? "bg-zinc-950 border-zinc-808/80 text-zinc-300 focus:border-zinc-700" : "bg-slate-100/60 border-slate-205 text-slate-700 focus:border-indigo-500"
                                }`}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handlePrintPrepSheet(materialScope)}
                            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                          >
                            <FileSpreadsheet className="h-3.5 w-3.5" />
                            Print Prep Sheet
                          </button>
                          <button
                            type="button"
                            onClick={handleGenerateDaySummary}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            Day End Summary
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsOperationsPanelExpanded(!isOperationsPanelExpanded)}
                            className={`p-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                              isDark ? "border-zinc-808 text-zinc-400 hover:text-white" : "border-slate-200 text-slate-600 hover:text-slate-800 bg-slate-50"
                            }`}
                          >
                            {isOperationsPanelExpanded ? "Collapse" : "Expand"}
                          </button>
                        </div>
                      </div>
                      {isOperationsPanelExpanded && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-4 pt-1 animate-fadeIn">
                          {/* Col 1: Deliver Today */}
                          <div className="lg:col-span-4 flex flex-col gap-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                              1. Deliver Today ({todayInvoices.length})
                            </h4>
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                              {todayInvoices.length === 0 ? (
                                <div className="p-4 rounded-xl border border-dashed text-center text-[10px] italic text-zinc-400">
                                  No pre-orders scheduled for today.
                                </div>
                              ) : (
                                todayInvoices.map(inv => (
                                  <div 
                                    key={inv.id} 
                                    onClick={() => { setPreviewInvoiceId(inv.id); setIsPreviewModalOpen(true); }}
                                    className={`p-3 rounded-xl border text-xs transition duration-150 cursor-pointer ${
                                      isDark ? "bg-zinc-950/40 border-zinc-808 hover:border-zinc-700" : "bg-slate-50/50 border-slate-200 hover:border-slate-300"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-mono font-bold text-indigo-500">{inv.order_id}</span>
                                      <span className="font-mono font-black text-emerald-500">₹{inv.total_amount.toLocaleString("en-IN")}</span>
                                    </div>
                                    <div className="font-semibold mt-1 text-[11px]">{inv.customer_name}</div>
                                    <div className="text-[10px] text-zinc-500 mt-1 truncate">
                                      {inv.items?.map(it => it.product_id ? `${products.find(p=>p.id===it.product_id)?.name || "Box"} (x${it.quantity})` : `${additives.find(a=>a.id===it.additive_id)?.name || "Dryfruit"} (${it.quantity.toFixed(2)} kg)`).join(", ")}
                                    </div>
                                    <div className="flex justify-between items-center text-[9px] mt-2 border-t pt-1.5 border-dashed border-zinc-808/30 text-zinc-400">
                                      <span>Adv: ₹{inv.advance_paid || 0}</span>
                                      <span className="font-bold text-rose-500">Due: ₹{inv.total_amount - (inv.advance_paid || 0)}</span>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                          {/* Col 2: Deliver Tomorrow */}
                          <div className="lg:col-span-4 flex flex-col gap-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-amber-500" />
                              2. Deliver Tomorrow ({tomorrowInvoices.length})
                            </h4>
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                              {tomorrowInvoices.length === 0 ? (
                                <div className="p-4 rounded-xl border border-dashed text-center text-[10px] italic text-zinc-400">
                                  No pre-orders scheduled for tomorrow.
                                </div>
                              ) : (
                                tomorrowInvoices.map(inv => (
                                  <div 
                                    key={inv.id} 
                                    onClick={() => { setPreviewInvoiceId(inv.id); setIsPreviewModalOpen(true); }}
                                    className={`p-3 rounded-xl border text-xs transition duration-150 cursor-pointer ${
                                      isDark ? "bg-zinc-950/40 border-zinc-808 hover:border-zinc-700" : "bg-slate-50/50 border-slate-200 hover:border-slate-300"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-mono font-bold text-indigo-500">{inv.order_id}</span>
                                      <span className="font-mono font-black text-emerald-500">₹{inv.total_amount.toLocaleString("en-IN")}</span>
                                    </div>
                                    <div className="font-semibold mt-1 text-[11px]">{inv.customer_name}</div>
                                    <div className="text-[10px] text-zinc-500 mt-1 truncate">
                                      {inv.items?.map(it => it.product_id ? `${products.find(p=>p.id===it.product_id)?.name || "Box"} (x${it.quantity})` : `${additives.find(a=>a.id===it.additive_id)?.name || "Dryfruit"} (${it.quantity.toFixed(2)} kg)`).join(", ")}
                                    </div>
                                    <div className="flex justify-between items-center text-[9px] mt-2 border-t pt-1.5 border-dashed border-zinc-808/30 text-zinc-400">
                                      <span>Adv: ₹{inv.advance_paid || 0}</span>
                                      <span className="font-bold text-amber-600">Due: ₹{inv.total_amount - (inv.advance_paid || 0)}</span>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                          {/* Col 3: Material Forecast calculator */}
                          <div className="lg:col-span-4 flex flex-col gap-3 border-t lg:border-t-0 lg:border-l pt-4 lg:pt-0 lg:pl-5 border-zinc-808/35">
                            <div className="flex items-center justify-between">
                              <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-zinc-200" : "text-slate-700"}`}>
                                3. Material Forecast
                              </h4>
                              <select
                                value={materialScope}
                                onChange={e => setMaterialScope(e.target.value as any)}
                                className={`px-2 py-1 text-[10px] border rounded focus:outline-none font-bold ${
                                  isDark ? "bg-zinc-950 border-zinc-850 text-zinc-300" : "bg-white border-slate-205 text-slate-700"
                                }`}
                              >
                                <option value="today">Today's Orders</option>
                                <option value="tomorrow">Tomorrow's Orders</option>
                                <option value="both">Today & Tomorrow</option>
                                <option value="all">All Active Pre-Orders</option>
                              </select>
                            </div>
                            <div className="space-y-3 bg-slate-50/50 dark:bg-zinc-950/40 border border-slate-200 dark:border-zinc-808/25 p-3 rounded-xl flex-1 overflow-y-auto max-h-60 scrollbar-thin">
                              <div className="space-y-1.5">
                                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Gifting Boxes Total</span>
                                {Object.keys(boxSummary).length === 0 ? (
                                  <span className="text-[10px] text-zinc-500 italic block">No box materials required.</span>
                                ) : (
                                  Object.entries(boxSummary).map(([name, qty]) => (
                                    <div key={name} className="flex justify-between text-xs font-semibold">
                                      <span className="truncate max-w-[170px]">{name}</span>
                                      <span className="font-mono font-bold text-indigo-650 dark:text-indigo-400">{qty} pcs</span>
                                    </div>
                                  ))
                                )}
                              </div>
                              <div className="space-y-1.5 border-t pt-2 border-dashed border-slate-200 dark:border-zinc-808/20 mt-2">
                                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Ingredient Fillings Needed</span>
                                {Object.keys(additiveSummary).length === 0 ? (
                                  <span className="text-[10px] text-zinc-500 italic block">No dryfruit ingredients required.</span>
                                ) : (
                                  Object.entries(additiveSummary).map(([additiveId, grams]) => {
                                    const addObj = additives.find(a => a.id === additiveId);
                                    const kgValue = (grams / 1000).toFixed(2);
                                    return (
                                      <div key={additiveId} className="flex justify-between text-xs font-semibold">
                                        <span>{addObj?.name || "Additive"}</span>
                                        <div className="font-mono font-bold flex gap-1 items-baseline">
                                          <span className="text-emerald-500 text-xs">{kgValue} kg</span>
                                          <span className="text-[9px] text-zinc-400">({grams.toLocaleString()}g)</span>
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
                {/* Kanban Filters & Sorting Bar */}
                <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 transition duration-205 ${isDark ? "bg-zinc-900/40 border-zinc-808/80" : "bg-white border-slate-205 shadow-sm"}`}>
                  <div className="flex flex-wrap items-center gap-3 text-xs w-full md:w-auto">
                    <div className="flex items-center gap-1.5 w-full sm:w-auto">
                      <span className={`font-bold uppercase text-[10px] tracking-wider shrink-0 ${isDark ? "text-zinc-400" : "text-slate-500"}`}>Days Left:</span>
                      <select
                        value={kanbanDaysFilter}
                        onChange={e => setKanbanDaysFilter(e.target.value)}
                        className={`px-3 py-1.5 border rounded-lg focus:outline-none w-full sm:w-auto font-semibold ${inputClass}`}
                      >
                        <option value="all">All Pre-Orders</option>
                        <option value="overdue">🚨 Overdue Orders</option>
                        <option value="0">📅 Deliver Today (0 days left)</option>
                        <option value="1">📅 Deliver Tomorrow (1 day left)</option>
                        <option value="2">⏳ Due in 2 days</option>
                        <option value="5">⏳ Due in 5 days</option>
                        <option value="10">⏳ Due in 10 days</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5 w-full sm:w-auto">
                      <span className={`font-bold uppercase text-[10px] tracking-wider shrink-0 ${isDark ? "text-zinc-400" : "text-slate-500"}`}>Specific Date:</span>
                      <div className="flex items-center gap-1 w-full sm:w-auto">
                        <input
                          type="date"
                          value={kanbanDateFilter}
                          onChange={e => setKanbanDateFilter(e.target.value)}
                          className={`px-2.5 py-1.5 border rounded-lg focus:outline-none w-full sm:w-auto font-mono text-xs font-bold ${inputClass}`}
                        />
                        {kanbanDateFilter && (
                          <button
                            type="button"
                            onClick={() => setKanbanDateFilter("")}
                            className={`p-1.5 border rounded-lg hover:text-rose-500 transition duration-150 cursor-pointer ${
                              isDark ? "bg-zinc-950 border-zinc-808" : "bg-slate-50 border-slate-205"
                            }`}
                            title="Clear Date"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs w-full md:w-auto justify-end">
                    <span className={`font-bold uppercase text-[10px] tracking-wider shrink-0 ${isDark ? "text-zinc-400" : "text-slate-500"}`}>Sort By:</span>
                    <select
                      value={kanbanSortOrder}
                      onChange={e => setKanbanSortOrder(e.target.value as any)}
                      className={`px-3 py-1.5 border rounded-lg focus:outline-none font-semibold w-full sm:w-auto ${inputClass}`}
                    >
                      <option value="delivery">📅 Delivery Date (Earliest first)</option>
                      <option value="order">💳 Purchase Order (Creation Date)</option>
                    </select>
                  </div>
                </div>

                {/* Mobile Kanban Tab Selector (md:hidden) */}
                <div className="flex md:hidden gap-1 p-1 bg-zinc-950/20 dark:bg-zinc-900/40 rounded-xl border border-zinc-808/30 w-full mt-2">
                  {[
                    { key: "ordered", label: "Ordered", dotColor: "bg-blue-500" },
                    { key: "preparing", label: "Prep", dotColor: "bg-amber-500" },
                    { key: "completed", label: "Ready", dotColor: "bg-indigo-500" },
                    { key: "delivered", label: "Sent", dotColor: "bg-emerald-500" }
                  ].map(tab => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveKanbanMobileTab(tab.key as any)}
                      className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition duration-150 flex items-center justify-center gap-1 cursor-pointer ${
                        activeKanbanMobileTab === tab.key 
                          ? "bg-indigo-600 text-white shadow-sm" 
                          : (isDark ? "text-zinc-400 hover:text-zinc-200" : "text-slate-550 hover:text-slate-800")
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${tab.dotColor}`} />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Board grid columns: Ordered, Preparing, Completed, Delivered */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start select-none">
                  {[
                    { key: "ordered", label: "Ordered", dotColor: "bg-blue-500", headerColor: "border-t-blue-500 bg-blue-500/5", textColor: "text-blue-500" },
                    { key: "preparing", label: "Preparing", dotColor: "bg-amber-500", headerColor: "border-t-amber-500 bg-amber-500/5", textColor: "text-amber-500" },
                    { key: "completed", label: "Completed", dotColor: "bg-indigo-500", headerColor: "border-t-indigo-500 bg-indigo-500/5", textColor: "text-indigo-500" },
                    { key: "delivered", label: "Delivered", dotColor: "bg-emerald-500", headerColor: "border-t-emerald-500 bg-emerald-500/5", textColor: "text-emerald-500" }
                  ].map(col => {
                    const colInvoices = getKanbanInvoices(col.key);
                    const isVisibleOnMobile = activeKanbanMobileTab === col.key;
                    return (
                      <div 
                        key={col.key} 
                        className={`flex flex-col gap-3 p-4 border rounded-2xl border-t-4 min-h-[500px] ${col.headerColor} ${
                          isVisibleOnMobile ? "flex" : "hidden md:flex"
                        } ${isDark ? "border-zinc-808/80 bg-zinc-950/20" : "border-slate-205 bg-slate-50/20"}`}
                      >
                        {/* Column Header */}
                        <div className="flex items-center justify-between pb-2 border-b border-dashed border-zinc-808/30">
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${col.dotColor}`} />
                            <span className={`text-xs font-black uppercase tracking-wider ${isDark ? "text-zinc-200" : "text-slate-700"}`}>{col.label}</span>
                          </div>
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${isDark ? "bg-zinc-900 text-zinc-400" : "bg-slate-100 text-slate-500"}`}>
                            {colInvoices.length}
                          </span>
                        </div>
                        {/* Cards list */}
                        <div className="flex-1 overflow-y-auto space-y-3 max-h-[600px] pr-1 scrollbar-thin">
                          {colInvoices.length === 0 ? (
                            <div className="p-6 border border-dashed rounded-xl text-center text-[10px] italic text-zinc-500 mt-2">
                              No orders in this stage
                            </div>
                          ) : (
                            colInvoices.map(inv => {
                              const itemsCount = inv.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
                              return (
                                <div 
                                  key={inv.id}
                                  className={`p-4 rounded-xl border flex flex-col gap-2.5 transition duration-150 group hover:-translate-y-0.5 hover:shadow-md cursor-pointer border-l-4 ${
                                    col.key === "ordered" ? "border-l-blue-500" :
                                    col.key === "preparing" ? "border-l-amber-500" :
                                    col.key === "completed" ? "border-l-indigo-500" :
                                    "border-l-emerald-500"
                                  } ${isDark ? "bg-zinc-950/50 hover:bg-zinc-900/60 border-zinc-858 hover:border-zinc-700" : "bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 shadow-xs"}`}
                                >
                                  {/* Header row */}
                                  <div className="flex items-center justify-between">
                                    <span className={`px-1.5 py-0.5 rounded font-mono text-[9px] font-bold ${
                                      isDark ? "bg-indigo-950/45 text-indigo-300" : "bg-indigo-50 text-indigo-700"
                                    }`}>
                                      {inv.order_id || `ORD-${inv.id.substring(4, 9).toUpperCase()}`}
                                    </span>
                                    <span className={`text-[9px] font-mono ${isDark ? "text-zinc-500" : "text-slate-400"}`}>
                                      {inv.invoice_number}
                                    </span>
                                  </div>
                                  {/* Pre-order Delivery Date & Countdown info */}
                                  {inv.delivery_date && (
                                    (() => {
                                      const today = new Date(simulationDate);
                                      today.setHours(0, 0, 0, 0);
                                      const targetDate = new Date(inv.delivery_date);
                                      targetDate.setHours(0, 0, 0, 0);
                                      const diffTime = targetDate.getTime() - today.getTime();
                                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                      let badgeColor = "";
                                      let countdownText = "";
                                      if (diffDays === 0) {
                                        badgeColor = "bg-rose-500 text-white animate-pulse";
                                        countdownText = "🚨 Deliver Today!";
                                      } else if (diffDays < 0) {
                                        badgeColor = "bg-rose-600 text-white font-bold";
                                        countdownText = `⚠️ Overdue (${Math.abs(diffDays)}d late)`;
                                      } else if (diffDays <= 3) {
                                        badgeColor = "bg-amber-500 text-white font-bold animate-pulse";
                                        countdownText = `⏳ ${diffDays}d remaining`;
                                      } else {
                                        badgeColor = "bg-blue-500 text-white";
                                        countdownText = `📅 ${diffDays}d left`;
                                      }
                                      return (
                                        <div className="flex items-center justify-between text-[9px] font-bold">
                                          <span className="text-zinc-500 font-mono">Delivery: {inv.delivery_date}</span>
                                          <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider ${badgeColor}`}>
                                            {countdownText}
                                          </span>
                                        </div>
                                      );
                                    })()
                                  )}
                                  {/* Body Client details */}
                                  <div>
                                    <h4 className={`text-xs font-bold ${isDark ? "text-zinc-200" : "text-zinc-700"}`}>{inv.customer_name}</h4>
                                    {inv.customer_phone && (
                                      <p className={`text-[10px] font-mono mt-0.5 ${isDark ? "text-zinc-500" : "text-slate-455"}`}>📞 {inv.customer_phone}</p>
                                    )}
                                  </div>
                                  {/* Product items detail list */}
                                  <div className="flex flex-col gap-1.5 mt-1 text-[10px]">
                                    {inv.items?.map((item, idx) => {
                                      const prod = item.product_id ? products.find(p => p.id === item.product_id) : null;
                                      const add = item.additive_id ? additives.find(a => a.id === item.additive_id) : null;
                                      const name = prod ? prod.name : (add ? `${add.name} (Loose)` : "Unknown Item");
                                      const suffix = prod ? "" : " kg";
                                      return (
                                        <div 
                                          key={idx} 
                                          className={`flex justify-between items-center px-2 py-1 rounded-lg border border-dashed transition duration-150 ${
                                            isDark 
                                              ? "bg-zinc-950/40 border-zinc-808/30 text-zinc-300 hover:bg-zinc-950 hover:border-zinc-808/50" 
                                              : "bg-slate-50/50 border-slate-200/50 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                                          }`}
                                        >
                                          <span className="truncate font-semibold max-w-[130px] lg:max-w-[140px]" title={name}>
                                            {name}
                                          </span>
                                          <span className="font-mono font-black text-indigo-500 shrink-0 bg-indigo-500/5 border border-indigo-500/10 px-1 rounded">
                                            x{item.quantity}{suffix}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                  {/* Value Details */}
                                  <div className="flex flex-col pt-1.5 border-t border-dashed border-zinc-808/30 gap-1 text-[11px]">
                                    <div className="flex items-baseline justify-between">
                                      <span className="text-zinc-500 font-medium">{itemsCount} units</span>
                                      <span className="font-mono font-extrabold text-emerald-500">₹{inv.total_amount.toLocaleString("en-IN")}</span>
                                    </div>
                                    {inv.advance_paid !== undefined && inv.advance_paid > 0 && (
                                      <div className="flex items-center justify-between text-[10px] pt-1 border-t border-dotted border-zinc-858/30">
                                        <span className="text-zinc-400">Paid Adv: ₹{inv.advance_paid.toLocaleString("en-IN")}</span>
                                        <span className="font-bold text-indigo-500">Due: ₹{(inv.total_amount - inv.advance_paid).toLocaleString("en-IN")}</span>
                                      </div>
                                    )}
                                  </div>
                                  {/* Footer actions */}
                                  <div className="flex items-center justify-between pt-2 border-t border-zinc-808/20 gap-2">
                                    {/* Left quick actions */}
                                    <div className="flex items-center gap-1.5">
                                      {/* 🔍 View details modal */}
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setPreviewInvoiceId(inv.id);
                                          setIsPreviewModalOpen(true);
                                        }}
                                        className={`p-1.5 rounded-lg border transition duration-150 ${
                                          isDark ? "hover:bg-zinc-850 border-zinc-808 text-zinc-400 hover:text-white" : "bg-white hover:bg-slate-100 border-slate-205 text-slate-550 hover:text-slate-800 shadow-2xs"
                                        }`}
                                        title="View Amazon Voucher"
                                      >
                                        <Search className="h-3 w-3" />
                                      </button>
                                      {/* ✏️ Edit Order */}
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setIsEditingInvoice(true);
                                          setEditingInvoiceId(inv.id);
                                          setInvoiceCustomerName(inv.customer_name);
                                          setInvoiceCustomerPhone(inv.customer_phone || "");
                                          setInvoiceCustomerStatus(inv.status);
                                          setInvoicePaymentMode(inv.payment_mode || "Cash");
                                          setIsPreOrder(!!inv.delivery_date);
                                          setInvoiceDeliveryDate(inv.delivery_date || "");
                                          setInvoiceAdvancePaid(inv.advance_paid !== undefined ? String(inv.advance_paid) : "");
                                          if (inv.items) {
                                            const mapped = inv.items.map(item => ({
                                              productId: item.product_id,
                                              additiveId: item.additive_id,
                                              quantity: item.quantity,
                                              unitPrice: item.unit_price,
                                              discount: item.discount || 0,
                                              customizations: item.customizations
                                            }));
                                            setInvoiceItems(mapped);
                                            setIsOnlyDryfruits(inv.items.every(it => !it.product_id && !!it.additive_id));
                                          }
                                          setBillingTab("form");
                                        }}
                                        className={`p-1.5 rounded-lg border transition duration-150 ${
                                          isDark ? "hover:bg-zinc-850 border-zinc-808 text-zinc-400 hover:text-white" : "bg-white hover:bg-slate-100 border-slate-205 text-slate-550 hover:text-slate-800 shadow-2xs"
                                        }`}
                                        title="Edit Order / Items"
                                      >
                                        <Edit className="h-3 w-3" />
                                      </button>
                                    </div>
                                    {/* Stage progress quick buttons */}
                                    <div className="flex items-center gap-1">
                                      {col.key !== "ordered" && (
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const stages = ["ordered", "preparing", "completed", "delivered"];
                                            const currentIdx = stages.indexOf(col.key);
                                            const prevStatus = stages[currentIdx - 1] as any;
                                            localDB.updateInvoiceStatus(inv.id, prevStatus);
                                            loadData();
                                          }}
                                          className={`p-1 rounded transition text-zinc-400 hover:scale-110 font-bold ${isDark ? "hover:bg-zinc-800 hover:text-white" : "hover:bg-transparent hover:text-zinc-900"}`}
                                          title="Move to Previous Stage"
                                        >
                                          &larr;
                                        </button>
                                      )}
                                      {col.key !== "delivered" && (
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const stages = ["ordered", "preparing", "completed", "delivered"];
                                            const currentIdx = stages.indexOf(col.key);
                                            const nextStatus = stages[currentIdx + 1] as any;
                                            localDB.updateInvoiceStatus(inv.id, nextStatus);
                                            loadData();
                                          }}
                                          className={`p-1 rounded transition text-zinc-400 hover:scale-110 font-bold ${isDark ? "hover:bg-zinc-800 hover:text-white" : "hover:bg-transparent hover:text-zinc-900"}`}
                                          title="Move to Next Stage"
                                        >
                                          &rarr;
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                        {/* Add Order Button inside column footer */}
                        <button
                          type="button"
                          onClick={() => {
                            setInvoiceCustomerStatus(col.key as any);
                            setBillingTab("form");
                            setIsEditingInvoice(false);
                            setEditingInvoiceId(null);
                            setInvoiceCustomerName("");
                            setInvoiceCustomerPhone("");
                            setInvoiceItems([{ productId: "", quantity: 1, unitPrice: 0, discount: 0 }]);
                          }}
                          className={`w-full py-1.5 border border-dashed rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition duration-150 shrink-0 cursor-pointer ${
                            isDark 
                              ? "bg-zinc-950/40 hover:bg-zinc-900 border-zinc-808 hover:border-zinc-700 text-zinc-400 hover:text-white"
                              : "bg-white hover:bg-slate-105 border-slate-205 hover:border-slate-300 text-slate-550 hover:text-slate-800 shadow-2xs"
                          }`}
                        >
                          <Plus className="h-3 w-3" /> Add {col.label} Order
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {/* SLIDING HISTORY DRAWER - Slides in from right when isHistoryDrawerOpen is true */}
            {isHistoryDrawerOpen && (
              <>
                {/* Backdrop cover overlay */}
                <div 
                  className="fixed inset-0 bg-zinc-950/50 backdrop-blur-xs z-40 transition-all duration-205"
                  onClick={() => setIsHistoryDrawerOpen(false)}
                />
                {/* Slide Panel Card */}
                <div className={`fixed top-0 right-0 h-full w-96 max-w-full z-50 p-6 flex flex-col gap-4 shadow-2xl transition-all duration-300 transform translate-x-0 ${
                  isDark ? "bg-zinc-900 border-l border-zinc-808" : "bg-white border-l border-slate-200"
                }`}>
                  <div className="flex items-center justify-between pb-3 border-b border-dashed border-zinc-808/30">
                    <div>
                      <h2 className={`text-lg font-bold flex items-center gap-2 ${isDark ? "text-zinc-100" : "text-zinc-800"}`}>
                        <FileText className="h-5 w-5 text-indigo-500" /> Invoice History
                      </h2>
                      <p className={`text-[11px] ${isDark ? "text-zinc-500" : "text-zinc-450"}`}>
                        Browse and view printable vouchers of previously generated client invoices.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsHistoryDrawerOpen(false)}
                      className={`p-1.5 rounded-lg transition duration-150 ${
                        isDark ? "hover:bg-zinc-800 text-zinc-400 hover:text-white" : "hover:bg-slate-100 text-zinc-550 hover:text-zinc-900"
                      }`}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  {/* Status Stages Micro Summary Grid */}
                  <div className="grid grid-cols-4 gap-2 text-center text-[10px] print:hidden">
                    {[
                      { label: "Ordered", status: "ordered", color: "text-blue-500 bg-blue-500/5 border-blue-500/10 dark:border-blue-500/5" },
                      { label: "Preparing", status: "preparing", color: "text-amber-500 bg-amber-500/5 border-amber-500/10 dark:border-amber-500/5" },
                      { label: "Completed", status: "completed", color: "text-indigo-500 bg-indigo-500/5 border-indigo-500/10 dark:border-indigo-500/5" },
                      { label: "Delivered", status: "delivered", color: "text-emerald-500 bg-emerald-500/5 border-emerald-500/10 dark:border-emerald-500/5" }
                    ].map(st => {
                      const count = invoices.filter(inv => inv.status === st.status).length;
                      return (
                        <div key={st.status} className={`p-2 rounded-xl border flex flex-col gap-0.5 transition duration-150 ${st.color}`}>
                          <span className="font-mono text-base font-black leading-none">{count}</span>
                          <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-550">{st.label}</span>
                        </div>
                      );
                    })}
                  </div>
                  {/* Search filter for invoices history */}
                  <div className="flex flex-col gap-2 print:hidden">
                    <div className="flex gap-2 items-center">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                        <input
                          type="text"
                          placeholder="Search name, code..."
                          value={invoiceHistorySearchQuery}
                          onChange={e => setInvoiceHistorySearchQuery(e.target.value)}
                          className={`pl-9 pr-4 py-1.5 text-xs border rounded-lg focus:outline-none w-full ${inputClass}`}
                        />
                      </div>
                      <select
                        value={invoiceHistoryStatusFilter}
                        onChange={e => setInvoiceHistoryStatusFilter(e.target.value)}
                        className={`px-2.5 py-1.5 text-xs border rounded-lg focus:outline-none font-bold cursor-pointer shrink-0 w-28 ${inputClass}`}
                      >
                        <option value="all">All Status</option>
                        <option value="ordered">Ordered</option>
                        <option value="preparing">Preparing</option>
                        <option value="completed">Completed</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>
                    
                    {/* Sort Order Selector */}
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-550 dark:text-zinc-400">
                      <span className="font-bold uppercase tracking-wider">Sort:</span>
                      <select
                        value={invoiceHistorySortOrder}
                        onChange={e => setInvoiceHistorySortOrder(e.target.value as any)}
                        className={`flex-1 px-2.5 py-1 text-[10px] border rounded-lg focus:outline-none font-bold cursor-pointer ${inputClass}`}
                      >
                        <option value="latest">📅 Issue Date (Latest First)</option>
                        <option value="oldest">📅 Issue Date (Oldest First)</option>
                      </select>
                    </div>
                  </div>
                  {/* Scrollable list */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                    {(() => {
                      const filtered = invoices.filter(inv => {
                        const matchesSearch = invoiceHistorySearchQuery === "" || 
                          inv.customer_name.toLowerCase().includes(invoiceHistorySearchQuery.toLowerCase()) ||
                          inv.invoice_number.toLowerCase().includes(invoiceHistorySearchQuery.toLowerCase());
                        const matchesStatus = invoiceHistoryStatusFilter === "all" || inv.status === invoiceHistoryStatusFilter;
                        return matchesSearch && matchesStatus;
                      });

                      filtered.sort((a, b) => {
                        const timeA = new Date(a.issue_date).getTime();
                        const timeB = new Date(b.issue_date).getTime();
                        return invoiceHistorySortOrder === "latest" ? timeB - timeA : timeA - timeB;
                      });

                      if (filtered.length === 0) {
                        return (
                          <div className={`p-6 rounded-xl border border-dashed text-center text-xs italic ${isDark ? "bg-zinc-950/20 border-zinc-858 text-zinc-500" : "bg-slate-50/50 border-slate-205 text-slate-450"}`}>
                            No matching invoices found in local storage.
                          </div>
                        );
                      }

                      return filtered.map(inv => (
                        <div 
                          key={inv.id}
                          onClick={() => {
                            setPreviewInvoiceId(inv.id);
                            setIsPreviewModalOpen(true);
                          }}
                          className={`p-3 rounded-xl border cursor-pointer transition duration-155 group flex flex-col justify-between gap-2.5 ${isDark ? "bg-zinc-950/30 border-zinc-858 hover:border-zinc-700 hover:bg-zinc-900/40" : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-xs"}`}
                        >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <span className={`px-1.5 py-0.5 rounded font-mono text-[9px] font-bold ${
                                    isDark ? "bg-indigo-950/45 text-indigo-300" : "bg-indigo-50 text-indigo-700"
                                  }`}>
                                    {inv.order_id || `ORD-${inv.id.substring(4, 9).toUpperCase()}`}
                                  </span>
                                  <span className={`font-mono text-xs font-bold ${isDark ? "text-indigo-400" : "text-indigo-650"}`}>
                                    {inv.invoice_number}
                                  </span>
                                </div>
                                <span className={`text-[10px] ${isDark ? "text-zinc-500" : "text-slate-400 font-medium"}`}>
                                  {new Date(inv.issue_date).toLocaleDateString("en-IN", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric"
                                  })}
                                </span>
                              </div>
                              <div className="flex items-baseline justify-between">
                                <span className={`text-xs font-bold ${isDark ? "text-zinc-200" : "text-zinc-755"}`}>
                                  {inv.customer_name}
                                </span>
                                <span className="font-mono text-xs font-extrabold text-emerald-500">
                                  ₹{inv.total_amount.toLocaleString("en-IN")}
                                </span>
                              </div>
                              <div className="flex items-center justify-between pt-1.5 border-t border-dashed border-zinc-808/40">
                                <div className="flex items-center gap-1.5">
                                  <span className={`text-[10px] ${isDark ? "text-zinc-500" : "text-slate-455"}`}>
                                    {inv.items?.length || 0} items
                                  </span>
                                  <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded font-mono ${
                                    inv.status === "ordered" ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" :
                                    inv.status === "preparing" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                                    inv.status === "completed" ? "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20" :
                                    "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                  }`}>
                                    {inv.status}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-500 uppercase tracking-wider group-hover:text-indigo-400 transition duration-150">
                                  View Voucher &rarr;
                                </div>
                              </div>
                            </div>
                          ));
                    })()}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : appMode === "inventory" ? (
          <>
            {/* Inventory Actions Panel Row */}
            <div className={`p-4 rounded-2xl border mb-6 flex flex-wrap items-center justify-between gap-4 ${
              isDark ? "bg-zinc-950/60 border-zinc-808/60" : "bg-slate-100/80 border-slate-205"
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-base">🛠️</span>
                <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-zinc-300" : "text-slate-700"}`}>
                  Inventory Controls
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button 
                  onClick={() => {
                    setSetupModalType("category");
                    setIsSetupModalOpen(true);
                  }}
                  className={`px-3.5 py-2 text-xs rounded-xl flex items-center gap-2 transition duration-200 font-bold uppercase tracking-wider cursor-pointer ${btnOutlineClass}`}
                >
                  <Plus className="h-4 w-4" /> Add Parameter
                </button>
                <button 
                  onClick={() => {
                    setIsEditProductMode(false);
                    setEditProductId("");
                    setNewProductName("");
                    setNewProductCategory("");
                    setNewProductSubtype("");
                    setNewProductPhotos("");
                    setNewProductPrice(0);
                    setInitialLocationId("");
                    setInitialQuantity(0);
                    setIsProductModalOpen(true);
                  }}
                  className={`px-3.5 py-2 text-xs rounded-xl flex items-center gap-2 transition duration-200 font-bold uppercase tracking-wider cursor-pointer ${btnOutlineClass}`}
                >
                  <Package className="h-4 w-4" /> New Product
                </button>
                <button 
                  onClick={() => setIsStockModalOpen(true)}
                  className={`px-3.5 py-2 text-xs rounded-xl flex items-center gap-2 transition duration-200 font-bold uppercase tracking-wider cursor-pointer ${btnOutlineClass}`}
                >
                  <Layers className="h-4 w-4" /> Update Stock
                </button>
                <button 
                  onClick={() => setIsMoveStockModalOpen(true)}
                  className={`px-3.5 py-2 text-xs rounded-xl flex items-center gap-2 transition duration-200 font-bold uppercase tracking-wider cursor-pointer ${btnOutlineClass}`}
                >
                  <ArrowLeftRight className="h-4 w-4" /> Move Stock
                </button>
                <button 
                  onClick={() => {
                    setDamagedProductId("");
                    setDamagedLocationId("");
                    setDamagedQuantity("");
                    setDamagedSearchQuery("");
                    setIsDamagedStockModalOpen(true);
                  }}
                  className={`px-3.5 py-2 text-xs rounded-xl flex items-center gap-2 transition duration-200 font-bold uppercase tracking-wider cursor-pointer border border-rose-500/25 hover:border-rose-500/40 text-rose-505 hover:bg-rose-500/5`}
                >
                  <AlertTriangle className="h-4 w-4" /> Add Damaged Pieces
                </button>
              </div>
            </div>
            {/* Stats Section */}
            <section className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className={`p-5 rounded-2xl ${cardClass} hover:border-indigo-400/50 hover:shadow-md transition duration-200 border-l-2 border-l-indigo-500 hover:-translate-y-0.5`}>
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Products</span>
              <Package className="h-4 w-4 text-indigo-400" />
            </div>
            <div className={`text-2xl font-bold ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>{totalProducts}</div>
            <p className="text-[10px] text-zinc-500 mt-1">Cataloged variations</p>
          </div>
          <div className={`p-5 rounded-2xl ${cardClass} hover:border-blue-400/50 hover:shadow-md transition duration-200 border-l-2 border-l-blue-500 hover:-translate-y-0.5`}>
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Stock</span>
              <Layers className="h-4 w-4 text-blue-400" />
            </div>
            <div className={`text-2xl font-bold ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>{totalStockQuantity}</div>
            <p className="text-[10px] text-zinc-500 mt-1">Items in storage</p>
          </div>
          <div className={`p-5 rounded-2xl ${cardClass} hover:border-amber-400/50 hover:shadow-md transition duration-200 border-l-2 hover:-translate-y-0.5 ${lowStockCount > 0 ? "border-l-rose-500" : "border-l-amber-505"}`}>
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Low Stock</span>
              <AlertTriangle className={`h-4 w-4 ${lowStockCount > 0 ? "text-rose-450" : "text-zinc-500"}`} />
            </div>
            <div className={`text-2xl font-bold ${lowStockCount > 0 ? "text-rose-450" : (isDark ? "text-zinc-100" : "text-zinc-900")}`}>{lowStockCount}</div>
            <p className="text-[10px] text-zinc-500 mt-1">Threshold &lt; 10 units</p>
          </div>
          <div className={`p-5 rounded-2xl ${cardClass} hover:border-emerald-400/50 hover:shadow-md transition duration-200 border-l-2 border-l-emerald-500 hover:-translate-y-0.5`}>
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Invoices</span>
              <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
            </div>
            <div className={`text-2xl font-bold ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>{totalInvoices}</div>
            <p className="text-[10px] text-zinc-500 mt-1">Billed clients</p>
          </div>
          <div className={`p-5 rounded-2xl ${cardClass} hover:border-teal-400/50 hover:shadow-md transition duration-200 col-span-2 lg:col-span-1 border-l-2 border-l-teal-500 hover:-translate-y-0.5`}>
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Revenue</span>
              <TrendingUp className="h-4 w-4 text-teal-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400">₹{totalRevenue.toLocaleString("en-IN")}</div>
            <p className="text-[10px] text-zinc-500 mt-1">Sales turnover</p>
          </div>
        </section>
        {/* Tab Selection */}
        <div className={`flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 pb-4 border-b ${isDark ? "border-zinc-900" : "border-slate-200"}`}>
          <div className={`flex items-center gap-1 p-1 rounded-xl border overflow-x-auto scrollbar-none max-w-full ${isDark ? "bg-zinc-900 border-zinc-800" : "bg-slate-100 border-slate-200"}`}>
            <button
              onClick={() => setActiveTab("stock")}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition duration-200 flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                activeTab === "stock"
                  ? (isDark ? "bg-zinc-800 text-zinc-100 border border-zinc-700/40 shadow-sm" : "bg-white text-zinc-800 border border-slate-200 shadow-sm")
                  : (isDark ? "text-zinc-400 hover:text-zinc-200" : "text-slate-500 hover:text-slate-800")
              }`}
            >
              <Layers className="h-3.5 w-3.5" /> Stock Levels
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition duration-200 flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                activeTab === "products"
                  ? (isDark ? "bg-zinc-800 text-zinc-100 border border-zinc-700/40 shadow-sm" : "bg-white text-zinc-800 border border-slate-200 shadow-sm")
                  : (isDark ? "text-zinc-400 hover:text-zinc-200" : "text-slate-500 hover:text-slate-800")
              }`}
            >
              <Package className="h-3.5 w-3.5" /> Product Catalog
            </button>
            <button
              onClick={() => setActiveTab("setup")}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition duration-200 flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                activeTab === "setup"
                  ? (isDark ? "bg-zinc-800 text-zinc-100 border border-zinc-700/40 shadow-sm" : "bg-white text-zinc-800 border border-slate-200 shadow-sm")
                  : (isDark ? "text-zinc-400 hover:text-zinc-200" : "text-slate-500 hover:text-slate-800")
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" /> System Setup
            </button>
          </div>
          {/* Inline filters */}
          {(activeTab === "stock" || activeTab === "products") && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
              <div className="relative flex-1 sm:flex-initial w-full sm:w-48">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className={`pl-9 pr-4 py-1.5 text-xs border rounded-lg focus:outline-none transition duration-200 w-full ${inputClass}`}
                />
              </div>
              <select
                value={selectedCategoryFilter}
                onChange={e => setSelectedCategoryFilter(e.target.value)}
                className={`px-3 py-1.5 text-xs border rounded-lg focus:outline-none w-full sm:w-auto ${inputClass}`}
              >
                <option value="all">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <select
                value={selectedLocationFilter}
                onChange={e => setSelectedLocationFilter(e.target.value)}
                className={`px-3 py-1.5 text-xs border rounded-lg focus:outline-none w-full sm:w-auto ${inputClass}`}
              >
                <option value="all">All Locations</option>
                {locations.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        {/* Tab 1: Stock Levels */}
        {activeTab === "stock" && (
          <>
            <div className={`${cardClass} overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`text-xs font-semibold uppercase tracking-wider border-b ${isDark ? "bg-zinc-950/40 text-zinc-400 border-zinc-800" : "bg-zinc-100/80 text-zinc-550 border-zinc-200"}`}>
                    <th className="py-4 px-6">Product</th>
                    <th className="py-4 px-4">Category</th>
                    <th className="py-4 px-4">Sub-Type</th>
                    <th className="py-4 px-4">Location</th>
                    <th className="py-4 px-4 text-right">Quantity</th>
                    <th className="py-4 px-6 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className={`divide-y text-sm ${isDark ? "divide-zinc-808" : "divide-zinc-150"}`}>
                  {paginatedStock.map((st, idx) => {
                      if (!st.product_id) return null;
                      const prod = getProduct(st.product_id);
                      if (!prod) return null;
                      return (
                        <tr key={`${st.id}-${idx}`} className={`transition duration-150 group ${isDark ? "hover:bg-zinc-900/25" : "hover:bg-zinc-100/40"}`}>
                          <td className="py-4 px-6 flex items-center gap-3">
                            {prod.photos && prod.photos[0] ? (
                              <img 
                                src={prod.photos[0]} 
                                alt={prod.name} 
                                className={`h-10 w-10 object-cover rounded-lg border ${isDark ? "bg-zinc-900 border-zinc-800" : "bg-slate-100 border-slate-200"}`}
                              />
                            ) : (
                              <div className={`h-10 w-10 rounded-lg border flex items-center justify-center text-zinc-400 ${isDark ? "bg-zinc-900/20 border-zinc-800" : "bg-slate-50 border-slate-200"}`}>
                                <Package className="h-5 w-5" />
                              </div>
                            )}
                            <div>
                              <div className={`font-semibold transition duration-150 ${isDark ? "text-zinc-200 group-hover:text-indigo-400" : "text-zinc-800 group-hover:text-indigo-600"}`}>
                                {prod.name}
                              </div>
                              <div className="text-xs text-zinc-500 font-mono">ID: {prod.id}</div>
                            </div>
                          </td>
                          <td className={`py-4 px-4 ${isDark ? "text-zinc-350" : "text-zinc-700"}`}>
                            <span className="flex items-center gap-1.5">
                              <Tag className="h-3.5 w-3.5 text-zinc-500" />
                              {getCategoryName(prod.category_id)}
                            </span>
                          </td>
                          <td className={`py-4 px-4 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                            {getSubTypeName(prod.sub_type_id)}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border ${isDark ? "bg-zinc-800/80 border-zinc-700 text-zinc-300" : "bg-zinc-100 border-zinc-200/80 text-zinc-650"}`}>
                              <MapPin className="h-3 w-3 text-indigo-500" />
                              {getLocationName(st.storage_location_id)}
                            </span>
                          </td>
                          <td className={`py-4 px-4 text-right font-mono font-bold ${isDark ? "text-zinc-205" : "text-zinc-800"}`}>
                            {st.quantity}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {st.quantity === 0 ? (
                                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-rose-500/10 text-rose-450 border border-rose-500/20">
                                  Out of Stock
                                </span>
                              ) : st.quantity < 10 ? (
                                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-amber-500/10 text-amber-555 border border-amber-500/20">
                                  Low Stock
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-emerald-500/10 text-emerald-555 border border-emerald-500/20">
                                  Healthy
                                </span>
                              )}
                              <button 
                                onClick={() => {
                                  setStockModalType("product");
                                  setStockProductId(st.product_id || "");
                                  setStockLocationId(st.storage_location_id);
                                  setStockQuantity(st.quantity);
                                  setIsStockModalOpen(true);
                                }}
                                className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded transition duration-150"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleSoftDelete("stock", st.id)}
                                className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1 hover:bg-zinc-800 text-rose-400 hover:text-rose-300 rounded transition duration-150"
                                title="Soft Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
            {/* Stock Pagination Controls */}
            <div className={`mt-4 p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition duration-205 ${isDark ? "bg-zinc-950/20 border-zinc-808/60" : "bg-slate-50/50 border-slate-200 shadow-xs"}`}>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className={`text-xs ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
                  Showing <strong className="font-semibold">{filteredStock.length === 0 ? 0 : Math.min((stockPage - 1) * stockPerPage + 1, filteredStock.length)}</strong> to <strong className="font-semibold">{Math.min(stockPage * stockPerPage, filteredStock.length)}</strong> of <strong className="font-bold text-indigo-500">{filteredStock.length}</strong> items
                </span>
                <span className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider">•</span>
                <div className="flex items-center gap-1.5">
                  <label className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider">Show</label>
                  <select
                    value={stockPerPage}
                    onChange={e => {
                      setStockPerPage(Number(e.target.value));
                      setStockPage(1);
                    }}
                    className={`px-2 py-1 text-xs border rounded-lg focus:outline-none ${inputClass}`}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={9999}>All</option>
                  </select>
                </div>
              </div>
              {totalStockPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={stockPage === 1}
                    onClick={() => setStockPage(prev => Math.max(prev - 1, 1))}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition duration-150 flex items-center gap-1 select-none cursor-pointer ${
                      stockPage === 1
                        ? "opacity-40 cursor-not-allowed text-zinc-500 border-zinc-808 bg-zinc-950/20"
                        : (isDark ? "bg-zinc-950 hover:bg-zinc-850 border-zinc-808 hover:border-zinc-700 text-zinc-300 hover:text-white" : "bg-white hover:bg-slate-50 border-slate-205 hover:border-slate-300 text-slate-650 hover:text-slate-850")
                    }`}
                  >
                    Previous
                  </button>
                  <span className={`text-xs font-mono font-bold px-3 py-1.5 rounded-lg border ${isDark ? "bg-zinc-950/40 border-zinc-850 text-zinc-300" : "bg-slate-50/50 border-slate-200 text-slate-655"}`}>
                    Page {stockPage} of {totalStockPages}
                  </span>
                  <button
                    type="button"
                    disabled={stockPage === totalStockPages}
                    onClick={() => setStockPage(prev => Math.min(prev + 1, totalStockPages))}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition duration-150 flex items-center gap-1 select-none cursor-pointer ${
                      stockPage === totalStockPages
                        ? "opacity-40 cursor-not-allowed text-zinc-500 border-zinc-808 bg-zinc-950/20"
                        : (isDark ? "bg-zinc-950 hover:bg-zinc-850 border-zinc-808 hover:border-zinc-700 text-zinc-300 hover:text-white" : "bg-white hover:bg-slate-50 border-slate-205 hover:border-slate-300 text-slate-650 hover:text-slate-850")
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* Dryfruit Ingredients Stock Table */}
          <div className={`${cardClass} overflow-hidden mt-6`}>
            <div className="p-4 border-b border-zinc-808/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <h3 className={`font-bold text-sm uppercase tracking-wider flex items-center gap-2 ${isDark ? "text-zinc-200" : "text-zinc-750"}`}>
                <span>🍯 Dryfruit Ingredients Stock</span>
              </h3>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 text-xs">
                {/* Search dryfruits */}
                <div className="relative w-full sm:w-44">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search dryfruits..."
                    value={dryfruitSearchQuery}
                    onChange={e => setDryfruitSearchQuery(e.target.value)}
                    className={`pl-8 pr-3 py-1.5 border rounded-lg focus:outline-none w-full ${inputClass}`}
                  />
                </div>
                
                {/* Location select */}
                <select
                  value={dryfruitLocationFilter}
                  onChange={e => setDryfruitLocationFilter(e.target.value)}
                  className={`px-3 py-1.5 border rounded-lg focus:outline-none w-full sm:w-auto ${inputClass}`}
                >
                  <option value="all">All Locations</option>
                  {locations.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`text-xs font-semibold uppercase tracking-wider border-b ${isDark ? "bg-zinc-950/40 text-zinc-400 border-zinc-808" : "bg-zinc-100/80 text-zinc-550 border-zinc-200"}`}>
                    <th className="py-4 px-6">Dryfruit Ingredient</th>
                    <th className="py-4 px-4">Location</th>
                    <th className="py-4 px-4 text-right">Stock Level (kg)</th>
                    <th className="py-4 px-6 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className={`divide-y text-sm ${isDark ? "divide-zinc-808" : "divide-zinc-150"}`}>
                  {stock
                    .filter(st => {
                      if (!st.additive_id) return false;
                      const add = additives.find(a => a.id === st.additive_id);
                      if (!add) return false;
                      // Search Match
                      const matchesSearch = add.name.toLowerCase().includes(dryfruitSearchQuery.toLowerCase());
                      // Location Filter Match
                      const matchesLocation = dryfruitLocationFilter === "all" || st.storage_location_id === dryfruitLocationFilter;
                      return matchesSearch && matchesLocation;
                    })
                    .map((st, idx) => {
                      const add = additives.find(a => a.id === st.additive_id);
                      if (!add) return null;
                      return (
                        <tr key={`${st.id}-${idx}`} className={`transition duration-150 group ${isDark ? "hover:bg-zinc-900/25" : "hover:bg-zinc-100/40"}`}>
                          <td className="py-4 px-6 font-semibold">
                            {add.name}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border ${isDark ? "bg-zinc-808/80 border-zinc-700 text-zinc-300" : "bg-zinc-100 border-zinc-200/80 text-zinc-650"}`}>
                              <MapPin className="h-3 w-3 text-indigo-500" />
                              {getLocationName(st.storage_location_id)}
                            </span>
                          </td>
                          <td className={`py-4 px-4 text-right font-mono font-bold ${isDark ? "text-zinc-205" : "text-zinc-800"}`}>
                            {st.quantity.toFixed(2)} kg
                          </td>
                          <td className="py-4 px-6 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {st.quantity <= 0 ? (
                                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-rose-500/10 text-rose-450 border border-rose-500/20">
                                  Deficit / Out
                                </span>
                              ) : st.quantity <= 2 ? (
                                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-amber-500/10 text-amber-555 border border-amber-500/20">
                                  Low Stock
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-emerald-500/10 text-emerald-555 border border-emerald-500/20">
                                  Healthy
                                </span>
                              )}
                              <button 
                                onClick={() => {
                                  setStockModalType("additive");
                                  setStockAdditiveId(st.additive_id || "");
                                  setStockLocationId(st.storage_location_id);
                                  setStockQuantity(st.quantity);
                                  setIsStockModalOpen(true);
                                }}
                                className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded transition duration-150 cursor-pointer"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleSoftDelete("stock", st.id)}
                                className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1 hover:bg-zinc-800 text-rose-400 hover:text-rose-355 rounded transition duration-150 cursor-pointer"
                                title="Soft Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
          {/* Damaged Stock Log Panel */}
          <div className={`${cardClass} mt-6 p-6`}>
            <button
              type="button"
              onClick={() => setIsDamagedLogExpanded(!isDamagedLogExpanded)}
              className="w-full flex items-center justify-between font-bold text-base select-none cursor-pointer"
            >
              <span className="flex items-center gap-2 text-rose-500">
                <AlertTriangle className="h-5 w-5" /> 
                <span>Damaged Pieces History ({damagedStockList.length} items logged)</span>
              </span>
              <span className={`text-xs px-2 py-1 rounded border transition ${
                isDark ? "bg-zinc-950 border-zinc-808 text-zinc-400" : "bg-white border-slate-200 text-slate-500"
              }`}>
                {isDamagedLogExpanded ? "Hide Logs" : "Show Logs"}
              </span>
            </button>
            {isDamagedLogExpanded && (
              <div className="mt-4 pt-4 border-t border-dashed border-zinc-808/30">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className={`border-b text-[10px] font-bold uppercase tracking-wider text-zinc-500 ${
                        isDark ? "bg-zinc-900 border-zinc-808 text-zinc-400" : "bg-slate-50 border-slate-205 text-slate-650"
                      }`}>
                        <th className="py-2.5 px-4">Product Name</th>
                        <th className="py-2.5 px-4">Location</th>
                        <th className="py-2.5 px-4 text-center">Damaged Qty</th>
                        <th className="py-2.5 px-4">Reported On</th>
                        <th className="py-2.5 px-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? "divide-zinc-900/60" : "divide-slate-200"}`}>
                      {damagedStockList.map((dmg, idx) => {
                        const prod = dmg.product_id ? getProduct(dmg.product_id) : null;
                        const add = dmg.additive_id ? additives.find(a => a.id === dmg.additive_id) : null;
                        const displayName = prod ? prod.name : (add ? `🍯 ${add.name} (Dryfruit)` : "Unknown Item");
                        const displayQty = dmg.product_id ? `${dmg.quantity} units` : `${dmg.quantity.toFixed(2)} kg`;
                        return (
                          <tr key={dmg.id} className={isDark ? "hover:bg-zinc-900/10" : "hover:bg-slate-50/20"}>
                            <td className="py-3 px-4 font-bold text-zinc-700 dark:text-zinc-200">{displayName}</td>
                            <td className="py-3 px-4 font-semibold text-zinc-500">{getLocationName(dmg.storage_location_id)}</td>
                            <td className="py-3 px-4 text-center font-mono font-black text-rose-500">{displayQty}</td>
                            <td className="py-3 px-4 text-zinc-500 font-mono">
                              {new Date(dmg.reported_at).toLocaleString("en-IN", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm("Are you sure you want to delete this damaged stock record? Note: This will not restore the stock automatically, please use Update Stock if restoring is needed.")) {
                                    localDB.softDelete("damaged_stock", dmg.id);
                                    loadData();
                                  }
                                }}
                                className="text-rose-500 hover:text-rose-600 hover:underline text-[10px] font-bold"
                              >
                                Delete Log
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {damagedStockList.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-zinc-500 italic">No damaged pieces reported yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
          </>
        )}        {/* Tab 2: Products Catalog */}
        {activeTab === "products" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {paginatedProducts.map((prod, idx) => (
              <div 
                key={`${prod.id}-${idx}`} 
                onClick={() => {
                  setDetailProductId(prod.id);
                  setIsDetailModalOpen(true);
                }}
                className={`rounded-2xl border overflow-hidden transition duration-300 group flex flex-col justify-between shadow-sm cursor-pointer hover:shadow-md hover:scale-[1.01] ${isDark ? "bg-zinc-900 border-zinc-808 hover:border-zinc-700 hover:bg-zinc-900/80" : "bg-white border-zinc-200 hover:border-zinc-300 hover:bg-slate-50/50"}`}
              >
                {/* Product Photo */}
                <div className={`h-48 w-full relative overflow-hidden ${isDark ? "bg-zinc-900" : "bg-zinc-100"}`}>
                  {prod.photos && prod.photos[0] ? (
                    <img 
                      src={prod.photos[0]} 
                      alt={prod.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400">
                      <Package className="h-12 w-12" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex gap-1.5">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditProductMode(true);
                        setEditProductId(prod.id);
                        setNewProductName(prod.name);
                        setNewProductCategory(prod.category_id);
                        setNewProductSubtype(prod.sub_type_id);
                        setNewProductPhotos(prod.photos.join(", "));
                        setNewProductPrice(prod.price || 0);
                        setNewProductSupplierCode(prod.supplier_code || "");
                        setIsProductModalOpen(true);
                      }}
                      className={`p-2 backdrop-blur-md rounded-lg border transition duration-150 text-xs font-semibold ${isDark ? "bg-zinc-950/80 hover:bg-zinc-850 text-zinc-400 hover:text-white border-zinc-808" : "bg-white/90 border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 shadow-sm"}`}
                      title="Edit Product"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSoftDelete("products", prod.id);
                      }}
                      className={`p-2 backdrop-blur-md rounded-lg border transition duration-150 ${isDark ? "bg-zinc-950/80 hover:bg-rose-950/80 text-zinc-400 hover:text-rose-400 border-zinc-808" : "bg-white/90 border-zinc-200 text-zinc-600 hover:text-rose-500 hover:bg-rose-50 shadow-sm"}`}
                      title="Soft Delete Product"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="absolute bottom-3 left-3 flex gap-1.5">
                    <span className={`px-2 py-0.5 text-[10px] font-semibold backdrop-blur-md border rounded-md ${isDark ? "bg-zinc-950/80 text-zinc-350 border-zinc-808" : "bg-white/90 text-zinc-600 border-zinc-200"}`}>
                      {getCategoryName(prod.category_id)}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-semibold backdrop-blur-md border rounded-md ${isDark ? "bg-zinc-950/80 text-zinc-400 border-zinc-888" : "bg-white/90 text-zinc-550 border-zinc-200"}`}>
                      {getSubTypeName(prod.sub_type_id)}
                    </span>
                  </div>
                </div>
                {/* Info */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="mb-4">
                    <h3 className={`font-bold text-lg transition duration-150 line-clamp-1 flex items-center justify-between ${isDark ? "text-zinc-150 group-hover:text-indigo-400" : "text-zinc-800 group-hover:text-indigo-650"}`}>
                      <span>{prod.name}</span>
                      <span className="text-sm font-bold text-indigo-500 font-mono">₹{prod.price || 0}</span>
                    </h3>
                    <div className="flex items-center justify-between text-[11px] mt-1 font-mono">
                      <span className="text-zinc-550">ID: {prod.id}</span>
                      {prod.supplier_code && (
                        <span className={`text-[10px] font-bold uppercase rounded px-1.5 shrink-0 ${isDark ? "bg-indigo-950/40 text-indigo-300 border border-indigo-900/30" : "bg-indigo-50 text-indigo-700 border border-indigo-100"}`}>
                          {prod.supplier_code}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`mt-4 pt-4 border-t flex flex-col gap-3 ${isDark ? "border-zinc-808" : "border-zinc-150"}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-500">Total in stock:</span>
                      <span className={`font-bold font-mono ${isDark ? "text-zinc-100" : "text-zinc-800"}`}>
                        {stock.filter(st => st.product_id === prod.id && st.deleted_at === null).reduce((sum, item) => sum + item.quantity, 0)} units
                      </span>
                    </div>
                    {/* Storage locations badge list */}
                    <div className="space-y-1.5 pt-2 border-t border-dashed border-slate-100 dark:border-zinc-800">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Storage Locations:</span>
                      {stock.filter(st => st.product_id === prod.id && st.quantity > 0 && st.deleted_at === null).length === 0 ? (
                        <span className="text-xs text-zinc-450 italic">No active stock (Catalog Only)</span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {stock.filter(st => st.product_id === prod.id && st.quantity > 0 && st.deleted_at === null).map((st, sIdx) => (
                            <span 
                              key={`${st.id}-${sIdx}`} 
                              className={`px-2 py-0.5 text-[9px] font-semibold font-mono rounded-md border flex items-center gap-1 ${
                                isDark 
                                  ? "bg-zinc-950/60 border-zinc-808/60 text-zinc-400" 
                                  : "bg-slate-50 border-slate-200 text-slate-600"
                              }`}
                            >
                              <MapPin className="h-2.5 w-2.5 text-indigo-500 shrink-0" />
                              <span>{getLocationName(st.storage_location_id)} ({st.quantity})</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setStockProductId(prod.id);
                        setStockLocationId("");
                        setStockQuantity(0);
                        setIsStockModalOpen(true);
                      }}
                      className={`w-full py-2 border text-xs font-semibold rounded-lg transition duration-150 flex items-center justify-center gap-1.5 ${isDark ? "bg-zinc-950 hover:bg-zinc-850 border-zinc-808 hover:border-zinc-700 text-indigo-400 hover:text-indigo-300" : "bg-zinc-50 hover:bg-zinc-100 border-zinc-200 hover:border-zinc-300 text-indigo-650 hover:text-indigo-700"}`}
                    >
                      <Layers className="h-3.5 w-3.5" /> Adjust Stock Count
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {/* Create Product Card - Only show on last page */}
            {productsPage === totalProductsPages && (
              <div 
                onClick={() => setIsProductModalOpen(true)}
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition duration-300 min-h-[300px] ${isDark ? "bg-zinc-905 hover:bg-zinc-900 border-zinc-808 hover:border-zinc-700" : "bg-white hover:bg-zinc-50/80 border-zinc-200 hover:border-zinc-300 shadow-sm"}`}
              >
                <div className={`p-4 rounded-full border mb-4 transition duration-350 ${isDark ? "bg-zinc-900 border-zinc-808" : "bg-zinc-50 border-zinc-200"}`}>
                  <Plus className="h-6 w-6 text-indigo-500" />
                </div>
                <h3 className={`font-bold ${isDark ? "text-zinc-300" : "text-zinc-750"}`}>Add New Product</h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-[200px]">Create a new product definition with default price, category, and sub-type.</p>
              </div>
            )}
          </div>
          {/* Pagination Controls */}
          {filteredProducts.length > 0 && (
            <div className={`mt-6 p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition duration-205 ${isDark ? "bg-zinc-900/50 border-zinc-850" : "bg-white border-slate-200/80 shadow-xs"}`}>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className={`text-xs ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
                  Showing <strong className="font-semibold">{Math.min((productsPage - 1) * productsPerPage + 1, filteredProducts.length)}</strong> to <strong className="font-semibold">{Math.min(productsPage * productsPerPage, filteredProducts.length)}</strong> of <strong className="font-bold text-indigo-500">{filteredProducts.length}</strong> products
                </span>
                <span className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider">•</span>
                <div className="flex items-center gap-1.5">
                  <label className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider">Show</label>
                  <select
                    value={productsPerPage}
                    onChange={e => {
                      setProductsPerPage(Number(e.target.value));
                      setProductsPage(1);
                    }}
                    className={`px-2 py-1 text-xs border rounded-lg focus:outline-none ${inputClass}`}
                  >
                    <option value={12}>12</option>
                    <option value={24}>24</option>
                    <option value={48}>48</option>
                    <option value={96}>96</option>
                    <option value={9999}>All</option>
                  </select>
                </div>
              </div>

              {totalProductsPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={productsPage === 1}
                    onClick={() => setProductsPage(prev => Math.max(prev - 1, 1))}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition duration-150 flex items-center gap-1 select-none cursor-pointer ${
                      productsPage === 1
                        ? "opacity-40 cursor-not-allowed text-zinc-500 border-zinc-808 bg-zinc-950/20"
                        : (isDark ? "bg-zinc-950 hover:bg-zinc-850 border-zinc-808 hover:border-zinc-700 text-zinc-300 hover:text-white" : "bg-white hover:bg-slate-50 border-slate-205 hover:border-slate-300 text-slate-650 hover:text-slate-850")
                    }`}
                  >
                    Previous
                  </button>
                  <span className={`text-xs font-mono font-bold px-3 py-1.5 rounded-lg border ${isDark ? "bg-zinc-950/40 border-zinc-850 text-zinc-300" : "bg-slate-50/50 border-slate-200 text-slate-650"}`}>
                    Page {productsPage} of {totalProductsPages}
                  </span>
                  <button
                    type="button"
                    disabled={productsPage === totalProductsPages}
                    onClick={() => setProductsPage(prev => Math.min(prev + 1, totalProductsPages))}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition duration-150 flex items-center gap-1 select-none cursor-pointer ${
                      productsPage === totalProductsPages
                        ? "opacity-40 cursor-not-allowed text-zinc-500 border-zinc-808 bg-zinc-950/20"
                        : (isDark ? "bg-zinc-950 hover:bg-zinc-850 border-zinc-808 hover:border-zinc-700 text-zinc-300 hover:text-white" : "bg-white hover:bg-slate-50 border-slate-205 hover:border-slate-300 text-slate-650 hover:text-slate-850")
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
        {/* Tab 4: System Setup */}
        {activeTab === "setup" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {/* Categories list */}
            <div className={`${cardClass} p-6 flex flex-col justify-between`}>
              <div>
                <h3 className={`font-bold text-lg mb-4 flex items-center justify-between ${isDark ? "text-zinc-100" : "text-zinc-800"}`}>
                  <span>Categories</span>
                  <button 
                    onClick={() => {
                      setSetupModalType("category");
                      setIsSetupModalOpen(true);
                    }}
                    className={`p-1 text-zinc-400 hover:text-indigo-500 rounded transition duration-150 ${isDark ? "hover:bg-zinc-800" : "hover:bg-zinc-150"}`}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </h3>
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-2">
                  {categories.map((c, idx) => (
                    <div key={`${c.id}-${idx}`} className={`p-3 rounded-lg border flex items-center justify-between group transition duration-150 ${isDark ? "bg-zinc-950/45 border-zinc-808 hover:border-zinc-700" : "bg-zinc-50 border-zinc-200/80 hover:border-zinc-300"}`}>
                      <div>
                        <span className={`font-medium block ${isDark ? "text-zinc-300" : "text-zinc-705"}`}>{c.name}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">ID: {c.id}</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition duration-150">
                        <button 
                          onClick={() => {
                            setIsEditMode(true);
                            setEditItemId(c.id);
                            setSetupName(c.name);
                            setSetupModalType("category");
                            setIsSetupModalOpen(true);
                          }}
                          className={`p-1 rounded text-xs transition duration-150 ${isDark ? "hover:bg-zinc-800 text-zinc-400 hover:text-white" : "hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900"}`}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleSoftDelete("categories", c.id)}
                          className={`p-1 rounded transition duration-150 ${isDark ? "hover:bg-zinc-800 text-rose-455" : "hover:bg-zinc-200/50 text-rose-500 hover:text-rose-600"}`}
                          title="Soft Delete Category"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Sub-types list */}
            <div className={`${cardClass} p-6 flex flex-col justify-between`}>
              <div>
                <h3 className={`font-bold text-lg mb-4 flex items-center justify-between ${isDark ? "text-zinc-100" : "text-zinc-800"}`}>
                  <span>Sub-Types</span>
                  <button 
                    onClick={() => {
                      setSetupModalType("subtype");
                      setIsSetupModalOpen(true);
                    }}
                    className={`p-1 text-zinc-400 hover:text-indigo-500 rounded transition duration-150 ${isDark ? "hover:bg-zinc-800" : "hover:bg-zinc-150"}`}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </h3>
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-2">
                  {subTypes.map((s, idx) => (
                    <div key={`${s.id}-${idx}`} className={`p-3 rounded-lg border flex items-center justify-between group transition duration-150 ${isDark ? "bg-zinc-950/45 border-zinc-808 hover:border-zinc-700" : "bg-zinc-50 border-zinc-200/80 hover:border-zinc-300"}`}>
                      <div>
                        <span className={`font-medium block ${isDark ? "text-zinc-300" : "text-zinc-705"}`}>
                          {s.name} <span className="text-xs text-zinc-500 font-normal">({getCategoryName(s.category_id)})</span>
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">ID: {s.id}</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition duration-150">
                        <button 
                          onClick={() => {
                            setIsEditMode(true);
                            setEditItemId(s.id);
                            setSetupName(s.name);
                            setSetupCategoryId(s.category_id);
                            setSetupModalType("subtype");
                            setIsSetupModalOpen(true);
                          }}
                          className={`p-1 rounded text-xs transition duration-150 ${isDark ? "hover:bg-zinc-800 text-zinc-400 hover:text-white" : "hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900"}`}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleSoftDelete("sub_types", s.id)}
                          className={`p-1 rounded transition duration-150 ${isDark ? "hover:bg-zinc-800 text-rose-455" : "hover:bg-zinc-200/50 text-rose-500 hover:text-rose-600"}`}
                          title="Soft Delete Sub-Type"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Storage Locations list */}
            <div className={`${cardClass} p-6 flex flex-col justify-between`}>
              <div>
                <h3 className={`font-bold text-lg mb-4 flex items-center justify-between ${isDark ? "text-zinc-100" : "text-zinc-800"}`}>
                  <span>Storage Locations</span>
                  <button 
                    onClick={() => {
                      setSetupModalType("location");
                      setIsSetupModalOpen(true);
                    }}
                    className={`p-1 text-zinc-400 hover:text-indigo-500 rounded transition duration-150 ${isDark ? "hover:bg-zinc-800" : "hover:bg-zinc-150"}`}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </h3>
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-2">
                  {locations.map((l, idx) => (
                    <div key={`${l.id}-${idx}`} className={`p-3 rounded-lg border flex items-center justify-between group transition duration-150 ${isDark ? "bg-zinc-950/45 border-zinc-808 hover:border-zinc-700" : "bg-zinc-50 border-zinc-200/80 hover:border-zinc-300"}`}>
                      <div>
                        <span className={`font-medium flex items-center gap-1.5 ${isDark ? "text-zinc-300" : "text-zinc-705"}`}>
                          <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                          {l.name}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">ID: {l.id}</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition duration-150">
                        <button 
                          onClick={() => {
                            setIsEditMode(true);
                            setEditItemId(l.id);
                            setSetupName(l.name);
                            setSetupModalType("location");
                            setIsSetupModalOpen(true);
                          }}
                          className={`p-1 rounded text-xs transition duration-150 ${isDark ? "hover:bg-zinc-800 text-zinc-400 hover:text-white" : "hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900"}`}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleSoftDelete("locations", l.id)}
                          className={`p-1 rounded transition duration-150 ${isDark ? "hover:bg-zinc-800 text-rose-455" : "hover:bg-zinc-200/50 text-rose-500 hover:text-rose-600"}`}
                          title="Soft Delete Location"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Dryfruit Additives list */}
            <div className={`${cardClass} p-6 flex flex-col justify-between`}>
              <div>
                <h3 className={`font-bold text-lg mb-4 flex items-center justify-between ${isDark ? "text-zinc-100" : "text-zinc-800"}`}>
                  <span>Dryfruit Additives</span>
                  <button 
                    onClick={() => {
                      setIsEditMode(false);
                      setEditItemId("");
                      setSetupName("");
                      setAdditivePrice("");
                      setAdditivePriceOption("1kg");
                      setAdditiveStockQty("");
                      setSetupModalType("additive");
                      setIsSetupModalOpen(true);
                    }}
                    className={`p-1 text-zinc-400 hover:text-indigo-500 rounded transition duration-150 ${isDark ? "hover:bg-zinc-800" : "hover:bg-zinc-150"}`}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </h3>
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-2">
                  {additives.map((add, idx) => (
                    <div key={`${add.id}-${idx}`} className={`p-3 rounded-lg border flex items-center justify-between group transition duration-150 ${isDark ? "bg-zinc-950/45 border-zinc-808 hover:border-zinc-700" : "bg-zinc-50 border-zinc-200/80 hover:border-zinc-300"}`}>
                      <div>
                        <span className={`font-medium block ${isDark ? "text-zinc-300" : "text-zinc-705"}`}>{add.name}</span>
                        <div className="flex gap-2 text-[10px] text-zinc-500 font-mono mt-0.5">
                          <span>₹{add.price_per_kg}/kg</span>
                          <span>•</span>
                          <span>Stock: <span className={`font-bold ${add.stock_qty_kg <= 2 ? "text-rose-500 font-extrabold" : "text-emerald-500"}`}>{add.stock_qty_kg || 0} kg</span></span>
                          <span>•</span>
                          <span>₹{Math.round(add.price_per_kg / 10)}/100g</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition duration-150">
                        <button 
                          onClick={() => {
                            setIsEditMode(true);
                            setEditItemId(add.id);
                            setSetupName(add.name);
                            setAdditivePrice(String(add.price_per_kg));
                            setAdditivePriceOption("1kg");
                            setAdditiveStockQty(String(add.stock_qty_kg || 0));
                            setSetupModalType("additive");
                            setIsSetupModalOpen(true);
                          }}
                          className={`p-1 rounded text-xs transition duration-150 ${isDark ? "hover:bg-zinc-800 text-zinc-400 hover:text-white" : "hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900"}`}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete additive "${add.name}"?`)) {
                              localDB.softDelete("additives", add.id);
                              loadData();
                            }
                          }}
                          className={`p-1 rounded transition duration-150 ${isDark ? "hover:bg-zinc-800 text-rose-455" : "hover:bg-zinc-200/50 text-rose-500 hover:text-rose-600"}`}
                          title="Delete Additive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {additives.length === 0 && (
                    <div className="text-center text-zinc-550 text-xs italic py-4">No additives created</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
          </>
        ) : (
          /* ADMIN PAGE VIEW */
          <div className="w-full max-w-2xl mx-auto mb-8 relative">
            {!isAdminUnlocked ? (
              <div className={`${cardClass} p-8 rounded-2xl border shadow-xl flex flex-col gap-6 items-center text-center max-w-md mx-auto`}>
                <div className="p-4 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 border border-indigo-100 dark:border-indigo-900/30">
                  <SlidersHorizontal className="h-10 w-10 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-800 dark:text-zinc-100">Administrative Gate</h2>
                  <p className="text-xs text-zinc-555 dark:text-zinc-455 mt-1 leading-relaxed">
                    Enter access credentials to modify business details and tax configurations.
                  </p>
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const savedPassword = localStorage.getItem("admin_portal_password") || "admin123";
                    if (adminPasswordInput === savedPassword) {
                      setIsAdminUnlocked(true);
                      setAdminPasswordInput("");
                    } else {
                      alert("Invalid credentials! Access denied.");
                    }
                  }}
                  className="w-full space-y-4"
                >
                  <input
                    type="password"
                    placeholder="Enter admin password..."
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    required
                    className={`w-full px-3 py-2 text-center text-sm border rounded-lg focus:outline-none font-mono ${inputClass}`}
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white font-bold rounded-lg shadow-md transition duration-155"
                  >
                    Unlock Administrative Panel
                  </button>
                </form>
                <div className="text-[10px] text-zinc-500 font-mono">
                  Default Gate Seed: <span className="font-bold">admin123</span>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-fadeIn">
                {/* 1. Seller Information Configuration */}
                <div className={`${cardClass} p-6 rounded-2xl border shadow-lg flex flex-col gap-6`}>
                  <div className="flex items-center justify-between border-b pb-4 border-zinc-808/20">
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-850 dark:text-zinc-100">Seller Business Profile</h2>
                      <p className="text-xs text-zinc-550 dark:text-zinc-450 mt-0.5">
                        These credentials are automatically printed on official invoices.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAdminUnlocked(false)}
                      className={`px-3 py-1.5 text-xs font-bold border rounded-lg transition text-rose-505 hover:bg-rose-500/5 ${
                        isDark ? "border-rose-900/30" : "border-rose-200"
                      }`}
                    >
                      Lock Session
                    </button>
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const updated = {
                        seller_name: sellerName.trim() || "Jenny's Creation",
                        seller_address: sellerAddress.trim() || "123 Creative Street, Studio City",
                        gstin: sellerGstin.trim(),
                        pan: sellerPan.trim(),
                        show_gst_pan: sellerShowGst
                      };
                      localDB.saveSellerSettings(updated);
                      loadData();
                      alert("Invoicing details updated successfully!");
                    }}
                    className="space-y-4 text-xs"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                          Business Seller Name
                        </label>
                        <input
                          type="text"
                          required
                          value={sellerName}
                          onChange={(e) => setSellerName(e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${inputClass}`}
                        />
                      </div>
                      <div className="flex flex-col justify-end pb-2">
                        <label className="flex items-center gap-2 font-bold text-zinc-600 dark:text-zinc-400 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={sellerShowGst}
                            onChange={(e) => setSellerShowGst(e.target.checked)}
                            className="rounded border-zinc-350 text-indigo-650 focus:ring-indigo-500 h-4 w-4"
                          />
                          <span>Show GSTIN & PAN details on bills</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                        Corporate Business Address
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={sellerAddress}
                        onChange={(e) => setSellerAddress(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none leading-relaxed ${inputClass}`}
                        placeholder="Seller address details..."
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                          Seller Permanent Account Number (PAN)
                        </label>
                        <input
                          type="text"
                          value={sellerPan}
                          onChange={(e) => setSellerPan(e.target.value)}
                          placeholder="e.g. ABCDE1234F"
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none font-mono uppercase ${inputClass}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                          Seller Goods & Services Tax (GSTIN)
                        </label>
                        <input
                          type="text"
                          value={sellerGstin}
                          onChange={(e) => setSellerGstin(e.target.value)}
                          placeholder="e.g. 24AAACJ1234A1Z5"
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none font-mono uppercase ${inputClass}`}
                        />
                      </div>
                    </div>
                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        className="px-5 py-2 text-white font-bold rounded-lg bg-indigo-650 hover:bg-indigo-600 shadow-md transition duration-150"
                      >
                        Save Configuration Changes
                      </button>
                    </div>
                  </form>
                </div>
                {/* 2. Admin password modification */}
                <div className={`${cardClass} p-6 rounded-2xl border shadow-lg flex flex-col gap-6`}>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-850 dark:text-zinc-100">Access Key Settings</h2>
                    <p className="text-xs text-zinc-550 dark:text-zinc-450 mt-0.5">
                      Configure password parameters to secure configuration menus.
                    </p>
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const savedPassword = localStorage.getItem("admin_portal_password") || "admin123";
                      if (adminCurrentPassword !== savedPassword) {
                        alert("Current password input matches no records!");
                        return;
                      }
                      if (!adminNewPassword.trim()) {
                        alert("New password cannot be blank!");
                        return;
                      }
                      localStorage.setItem("admin_portal_password", adminNewPassword.trim());
                      setAdminCurrentPassword("");
                      setAdminNewPassword("");
                      alert("Administrative credentials updated successfully!");
                    }}
                    className="space-y-4 text-xs"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                          Current Key Password
                        </label>
                        <input
                          type="password"
                          required
                          value={adminCurrentPassword}
                          onChange={(e) => setAdminCurrentPassword(e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none font-mono ${inputClass}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                          New Access Password
                        </label>
                        <input
                          type="password"
                          required
                          value={adminNewPassword}
                          onChange={(e) => setAdminNewPassword(e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none font-mono ${inputClass}`}
                        />
                      </div>
                    </div>
                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        className="px-5 py-2 text-white font-bold rounded-lg bg-indigo-650 hover:bg-indigo-600 shadow-md transition duration-150"
                      >
                        Update Access Credentials
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {/* --- MODALS --- */}
      {/* 1. Add Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-start md:items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className={`${cardClass} w-full p-6 shadow-2xl relative transition-all duration-300 ${!isEditProductMode && newProductCategory && productVariants.length > 0 ? "max-w-4xl" : "max-w-md"}`}>
            <button 
              onClick={closeProductModal}
              className={`absolute top-4 right-4 p-1 rounded transition duration-150 ${isDark ? "hover:bg-zinc-800 text-zinc-400 hover:text-white" : "hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900"}`}
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isDark ? "text-zinc-100" : "text-zinc-800"}`}>
              <Package className="h-5 w-5 text-indigo-500" /> {isEditProductMode ? "Edit" : "New"} Product Definition
            </h2>
            <form onSubmit={handleSaveProduct} className="flex flex-col max-h-[75vh] md:max-h-[82vh]">
              <div className="flex-1 overflow-y-auto pr-2 pb-2 scrollbar-thin">
                <div className={!isEditProductMode && newProductCategory && productVariants.length > 0 ? "grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" : "space-y-4"}>
                  {/* Left Column: Product Info */}
                  <div className={!isEditProductMode && newProductCategory && productVariants.length > 0 ? "lg:col-span-5 space-y-4" : "space-y-4"}>
                    <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                  {isEditProductMode ? "Product Name" : "Base Product Name"}
                </label>
                <input 
                  type="text" 
                  required
                  placeholder={isEditProductMode ? "e.g. 2 JAR Gift Box" : "e.g. Luxury Gift Box"}
                  value={newProductName}
                  onChange={e => setNewProductName(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${inputClass}`}
                />
              </div>
              {/* Category Select - Always visible */}
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Category</label>
                <select 
                  required
                  value={newProductCategory}
                  onChange={e => setNewProductCategory(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${inputClass}`}
                >
                  <option value="">Select Category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              {/* Supplier Code - Alphanumeric Optional */}
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                  Supplier Code <span className={`text-[10px] lowercase font-normal ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>(optional)</span>
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. SP-BOX-02J"
                  value={newProductSupplierCode}
                  onChange={e => setNewProductSupplierCode(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${inputClass}`}
                />
              </div>
              {/* Photo URLs - Always visible */}
              <div className="relative">
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                  Photo URL(s) <span className="text-[10px] text-zinc-500 font-normal">(JPG or PNG format)</span>
                </label>
                <div className="space-y-2">
                  <input 
                    type="text" 
                    placeholder="e.g. /gift_box_2jar.jpg"
                    value={newProductPhotos}
                    onChange={e => setNewProductPhotos(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${inputClass}`}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAssetSelector(!showAssetSelector)}
                      className={`w-full py-2 px-3 border rounded-lg text-xs font-semibold transition duration-150 flex items-center justify-center gap-1.5 select-none ${
                        showAssetSelector
                          ? "bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-500"
                          : (isDark ? "bg-zinc-950 hover:bg-zinc-850 border-zinc-808 hover:border-zinc-700 text-indigo-400 hover:text-indigo-300" : "bg-slate-50 hover:bg-slate-100 border-slate-205 hover:border-slate-300 text-indigo-650 hover:text-indigo-700")
                      }`}
                    >
                      <Image className="h-4 w-4" /> Preset Path
                    </button>
                    <label
                      className={`w-full py-2 px-3 border rounded-lg text-xs font-semibold transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer select-none ${
                        isDark ? "bg-zinc-950 hover:bg-zinc-850 border-zinc-808 hover:border-zinc-700 text-emerald-450 hover:text-emerald-400" : "bg-slate-50 hover:bg-slate-100 border-slate-205 hover:border-slate-300 text-emerald-600 hover:text-emerald-700"
                      }`}
                    >
                      <Plus className="h-4 w-4" /> Local Drive
                      <input 
                        type="file" 
                        accept="image/png, image/jpeg" 
                        onChange={handleLocalImageUpload}
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>
                {/* Asset selector dropdown */}
                {showAssetSelector && (
                  <div className={`absolute left-0 right-0 mt-2 p-2.5 rounded-xl border border-dashed flex flex-col gap-2 transition-all duration-150 z-20 ${isDark ? "bg-zinc-950/95 backdrop-blur-md border-zinc-808/80 shadow-xl" : "bg-white/95 backdrop-blur-md border-slate-205 shadow-lg"}`}>
                    <div 
                      onClick={() => {
                        setNewProductPhotos("/gift_box_2jar.jpg");
                        setShowAssetSelector(false);
                      }}
                      className={`p-2 rounded-lg border cursor-pointer flex items-center gap-3 transition-all duration-150 ${isDark ? "bg-zinc-900 border-zinc-808 hover:border-zinc-700 hover:bg-zinc-850" : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}
                    >
                      <div className="h-9 w-9 rounded overflow-hidden border border-slate-200 dark:border-zinc-800 bg-zinc-900 shrink-0">
                        <img src="/gift_box_2jar.jpg" alt="Gift Box" className="w-full h-full object-cover" />
                      </div>
                      <div className="overflow-hidden text-left">
                        <span className={`text-xs font-bold block truncate ${isDark ? "text-zinc-200" : "text-slate-700"}`}>gift_box_2jar.jpg</span>
                        <span className="text-[10px] text-zinc-500 block font-mono">Format: JPG</span>
                      </div>
                    </div>
                    <div 
                      onClick={() => {
                        setNewProductPhotos("/peacock_tray.jpg");
                        setShowAssetSelector(false);
                      }}
                      className={`p-2 rounded-lg border cursor-pointer flex items-center gap-3 transition-all duration-150 ${isDark ? "bg-zinc-900 border-zinc-808 hover:border-zinc-700 hover:bg-zinc-850" : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}
                    >
                      <div className="h-9 w-9 rounded overflow-hidden border border-slate-200 dark:border-zinc-800 bg-zinc-900 shrink-0">
                        <img src="/peacock_tray.jpg" alt="Peacock Tray" className="w-full h-full object-cover" />
                      </div>
                      <div className="overflow-hidden text-left">
                        <span className={`text-xs font-bold block truncate ${isDark ? "text-zinc-200" : "text-slate-700"}`}>peacock_tray.jpg</span>
                        <span className="text-[10px] text-zinc-500 block font-mono">Format: JPG</span>
                      </div>
                    </div>
                  </div>
                )}
                {/* Formatting warning */}
                {newProductPhotos && !newProductPhotos.split(",").every(url => url.trim().startsWith("data:image/") || url.trim().match(/\.(jpg|jpeg|png)$/i)) && (
                  <span className="text-[10px] text-rose-500 font-semibold block mt-1.5 flex items-center gap-1">
                    ⚠️ Please ensure paths end with a valid image format (.jpg or .png) or are uploaded from drive
                  </span>
                )}
              </div>
              {/* EDIT MODE: Single product configuration */}
              {isEditProductMode && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Sub-Type</label>
                    <select 
                      required
                      value={newProductSubtype}
                      onChange={e => setNewProductSubtype(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${inputClass}`}
                    >
                      <option value="">Select Subtype</option>
                      {subTypes.filter(s => s.category_id === newProductCategory).map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Selling Price (₹)</label>
                    <input 
                      type="number" 
                      min="0"
                      required
                      value={newProductPrice}
                      onChange={e => setNewProductPrice(Number(e.target.value))}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none font-mono ${inputClass}`}
                    />
                  </div>
                </div>
              )}
                  </div>
                  {/* Right Column: Variants Allocations */}
                  <div className={!isEditProductMode && newProductCategory && productVariants.length > 0 ? "lg:col-span-7 space-y-4" : "space-y-4"}>
                    {/* CREATE MODE: Variant Table or fallback */}
                    {!isEditProductMode && (
                <>
                  {/* Category selected and variants exist: Show Variants Table */}
                  {newProductCategory && productVariants.length > 0 ? (
                    <div className="space-y-4">
                      {/* Subtype Variants Allocation Table */}
                      <div className="space-y-2">
                        <label className={`block text-xs font-bold uppercase tracking-wider ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                          Sub-Type Price & Stock Allocation Table
                        </label>
                        <div className={`border rounded-xl overflow-x-auto max-h-60 overflow-y-auto ${isDark ? "border-zinc-808 bg-zinc-950/20" : "border-slate-200 bg-slate-50/20"}`}>
                          <table className="w-full min-w-[550px] text-left border-collapse text-xs">
                            <thead>
                              <tr className={`border-b text-[10px] font-semibold uppercase tracking-wider ${isDark ? "bg-zinc-900 text-zinc-400 border-zinc-800" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                                <th className="py-2 px-3 text-center w-8">On</th>
                                <th className="py-2 px-3">Sub-Type</th>
                                <th className="py-2 px-3 w-24">Price (₹)</th>
                                <th className="py-2 px-3 w-32">Location</th>
                                <th className="py-2 px-3 w-16">Qty</th>
                              </tr>
                            </thead>
                            <tbody className={`divide-y ${isDark ? "divide-zinc-900" : "divide-slate-250/50"}`}>
                              {productVariants.map((variant, idx) => (
                                <tr key={variant.subTypeId} className={`transition duration-150 ${variant.selected ? "" : "opacity-40"}`}>
                                  <td className="py-2 px-3 text-center">
                                    <input 
                                      type="checkbox"
                                      checked={variant.selected}
                                      onChange={e => {
                                        const updated = [...productVariants];
                                        updated[idx].selected = e.target.checked;
                                        setProductVariants(updated);
                                      }}
                                      className="rounded border-zinc-350 text-indigo-650 focus:ring-indigo-500"
                                    />
                                  </td>
                                  <td className={`py-2 px-3 font-semibold ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                                    {variant.subTypeName}
                                  </td>
                                  <td className="py-2 px-3">
                                    <input 
                                      type="number"
                                      min="0"
                                      disabled={!variant.selected}
                                      value={variant.price || ""}
                                      onFocus={e => e.target.select()}
                                      onChange={e => {
                                        const updated = [...productVariants];
                                        updated[idx].price = Number(e.target.value);
                                        setProductVariants(updated);
                                      }}
                                      className={`w-full px-2 py-1 border rounded focus:outline-none font-mono text-xs ${inputClass}`}
                                    />
                                  </td>
                                  <td className="py-2 px-3">
                                    <select
                                      disabled={!variant.selected}
                                      value={variant.locationId}
                                      onChange={e => {
                                        const updated = [...productVariants];
                                        updated[idx].locationId = e.target.value;
                                        setProductVariants(updated);
                                      }}
                                      className={`w-full px-1 py-1 border rounded focus:outline-none text-xs ${inputClass}`}
                                    >
                                      <option value="">No Stock</option>
                                      {locations.map(l => (
                                        <option key={l.id} value={l.id}>{l.name}</option>
                                      ))}
                                    </select>
                                  </td>
                                  <td className="py-2 px-3">
                                    <input 
                                      type="number"
                                      min="0"
                                      placeholder="0"
                                      disabled={!variant.selected}
                                      value={variant.quantity || ""}
                                      onFocus={e => e.target.select()}
                                      onChange={e => {
                                        const updated = [...productVariants];
                                        updated[idx].quantity = Number(e.target.value);
                                        setProductVariants(updated);
                                      }}
                                      className={`w-full px-2 py-1 border rounded focus:outline-none font-mono text-xs ${inputClass}`}
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Warning if category has no subtypes */}
                      {newProductCategory && productVariants.length === 0 && (
                        <div className={`p-3 rounded-lg border text-center text-xs ${isDark ? "bg-amber-950/20 border-amber-900/30 text-amber-450" : "bg-amber-50 border-amber-100 text-amber-700"}`}>
                          No active sub-types registered for this category yet. 
                          Please register sub-types first in the "System Setup" tab to create variants, or add a single item below.
                        </div>
                      )}
                      {/* FALLBACK: Single item input */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Sub-Type</label>
                          <select 
                            required
                            value={newProductSubtype}
                            onChange={e => setNewProductSubtype(e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${inputClass}`}
                          >
                            <option value="">Select Subtype</option>
                            {subTypes.filter(s => s.category_id === newProductCategory).map(s => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Selling Price (₹)</label>
                          <input 
                            type="number" 
                            min="0"
                            required
                            value={newProductPrice}
                            onChange={e => setNewProductPrice(Number(e.target.value))}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none font-mono ${inputClass}`}
                          />
                        </div>
                      </div>
                      {/* Fallback Single Location Stock allocation */}
                      <div className={`border-t pt-4 space-y-4 ${isDark ? "border-zinc-808" : "border-zinc-150"}`}>
                        <div className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            id="isMultiLocationStock" 
                            checked={isMultiLocationStock} 
                            onChange={e => setIsMultiLocationStock(e.target.checked)} 
                            className="rounded border-zinc-350 text-indigo-650 focus:ring-indigo-505"
                          />
                          <label htmlFor="isMultiLocationStock" className={`text-xs font-semibold cursor-pointer select-none ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                            Distribute stock across multiple locations?
                          </label>
                        </div>
                        {!isMultiLocationStock ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Initial Location</label>
                              <select 
                                 value={initialLocationId}
                                 onChange={e => setInitialLocationId(e.target.value)}
                                 className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${inputClass}`}
                              >
                                <option value="">No Stock (Catalog Only)</option>
                                {locations.map(l => (
                                  <option key={l.id} value={l.id}>{l.name}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Initial Quantity</label>
                              <input 
                                type="number" 
                                min="0"
                                value={initialQuantity || ""}
                                onChange={e => setInitialQuantity(Number(e.target.value))}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none font-mono ${inputClass}`}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3 bg-slate-50/50 dark:bg-zinc-950/20 p-3 rounded-xl border border-slate-100 dark:border-zinc-808/30">
                            <label className={`block text-xs font-bold uppercase tracking-wider ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                              Location Allocations
                            </label>
                            {initialStocks.map((stockEntry, sIdx) => (
                              <div key={sIdx} className="flex gap-2 items-center">
                                <select 
                                  value={stockEntry.locationId}
                                  onChange={e => {
                                    const updated = [...initialStocks];
                                    updated[sIdx].locationId = e.target.value;
                                    setInitialStocks(updated);
                                  }}
                                  className={`flex-1 px-3 py-1.5 text-xs border rounded-lg focus:outline-none ${inputClass}`}
                                >
                                  <option value="">Select Location</option>
                                  {locations.map(l => (
                                    <option key={l.id} value={l.id}>{l.name}</option>
                                  ))}
                                </select>
                                <input 
                                  type="number"
                                  min="0"
                                  placeholder="Qty"
                                  value={stockEntry.quantity || ""}
                                  onChange={e => {
                                    const updated = [...initialStocks];
                                    updated[sIdx].quantity = Number(e.target.value);
                                    setInitialStocks(updated);
                                  }}
                                  className={`w-20 px-3 py-1.5 text-xs border rounded-lg focus:outline-none font-mono ${inputClass}`}
                                />
                                {initialStocks.length > 1 && (
                                  <button 
                                    type="button"
                                    onClick={() => {
                                      setInitialStocks(initialStocks.filter((_, idx) => idx !== sIdx));
                                    }}
                                    className={`p-1.5 rounded transition duration-150 ${isDark ? "text-rose-400 hover:bg-zinc-900" : "text-rose-600 hover:bg-rose-50"}`}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                            <button 
                              type="button"
                              onClick={() => setInitialStocks([...initialStocks, { locationId: "", quantity: 0 }])}
                              className="text-[10px] font-bold text-indigo-650 hover:text-indigo-500 flex items-center gap-1 mt-1 transition duration-150"
                            >
                              <Plus className="h-3 w-3" /> Add Location Allocation
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </>
              )}
                  </div>
                </div>
              </div>
              <div className={`pt-4 flex justify-end gap-3 border-t mt-2 ${isDark ? "border-zinc-808/60" : "border-zinc-150"}`}>
                <button 
                  type="button" 
                  onClick={closeProductModal}
                  className={`px-4 py-2 text-sm border rounded-lg transition duration-150 ${isDark ? "bg-zinc-950 hover:bg-zinc-850 border-zinc-850 text-zinc-400" : "bg-white hover:bg-zinc-100 border-zinc-205 text-zinc-650 hover:text-zinc-850 shadow-xs"}`}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-sm transition duration-150"
                >
                  {isEditProductMode ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* 2. Update Stock Modal */}
      {isStockModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-start md:items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className={`${cardClass} w-full max-w-xl p-6 shadow-2xl relative`}>
            <button 
              onClick={() => {
                setStockModalCategoryFilter("all");
                setStockModalSearchQuery("");
                setActiveStockAdditiveDropdown(false);
                setStockAdditiveSearchQuery("");
                setIsStockModalOpen(false);
              }}
              className={`absolute top-4 right-4 p-1 rounded transition duration-150 cursor-pointer ${isDark ? "hover:bg-zinc-800 text-zinc-400 hover:text-white" : "hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900"}`}
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isDark ? "text-zinc-100" : "text-zinc-800"}`}>
              <Layers className="h-5 w-5 text-indigo-500" /> Update Stock Quantities
            </h2>
            <form onSubmit={handleUpdateStock} className="space-y-4">
              
              {/* Toggle stock category type */}
              <div className="flex gap-2 p-1 bg-zinc-950/20 dark:bg-zinc-900/40 rounded-xl border border-zinc-808/30 w-full mb-4">
                <button
                  type="button"
                  onClick={() => setStockModalType("product")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                    stockModalType === "product" ? "bg-indigo-600 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Product Box
                </button>
                <button
                  type="button"
                  onClick={() => setStockModalType("additive")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                    stockModalType === "additive" ? "bg-indigo-600 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Dryfruit Filling
                </button>
              </div>

              {stockModalType === "product" ? (
                <>
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-xl border border-dashed border-slate-200 dark:border-zinc-808/60 bg-slate-50/30 dark:bg-zinc-950/20">
                    <div>
                      <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? "text-zinc-450" : "text-zinc-500"}`}>Filter by Category</label>
                      <select
                        value={stockModalCategoryFilter}
                        onChange={e => setStockModalCategoryFilter(e.target.value)}
                        className={`w-full px-2.5 py-1.5 border rounded-lg focus:outline-none text-xs ${inputClass}`}
                      >
                        <option value="all">All Categories</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? "text-zinc-450" : "text-zinc-500"}`}>Search Product Name</label>
                      <input
                        type="text"
                        placeholder="Type to search..."
                        value={stockModalSearchQuery}
                        onChange={e => setStockModalSearchQuery(e.target.value)}
                        className={`w-full px-2.5 py-1.5 border rounded-lg focus:outline-none text-xs ${inputClass}`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Product</label>
                    <select 
                      required={stockModalType === "product"}
                      value={stockProductId}
                      onChange={e => setStockProductId(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${inputClass}`}
                    >
                      <option value="">Select Product ({filteredStockProducts.length} items found)</option>
                      {filteredStockProducts.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (₹{p.price || 0})</option>
                      ))}
                    </select>
                  </div>

                  {stockProductId && (
                    <div className={`p-3 rounded-xl border space-y-2 ${isDark ? "bg-zinc-950/20 border-zinc-808/50" : "bg-slate-100/30 border-slate-200"}`}>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Current Storage Locations & Stock:</span>
                      {stock.filter(st => st.product_id === stockProductId && st.quantity > 0 && st.deleted_at === null).length === 0 ? (
                        <span className="text-xs text-zinc-500 italic block">No active stock found in any location (0 units in stock)</span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {stock.filter(st => st.product_id === stockProductId && st.quantity > 0 && st.deleted_at === null).map(st => (
                            <span 
                              key={st.id} 
                              className={`px-2 py-0.5 text-[10px] font-semibold font-mono rounded-md border flex items-center gap-1 ${
                                isDark 
                                  ? "bg-zinc-950/60 border-zinc-808/60 text-zinc-300" 
                                  : "bg-slate-50 border-slate-200 text-slate-700"
                              }`}
                            >
                              <MapPin className="h-2.5 w-2.5 text-indigo-500 shrink-0" />
                              <span>{getLocationName(st.storage_location_id)}: <strong>{st.quantity}</strong> avl</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="relative">
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                      Dryfruit Ingredient
                    </label>
                    <input type="hidden" required={stockModalType === "additive"} value={stockAdditiveId} />
                    
                    <button
                      type="button"
                      onClick={() => {
                        setActiveStockAdditiveDropdown(!activeStockAdditiveDropdown);
                        setStockAdditiveSearchQuery("");
                      }}
                      className={`w-full px-3 py-2 border rounded-lg text-left text-xs flex items-center justify-between transition duration-150 cursor-pointer ${
                        isDark ? "bg-zinc-950 border-zinc-850 text-zinc-200" : "bg-white border-slate-200 text-slate-800"
                      }`}
                    >
                      <span className="truncate font-semibold">
                        {stockAdditiveId 
                          ? (additives.find(a => a.id === stockAdditiveId)?.name || "Select Dryfruit Ingredient...") 
                          : "Select Dryfruit Ingredient..."}
                      </span>
                      <ChevronDown className="h-4 w-4 text-zinc-550 shrink-0" />
                    </button>

                    {activeStockAdditiveDropdown && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setActiveStockAdditiveDropdown(false)} />
                        
                        <div className={`absolute left-0 right-0 mt-1.5 p-2 rounded-xl border z-45 flex flex-col gap-2 shadow-xl ${
                          isDark ? "bg-zinc-950 border-zinc-808 shadow-zinc-950/80" : "bg-white border-slate-205 shadow-slate-200/50"
                        }`}>
                          <div className="relative">
                            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-550" />
                            <input
                              type="text"
                              placeholder="Search dryfruit ingredient..."
                              value={stockAdditiveSearchQuery}
                              autoFocus
                              onChange={e => setStockAdditiveSearchQuery(e.target.value)}
                              className={`w-full pl-8 pr-2 py-1.5 text-xs border rounded-md focus:outline-none ${inputClass}`}
                            />
                          </div>

                          <div className="max-h-48 overflow-y-auto space-y-1 scrollbar-thin">
                            {additives
                              .filter(a => a.deleted_at === null && a.name.toLowerCase().includes(stockAdditiveSearchQuery.toLowerCase()))
                              .length === 0 ? (
                                <div className="p-2 text-center text-xs text-zinc-500 italic">
                                  No ingredients found
                                </div>
                              ) : (
                                additives
                                  .filter(a => a.deleted_at === null && a.name.toLowerCase().includes(stockAdditiveSearchQuery.toLowerCase()))
                                  .map(add => {
                                    const isSelected = stockAdditiveId === add.id;
                                    return (
                                      <div
                                        key={add.id}
                                        onClick={() => {
                                          setStockAdditiveId(add.id);
                                          setActiveStockAdditiveDropdown(false);
                                        }}
                                        className={`p-2 rounded-lg text-left transition duration-155 flex items-center justify-between text-xs font-semibold cursor-pointer ${
                                          isSelected
                                            ? "bg-indigo-600 text-white"
                                            : (isDark ? "hover:bg-zinc-850 text-zinc-300" : "hover:bg-slate-100 text-slate-700")
                                        }`}
                                      >
                                        <span>{add.name}</span>
                                        <span className={`font-mono text-[10px] ${isSelected ? "text-indigo-200" : "text-zinc-500"}`}>
                                          ₹{add.price_per_kg}/kg
                                        </span>
                                      </div>
                                    );
                                  })
                              )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {stockAdditiveId && (
                    <div className={`p-3 rounded-xl border space-y-2 ${isDark ? "bg-zinc-950/20 border-zinc-808/50" : "bg-slate-100/30 border-slate-200"}`}>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Current Storage Locations & Stock (kg):</span>
                      {stock.filter(st => st.additive_id === stockAdditiveId && st.quantity > 0 && st.deleted_at === null).length === 0 ? (
                        <span className="text-xs text-zinc-500 italic block">No active stock found in any location (0 kg in stock)</span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {stock.filter(st => st.additive_id === stockAdditiveId && st.quantity > 0 && st.deleted_at === null).map(st => (
                            <span 
                              key={st.id} 
                              className={`px-2 py-0.5 text-[10px] font-semibold font-mono rounded-md border flex items-center gap-1 ${
                                isDark 
                                  ? "bg-zinc-950/60 border-zinc-808/60 text-zinc-300" 
                                  : "bg-slate-50 border-slate-200 text-slate-700"
                              }`}
                            >
                              <MapPin className="h-2.5 w-2.5 text-indigo-500 shrink-0" />
                              <span>{getLocationName(st.storage_location_id)}: <strong>{st.quantity.toFixed(2)} kg</strong> avl</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Location</label>
                <select 
                  required
                  value={stockLocationId}
                  onChange={e => setStockLocationId(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${inputClass}`}
                >
                  <option value="">Select Location</option>
                  {locations.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                  {stockModalType === "product" ? "Quantity (units)" : "Quantity (kg)"}
                </label>
                <input 
                  type="text" 
                  required
                  value={stockQuantity}
                  onChange={e => {
                    const regex = stockModalType === "product" ? /[^0-9]/g : /[^0-9.]/g;
                    const val = e.target.value.replace(regex, '');
                    setStockQuantity(val ? Number(val) : 0);
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none font-mono font-bold ${inputClass}`}
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => {
                    setStockModalCategoryFilter("all");
                    setStockModalSearchQuery("");
                    setIsStockModalOpen(false);
                  }}
                  className={`px-4 py-2 text-sm border rounded-lg transition duration-150 cursor-pointer ${isDark ? "bg-zinc-950 hover:bg-zinc-850 border-zinc-850 text-zinc-400" : "bg-white hover:bg-zinc-100 border-zinc-205 text-zinc-600 hover:text-zinc-850 shadow-xs"}`}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-sm transition duration-150 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* 3. Add Param Setup Modal */}
      {isSetupModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-start md:items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className={`${cardClass} w-full max-w-sm p-6 shadow-2xl relative`}>
            <button 
              onClick={() => {
                setIsSetupModalOpen(false);
                setSetupName("");
                setSetupCategoryId("");
                setIsEditMode(false);
                setEditItemId("");
              }}
              className={`absolute top-4 right-4 p-1 rounded transition duration-150 ${isDark ? "hover:bg-zinc-800 text-zinc-400 hover:text-white" : "hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900"}`}
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 capitalize ${isDark ? "text-zinc-100" : "text-zinc-800"}`}>
              <Sparkles className="h-5 w-5 text-indigo-500" /> {isEditMode ? "Edit" : "Add"} {setupModalType}
            </h2>
            {!isEditMode && (
              <div className={`grid grid-cols-4 p-1 rounded-lg mb-4 text-[9px] font-bold uppercase tracking-wider border ${isDark ? "bg-zinc-950 border-zinc-855" : "bg-zinc-100 border-zinc-200"}`}>
                <button 
                  type="button"
                  onClick={() => setSetupModalType("category")}
                  className={`py-1.5 text-center rounded-md transition duration-150 ${setupModalType === "category" ? (isDark ? "bg-zinc-800 text-white" : "bg-white text-zinc-800 shadow-sm") : (isDark ? "text-zinc-500 hover:text-zinc-300" : "text-zinc-500 hover:text-zinc-850")}`}
                >
                  Category
                </button>
                <button 
                  type="button"
                  onClick={() => setSetupModalType("subtype")}
                  className={`py-1.5 text-center rounded-md transition duration-150 ${setupModalType === "subtype" ? (isDark ? "bg-zinc-800 text-white" : "bg-white text-zinc-800 shadow-sm") : (isDark ? "text-zinc-500 hover:text-zinc-300" : "text-zinc-500 hover:text-zinc-850")}`}
                >
                  Subtype
                </button>
                <button 
                  type="button"
                  onClick={() => setSetupModalType("location")}
                  className={`py-1.5 text-center rounded-md transition duration-150 ${setupModalType === "location" ? (isDark ? "bg-zinc-800 text-white" : "bg-white text-zinc-800 shadow-sm") : (isDark ? "text-zinc-500 hover:text-zinc-300" : "text-zinc-500 hover:text-zinc-850")}`}
                >
                  Location
                </button>
                <button 
                  type="button"
                  onClick={() => setSetupModalType("additive")}
                  className={`py-1.5 text-center rounded-md transition duration-150 ${setupModalType === "additive" ? (isDark ? "bg-zinc-800 text-white" : "bg-white text-zinc-800 shadow-sm") : (isDark ? "text-zinc-500 hover:text-zinc-300" : "text-zinc-500 hover:text-zinc-850")}`}
                >
                  Additive
                </button>
              </div>
            )}
            <form onSubmit={handleAddSetupItem} className="space-y-4">
              {setupModalType === "subtype" && (
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>For Category</label>
                  <select 
                    required
                    value={setupCategoryId}
                    onChange={e => setSetupCategoryId(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${inputClass}`}
                  >
                    <option value="">Select Parent Category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 capitalize ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Name</label>
                <input 
                  type="text" 
                  required
                  placeholder={`e.g. New ${setupModalType}`}
                  value={setupName}
                  onChange={e => setSetupName(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${inputClass}`}
                />
              </div>
              {setupModalType === "additive" && (
                <div className="grid grid-cols-2 gap-2 animate-fadeIn">
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Pricing Unit</label>
                    <select
                      value={additivePriceOption}
                      onChange={e => setAdditivePriceOption(e.target.value as "100g" | "1kg")}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${inputClass}`}
                    >
                      <option value="1kg">Per 1 kg</option>
                      <option value="100g">Per 100 gm</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Price (₹)</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. 800"
                      value={additivePrice}
                      onChange={e => setAdditivePrice(e.target.value.replace(/[^0-9.]/g, ""))}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${inputClass}`}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Stock Level (kg)</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. 10"
                      value={additiveStockQty}
                      onChange={e => setAdditiveStockQty(e.target.value.replace(/[^0-9.]/g, ""))}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${inputClass}`}
                    />
                  </div>
                  <div className="col-span-2 text-[10px] text-zinc-500 italic leading-normal">
                    Stored as: ₹{Number(additivePrice) ? (additivePriceOption === "100g" ? Number(additivePrice) * 10 : Number(additivePrice)) : 0} per 1 kg.
                  </div>
                </div>
              )}
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsSetupModalOpen(false);
                    setSetupName("");
                    setSetupCategoryId("");
                    setIsEditMode(false);
                    setEditItemId("");
                  }}
                  className={`px-4 py-2 text-sm border rounded-lg transition duration-150 ${isDark ? "bg-zinc-950 hover:bg-zinc-850 border-zinc-855 text-zinc-400" : "bg-white hover:bg-zinc-100 border-zinc-205 text-zinc-650 hover:text-zinc-850 shadow-xs"}`}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-sm transition duration-150"
                >
                  {isEditMode ? "Save Changes" : "Add Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Damaged Stock Modal */}
      {isDamagedStockModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-start md:items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className={`${cardClass} w-full max-w-md p-6 shadow-2xl relative rounded-2xl`}>
            <button 
              onClick={() => setIsDamagedStockModalOpen(false)}
              className={`absolute top-4 right-4 p-1 rounded transition duration-150 cursor-pointer ${isDark ? "hover:bg-zinc-800 text-zinc-400 hover:text-white" : "hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900"}`}
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isDark ? "text-zinc-100" : "text-zinc-800"}`}>
              <AlertTriangle className="h-5 w-5 text-rose-500 animate-pulse" /> Record Damaged Stock
            </h2>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (damagedModalType === "product") {
                  if (!damagedProductId) {
                    alert("Please select a product first.");
                    return;
                  }
                } else {
                  if (!damagedAdditiveId) {
                    alert("Please select a dryfruit first.");
                    return;
                  }
                }
                if (!damagedLocationId) {
                  alert("Please select a storage location.");
                  return;
                }
                const qty = Number(damagedQuantity);
                if (qty <= 0) {
                  alert("Please enter a valid quantity.");
                  return;
                }

                try {
                  if (damagedModalType === "product") {
                    localDB.addDamagedStock(damagedProductId, damagedLocationId, qty, null);
                  } else {
                    localDB.addDamagedStock(null, damagedLocationId, qty, damagedAdditiveId);
                  }
                  alert("Damaged stock logged and subtracted from available inventory.");
                  loadData();
                  setIsDamagedStockModalOpen(false);
                  setDamagedProductId("");
                  setDamagedAdditiveId("");
                  setDamagedLocationId("");
                  setDamagedQuantity("");
                  setDamagedSearchQuery("");
                } catch (err: any) {
                  alert(err.message || "Failed to mark stock as damaged.");
                }
              }} 
              className="space-y-4"
            >
              {/* Toggle stock category type */}
              <div className="flex gap-2 p-1 bg-zinc-950/20 dark:bg-zinc-900/40 rounded-xl border border-zinc-808/30 w-full mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setDamagedModalType("product");
                    setDamagedProductId("");
                    setDamagedAdditiveId("");
                    setDamagedSearchQuery("");
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                    damagedModalType === "product" ? "bg-indigo-600 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Product Box
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDamagedModalType("additive");
                    setDamagedProductId("");
                    setDamagedAdditiveId("");
                    setDamagedSearchQuery("");
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                    damagedModalType === "additive" ? "bg-indigo-600 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Dryfruit Filling
                </button>
              </div>

              {damagedModalType === "product" ? (
                /* Product Autocomplete Selector */
                <div className="relative">
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Select Product</label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Search product by name or supplier..."
                      value={damagedSearchQuery}
                      onChange={e => setDamagedSearchQuery(e.target.value)}
                      className={`w-full pl-9 pr-8 py-2 text-xs border rounded-lg focus:outline-none ${inputClass}`}
                    />
                    {damagedProductId && !damagedSearchQuery && (
                      <span className="absolute right-3 top-2.5 text-xs text-indigo-500 font-bold">
                        ✓ Selected
                      </span>
                    )}
                  </div>

                  {damagedSearchQuery && (
                    <div className={`absolute left-0 right-0 mt-1 p-2 rounded-xl border z-50 max-h-48 overflow-y-auto shadow-xl ${
                      isDark ? "bg-zinc-950 border-zinc-808 shadow-zinc-950/80" : "bg-white border-slate-205 shadow-slate-250/50"
                    }`}>
                      {products
                        .filter(p => p.deleted_at === null)
                        .filter(p => p.name.toLowerCase().includes(damagedSearchQuery.toLowerCase()) || (p.supplier_code && p.supplier_code.toLowerCase().includes(damagedSearchQuery.toLowerCase())))
                        .slice(0, 10)
                        .map(p => {
                          const avlStock = getProductStock(p.id);
                          return (
                            <div
                              key={p.id}
                              onClick={() => {
                                setDamagedProductId(p.id);
                                setDamagedSearchQuery("");
                              }}
                              className={`p-2 rounded-lg cursor-pointer text-xs flex justify-between items-center transition ${
                                isDark ? "hover:bg-zinc-900 text-zinc-200" : "hover:bg-slate-100 text-slate-700"
                              }`}
                            >
                              <span>{p.name} {p.supplier_code ? `(${p.supplier_code})` : ""}</span>
                              <span className="text-[10px] text-zinc-550">Stock: {avlStock} units</span>
                            </div>
                          );
                        })}
                      {products
                        .filter(p => p.deleted_at === null)
                        .filter(p => p.name.toLowerCase().includes(damagedSearchQuery.toLowerCase())).length === 0 && (
                          <div className="text-[10px] italic text-zinc-500 text-center py-2">No matching products</div>
                        )}
                  </div>
                  )}

                  {damagedProductId && (
                    <div className={`mt-2 p-2.5 rounded-lg border text-xs flex justify-between items-center ${
                      isDark ? "bg-zinc-900/40 border-zinc-808/50 text-zinc-300" : "bg-slate-50 border-slate-200 text-slate-700"
                    }`}>
                      <span>Selected: <span className="font-extrabold text-indigo-505">{products.find(p => p.id === damagedProductId)?.name}</span></span>
                      <button 
                        type="button" 
                        onClick={() => setDamagedProductId("")} 
                        className="text-rose-500 text-[10px] hover:underline cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Dryfruits Autocomplete Selector */
                <div className="relative">
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Select Dryfruit</label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Search dryfruits by name..."
                      value={damagedSearchQuery}
                      onChange={e => setDamagedSearchQuery(e.target.value)}
                      className={`w-full pl-9 pr-8 py-2 text-xs border rounded-lg focus:outline-none ${inputClass}`}
                    />
                    {damagedAdditiveId && !damagedSearchQuery && (
                      <span className="absolute right-3 top-2.5 text-xs text-indigo-500 font-bold">
                        ✓ Selected
                      </span>
                    )}
                  </div>

                  {damagedSearchQuery && (
                    <div className={`absolute left-0 right-0 mt-1 p-2 rounded-xl border z-50 max-h-48 overflow-y-auto shadow-xl ${
                      isDark ? "bg-zinc-950 border-zinc-808 shadow-zinc-950/80" : "bg-white border-slate-205 shadow-slate-250/50"
                    }`}>
                      {additives
                        .filter(a => a.deleted_at === null)
                        .filter(a => a.name.toLowerCase().includes(damagedSearchQuery.toLowerCase()))
                        .slice(0, 10)
                        .map(a => {
                          const avlStock = stock.filter(st => st.additive_id === a.id && st.deleted_at === null).reduce((sum, st) => sum + st.quantity, 0);
                          return (
                            <div
                              key={a.id}
                              onClick={() => {
                                setDamagedAdditiveId(a.id);
                                setDamagedSearchQuery("");
                              }}
                              className={`p-2 rounded-lg cursor-pointer text-xs flex justify-between items-center transition ${
                                isDark ? "hover:bg-zinc-900 text-zinc-200" : "hover:bg-slate-100 text-slate-700"
                              }`}
                            >
                              <span>{a.name}</span>
                              <span className="text-[10px] text-zinc-555">Stock: {avlStock.toFixed(2)} kg</span>
                            </div>
                          );
                        })}
                      {additives
                        .filter(a => a.deleted_at === null)
                        .filter(a => a.name.toLowerCase().includes(damagedSearchQuery.toLowerCase())).length === 0 && (
                          <div className="text-[10px] italic text-zinc-500 text-center py-2">No matching dryfruits</div>
                        )}
                    </div>
                  )}

                  {damagedAdditiveId && (
                    <div className={`mt-2 p-2.5 rounded-lg border text-xs flex justify-between items-center ${
                      isDark ? "bg-zinc-900/40 border-zinc-808/50 text-zinc-300" : "bg-slate-50 border-slate-200 text-slate-700"
                    }`}>
                      <span>Selected: <span className="font-extrabold text-indigo-505">{additives.find(a => a.id === damagedAdditiveId)?.name}</span></span>
                      <button 
                        type="button" 
                        onClick={() => setDamagedAdditiveId("")} 
                        className="text-rose-500 text-[10px] hover:underline cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Storage Location Dropdown */}
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Storage Location</label>
                <select
                  required
                  value={damagedLocationId}
                  onChange={e => setDamagedLocationId(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${inputClass}`}
                >
                  <option value="">Select Location</option>
                  {locations.map(loc => {
                    const locStockObj = stock.find(st => 
                      st.storage_location_id === loc.id && 
                      (damagedModalType === "product" ? st.product_id === damagedProductId : st.additive_id === damagedAdditiveId) && 
                      st.deleted_at === null
                    );
                    const locStock = locStockObj ? locStockObj.quantity : 0;
                    const suffix = damagedModalType === "product" ? " units" : " kg";
                    return (
                      <option key={loc.id} value={loc.id} disabled={locStock === 0}>
                        {loc.name} (Stock: {locStock.toFixed(damagedModalType === "product" ? 0 : 2)}{suffix})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Damaged Quantity */}
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                  {damagedModalType === "product" ? "Quantity of Damaged Pieces (units)" : "Weight of Damaged Pieces (kg)"}
                </label>
                <input 
                  type="text" 
                  required
                  placeholder={damagedModalType === "product" ? "e.g. 5" : "e.g. 1.5"}
                  value={damagedQuantity}
                  onChange={e => {
                    const regex = damagedModalType === "product" ? /[^0-9]/g : /[^0-9.]/g;
                    setDamagedQuantity(e.target.value.replace(regex, ""));
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none text-left font-mono ${inputClass}`}
                />
              </div>

              <div className="p-3 rounded-lg bg-rose-500/5 border border-rose-500/10 text-[10px] text-rose-500 leading-relaxed font-semibold">
                ⚠️ WARNING: Marking pieces as damaged permanently subtracts them from available stock levels in that location.
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsDamagedStockModalOpen(false)}
                  className={`px-4 py-2 text-sm border rounded-lg transition duration-150 cursor-pointer ${isDark ? "bg-zinc-950 hover:bg-zinc-850 border-zinc-855 text-zinc-400" : "bg-white hover:bg-zinc-100 border-zinc-205 text-zinc-650 hover:text-zinc-850 shadow-xs"}`}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 text-sm bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg shadow-sm transition duration-150 cursor-pointer"
                >
                  Mark as Damaged
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* 8. Printable Invoice Preview Modal */}
      {isPreviewModalOpen && previewInvoiceId && (() => {
        const inv = invoices.find(i => i.id === previewInvoiceId);
        if (!inv) return null;
        const sellerSettings = localDB.getSellerSettings();
        return (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-start md:items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm print:p-0">
            <div className={`${cardClass} w-full max-w-2xl p-6 shadow-2xl relative rounded-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto print-invoice-card print:border-none print:shadow-none print:max-h-none print:overflow-visible`}>
              {/* Close button */}
              <button 
                type="button"
                onClick={() => {
                  setPreviewInvoiceId("");
                  setIsPreviewModalOpen(false);
                }}
                className={`absolute top-4 right-4 p-1.5 rounded-lg transition duration-150 print:hidden ${isDark ? "hover:bg-zinc-800 text-zinc-400 hover:text-white" : "hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900"}`}
              >
                <X className="h-5 w-5" />
              </button>
              {/* Receipt Body - Amazon Style Invoicing */}
              <div id="invoice-receipt-print" className={`p-6 rounded-xl border flex flex-col gap-5 print:border-none ${isDark ? "bg-zinc-950/50 border-zinc-808/80 text-zinc-355" : "bg-white border-slate-205 text-slate-800"}`}>
                {/* Amazon Invoice Top Logo & Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4 border-zinc-808/30">
                  <div>
                    <h2 className="text-2xl font-black text-indigo-555 tracking-wider flex items-center gap-1.5">
                      <span>{sellerSettings.seller_name.toUpperCase()}</span>
                    </h2>
                    <p className={`text-[10px] uppercase tracking-widest mt-0.5 font-bold ${isDark ? "text-zinc-500" : "text-slate-450"}`}>
                      Tax Invoice / Bill of Supply
                    </p>
                  </div>
                  <div className="text-left sm:text-right font-mono">
                    <span className="px-2.5 py-1 font-bold text-xs rounded border border-indigo-500/20 bg-indigo-500/10 text-indigo-500 inline-block">
                      Invoice No: {inv.invoice_number}
                    </span>
                    <p className={`text-[11px] mt-1.5 ${isDark ? "text-zinc-500" : "text-slate-450"}`}>
                      Date: {new Date(inv.issue_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
                {/* Horizontal Progress Stepper */}
                <div className="py-2.5 border-b border-zinc-808/30 print:pb-4">
                  <div className="flex items-center justify-between relative max-w-md mx-auto">
                    {/* Background Progress connector Line */}
                    <div className={`absolute top-[14px] left-4 right-4 h-[2px] rounded -z-10 ${
                      isDark ? "bg-zinc-850" : "bg-slate-100"
                    }`} />
                    {/* Active highlighted Progress line */}
                    <div 
                      className="absolute top-[14px] left-4 h-[2px] rounded -z-10 bg-indigo-500 transition-all duration-300"
                      style={{
                        width: inv.status === "ordered" ? "0%" :
                               inv.status === "preparing" ? "33%" :
                               inv.status === "completed" ? "66%" : "100%"
                      }}
                    />
                    {/* Stepper Dots */}
                    {[
                      { key: "ordered", label: "Ordered" },
                      { key: "preparing", label: "Preparing" },
                      { key: "completed", label: "Completed" },
                      { key: "delivered", label: "Delivered" }
                    ].map((step, idx) => {
                      const stages = ["ordered", "preparing", "completed", "delivered"];
                      const currentIdx = stages.indexOf(inv.status);
                      const isCompleted = idx <= currentIdx;
                      const isActive = idx === currentIdx;
                      return (
                        <div key={step.key} className="flex flex-col items-center gap-1.5 relative z-10">
                          {/* Dot Circle */}
                          <div 
                            className={`h-7 w-7 rounded-full flex items-center justify-center border font-mono text-[10px] font-bold transition-all duration-200 ${
                              isActive 
                                ? "bg-indigo-650 text-white border-indigo-650 ring-4 ring-indigo-500/10 scale-105 shadow-md"
                                : (isCompleted 
                                    ? "bg-indigo-500 text-white border-indigo-500" 
                                    : (isDark ? "bg-zinc-950 text-zinc-500 border-zinc-808" : "bg-white text-slate-400 border-slate-200"))
                            }`}
                          >
                            {idx + 1}
                          </div>
                          <span className={`text-[8px] font-black uppercase tracking-wider ${
                            isActive 
                              ? "text-indigo-500 font-bold" 
                              : (isCompleted 
                                  ? (isDark ? "text-zinc-300" : "text-slate-650") 
                                  : "text-zinc-500")
                          }`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* Amazon Grid Header details */}
                <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 p-3 rounded-lg border text-[11px] font-medium leading-relaxed ${
                  isDark ? "bg-zinc-950/40 border-zinc-808/60 text-zinc-400" : "bg-slate-50/60 border-slate-200 text-slate-650"
                }`}>
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase font-bold tracking-wider">Order Date:</span>
                    <span>{new Date(inv.issue_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase font-bold tracking-wider">Order # / Ref:</span>
                    <span className="font-mono">JC-ORD-{inv.id.substring(4, 10).toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase font-bold tracking-wider">Invoice Details:</span>
                    <span className="font-semibold">{inv.invoice_number}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase font-bold tracking-wider">Payment Mode:</span>
                    <span className="font-bold text-emerald-500">{inv.payment_mode || "Cash"}</span>
                  </div>
                </div>
                {/* Billing Address Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
                  <div className={`p-4 rounded-xl border ${isDark ? "bg-zinc-950/20 border-zinc-808/50" : "bg-slate-50/30 border-slate-200/80"}`}>
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-500 mb-2 border-b pb-1.5 border-zinc-808/20">Sold By (Seller Details):</h4>
                    <p className="font-bold text-sm">{sellerSettings.seller_name}</p>
                    <p className="text-zinc-550 text-[11px] mt-0.5 whitespace-pre-line leading-relaxed">{sellerSettings.seller_address}</p>
                    {sellerSettings.show_gst_pan && (
                      <div className="mt-2 text-[10px] font-mono text-zinc-500 border-t pt-1 border-dashed border-zinc-808/20">
                        <p>PAN: {sellerSettings.pan}</p>
                        <p>GSTIN: {sellerSettings.gstin}</p>
                      </div>
                    )}
                  </div>
                  <div className={`p-4 rounded-xl border ${isDark ? "bg-zinc-950/20 border-zinc-808/50" : "bg-slate-50/30 border-slate-200/80"}`}>
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-500 mb-2 border-b pb-1.5 border-zinc-808/20">Billing Address (Buyer Details):</h4>
                    <p className="font-black text-sm text-indigo-505">{inv.customer_name}</p>
                    {inv.customer_phone ? (
                      <p className="font-bold text-zinc-700 dark:text-zinc-200 text-[11px] mt-1 flex items-center gap-1">
                        <span>📞 Phone:</span> <span className="font-mono">{inv.customer_phone}</span>
                      </p>
                    ) : (
                      <p className="text-zinc-550 italic text-[11px] mt-1">No phone number attached</p>
                    )}
                    <p className="text-zinc-550 text-[10px] font-mono mt-2">Buyer ID: client-hash-{inv.id.substring(4, 9)}</p>
                  </div>
                </div>
                {/* Items Table - Amazon style */}
                <div className={`border rounded-xl overflow-hidden ${isDark ? "border-zinc-808/80" : "border-slate-200"}`}>
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className={`border-b text-[10px] font-bold uppercase tracking-wider text-zinc-500 ${
                        isDark ? "bg-zinc-900 border-zinc-808 text-zinc-400" : "bg-slate-50 border-slate-200 text-slate-600"
                      }`}>
                        <th className="py-2.5 px-4 w-12 text-center">Sl.</th>
                        <th className="py-2.5 px-4">Item description</th>
                        <th className="py-2.5 px-4 text-right w-24">Unit Price</th>
                        <th className="py-2.5 px-4 text-center w-16">Qty</th>
                        <th className="py-2.5 px-4 text-right w-24">Net Amount</th>
                        {inv.items?.some(i => i.discount && i.discount > 0) && (
                          <th className="py-2.5 px-4 text-right w-20">Discount</th>
                        )}
                        <th className="py-2.5 px-4 text-right w-28">Total Amount</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y font-medium ${isDark ? "divide-zinc-850" : "divide-slate-150"}`}>
                      {inv.items?.map((item, idx) => {
                        const prod = item.product_id ? getProduct(item.product_id) : null;
                        const add = item.additive_id ? additives.find(a => a.id === item.additive_id) : null;
                        const displayName = prod ? prod.name : (add ? `🍯 ${add.name} (Dryfruit)` : "Unknown Item");
                        const displayId = item.product_id || item.additive_id || "";
                        const displayQty = item.product_id ? `${item.quantity}` : `${item.quantity.toFixed(2)} kg`;
                        const netAmount = item.quantity * item.unit_price;
                        const rowTotal = netAmount * (1 - (item.discount || 0) / 100);
                        const hasDiscount = inv.items?.some(i => i.discount && i.discount > 0);
                        return (
                          <tr key={idx} className={`align-middle ${isDark ? "hover:bg-zinc-900/10" : "hover:bg-slate-50/20"}`}>
                            <td className="py-3 px-4 text-center text-zinc-500 font-mono">{idx + 1}</td>
                             <td className="py-3 px-4">
                               <div className="flex flex-col gap-0.5">
                                 <span className={`font-bold ${isDark ? "text-zinc-100" : "text-slate-800"}`}>
                                   {displayName}
                                 </span>
                                 <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                                   <span className="text-[9px] text-zinc-550 font-mono">ID: {displayId}</span>
                                   {prod?.supplier_code && (
                                     <span className={`text-[8px] font-mono font-bold uppercase rounded px-1 shrink-0 ${isDark ? "bg-indigo-950/40 text-indigo-300 border border-indigo-900/30" : "bg-indigo-50 text-indigo-700 border border-indigo-100"}`}>
                                       Code: {prod.supplier_code}
                                     </span>
                                   )}
                                 </div>
                                 {item.customizations && item.customizations.filter(c => c.additive_id !== "empty").length > 0 && (
                                   <div className={`mt-2 p-2 rounded-lg border border-dashed text-[10px] ${
                                     isDark ? "bg-zinc-950/40 border-zinc-808/60 text-zinc-350" : "bg-slate-50 border-slate-205 text-slate-650"
                                   }`}>
                                     <span className="font-extrabold uppercase tracking-wide text-[8px] text-indigo-550 block mb-1">🍯 Custom Jar Filling:</span>
                                     <div className="grid grid-cols-1 gap-1">
                                       {item.customizations.filter(c => c.additive_id !== "empty").map((jar, cIdx) => {
                                         const additiveObj = additives.find(a => a.id === jar.additive_id);
                                         const extraPrice = additiveObj ? Math.round((additiveObj.price_per_kg / 1000) * jar.weight_grams) : 0;
                                         return (
                                           <div key={cIdx} className="flex justify-between items-center">
                                             <span>Jar #{jar.jar_number}: {additiveObj?.name || "Additive"} ({jar.weight_grams}g)</span>
                                             <span className="font-mono text-zinc-550 font-bold">+₹{extraPrice}</span>
                                           </div>
                                         );
                                       })}
                                     </div>
                                   </div>
                                 )}
                               </div>
                             </td>
                            <td className="py-3 px-4 text-right font-mono text-zinc-550">₹{item.unit_price.toFixed(2)}</td>
                            <td className="py-3 px-4 text-center font-mono font-bold">{displayQty}</td>
                            <td className="py-3 px-4 text-right font-mono text-zinc-550">₹{netAmount.toFixed(2)}</td>
                            {hasDiscount && (
                              <td className="py-3 px-4 text-right font-mono text-rose-500">
                                {item.discount && item.discount > 0 ? `-${item.discount}%` : "0%"}
                              </td>
                            )}
                            <td className="py-3 px-4 text-right font-mono font-extrabold text-indigo-500">₹{rowTotal.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {/* Grand Total Summary Box - Amazon Style */}
                <div className="flex flex-col sm:flex-row items-stretch justify-between gap-4 mt-2">
                  {/* Left Notes */}
                  <div className={`p-4 rounded-xl border flex-1 text-[11px] leading-relaxed flex flex-col justify-center gap-1.5 ${isDark ? "border-zinc-808 bg-zinc-950/10 text-zinc-550" : "border-slate-200 bg-slate-50/10 text-slate-600"}`}>
                    {inv.delivery_date && (
                      <div className="mb-2 border-b pb-1.5 border-dashed border-zinc-808/30">
                        <span className="font-extrabold uppercase text-[9px] tracking-wider text-indigo-500 block mb-0.5">📅 Pre-Order Scheduled Delivery:</span>
                        <p className="font-bold text-xs">Required by buyer on: <span className="font-mono text-indigo-600 dark:text-indigo-400">{inv.delivery_date}</span></p>
                      </div>
                    )}
                    <p className="font-bold uppercase tracking-wider text-[9px] text-zinc-400">Declaration & Terms:</p>
                    <p className="text-[10px]">We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.</p>
                  </div>
                  {/* Right summary table */}
                  <div className={`p-4 rounded-xl border w-full sm:w-80 flex flex-col gap-2 text-xs font-semibold ${
                    isDark ? "border-zinc-808 bg-zinc-950/20" : "border-slate-200 bg-slate-50/20 shadow-xs"
                  }`}>
                    <div className="flex justify-between text-zinc-550">
                      <span>Gross Subtotal:</span>
                      <span className="font-mono">₹{inv.items?.reduce((s, i) => s + (i.quantity * i.unit_price), 0).toFixed(2)}</span>
                    </div>
                    {inv.items?.some(i => i.discount && i.discount > 0) && (
                      <div className="flex justify-between text-rose-500">
                        <span>Discounts Applied:</span>
                        <span className="font-mono font-bold">-₹{inv.items?.reduce((s, i) => s + (i.quantity * i.unit_price * (i.discount || 0) / 100), 0).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-zinc-550 border-t border-dashed border-zinc-808/30 pt-2 font-mono">
                      <span>Delivery Charges:</span>
                      <span className="text-emerald-500 uppercase text-[10px] font-bold">FREE</span>
                    </div>
                    {/* Highlight Grand Total Banner */}
                    <div className={`flex justify-between items-center p-2.5 rounded-lg font-bold border mt-1.5 ${
                      isDark 
                        ? "bg-zinc-900 border-zinc-808 text-zinc-300" 
                        : "bg-slate-50 border-slate-200 text-slate-800 shadow-xs"
                    }`}>
                      <span className="text-[11px] uppercase tracking-wider font-extrabold">Grand Total:</span>
                      <span className="font-mono text-base font-black">₹{inv.total_amount.toFixed(2)}</span>
                    </div>
                    {inv.advance_paid !== undefined && inv.advance_paid > 0 && (
                      <>
                        <div className="flex justify-between text-emerald-500 mt-1 border-t border-dotted border-zinc-808/30 pt-2">
                          <span>Deposit Advance Paid:</span>
                          <span className="font-mono font-extrabold">-₹{inv.advance_paid.toFixed(2)}</span>
                        </div>
                        <div className={`flex justify-between items-center p-2.5 rounded-lg font-bold border mt-1.5 ${
                          isDark 
                            ? "bg-amber-950/20 border-amber-900/40 text-amber-300" 
                            : "bg-amber-50 border-amber-200 text-amber-850 shadow-xs"
                        }`}>
                          <span className="text-[11px] uppercase tracking-wider font-extrabold">Balance Outstanding:</span>
                          <span className="font-mono text-lg font-black">₹{(inv.total_amount - inv.advance_paid).toFixed(2)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-center mt-6 pt-4 border-t border-dashed border-zinc-808/30 print:mt-10">
                  <p className="text-[10px] italic text-zinc-500 font-medium">
                    Invoice generated electronically • System developed by <span className="font-extrabold not-italic text-indigo-500">Lecharme</span>
                  </p>
                </div>
              </div>
              {/* Modal Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-4 border-zinc-808/30 print:hidden">
                {/* Status Changer dropdown */}
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Change Status:</span>
                  <select
                    value={inv.status}
                    onChange={e => {
                      localDB.updateInvoiceStatus(inv.id, e.target.value as any);
                      loadData();
                    }}
                    className={`px-3 py-1.5 text-xs font-bold border rounded-lg focus:outline-none capitalize cursor-pointer ${
                      inv.status === "ordered" ? "text-blue-500 bg-blue-500/5 border-blue-500/20" :
                      inv.status === "preparing" ? "text-amber-500 bg-amber-500/5 border-amber-500/20" :
                      inv.status === "completed" ? "text-indigo-500 bg-indigo-500/5 border-indigo-500/20" :
                      "text-emerald-500 bg-emerald-500/5 border-emerald-500/20"
                    } ${inputClass}`}
                  >
                    <option value="ordered">Ordered (Awaiting Work)</option>
                    <option value="preparing">Preparing (In Production)</option>
                    <option value="completed">Completed (Dispatched)</option>
                    <option value="delivered">Delivered (Handed Over)</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 w-full sm:w-auto">
                  <button 
                    type="button" 
                    onClick={() => {
                      setPreviewInvoiceId("");
                      setIsPreviewModalOpen(false);
                    }}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg border transition duration-150 flex-1 sm:flex-initial text-center ${isDark ? "bg-zinc-950 hover:bg-zinc-850 border-zinc-850 text-zinc-400" : "bg-white hover:bg-zinc-100 border-zinc-205 text-zinc-650 hover:text-zinc-800 shadow-xs"}`}
                  >
                    Close Receipt
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      window.print();
                    }}
                    className="px-4 py-2 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-sm transition duration-150 flex items-center justify-center gap-1.5 flex-1 sm:flex-initial"
                  >
                    <FileText className="h-4 w-4" /> Print Invoice
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
      {/* Dynamic print-specific css injector style tag */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden !important;
          }
          #invoice-receipt-print, #invoice-receipt-print * {
            visibility: visible !important;
          }
          #invoice-receipt-print {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            border: none !important;
            background: white !important;
            color: black !important;
          }
        }
      `}} />
      {/* 5. Archive Bin / Restore Manager Modal */}
      {isArchiveModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-start md:items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className={`${cardClass} w-full max-w-4xl p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto`}>
            <button 
              onClick={() => setIsArchiveModalOpen(false)}
              className={`absolute top-4 right-4 p-1 rounded transition duration-150 ${isDark ? "hover:bg-zinc-800 text-zinc-400 hover:text-white" : "hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900"}`}
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isDark ? "text-zinc-100" : "text-zinc-800"}`}>
              <Trash2 className="h-5 w-5 text-amber-500" /> Archive Bin (Restore Manager)
            </h2>
            {/* Modal tabs */}
            <div className={`flex p-1 rounded-lg mb-6 text-xs font-semibold uppercase tracking-wider overflow-x-auto border ${isDark ? "bg-zinc-950 border-zinc-850" : "bg-zinc-100 border-zinc-200"}`}>
              <button 
                onClick={() => setArchiveTab("categories")}
                className={`flex-1 py-1.5 text-center rounded-md min-w-[80px] transition duration-155 ${archiveTab === "categories" ? (isDark ? "bg-zinc-800 text-white" : "bg-white text-zinc-850 shadow-sm") : (isDark ? "text-zinc-500 hover:text-zinc-300" : "text-zinc-500 hover:text-zinc-850")}`}
              >
                Categories ({deletedCategories.length})
              </button>
              <button 
                onClick={() => setArchiveTab("sub_types")}
                className={`flex-1 py-1.5 text-center rounded-md min-w-[80px] transition duration-155 ${archiveTab === "sub_types" ? (isDark ? "bg-zinc-800 text-white" : "bg-white text-zinc-850 shadow-sm") : (isDark ? "text-zinc-500 hover:text-zinc-300" : "text-zinc-500 hover:text-zinc-850")}`}
              >
                Sub-Types ({deletedSubTypes.length})
              </button>
              <button 
                onClick={() => setArchiveTab("locations")}
                className={`flex-1 py-1.5 text-center rounded-md min-w-[80px] transition duration-155 ${archiveTab === "locations" ? (isDark ? "bg-zinc-800 text-white" : "bg-white text-zinc-850 shadow-sm") : (isDark ? "text-zinc-500 hover:text-zinc-300" : "text-zinc-500 hover:text-zinc-850")}`}
              >
                Locations ({deletedLocations.length})
              </button>
              <button 
                onClick={() => setArchiveTab("products")}
                className={`flex-1 py-1.5 text-center rounded-md min-w-[80px] transition duration-155 ${archiveTab === "products" ? (isDark ? "bg-zinc-800 text-white" : "bg-white text-zinc-850 shadow-sm") : (isDark ? "text-zinc-500 hover:text-zinc-300" : "text-zinc-500 hover:text-zinc-850")}`}
              >
                Products ({deletedProducts.length})
              </button>
              <button 
                onClick={() => setArchiveTab("invoices")}
                className={`flex-1 py-1.5 text-center rounded-md min-w-[80px] transition duration-155 ${archiveTab === "invoices" ? (isDark ? "bg-zinc-800 text-white" : "bg-white text-zinc-850 shadow-sm") : (isDark ? "text-zinc-500 hover:text-zinc-300" : "text-zinc-500 hover:text-zinc-850")}`}
              >
                Invoices ({deletedInvoices.length})
              </button>
            </div>
            {/* List by active tab */}
            <div className="space-y-3 min-h-[250px] max-h-[50vh] overflow-y-auto pr-2">
              {/* Category Tab */}
              {archiveTab === "categories" && (
                deletedCategories.length === 0 ? (
                  <p className="text-zinc-500 text-sm text-center py-10">No archived categories.</p>
                ) : (
                  deletedCategories.map(c => (
                    <div key={c.id} className={`p-3.5 rounded-xl border flex items-center justify-between ${isDark ? "bg-zinc-950 border-zinc-850" : "bg-zinc-50 border-zinc-200"}`}>
                      <div>
                        <span className={`font-bold ${isDark ? "text-zinc-305" : "text-zinc-700"}`}>{c.name}</span>
                        <span className="block text-[10px] text-zinc-500 mt-0.5 font-mono">Deleted At: {new Date(c.deleted_at!).toLocaleString("en-IN")}</span>
                      </div>
                      <button 
                        onClick={() => handleRestore("categories", c.id)}
                        className="px-3 py-1.5 text-xs bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-white border border-amber-500/20 rounded-lg transition duration-155 font-semibold"
                      >
                        Restore Category
                      </button>
                    </div>
                  ))
                )
              )}
              {/* Sub-Types Tab */}
              {archiveTab === "sub_types" && (
                deletedSubTypes.length === 0 ? (
                  <p className="text-zinc-500 text-sm text-center py-10">No archived sub-types.</p>
                ) : (
                  deletedSubTypes.map(s => (
                    <div key={s.id} className={`p-3.5 rounded-xl border flex items-center justify-between ${isDark ? "bg-zinc-950 border-zinc-850" : "bg-zinc-50 border-zinc-200"}`}>
                      <div>
                        <span className={`font-bold ${isDark ? "text-zinc-305" : "text-zinc-700"}`}>{s.name} <span className="text-xs text-zinc-500 font-normal">({getCategoryName(s.category_id)})</span></span>
                        <span className="block text-[10px] text-zinc-500 mt-0.5 font-mono">Deleted At: {new Date(s.deleted_at!).toLocaleString("en-IN")}</span>
                      </div>
                      <button 
                        onClick={() => handleRestore("sub_types", s.id)}
                        className="px-3 py-1.5 text-xs bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-white border border-amber-500/20 rounded-lg transition duration-155 font-semibold"
                      >
                        Restore Sub-Type
                      </button>
                    </div>
                  ))
                )
              )}
              {/* Locations Tab */}
              {archiveTab === "locations" && (
                deletedLocations.length === 0 ? (
                  <p className="text-zinc-500 text-sm text-center py-10">No archived locations.</p>
                ) : (
                  deletedLocations.map(l => (
                    <div key={l.id} className={`p-3.5 rounded-xl border flex items-center justify-between ${isDark ? "bg-zinc-950 border-zinc-850" : "bg-zinc-50 border-zinc-200"}`}>
                      <div>
                        <span className={`font-bold ${isDark ? "text-zinc-305" : "text-zinc-700"}`}>{l.name}</span>
                        <span className="block text-[10px] text-zinc-500 mt-0.5 font-mono">Deleted At: {new Date(l.deleted_at!).toLocaleString("en-IN")}</span>
                      </div>
                      <button 
                        onClick={() => handleRestore("locations", l.id)}
                        className="px-3 py-1.5 text-xs bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-white border border-amber-500/20 rounded-lg transition duration-155 font-semibold"
                      >
                        Restore Location
                      </button>
                    </div>
                  ))
                )
              )}
              {/* Products Tab */}
              {archiveTab === "products" && (
                deletedProducts.length === 0 ? (
                  <p className="text-zinc-500 text-sm text-center py-10">No archived products.</p>
                ) : (
                  deletedProducts.map(p => (
                    <div key={p.id} className={`p-3.5 rounded-xl border flex items-center justify-between ${isDark ? "bg-zinc-950 border-zinc-850" : "bg-zinc-50 border-zinc-200"}`}>
                      <div>
                        <span className={`font-bold ${isDark ? "text-zinc-305" : "text-zinc-700"}`}>{p.name} <span className="text-xs text-zinc-500 font-normal">({getCategoryName(p.category_id)})</span></span>
                        <span className="block text-[10px] text-zinc-500 mt-0.5 font-mono">Deleted At: {new Date(p.deleted_at!).toLocaleString("en-IN")}</span>
                      </div>
                      <button 
                        onClick={() => handleRestore("products", p.id)}
                        className="px-3 py-1.5 text-xs bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-white border border-amber-500/20 rounded-lg transition duration-155 font-semibold"
                      >
                        Restore Product
                      </button>
                    </div>
                  ))
                )
              )}
              {/* Invoices Tab */}
              {archiveTab === "invoices" && (
                deletedInvoices.length === 0 ? (
                  <p className="text-zinc-500 text-sm text-center py-10">No archived invoices.</p>
                ) : (
                  deletedInvoices.map(inv => (
                    <div key={inv.id} className={`p-3.5 rounded-xl border flex items-center justify-between ${isDark ? "bg-zinc-950 border-zinc-850" : "bg-zinc-50 border-zinc-200"}`}>
                      <div>
                        <span className={`font-bold ${isDark ? "text-zinc-355" : "text-zinc-700"}`}>{inv.invoice_number} ({inv.customer_name})</span>
                        <span className="block text-[10px] text-zinc-500 mt-0.5 font-mono">Deleted At: {new Date(inv.deleted_at!).toLocaleString("en-IN")}</span>
                      </div>
                      <button 
                        onClick={() => handleRestore("invoices", inv.id)}
                        className="px-3 py-1.5 text-xs bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-white border border-amber-500/20 rounded-lg transition duration-155 font-semibold"
                      >
                        Restore Invoice
                      </button>
                    </div>
                  ))
                )
              )}
            </div>
            <div className={`pt-6 flex justify-end mt-4 border-t ${isDark ? "border-zinc-850" : "border-zinc-150"}`}>
              <button 
                onClick={() => setIsArchiveModalOpen(false)}
                className={`px-4 py-2 text-sm border rounded-lg font-medium transition duration-150 ${isDark ? "bg-zinc-950 hover:bg-zinc-850 border-zinc-850 text-zinc-400" : "bg-white hover:bg-zinc-100 border-zinc-205 text-zinc-650 hover:text-zinc-850 shadow-xs"}`}
              >
                Close Bin
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 6. Move Stock Modal */}
      {isMoveStockModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-start md:items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className={`${cardClass} w-full max-w-xl p-6 shadow-2xl relative`}>
            <button 
              onClick={() => {
                setMoveModalCategoryFilter("all");
                setMoveModalSearchQuery("");
                setIsMoveStockModalOpen(false);
              }}
              className={`absolute top-4 right-4 p-1 rounded transition duration-150 cursor-pointer ${isDark ? "hover:bg-zinc-800 text-zinc-400 hover:text-white" : "hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900"}`}
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isDark ? "text-zinc-100" : "text-zinc-800"}`}>
              <ArrowLeftRight className="h-5 w-5 text-indigo-500" /> Move Stock (Transfer)
            </h2>
            <form onSubmit={handleMoveStock} className="space-y-4">
              
              {/* Toggle stock category type */}
              <div className="flex gap-2 p-1 bg-zinc-950/20 dark:bg-zinc-900/40 rounded-xl border border-zinc-808/30 w-full mb-4">
                <button
                  type="button"
                  onClick={() => setMoveModalType("product")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                    moveModalType === "product" ? "bg-indigo-600 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Product Box
                </button>
                <button
                  type="button"
                  onClick={() => setMoveModalType("additive")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                    moveModalType === "additive" ? "bg-indigo-600 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Dryfruit Filling
                </button>
              </div>

              {moveModalType === "product" ? (
                <>
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-xl border border-dashed border-slate-200 dark:border-zinc-808/60 bg-slate-50/30 dark:bg-zinc-950/20">
                    <div>
                      <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? "text-zinc-450" : "text-zinc-500"}`}>Filter by Category</label>
                      <select
                        value={moveModalCategoryFilter}
                        onChange={e => setMoveModalCategoryFilter(e.target.value)}
                        className={`w-full px-2.5 py-1.5 border rounded-lg focus:outline-none text-xs ${inputClass}`}
                      >
                        <option value="all">All Categories</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? "text-zinc-450" : "text-zinc-500"}`}>Search Product Name</label>
                      <input
                        type="text"
                        placeholder="Type to search..."
                        value={moveModalSearchQuery}
                        onChange={e => setMoveModalSearchQuery(e.target.value)}
                        className={`w-full px-2.5 py-1.5 border rounded-lg focus:outline-none text-xs ${inputClass}`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Product</label>
                    <select 
                      value={moveProductId}
                      onChange={e => {
                        setMoveProductId(e.target.value);
                        setMoveSourceLocationId("");
                        setMoveDestinationLocationId("");
                      }}
                      required={moveModalType === "product"}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${inputClass}`}
                    >
                      <option value="">Select Product to Move ({filteredMoveProducts.length} items found)</option>
                      {filteredMoveProducts.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (₹{p.price || 0})</option>
                      ))}
                    </select>
                  </div>

                  {moveProductId && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Source Location</label>
                        <select 
                          value={moveSourceLocationId}
                          onChange={e => setMoveSourceLocationId(e.target.value)}
                          required
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${inputClass}`}
                        >
                          <option value="">Select Source</option>
                          {locations
                            .filter(l => {
                              const hasStock = stock.find(st => st.product_id === moveProductId && st.storage_location_id === l.id && st.deleted_at === null);
                              return hasStock && hasStock.quantity > 0;
                            })
                            .map(l => {
                              const quantity = stock.find(st => st.product_id === moveProductId && st.storage_location_id === l.id && st.deleted_at === null)?.quantity || 0;
                              return (
                                <option key={l.id} value={l.id}>{l.name} ({quantity} avl)</option>
                              );
                            })}
                        </select>
                      </div>

                      <div>
                        <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Destination Location</label>
                        <select 
                          value={moveDestinationLocationId}
                          onChange={e => setMoveDestinationLocationId(e.target.value)}
                          required
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${inputClass}`}
                        >
                          <option value="">Select Destination</option>
                          {locations
                            .filter(l => l.id !== moveSourceLocationId)
                            .map(l => (
                              <option key={l.id} value={l.id}>{l.name}</option>
                            ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {moveProductId && moveSourceLocationId && (
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className={`block text-xs font-semibold uppercase tracking-wider ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Quantity to Move</label>
                        <span className="text-[10px] font-bold text-indigo-505 font-mono">
                          Max: {stock.find(st => st.product_id === moveProductId && st.storage_location_id === moveSourceLocationId && st.deleted_at === null)?.quantity || 0} units
                        </span>
                      </div>
                      <input 
                        type="number"
                        min="1"
                        max={stock.find(st => st.product_id === moveProductId && st.storage_location_id === moveSourceLocationId && st.deleted_at === null)?.quantity || 1}
                        value={moveQuantity || ""}
                        onChange={e => setMoveQuantity(Number(e.target.value))}
                        required
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none font-mono ${inputClass}`}
                      />
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Dryfruit Ingredient</label>
                    <select 
                      value={moveAdditiveId}
                      onChange={e => {
                        setMoveAdditiveId(e.target.value);
                        setMoveSourceLocationId("");
                        setMoveDestinationLocationId("");
                      }}
                      required={moveModalType === "additive"}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${inputClass}`}
                    >
                      <option value="">Select Dryfruit to Move...</option>
                      {additives.map(a => (
                        <option key={a.id} value={a.id}>{a.name} (₹{a.price_per_kg}/kg)</option>
                      ))}
                    </select>
                  </div>

                  {moveAdditiveId && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Source Location</label>
                        <select 
                          value={moveSourceLocationId}
                          onChange={e => setMoveSourceLocationId(e.target.value)}
                          required
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${inputClass}`}
                        >
                          <option value="">Select Source</option>
                          {locations
                            .filter(l => {
                              const hasStock = stock.find(st => st.additive_id === moveAdditiveId && st.storage_location_id === l.id && st.deleted_at === null);
                              return hasStock && hasStock.quantity > 0;
                            })
                            .map(l => {
                              const quantity = stock.find(st => st.additive_id === moveAdditiveId && st.storage_location_id === l.id && st.deleted_at === null)?.quantity || 0;
                              return (
                                <option key={l.id} value={l.id}>{l.name} ({quantity.toFixed(2)} kg avl)</option>
                              );
                            })}
                        </select>
                      </div>

                      <div>
                        <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Destination Location</label>
                        <select 
                          value={moveDestinationLocationId}
                          onChange={e => setMoveDestinationLocationId(e.target.value)}
                          required
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${inputClass}`}
                        >
                          <option value="">Select Destination</option>
                          {locations
                            .filter(l => l.id !== moveSourceLocationId)
                            .map(l => (
                              <option key={l.id} value={l.id}>{l.name}</option>
                            ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {moveAdditiveId && moveSourceLocationId && (
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className={`block text-xs font-semibold uppercase tracking-wider ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Weight to Move (kg)</label>
                        <span className="text-[10px] font-bold text-indigo-505 font-mono">
                          Max: {(stock.find(st => st.additive_id === moveAdditiveId && st.storage_location_id === moveSourceLocationId && st.deleted_at === null)?.quantity || 0).toFixed(2)} kg
                        </span>
                      </div>
                      <input 
                        type="text"
                        value={moveQuantity || ""}
                        onChange={e => {
                          const val = e.target.value.replace(/[^0-9.]/g, '');
                          const maxVal = stock.find(st => st.additive_id === moveAdditiveId && st.storage_location_id === moveSourceLocationId && st.deleted_at === null)?.quantity || 0;
                          setMoveQuantity(Math.min(val ? Number(val) : 0, maxVal));
                        }}
                        required
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none font-mono ${inputClass}`}
                      />
                    </div>
                  )}
                </>
              )}

              <div className={`pt-4 flex justify-end gap-3 border-t mt-4 ${isDark ? "border-zinc-808/60" : "border-zinc-150"}`}>
                <button 
                  type="button" 
                  onClick={() => {
                    setMoveModalCategoryFilter("all");
                    setMoveModalSearchQuery("");
                    setIsMoveStockModalOpen(false);
                  }}
                  className={`px-4 py-2 text-sm border rounded-lg transition duration-150 cursor-pointer ${isDark ? "bg-zinc-950 hover:bg-zinc-850 border-zinc-855 text-zinc-400" : "bg-white hover:bg-zinc-100 border-zinc-205 text-zinc-650 hover:text-zinc-850 shadow-xs"}`}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-sm transition duration-150 cursor-pointer"
                >
                  Move Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* 7. Product Details Popup Modal */}
      {isDetailModalOpen && detailProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-start md:items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className={`${cardClass} w-full max-w-3xl p-6 shadow-2xl relative rounded-2xl flex flex-col gap-6`}>
            {/* Close button */}
            <button 
              onClick={() => {
                setDetailProductId("");
                setIsDetailModalOpen(false);
              }}
              className={`absolute top-4 right-4 p-1.5 rounded-lg transition duration-150 ${isDark ? "hover:bg-zinc-800 text-zinc-400 hover:text-white" : "hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900"}`}
            >
              <X className="h-5 w-5" />
            </button>
            {/* Modal Content Header & Split details layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Product Photo - col-span-5 */}
              <div className="md:col-span-5 flex flex-col gap-3">
                <div className={`h-56 w-full rounded-xl overflow-hidden border ${isDark ? "bg-zinc-950 border-zinc-808" : "bg-slate-50 border-slate-200"}`}>
                  {detailProduct.photos && detailProduct.photos[0] ? (
                    <img 
                      src={detailProduct.photos[0]} 
                      alt={detailProduct.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-450">
                      <Package className="h-16 w-16" />
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${isDark ? "bg-zinc-950 text-zinc-350 border-zinc-808" : "bg-slate-50 text-slate-650 border-slate-200"}`}>
                    Category: <strong>{getCategoryName(detailProduct.category_id)}</strong>
                  </span>
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${isDark ? "bg-zinc-950 text-zinc-350 border-zinc-808" : "bg-slate-50 text-slate-650 border-slate-200"}`}>
                    Sub-Type: <strong>{getSubTypeName(detailProduct.sub_type_id)}</strong>
                  </span>
                </div>
              </div>
              {/* Product details & Stock Levels - col-span-7 */}
              <div className="md:col-span-7 flex flex-col justify-between">
                <div>
                  <h3 className={`text-2xl font-black mb-1.5 ${isDark ? "text-zinc-50" : "text-slate-800"}`}>
                    {detailProduct.name}
                  </h3>
                  <div className="flex items-center flex-wrap gap-2.5 mb-4">
                    <span className="text-xl font-extrabold text-indigo-500 font-mono">₹{detailProduct.price || 0}</span>
                    <span className={`px-2 py-0.5 text-[10px] rounded font-mono ${isDark ? "bg-zinc-800 text-zinc-400" : "bg-slate-100 text-slate-500"}`}>ID: {detailProduct.id}</span>
                    {detailProduct.supplier_code && (
                      <span className={`px-2 py-0.5 text-[10px] rounded font-mono font-bold uppercase ${isDark ? "bg-indigo-950/40 text-indigo-300 border border-indigo-900/30" : "bg-indigo-50 text-indigo-700 border border-indigo-100"}`}>
                        Supplier Code: {detailProduct.supplier_code}
                      </span>
                    )}
                  </div>
                  {/* Stock allocations */}
                  <div className="space-y-2.5">
                    <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
                      Storage Allocation Breakdown
                    </h4>
                    <div className={`border rounded-xl divide-y overflow-hidden max-h-40 overflow-y-auto ${isDark ? "border-zinc-808 divide-zinc-808 bg-zinc-950/20" : "border-slate-200 divide-slate-200 bg-slate-50/20"}`}>
                      {locations.filter(loc => {
                        const locStock = stock.find(st => st.product_id === detailProduct.id && st.storage_location_id === loc.id && st.deleted_at === null);
                        return locStock && locStock.quantity > 0;
                      }).length === 0 ? (
                        <div className="p-4 text-center text-xs italic text-zinc-500">
                          No active stock allocated in any storage location.
                        </div>
                      ) : (
                        locations
                          .filter(loc => {
                            const locStock = stock.find(st => st.product_id === detailProduct.id && st.storage_location_id === loc.id && st.deleted_at === null);
                            return locStock && locStock.quantity > 0;
                          })
                          .map(loc => {
                            const locStock = stock.find(st => st.product_id === detailProduct.id && st.storage_location_id === loc.id && st.deleted_at === null);
                            const qty = locStock ? locStock.quantity : 0;
                            return (
                              <div key={loc.id} className="p-3 flex items-center justify-between text-xs">
                                <span className="flex items-center gap-2 font-medium">
                                  <MapPin className="h-4 w-4 text-indigo-500 shrink-0" />
                                  {loc.name}
                                </span>
                                <div className="flex items-center gap-3">
                                  <span className={`font-mono font-bold ${isDark ? "text-zinc-100" : "text-slate-850"}`}>
                                    {qty} units
                                  </span>
                                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: qty > 10 ? '#10B981' : '#F59E0B' }} />
                                </div>
                              </div>
                            );
                          })
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t flex items-center justify-between border-dashed border-slate-205 dark:border-zinc-800">
                  <span className={`text-sm ${isDark ? "text-zinc-405" : "text-slate-550"}`}>Total Combined Inventory:</span>
                  <span className="text-lg font-black font-mono text-indigo-550">
                    {stock.filter(st => st.product_id === detailProduct.id && st.deleted_at === null).reduce((sum, item) => sum + item.quantity, 0)} units
                  </span>
                </div>
              </div>
            </div>
            {/* Similar Products Carousel/Row */}
            <div className={`border-t pt-4 ${isDark ? "border-zinc-808" : "border-slate-150"}`}>
              <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
                Similar products in <span className="text-indigo-500 font-bold">{getSubTypeName(detailProduct.sub_type_id)}</span>
              </h4>
              {similarProducts.length === 0 ? (
                <div className={`p-4 rounded-xl text-center text-xs italic ${isDark ? "bg-zinc-950/30 text-zinc-550 border border-zinc-808" : "bg-slate-50/50 text-slate-450 border border-slate-205"}`}>
                  No other products found with this sub-type variant.
                </div>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
                  {similarProducts.map((simProd) => (
                    <div 
                      key={simProd.id}
                      onClick={() => setDetailProductId(simProd.id)}
                      className={`flex-none w-48 p-2.5 rounded-xl border cursor-pointer transition duration-200 hover:scale-[1.02] flex items-center gap-3 ${isDark ? "bg-zinc-950 border-zinc-808 hover:border-zinc-700 hover:bg-zinc-900/60" : "bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white"}`}
                    >
                      <div className="h-10 w-10 rounded-lg overflow-hidden shrink-0 border bg-zinc-900 border-zinc-800">
                        {simProd.photos && simProd.photos[0] ? (
                          <img 
                            src={simProd.photos[0]} 
                            alt={simProd.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-550">
                            <Package className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <span className={`text-xs font-bold block truncate transition duration-150 ${isDark ? "text-zinc-300 hover:text-indigo-400" : "text-slate-700 hover:text-indigo-650"}`}>
                          {simProd.name}
                        </span>
                        <span className="text-[10px] font-bold text-indigo-505 font-mono">₹{simProd.price || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Modal Bottom Actions */}
            <div className={`flex justify-end pt-3 border-t mt-1 ${isDark ? "border-zinc-808" : "border-slate-150"}`}>
              <button 
                type="button" 
                onClick={() => {
                  setDetailProductId("");
                  setIsDetailModalOpen(false);
                }}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg border transition duration-150 ${isDark ? "bg-zinc-950 hover:bg-zinc-850 border-zinc-850 text-zinc-400" : "bg-white hover:bg-zinc-100 border-zinc-205 text-zinc-650 hover:text-zinc-850 shadow-xs"}`}
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
      {/* App Branding Footer */}
      <footer className="text-center py-6 pb-8 border-t border-dashed border-zinc-808/10 mt-12 print:hidden">
        <p className="text-[11px] font-medium text-zinc-500 tracking-wide">
          Inventory & Billing Console • Developed by <span className="font-extrabold text-indigo-500 hover:text-indigo-400 transition cursor-pointer">Lecharme</span>
        </p>
      </footer>
    </div>
  );
}