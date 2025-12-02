import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import TablePage from "@/pages/table";
import SharedTablePage from "@/pages/shared-table";
import CustomTableList from "@/pages/custom-table-list";
import CustomTableView from "@/pages/custom-table";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";
import { RefreshCw } from "lucide-react";

function Router() {
  const { toast } = useToast();

  // Check for service worker updates
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                toast({
                  title: "Update Available",
                  description: "A new version is available. Refresh to update.",
                  action: (
                    <button
                      onClick={() => window.location.reload()}
                      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Refresh
                    </button>
                  ),
                  duration: 10000,
                });
              }
            });
          }
        });

        // Check for updates every 30 minutes
        setInterval(() => {
          registration.update();
        }, 30 * 60 * 1000);
      });
    }
  }, [toast]);

  return (
    <div className="min-h-screen pb-16 text-sm">
      <Switch>
        <Route path="/">
          {() => <TablePage />}
        </Route>
        <Route path="/share/:shareId">
          {() => <SharedTablePage />}
        </Route>
        <Route path="/custom-tables">
          {() => <CustomTableList />}
        </Route>
        <Route path="/custom/:shareId">
          {() => <CustomTableView />}
        </Route>
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
