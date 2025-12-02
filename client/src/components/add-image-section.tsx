import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageIcon, Plus } from "lucide-react";
import { UseMutationResult } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ImageUploadModal } from "./image-upload-modal";
import { MediaWithCaption } from "@shared/schema";

interface AddImageSectionProps {
  rowId: string;
  location?: string;
  onClose: () => void;
  onAddImage: UseMutationResult<any, Error, { rowId: string; imageUrl: string; caption?: string }, unknown>;
  allMedia?: MediaWithCaption[]; // Optional: all available media for selection
}

export function AddImageSection({ rowId, location, onClose, onAddImage, allMedia = [] }: AddImageSectionProps) {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const { toast } = useToast();

  const handleSaveImages = async (images: MediaWithCaption[]) => {
    try {
      for (const image of images) {
        await onAddImage.mutateAsync({ 
          rowId, 
          imageUrl: image.url, 
          caption: image.caption 
        });
      }
      
      toast({
        title: "Images Added",
        description: `${images.length} image(s) added successfully.`,
      });
      
      setUploadModalOpen(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add some images.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card className="bg-card/90 backdrop-blur-xl border-2 border-border shadow-2xl rounded-xl mb-6" data-testid="add-image-section">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-6 flex items-center text-foreground text-center justify-center text-sm">
            <ImageIcon className="w-4 h-4 mr-2 text-primary" />
            📷 Add Media to {location || 'Row'}
          </h3>
          
          <div className="flex flex-col gap-6 items-center text-center">
            <div className="bg-muted/50 backdrop-blur-sm border border-border rounded-lg p-6">
              <p className="text-muted-foreground mb-4 text-sm">
                🎬 Add images to this location
              </p>
              <Button 
                onClick={() => setUploadModalOpen(true)}
                className="bg-green-500 hover:bg-green-600 text-white"
                data-testid="button-open-media-upload"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Images
              </Button>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Upload Modal */}
      <ImageUploadModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        onSave={handleSaveImages}
        allMedia={allMedia}
      />
    </>
  );
}