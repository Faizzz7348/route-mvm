import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, Bookmark } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableState: {
    filters: {
      searchTerm: string;
      routeFilters: string[];
      deliveryFilters: string[];
    };
    sorting: {
      column: string;
      direction: 'asc' | 'desc';
    } | null;
    columnVisibility: Record<string, boolean>;
    columnOrder: string[];
  };
}

export function ShareDialog({ open, onOpenChange, tableState }: ShareDialogProps) {
  const [shareUrl, setShareUrl] = useState<string>("");
  const [shareId, setShareId] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [remark, setRemark] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateShareUrl = async () => {
    setIsGenerating(true);
    try {
      // Generate a unique 6-character share ID
      const generatedShareId = Math.random().toString(36).substring(2, 8);
      
      // Create shared state via API (remark will be added later when saving)
      const response = await apiRequest("POST", "/api/share-table", {
        shareId: generatedShareId,
        tableState,
        remark: "",
      });

      if (!response.ok) {
        throw new Error("Failed to create share link");
      }

      // Generate the shareable URL
      const url = `${window.location.origin}/share/${generatedShareId}`;
      setShareUrl(url);
      setShareId(generatedShareId);
      
      toast({
        title: "Share link created",
        description: "Your table view has been saved and can now be shared.",
      });
    } catch (error) {
      console.error("Error generating share link:", error);
      toast({
        title: "Error",
        description: "Failed to create share link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const saveShareLink = async () => {
    setIsSaving(true);
    try {
      // First, update the shared table state with the remark
      const updateResponse = await apiRequest("PUT", `/api/share-table/${shareId}/remark`, {
        remark: remark.trim(),
      });

      if (!updateResponse.ok) {
        throw new Error("Failed to update share link remark");
      }

      // Then save to saved links
      const response = await apiRequest("POST", "/api/saved-share-links", {
        shareId,
        url: shareUrl,
        remark: remark.trim(),
      });

      if (!response.ok) {
        throw new Error("Failed to save share link");
      }

      setIsSaved(true);
      
      // Invalidate saved links query to auto-refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/saved-share-links"] });
      
      toast({
        title: "Link saved!",
        description: "Share link has been added to your saved links.",
      });
    } catch (error) {
      console.error("Error saving share link:", error);
      toast({
        title: "Error",
        description: "Failed to save share link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Share link copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast({
        title: "Error",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset state when closing
      setShareUrl("");
      setShareId("");
      setCopied(false);
      setIsSaved(false);
      setRemark("");
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] animate-in zoom-in-95 duration-300 data-[state=closed]:animate-out data-[state=closed]:zoom-out-90 bg-white/70 dark:bg-black/30 backdrop-blur-2xl border-2 border-gray-200/60 dark:border-white/10 shadow-[0_20px_60px_0_rgba(0,0,0,0.25)] rounded-xl">
        {/* Enhanced Premium Frosted Glass Layer */}
        <div 
          className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-white/70 via-white/50 to-white/60 dark:from-black/50 dark:via-black/30 dark:to-black/40 border-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),inset_0_-1px_1px_rgba(0,0,0,0.1)]" 
          style={{
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          }}
        >
          {/* Subtle top shine effect */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 dark:via-white/20 to-transparent" />
          {/* Ambient glow */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-blue-500/5 via-transparent to-purple-500/5 dark:from-blue-400/10 dark:via-transparent dark:to-purple-400/10" />
        </div>
        
        <DialogHeader>
          <DialogTitle>Share Table View</DialogTitle>
          <DialogDescription>
            Create a shareable link for the current table state including filters, sorting, and visible columns.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {!shareUrl ? (
            <Button
              onClick={generateShareUrl}
              disabled={isGenerating}
              className="w-full transition-all duration-300 hover:scale-[1.02] active:scale-95 bg-transparent hover:bg-blue-500/10 border-2 border-blue-500/30 hover:border-blue-500/50 text-black dark:text-gray-400 hover:text-blue-600 dark:hover:text-gray-300 font-medium"
              data-testid="button-generate-share-link"
            >
              {isGenerating ? "Generating..." : "Generate Share Link"}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="flex-1"
                  data-testid="input-share-url"
                />
                <Button
                  onClick={copyToClipboard}
                  size="sm"
                  variant="outline"
                  className="shrink-0 transition-all duration-300 hover:scale-110 active:scale-95"
                  data-testid="button-copy-share-link"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  onClick={saveShareLink}
                  size="sm"
                  variant={isSaved ? "default" : "outline"}
                  className="shrink-0 transition-all duration-300 hover:scale-110 active:scale-95"
                  disabled={isSaving || isSaved}
                  data-testid="button-save-share-link"
                  title={isSaved ? "Link saved" : "Save link"}
                >
                  {isSaved ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Bookmark className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Remark (optional)
                </label>
                <Input
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="e.g., Weekend delivery route, KL 3 only..."
                  className="w-full"
                  data-testid="input-share-remark"
                />
              </div>
              <div className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/50">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Anyone with this link can view your table with the current filters and settings.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            className="transition-all duration-300 hover:scale-[1.02] active:scale-95"
            data-testid="button-cancel-share"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
