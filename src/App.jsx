import { useEffect } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import CloneCampaign from "./routes/clone-campaign";
import CampaignSetup from "./routes/campaign-setup";

const TITLES = {
  "/": "Clone Campaign",
  "/campaign-setup": "Campaign Setup",
};

function useDocumentTitle() {
  const { pathname } = useLocation();
  useEffect(() => {
    const path = pathname.replace(/\/+$/, "") || "/";
    const title = TITLES[path];
    document.title = title ? `${title} | DIGIT HCM` : "DIGIT HCM";
    window.scrollTo(0, 0);
  }, [pathname]);
}

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  useDocumentTitle();
  return (
    <Routes>
      <Route path="/" element={<CloneCampaign />} />
      <Route path="/campaign-setup" element={<CampaignSetup />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
