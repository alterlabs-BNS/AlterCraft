import React, { lazy } from "react";
import { Navigate, createBrowserRouter, useLocation, type RouteObject } from "react-router";
import { useAuth } from "./contexts/AuthContext";

const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const ProductGalleryPage = lazy(() =>
  import("./components/ProductGalleryPage").then((module) => ({ default: module.ProductGalleryPage }))
);
const Shop = lazy(() => import("./pages/Shop"));
const ShopProduct = lazy(() => import("./pages/ShopProduct"));
const AccountDashboard = lazy(() => import("./pages/Account").then((module) => ({ default: module.AccountDashboard })));
const AccountSignIn = lazy(() => import("./pages/Account").then((module) => ({ default: module.AccountSignIn })));
const AccountSignUp = lazy(() => import("./pages/Account").then((module) => ({ default: module.AccountSignUp })));
const ModularKitchenNearMe = lazy(() =>
  import("./pages/ModularKitchenNearMe").then((module) => ({ default: module.ModularKitchenNearMe }))
);
const ModularKitchenGhaziabad = lazy(() =>
  import("./pages/LocalServicePages").then((module) => ({ default: module.ModularKitchenGhaziabad }))
);
const ModularKitchenNoida = lazy(() =>
  import("./pages/LocalServicePages").then((module) => ({ default: module.ModularKitchenNoida }))
);
const CustomFurnitureGhaziabad = lazy(() =>
  import("./pages/LocalServicePages").then((module) => ({ default: module.CustomFurnitureGhaziabad }))
);
const CustomFurnitureNoida = lazy(() =>
  import("./pages/LocalServicePages").then((module) => ({ default: module.CustomFurnitureNoida }))
);
const CustomFurnitureGreaterNoida = lazy(() =>
  import("./pages/LocalServicePages").then((module) => ({ default: module.CustomFurnitureGreaterNoida }))
);
const CustomFurnitureMakerNearMe = lazy(() =>
  import("./pages/LocalServicePages").then((module) => ({ default: module.CustomFurnitureMakerNearMe }))
);
const FurnitureMakerGhaziabad = lazy(() =>
  import("./pages/LocalServicePages").then((module) => ({ default: module.FurnitureMakerGhaziabad }))
);
const FurnitureMakerModinagarGhaziabad = lazy(() =>
  import("./pages/LocalServicePages").then((module) => ({ default: module.FurnitureMakerModinagarGhaziabad }))
);
const ModularKitchenQuotationGhaziabad = lazy(() =>
  import("./pages/LocalServicePages").then((module) => ({ default: module.ModularKitchenQuotationGhaziabad }))
);
const WardrobeQuotationGhaziabad = lazy(() =>
  import("./pages/LocalServicePages").then((module) => ({ default: module.WardrobeQuotationGhaziabad }))
);
const CustomFurnitureQuotationGhaziabad = lazy(() =>
  import("./pages/LocalServicePages").then((module) => ({ default: module.CustomFurnitureQuotationGhaziabad }))
);
const WorkstationManufacturersGhaziabad = lazy(() =>
  import("./pages/LocalServicePages").then((module) => ({ default: module.WorkstationManufacturersGhaziabad }))
);
const AIInteriorDesignPlanner = lazy(() =>
  import("./pages/LocalServicePages").then((module) => ({ default: module.AIInteriorDesignPlanner }))
);
const OfficeInteriorGhaziabad = lazy(() =>
  import("./pages/LocalServicePages").then((module) => ({ default: module.OfficeInteriorGhaziabad }))
);
const OfficeInteriorNoida = lazy(() =>
  import("./pages/LocalServicePages").then((module) => ({ default: module.OfficeInteriorNoida }))
);
const WardrobeDesignGhaziabad = lazy(() =>
  import("./pages/LocalServicePages").then((module) => ({ default: module.WardrobeDesignGhaziabad }))
);
const WardrobeGhaziabad = lazy(() =>
  import("./pages/LocalServicePages").then((module) => ({ default: module.WardrobeGhaziabad }))
);
const TVUnitGhaziabad = lazy(() =>
  import("./pages/LocalServicePages").then((module) => ({ default: module.TVUnitGhaziabad }))
);
const OfficeFurnitureGhaziabad = lazy(() =>
  import("./pages/LocalServicePages").then((module) => ({ default: module.OfficeFurnitureGhaziabad }))
);
const InteriorsGhaziabad = lazy(() =>
  import("./pages/LocalServicePages").then((module) => ({ default: module.InteriorsGhaziabad }))
);
const BedManufacturerGhaziabad = lazy(() =>
  import("./pages/LocalServicePages").then((module) => ({ default: module.BedManufacturerGhaziabad }))
);
const ShoeRackDesign = lazy(() =>
  import("./pages/LocalServicePages").then((module) => ({ default: module.ShoeRackDesign }))
);
const ModularKitchen = lazy(() =>
  import("./pages/servicePages").then((module) => ({ default: module.ModularKitchen }))
);
const DesignerBeds = lazy(() =>
  import("./pages/servicePages").then((module) => ({ default: module.DesignerBeds }))
);
const BedsStorefront = lazy(() => import("./pages/BedsStorefront"));
const FlushDoors = lazy(() =>
  import("./pages/servicePages").then((module) => ({ default: module.FlushDoors }))
);
const Wardrobes = lazy(() =>
  import("./pages/servicePages").then((module) => ({ default: module.Wardrobes }))
);
const OfficeCommercial = lazy(() =>
  import("./pages/servicePages").then((module) => ({ default: module.OfficeCommercial }))
);
const WarrantyQuality = lazy(() =>
  import("./pages/InfoPages").then((module) => ({ default: module.WarrantyQuality }))
);
const About = lazy(() =>
  import("./pages/InfoPages").then((module) => ({ default: module.About }))
);
const Contact = lazy(() =>
  import("./pages/InfoPages").then((module) => ({ default: module.Contact }))
);
const NotFound = lazy(() =>
  import("./pages/InfoPages").then((module) => ({ default: module.NotFound }))
);
const AIPlannerLanding = lazy(() =>
  import("./pages/AIPlanner").then((module) => ({ default: module.AIPlannerLanding }))
);
const AIPlannerStart = lazy(() =>
  import("./pages/AIPlanner").then((module) => ({ default: module.AIPlannerStart }))
);
const AIPlannerUpload = lazy(() =>
  import("./pages/AIPlanner").then((module) => ({ default: module.AIPlannerUpload }))
);
const AIPlannerDimensions = lazy(() =>
  import("./pages/AIPlanner").then((module) => ({ default: module.AIPlannerDimensions }))
);
const AIPlannerRequirements = lazy(() =>
  import("./pages/AIPlanner").then((module) => ({ default: module.AIPlannerRequirements }))
);
const AIPlannerConfirm = lazy(() =>
  import("./pages/AIPlanner").then((module) => ({ default: module.AIPlannerConfirm }))
);
const AIPlannerSubmitted = lazy(() =>
  import("./pages/AIPlanner").then((module) => ({ default: module.AIPlannerSubmitted }))
);
const MyProjects = lazy(() =>
  import("./pages/AIPlanner").then((module) => ({ default: module.MyProjects }))
);
const MyProjectDetail = lazy(() =>
  import("./pages/AIPlanner").then((module) => ({ default: module.MyProjectDetail }))
);
const AdminLeads = lazy(() =>
  import("./pages/AIPlanner").then((module) => ({ default: module.AdminLeads }))
);
const AdminProjectDetail = lazy(() =>
  import("./pages/AIPlanner").then((module) => ({ default: module.AdminProjectDetail }))
);
const ACOSDashboard = lazy(() =>
  import("./pages/ACOS").then((module) => ({ default: module.ACOSDashboard }))
);
const ACOSLogin = lazy(() =>
  import("./pages/ACOS").then((module) => ({ default: module.ACOSLogin }))
);
const ACOSSignUp = lazy(() =>
  import("./pages/ACOS").then((module) => ({ default: module.ACOSSignUp }))
);
const ACOSResetPassword = lazy(() =>
  import("./pages/ACOS").then((module) => ({ default: module.ACOSResetPassword }))
);
const ACOSForbidden = lazy(() =>
  import("./pages/ACOS").then((module) => ({ default: module.ACOSForbidden }))
);
const ACOSLeads = lazy(() =>
  import("./pages/ACOS").then((module) => ({ default: module.ACOSLeads }))
);
const ACOSProduction = lazy(() =>
  import("./pages/ACOS").then((module) => ({ default: module.ACOSProduction }))
);
const ACOSFinances = lazy(() =>
  import("./pages/ACOS").then((module) => ({ default: module.ACOSFinances }))
);
const ACOSMarketing = lazy(() =>
  import("./pages/ACOS").then((module) => ({ default: module.ACOSMarketing }))
);
const ACOSHR = lazy(() =>
  import("./pages/ACOS").then((module) => ({ default: module.ACOSHR }))
);
const ACOSMarketplace = lazy(() =>
  import("./pages/ACOS").then((module) => ({ default: module.ACOSMarketplace }))
);
const ACOSReports = lazy(() =>
  import("./pages/ACOS").then((module) => ({ default: module.ACOSReports }))
);
const ACOSUsers = lazy(() =>
  import("./pages/ACOS").then((module) => ({ default: module.ACOSUsers }))
);
const ACOSBackendGuide = lazy(() =>
  import("./pages/ACOS").then((module) => ({ default: module.ACOSBackendGuide }))
);
const ContractorDesk = lazy(() => import("./pages/ContractorDesk"));
const ContractorAdminDesk = lazy(() => import("./pages/ContractorAdminDesk"));
const OperatorDesk = lazy(() => import("./pages/OperatorDesk"));
const contractorDeskApkPath = "/downloads/contractor-desk-debug.apk";

