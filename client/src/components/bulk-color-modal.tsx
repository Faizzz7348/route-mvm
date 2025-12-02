import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Palette } from "lucide-react";

interface BulkColorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  routeOptions: string[];
  onUpdate: (route: string, color: string) => void;
  isPending: boolean;
  currentRows: Array<{ route: string; markerColor?: string }>;
}

export function BulkColorModal({ 
  open, 
  onOpenChange, 
  routeOptions, 
  onUpdate, 
  isPending,
  currentRows 
}: BulkColorModalProps) {
  const [selectedRoute, setSelectedRoute] = useState("");
  const [selectedColor, setSelectedColor] = useState("#3b82f6");

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedRoute("");
      setSelectedColor("#3b82f6");
    }
  }, [open]);

  // Get current color for selected route
  const currentColor = selectedRoute 
    ? currentRows.find(r => r.route === selectedRoute)?.markerColor || '#3b82f6'
    : '#3b82f6';

  const handleUpdate = () => {
    if (selectedRoute) {
      onUpdate(selectedRoute, selectedColor);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white/80 dark:bg-black/80 backdrop-blur-3xl border-2 border-purple-200/60 dark:border-purple-700/60 shadow-[0_20px_80px_0_rgba(168,85,247,0.4)]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
            <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Bulk Edit Marker Color
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-5 py-4">
          {/* Route Selection */}
          <div className="space-y-2">
            <Label htmlFor="route-select" className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              Select Route
            </Label>
            <select
              id="route-select"
              value={selectedRoute}
              onChange={(e) => setSelectedRoute(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-white/60 dark:bg-black/60 backdrop-blur-xl border-2 border-purple-200 dark:border-purple-800 rounded-xl font-medium shadow-sm hover:border-purple-400 dark:hover:border-purple-600 focus:border-purple-500 dark:focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
            >
              <option value="">-- Select Route --</option>
              {routeOptions.map((route) => (
                <option key={route} value={route}>
                  {route}
                </option>
              ))}
            </select>
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center justify-between">
              <span>New Marker Color</span>
              {selectedRoute && (
                <span className="flex items-center gap-1.5 text-xs font-normal text-gray-600 dark:text-gray-400">
                  Current:
                  <span 
                    className="inline-block w-5 h-5 rounded-md border-2 border-gray-400 dark:border-gray-500 shadow-sm"
                    style={{ backgroundColor: currentColor }}
                    title={currentColor}
                  />
                  <span className="font-mono text-[10px]">{currentColor}</span>
                </span>
              )}
            </Label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="h-14 w-20 rounded-xl border-2 border-purple-300 dark:border-purple-700 cursor-pointer shadow-md hover:scale-105 transition-transform"
              />
              <div className="flex-1 px-4 py-3 bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-xl">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Selected Color</div>
                <div className="font-mono text-sm font-bold text-purple-700 dark:text-purple-300">
                  {selectedColor}
                </div>
              </div>
            </div>
          </div>

          {/* Info Message */}
          <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/40 dark:to-pink-950/40 border border-purple-200 dark:border-purple-800 rounded-xl">
            <p className="text-xs text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
              {selectedRoute 
                ? (
                  <>
                    <span className="text-green-600 dark:text-green-400 font-bold">✓</span> Will update marker colors for <span className="font-bold text-purple-700 dark:text-purple-300">ALL</span> locations in route <span className="font-bold">"{selectedRoute}"</span>
                  </>
                )
                : (
                  <>
                    <span className="text-blue-600 dark:text-blue-400 font-bold">💡</span> Select a route to bulk update marker colors for all locations
                  </>
                )
              }
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="bg-white/60 dark:bg-black/60 backdrop-blur-xl border-gray-300 dark:border-gray-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={!selectedRoute || isPending}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Updating...
              </>
            ) : (
              <>
                <Palette className="w-4 h-4 mr-2" />
                Update Color
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
