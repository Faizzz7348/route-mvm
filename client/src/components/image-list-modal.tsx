import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { MediaWithCaption } from "@shared/schema";

interface ImageListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: MediaWithCaption[];
  location: string;
  onAddImage: () => void;
  onEditImage: (index: number) => void;
  onDeleteImage: (index: number) => void;
}

export function ImageListModal({
  open,
  onOpenChange,
  images,
  location,
  onAddImage,
  onEditImage,
  onDeleteImage
}: ImageListModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Manage Images - {location}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add Image Button */}
          <Button
            onClick={onAddImage}
            className="w-full"
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Image
          </Button>

          {/* Images List */}
          {images.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No images yet. Click "Add New Image" to get started.
            </div>
          ) : (
            <div className="grid gap-3">
              {images.map((media, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  {/* Image Preview */}
                  <img
                    src={media.url.startsWith('data:') ? media.url : `${media.url}?w=80&h=80&fit=crop`}
                    alt={media.caption || `Image ${index + 1}`}
                    className="w-16 h-16 object-cover rounded border"
                  />

                  {/* Caption */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {media.caption || `Image ${index + 1}`}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {media.url.substring(0, 60)}...
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEditImage(index)}
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        if (confirm(`Delete "${media.caption || `Image ${index + 1}`}"?`)) {
                          onDeleteImage(index);
                        }
                      }}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