function FlipHomeRedirect() {
  React.useEffect(() => {
    window.location.replace("/home-flip.html");
  }, []);

  return (
    <main className="site-error-fallback">
      <div className="site-error-fallback__panel">
        <p>AlterCraft</p>
        <h1>Opening the store.</h1>
        <span>If the homepage does not open automatically, use the link below.</span>
        <div>
          <a href="/home-flip.html">Enter AlterCraft</a>
          <a href="/shop">Go to Shop</a>
        </div>
      </div>
    </main>
  );
}

function StaticBlogRedirect() {
  React.useEffect(() => {
    window.location.replace("/blog/index.html");
  }, []);

  return (
    <main className="site-error-fallback">
      <div className="site-error-fallback__panel">
        <p>AlterCraft Blog</p>
        <h1>Opening the planning guides.</h1>
        <span>If the blog does not open automatically, use the blog index link.</span>
        <div>
          <a href="/blog/index.html">Open Blog</a>
          <a href="/">Go Home</a>
        </div>
      </div>
    </main>
  );
}

function ContractorDeskApkRedirect() {
  React.useEffect(() => {
    window.location.replace(contractorDeskApkPath);
  }, []);

  return (
    <main className="site-error-fallback">
      <div className="site-error-fallback__panel">
        <p>Contractor Desk APK</p>
        <h1>Your download is starting.</h1>
        <span>If it does not start automatically, use the official APK download link.</span>
        <div>
          <a href={contractorDeskApkPath}>Download APK</a>
          <a href="/ContractorDesk">Contractor Desk</a>
        </div>
      </div>
    </main>
  );
}

