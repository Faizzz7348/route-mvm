import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Link as LinkIcon, X } from "lucide-react";
import type { MediaWithCaption } from "@shared/schema";

// ImgBB API Configuration
const IMGBB_API_KEY = '4042c537845e8b19b443add46f4a859c';
const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload';

interface SimpleImageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (media: MediaWithCaption) => void;
  mode?: 'add' | 'edit';
  existingMedia?: MediaWithCaption;
}

export function SimpleImageModal({ open, onOpenChange, onSave, mode = 'add', existingMedia }: SimpleImageModalProps) {
  const [activeTab, setActiveTab] = useState<string>("url");
  const [isUploading, setIsUploading] = useState(false);
  
  // URL tab state
  const [imageUrl, setImageUrl] = useState(existingMedia?.url || "");
  const [urlCaption, setUrlCaption] = useState(existingMedia?.caption || "");
  
  // Upload tab state
  const [uploadedImageData, setUploadedImageData] = useState<string | null>(null);
  const [uploadCaption, setUploadCaption] = useState(existingMedia?.caption || "");
  const [uploadPreview, setUploadPreview] = useState<string | null>(existingMedia?.url || null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setImageUrl("");
    setUrlCaption("");
    setUploadedImageData(null);
    setUploadCaption("");
    setUploadPreview(null);
    setIsUploading(false);
    setActiveTab("url");
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  // ImgBB Upload Function
  const uploadToImgBB = async (base64Image: string): Promise<{ url: string; thumb: string; medium: string; deleteUrl: string }> => {
    try {
      const base64Data = base64Image.split(',')[1] || base64Image;
      
      const formData = new FormData();
      formData.append('key', IMGBB_API_KEY);
      formData.append('image', base64Data);
      
      const response = await fetch(IMGBB_UPLOAD_URL, {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        return {
          url: result.data.url,
          thumb: result.data.medium?.url || result.data.thumb.url,
          medium: result.data.medium?.url || result.data.url,
          deleteUrl: result.data.delete_url
        };
      } else {
        throw new Error(result.error?.message || 'Upload failed');
      }
    } catch (error) {
      console.error('ImgBB upload error:', error);
      throw error;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedImageData(result);
        setUploadPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedImageData(result);
        setUploadPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setIsUploading(true);

      if (activeTab === "url") {
        // URL tab
        if (!imageUrl || !urlCaption) {
          alert('Please fill in both URL and caption');
          setIsUploading(false);
          return;
        }

        const media: MediaWithCaption = {
          url: imageUrl,
          caption: urlCaption,
          type: "image"
        };

        onSave(media);
      } else {
        // Upload tab
        if (!uploadedImageData) {
          alert('Please upload an image');
          setIsUploading(false);
          return;
        }

        if (!uploadCaption) {
          alert('Please enter a caption');
          setIsUploading(false);
          return;
        }

        // Upload to ImgBB
        const uploadResult = await uploadToImgBB(uploadedImageData);

        const media: MediaWithCaption = {
          url: uploadResult.url,
          caption: uploadCaption,
          type: "image",
          thumbnail: uploadResult.thumb
        };

        onSave(media);
      }

      handleClose();
    } catch (error) {
      console.error('Error saving image:', error);
      alert('Failed to save image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Image' : 'Add Image'}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url" className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              Add by URL
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload Image
            </TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="urlCaption">Caption</Label>
              <Input
                id="urlCaption"
                type="text"
                placeholder="Image caption"
                value={urlCaption}
                onChange={(e) => setUrlCaption(e.target.value)}
              />
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Upload Image</Label>
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                
                {uploadPreview ? (
                  <div className="relative">
                    <img
                      src={uploadPreview}
                      alt="Preview"
                      className="max-w-full max-h-[200px] mx-auto rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadPreview(null);
                        setUploadedImageData(null);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Upload className="w-12 h-12" />
                    <p>Click to upload or drag and drop</p>
                    <p className="text-sm">PNG, JPG, GIF up to 10MB</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="uploadCaption">Caption</Label>
              <Input
                id="uploadCaption"
                type="text"
                placeholder="Image caption"
                value={uploadCaption}
                onChange={(e) => setUploadCaption(e.target.value)}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isUploading}>
            {isUploading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
