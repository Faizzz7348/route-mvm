import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ImageWithCaption, MediaWithCaption } from "@shared/schema";
import { UseMutationResult } from "@tanstack/react-query";
import { ImageUploadModal } from "./image-upload-modal";

interface ImageEditSectionProps {
  rowId: string;
  images: ImageWithCaption[];
  location?: string;
  onClose: () => void;
  onAddImage: UseMutationResult<any, Error, { rowId: string; imageUrl: string; caption?: string }, unknown>;
  onUpdateImage: UseMutationResult<any, Error, { rowId: string; imageIndex: number; imageUrl?: string; caption?: string }, unknown>;
  onDeleteImage: UseMutationResult<any, Error, { rowId: string; imageIndex?: number }, unknown>;
  allMedia?: MediaWithCaption[]; // Optional: all available media for selection
}

export function ImageEditSection({ 
  rowId, 
  images, 
  location,
  onClose, 
  onAddImage, 
  onUpdateImage, 
  onDeleteImage,
  allMedia = []
}: ImageEditSectionProps) {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const { toast } = useToast();

  // Convert existing images to MediaWithCaption format
  const existingImages: MediaWithCaption[] = images.map(img => ({
    id: img.id || crypto.randomUUID(), // Generate ID if not exists
    url: img.url,
    caption: img.caption || "",
    type: "image" as const
  }));

  const handleSaveImages = async (updatedImages: MediaWithCaption[]) => {
    try {
      // Delete all existing images first
      if (images.length > 0) {
        await onDeleteImage.mutateAsync({ rowId });
      }

      // Add all new/updated images
      for (const image of updatedImages) {
        await onAddImage.mutateAsync({ 
          rowId, 
          imageUrl: image.url, 
          caption: image.caption 
        });
      }
      
      toast({
        title: "Success",
        description: `Images updated successfully.`,
      });
      
      setUploadModalOpen(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update images.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card className="bg-card/90 backdrop-blur-xl border-2 border-border shadow-2xl rounded-xl mb-6">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-6 flex items-center text-foreground text-center justify-center text-sm">
            <ImageIcon className="w-4 h-4 mr-2 text-primary" />
            📷 Manage Images - {location || 'Row'}
          </h3>
          
          <div className="flex flex-col gap-6 items-center text-center">
            <div className="bg-muted/50 backdrop-blur-sm border border-border rounded-lg p-6 w-full">
              <p className="text-muted-foreground mb-2 text-sm">
                Current images: <strong>{images.length}</strong>
              </p>
              <p className="text-muted-foreground mb-4 text-xs">
                Edit, replace, or delete existing images
              </p>
              <Button 
                onClick={() => setUploadModalOpen(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Manage Images
              </Button>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
              >
                Close
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Upload Modal with existing images */}
      <ImageUploadModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        existingImages={existingImages}
        onSave={handleSaveImages}
        allMedia={allMedia}
      />
    </>
  );
}