function SiteErrorFallback() {
  return (
    <main className="site-error-fallback">
      <div className="site-error-fallback__panel">
        <p>AlterCraft</p>
        <h1>We could not load this page properly.</h1>
        <span>Please return home or contact AlterCraft and we will help you continue.</span>
        <div>
          <a href="/">Go Home</a>
          <a href="/contact">Contact Us</a>
        </div>
      </div>
    </main>
  );
}

function AdminOnly({ children }: { children: React.ReactNode }) {
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  if (!isAdmin) {
    return <Navigate to="/admin/forbidden" replace />;
  }

  return <>{children}</>;
}

const adminOnly = (children: React.ReactNode) => <AdminOnly>{children}</AdminOnly>;

function withSiteErrorFallback(routes: RouteObject[]): RouteObject[] {
  return routes.map((route) => {
    const routeWithFallback: RouteObject = {
      ...route,
      errorElement: route.errorElement ?? <SiteErrorFallback />,
    };

    if (route.children) {
      routeWithFallback.children = withSiteErrorFallback(route.children);
    }

    return routeWithFallback;
  });
}

export const router = createBrowserRouter(withSiteErrorFallback([
  {
    path: "/",
    Component: FlipHomeRedirect,
  },
  {
    path: "/false",
    element: <Navigate to="/" replace />,
  },
  {
    path: "/gallery",
    Component: ProductGalleryPage,
  },
  {
    path: "/portfolio",
    Component: ProductGalleryPage,
  },
  {
    path: "/products",
    Component: ProductGalleryPage,
  },
  {
    path: "/shop",
    Component: Shop,
  },
  {
    path: "/shop/p/:slug",
    Component: ShopProduct,
  },
  {
    path: "/account",
    Component: AccountDashboard,
  },
  {
    path: "/account/sign-in",
    Component: AccountSignIn,
  },
  {
    path: "/account/sign-up",
    Component: AccountSignUp,
  },
  {
    path: "/ContractorDesk",
    Component: ContractorDesk,
  },
  {
    path: "/contractor-desk",
    Component: ContractorDesk,
  },
  {
    path: "/contractor-admin",
    Component: ContractorAdminDesk,
  },
  {
    path: "/blog",
    Component: StaticBlogRedirect,
  },
  {
    path: "/blog/",
    Component: StaticBlogRedirect,
  },
  {
    path: "/downloads/contractor-desk-debug.apk",
    Component: ContractorDeskApkRedirect,
  },
  {
    path: "/downloads/contractor-desk-debug",
    Component: ContractorDeskApkRedirect,
  },
  {
    path: "/downloads/operator-desk-debug.apk",
    Component: ContractorDeskApkRedirect,
  },
  {
    path: "/downloads/operator-desk-debug",
    Component: ContractorDeskApkRedirect,
  },
  {
    path: "/OperatorDesk",
    element: <Navigate to="/operator-desk/dashboard" replace />,
  },
  {
    path: "/operator-desk",
    Component: OperatorDesk,
  },
  {
    path: "/operator-desk/:screen",
    Component: OperatorDesk,
  },
  {
    path: "/modular-kitchen",
    Component: ModularKitchen,
  },
  {
    path: "/modular-kitchen-near-me",
    Component: ModularKitchenNearMe,
  },
  {
    path: "/modular-kitchen-near-me/",
    Component: ModularKitchenNearMe,
  },
  {
    path: "/modular-kitchen-ghaziabad",
    Component: ModularKitchenGhaziabad,
  },
  {
    path: "/modular-kitchen-noida",
    Component: ModularKitchenNoida,
  },
  {
    path: "/custom-furniture-ghaziabad",
    Component: CustomFurnitureGhaziabad,
  },
  {
    path: "/custom-furniture-noida",
    Component: CustomFurnitureNoida,
  },
  {
    path: "/custom-furniture-greater-noida",
    Component: CustomFurnitureGreaterNoida,
  },
  {
    path: "/custom-furniture-maker-near-me",
    Component: CustomFurnitureMakerNearMe,
  },
  {
    path: "/furniture-maker-ghaziabad",
    Component: FurnitureMakerGhaziabad,
  },
  {
    path: "/furniture-maker-modinagar-ghaziabad",
    Component: FurnitureMakerModinagarGhaziabad,
  },
  {
    path: "/furniture-maker-in-modinagar-ghaziabad",
    Component: FurnitureMakerModinagarGhaziabad,
  },
  {
    path: "/modular-kitchen-quotation-ghaziabad",
    Component: ModularKitchenQuotationGhaziabad,
  },
  {
    path: "/wardrobe-quotation-ghaziabad",
    Component: WardrobeQuotationGhaziabad,
  },
  {
    path: "/custom-furniture-quotation-ghaziabad",
    Component: CustomFurnitureQuotationGhaziabad,
  },
  {
    path: "/workstation-manufacturers-ghaziabad",
    Component: WorkstationManufacturersGhaziabad,
  },
  {
    path: "/ai-interior-design-planner",
    Component: AIInteriorDesignPlanner,
  },
  {
    path: "/office-interior-ghaziabad",
    Component: OfficeInteriorGhaziabad,
  },
  {
    path: "/office-interior-noida",
    Component: OfficeInteriorNoida,
  },
  {
    path: "/wardrobe-design-ghaziabad",
    Component: WardrobeDesignGhaziabad,
  },
  {
    path: "/wardrobe-ghaziabad",
    Component: WardrobeGhaziabad,
  },
  {
    path: "/tv-unit-ghaziabad",
    Component: TVUnitGhaziabad,
  },
  {
    path: "/office-furniture-ghaziabad",
    Component: OfficeFurnitureGhaziabad,
  },
  {
    path: "/interiors-ghaziabad",
    Component: InteriorsGhaziabad,
  },
  {
    path: "/bed-manufacturer-ghaziabad",
    Component: BedManufacturerGhaziabad,
  },
  {
    path: "/shoe-rack-design",
    Component: ShoeRackDesign,
  },
  {
    path: "/kitchen",
    Component: ModularKitchen,
  },
  {
    path: "/designer-beds",
    Component: DesignerBeds,
  },
  {
    path: "/beds",
    Component: BedsStorefront,
  },
  {
    path: "/flush-doors",
    Component: FlushDoors,
  },
  {
    path: "/doors",
    Component: FlushDoors,
  },
  {
    path: "/wardrobes",
    Component: Wardrobes,
  },
  {
    path: "/storage",
    Component: Wardrobes,
  },
  {
    path: "/office-commercial",
    Component: OfficeCommercial,
  },
  {
    path: "/office",
    Component: OfficeCommercial,
  },
  {
    path: "/warranty-quality",
    Component: WarrantyQuality,
  },
  {
    path: "/warranty",
    Component: WarrantyQuality,
  },
  {
    path: "/about",
    Component: About,
  },
  {
    path: "/contact",
    Component: Contact,
  },
  {
    path: "/get-quote",
    Component: Contact,
  },
  {
    path: "/ai-planner",
    Component: AIPlannerLanding,
  },
  {
    path: "/ai-planner/start",
    Component: AIPlannerStart,
  },
  {
    path: "/ai-planner/upload",
    Component: AIPlannerUpload,
  },
  {
    path: "/ai-planner/dimensions",
    Component: AIPlannerDimensions,
  },
  {
    path: "/ai-planner/requirements",
    Component: AIPlannerRequirements,
  },
  {
    path: "/ai-planner/confirm",
    Component: AIPlannerConfirm,
  },
  {
    path: "/ai-planner/submitted",
    Component: AIPlannerSubmitted,
  },
  {
    path: "/my-projects",
    Component: MyProjects,
  },
  {
    path: "/my-projects/:id",
    Component: MyProjectDetail,
  },
  {
    path: "/admin",
    element: adminOnly(<ACOSDashboard />),
  },
  {
    path: "/admin/login",
    Component: ACOSLogin,
  },
  {
    path: "/admin/signup",
    Component: ACOSSignUp,
  },
  {
    path: "/admin/reset-password",
    Component: ACOSResetPassword,
  },
  {
    path: "/admin/forbidden",
    Component: ACOSForbidden,
  },
  {
    path: "/admin/leads",
    element: adminOnly(<ACOSLeads />),
  },
  {
    path: "/admin/design-requests",
    element: adminOnly(<AdminLeads />),
  },
  {
    path: "/admin/projects/:id",
    element: adminOnly(<AdminProjectDetail />),
  },
  {
    path: "/admin/production",
    element: adminOnly(<ACOSProduction />),
  },
  {
    path: "/admin/finances",
    element: adminOnly(<ACOSFinances />),
  },
  {
    path: "/admin/marketing",
    element: adminOnly(<ACOSMarketing />),
  },
  {
    path: "/admin/hr",
    element: adminOnly(<ACOSHR />),
  },
  {
    path: "/admin/marketplace",
    element: adminOnly(<ACOSMarketplace />),
  },
  {
    path: "/admin/reports",
    element: adminOnly(<ACOSReports />),
  },
  {
    path: "/admin/users",
    element: adminOnly(<ACOSUsers />),
  },
  {
    path: "/admin/backend-guide",
    element: adminOnly(<ACOSBackendGuide />),
  },
  {
    path: "/product/:id",
    Component: ProductDetail,
  },
  {
    path: "/products/:id",
    Component: ProductDetail,
  },
  {
    path: "*",
    Component: NotFound,
  },
]));
