import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageIcon, Pencil, Trash2, X, AlertTriangle } from "lucide-react";
import { UseMutationResult } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ImageData {
  url: string;
  caption?: string;
  thumbnail?: string;
  type?: "image" | "video";
}

interface ImageManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rowId: string;
  location?: string;
  images: ImageData[];
  onAddImage: UseMutationResult<any, Error, { rowId: string; imageUrl: string; caption?: string; thumbnail?: string }, unknown>;
  onUpdateImage: UseMutationResult<any, Error, { rowId: string; imageIndex: number; imageUrl?: string; caption?: string; thumbnail?: string }, unknown>;
  onDeleteImage: UseMutationResult<any, Error, { rowId: string; imageIndex?: number }, unknown>;
}

type ModalMode = 'add' | 'edit' | 'delete';
type EditAction = 'replace' | 'caption' | 'url' | 'thumbnail';
type DeleteAction = 'caption' | 'image' | 'all';

export function ImageManagementModal({
  open,
  onOpenChange,
  rowId,
  location,
  images,
  onAddImage,
  onUpdateImage,
  onDeleteImage,
}: ImageManagementModalProps) {
  const hasImages = images && images.length > 0;
  const [mode, setMode] = useState<ModalMode>('add');
  
  // Add Image States
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'url' | 'media'>('url');
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageCaption, setNewImageCaption] = useState("");
  const [newImageThumbnail, setNewImageThumbnail] = useState("");
  const [bulkUrls, setBulkUrls] = useState("");
  
  // Edit States
  const [editAction, setEditAction] = useState<EditAction>('replace');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editCaption, setEditCaption] = useState("");
  const [editUrlValue, setEditUrlValue] = useState("");
  const [editThumbnail, setEditThumbnail] = useState("");
  
  // Delete States
  const [deleteAction, setDeleteAction] = useState<DeleteAction>('caption');
  const [deleteImageIndex, setDeleteImageIndex] = useState(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [pendingDeleteAction, setPendingDeleteAction] = useState<{ action: DeleteAction; index?: number } | null>(null);
  
  const { toast } = useToast();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setMode(hasImages ? 'edit' : 'add');
      setIsBulkMode(false);
      setUploadMethod('url');
      setNewImageUrl("");
      setNewImageCaption("");
      setNewImageThumbnail("");
      setBulkUrls("");
      setEditAction('replace');
      setSelectedImageIndex(0);
      setEditImageUrl("");
      setEditCaption(images[0]?.caption || "");
      setEditUrlValue(images[0]?.url || "");
      setEditThumbnail(images[0]?.thumbnail || "");
      setDeleteAction('caption');
      setDeleteImageIndex(0);
    }
  }, [open, hasImages, images]);

  // Update edit fields when selected image changes
  useEffect(() => {
    if (images[selectedImageIndex]) {
      setEditCaption(images[selectedImageIndex].caption || "");
      setEditUrlValue(images[selectedImageIndex].url || "");
      setEditThumbnail(images[selectedImageIndex].thumbnail || "");
    }
  }, [selectedImageIndex, images]);

  // Handle Add Image (Single)
  const handleAddImage = async () => {
    try {
      const imageUrl = newImageUrl;

      if (!imageUrl) {
        toast({
          title: "Error",
          description: "Please provide an image URL.",
          variant: "destructive",
        });
        return;
      }

      await onAddImage.mutateAsync({
        rowId,
        imageUrl,
        caption: newImageCaption || undefined,
        thumbnail: newImageThumbnail || undefined,
      });

      toast({
        title: "Image Added",
        description: "Image has been added successfully.",
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add image.",
        variant: "destructive",
      });
    }
  };

  // Handle Bulk Add Images
  const handleBulkAddImages = async () => {
    try {
      if (!bulkUrls.trim()) {
        toast({
          title: "Error",
          description: "Please provide at least one image URL.",
          variant: "destructive",
        });
        return;
      }

      // Split by newlines and filter out empty lines
      const urls = bulkUrls
        .split('\n')
        .map(url => url.trim())
        .filter(url => url.length > 0);

      if (urls.length === 0) {
        toast({
          title: "Error",
          description: "Please provide valid image URLs.",
          variant: "destructive",
        });
        return;
      }

      // Add each image
      let successCount = 0;
      let failCount = 0;

      for (const url of urls) {
        try {
          await onAddImage.mutateAsync({
            rowId,
            imageUrl: url,
            caption: undefined,
          });
          successCount++;
        } catch (error) {
          failCount++;
          console.error(`Failed to add image: ${url}`, error);
        }
      }

      if (successCount > 0) {
        toast({
          title: "Images Added",
          description: `Successfully added ${successCount} image(s).${failCount > 0 ? ` Failed: ${failCount}` : ''}`,
        });
      }

      if (failCount === 0) {
        onOpenChange(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add images.",
        variant: "destructive",
      });
    }
  };

  // Handle Edit Image
  const handleEditImage = async () => {
    try {
      const currentImage = images[selectedImageIndex];
      if (!currentImage) return;

      if (editAction === 'replace') {
        // Replace entire image
        if (!editImageUrl) {
          toast({
            title: "Error",
            description: "Please provide a new image URL.",
            variant: "destructive",
          });
          return;
        }

        await onUpdateImage.mutateAsync({
          rowId,
          imageIndex: selectedImageIndex,
          imageUrl: editImageUrl,
          caption: currentImage.caption,
          thumbnail: currentImage.thumbnail,
        });

        toast({
          title: "Image Replaced",
          description: "Image has been replaced successfully.",
        });
      } else if (editAction === 'caption') {
        // Update caption only
        await onUpdateImage.mutateAsync({
          rowId,
          imageIndex: selectedImageIndex,
          caption: editCaption || undefined,
        });

        toast({
          title: "Caption Updated",
          description: "Image caption has been updated.",
        });
      } else if (editAction === 'url') {
        // Update URL only
        if (!editUrlValue) {
          toast({
            title: "Error",
            description: "Please provide a valid URL.",
            variant: "destructive",
          });
          return;
        }

        await onUpdateImage.mutateAsync({
          rowId,
          imageIndex: selectedImageIndex,
          imageUrl: editUrlValue,
          caption: currentImage.caption,
          thumbnail: currentImage.thumbnail,
        });

        toast({
          title: "URL Updated",
          description: "Image URL has been updated.",
        });
      } else if (editAction === 'thumbnail') {
        // Update thumbnail only
        await onUpdateImage.mutateAsync({
          rowId,
          imageIndex: selectedImageIndex,
          thumbnail: editThumbnail || undefined,
        });

        toast({
          title: "Thumbnail Updated",
          description: "Image thumbnail has been updated.",
        });
      }

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update image.",
        variant: "destructive",
      });
    }
  };

  // Handle Delete (with confirmation)
  const handleDeleteRequest = (action: DeleteAction, index?: number) => {
    setPendingDeleteAction({ action, index: index ?? deleteImageIndex });
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!pendingDeleteAction) return;

    try {
      const { action, index } = pendingDeleteAction;

      if (action === 'caption') {
        // Delete caption only (set to empty)
        const currentImage = images[index!];
        await onUpdateImage.mutateAsync({
          rowId,
          imageIndex: index!,
          caption: undefined,
        });

        toast({
          title: "Caption Deleted",
          description: "Image caption has been removed.",
        });
      } else if (action === 'image') {
        // Delete single image
        const imageToDelete = images[index!];
        await onDeleteImage.mutateAsync({
          rowId,
          imageIndex: index!,
        });

        toast({
          title: "Image Deleted",
          description: "Image has been deleted successfully.",
        });
      } else if (action === 'all') {
        // Delete all images
        await onDeleteImage.mutateAsync({
          rowId,
        });

        toast({
          title: "All Images Deleted",
          description: `${images.length} image(s) have been deleted.`,
        });
      }

      setShowDeleteDialog(false);
      setPendingDeleteAction(null);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] bg-white/90 dark:bg-black/90 backdrop-blur-3xl border-2 border-blue-200/60 dark:border-blue-700/60 shadow-[0_20px_80px_0_rgba(59,130,246,0.4)] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
              <ImageIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              {hasImages ? 'Manage Images' : 'Add Image'} - {location || 'Location'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Mode Tabs - Only show if has images */}
            {hasImages && (
              <Tabs value={mode} onValueChange={(v) => setMode(v as ModalMode)} className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-blue-100/50 dark:bg-blue-900/30">
                  <TabsTrigger value="add" className="text-xs">
                    <ImageIcon className="w-3 h-3 mr-1" />
                    Add
                  </TabsTrigger>
                  <TabsTrigger value="edit" className="text-xs">
                    <Pencil className="w-3 h-3 mr-1" />
                    Edit
                  </TabsTrigger>
                  <TabsTrigger value="delete" className="text-xs">
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </TabsTrigger>
                </TabsList>

                {/* Add Image Tab */}
                <TabsContent value="add" className="space-y-4 mt-4">
                  {/* Toggle Single/Bulk Mode */}
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isBulkMode ? 'bg-purple-500' : 'bg-green-500'}`}></div>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {isBulkMode ? '📦 Bulk Add Mode' : '📷 Single Image Mode'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUploadMethod(uploadMethod === 'url' ? 'media' : 'url')}
                        className="text-xs h-7 px-3"
                      >
                        {uploadMethod === 'url' ? '🔗 URL' : '📁 Media'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsBulkMode(!isBulkMode)}
                        className="text-xs h-7 px-3"
                      >
                        {isBulkMode ? 'Switch to Single' : 'Switch to Bulk'}
                      </Button>
                    </div>
                  </div>

                  {!isBulkMode ? (
                    /* Single Image Mode */
                    <div className="space-y-3">
                      {uploadMethod === 'url' ? (
                        /* URL Upload */
                        <>
                          <div>
                            <Label className="text-sm font-semibold">Image URL</Label>
                            <Input
                              value={newImageUrl}
                              onChange={(e) => setNewImageUrl(e.target.value)}
                              placeholder="https://example.com/image.jpg"
                              className="mt-1"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Enter the direct URL to your image
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-semibold">Caption (Optional)</Label>
                            <Textarea
                              value={newImageCaption}
                              onChange={(e) => setNewImageCaption(e.target.value)}
                              placeholder="Add a caption..."
                              className="mt-1"
                              rows={2}
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-semibold">Thumbnail URL (Optional)</Label>
                            <Input
                              value={newImageThumbnail}
                              onChange={(e) => setNewImageThumbnail(e.target.value)}
                              placeholder="https://example.com/thumbnail.jpg"
                              className="mt-1"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Leave empty to use main image as thumbnail
                            </p>
                          </div>
                          <div className="px-3 py-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <p className="text-xs text-gray-700 dark:text-gray-300">
                              💡 Tip: Use image hosting services like imgur.com, postimages.org, or imgbb.com to get image URLs
                            </p>
                          </div>
                        </>
                      ) : (
                        /* Media Upload */
                        <div className="space-y-3">
                          <div>
                            <Label className="text-sm font-semibold">Upload Image</Label>
                            <div className="mt-1">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  
                                  try {
                                    // Convert to base64
                                    const reader = new FileReader();
                                    reader.onloadend = async () => {
                                      const base64 = reader.result as string;
                                      
                                      // Upload to ImgBB
                                      toast({
                                        title: "Uploading...",
                                        description: "Uploading image to ImgBB...",
                                      });
                                      
                                      const response = await fetch('/api/upload-image', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ image: base64 }),
                                      });
                                      
                                      if (response.ok) {
                                        const data = await response.json();
                                        setNewImageUrl(data.url);
                                        toast({
                                          title: "Success",
                                          description: "Image uploaded successfully!",
                                        });
                                      } else {
                                        throw new Error('Upload failed');
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  } catch (error) {
                                    toast({
                                      title: "Error",
                                      description: "Failed to upload image",
                                      variant: "destructive",
                                    });
                                  }
                                }}
                                className="cursor-pointer"
                              />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Select an image file from your device (will be uploaded to ImgBB)
                            </p>
                          </div>
                          {newImageUrl && (
                            <div className="space-y-2">
                              <div className="relative rounded-lg overflow-hidden border border-border bg-muted/30">
                                <img 
                                  src={newImageUrl} 
                                  alt="Preview" 
                                  className="w-full h-40 object-cover"
                                />
                              </div>
                              <p className="text-xs text-green-600 dark:text-green-400">
                                ✅ Image uploaded successfully!
                              </p>
                            </div>
                          )}
                          <div>
                            <Label className="text-sm font-semibold">Caption (Optional)</Label>
                            <Textarea
                              value={newImageCaption}
                              onChange={(e) => setNewImageCaption(e.target.value)}
                              placeholder="Add a caption..."
                              className="mt-1"
                              rows={2}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Bulk Add Mode */
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-semibold">Image URLs (One per line)</Label>
                        <Textarea
                          value={bulkUrls}
                          onChange={(e) => setBulkUrls(e.target.value)}
                          placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg&#10;https://example.com/image3.jpg"
                          className="mt-1 font-mono text-xs"
                          rows={8}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Paste multiple image URLs, one URL per line
                        </p>
                      </div>
                      <div className="px-3 py-2 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg">
                        <p className="text-xs text-gray-700 dark:text-gray-300">
                          <span className="font-bold">📦 Bulk Mode:</span> Add multiple images at once. Each URL must be on a separate line. Captions can be added individually later via Edit mode.
                        </p>
                      </div>
                      {bulkUrls.trim() && (
                        <div className="px-3 py-2 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                          <p className="text-xs text-green-700 dark:text-green-300">
                            ✓ Ready to add <span className="font-bold">{bulkUrls.split('\n').filter(url => url.trim()).length}</span> image(s)
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>

                {/* Edit Image Tab */}
                <TabsContent value="edit" className="space-y-4 mt-4">
                  {/* Image Selector */}
                  <div>
                    <Label className="text-sm font-semibold">Select Image to Edit</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {images.map((img, index) => (
                        <div
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                            selectedImageIndex === index
                              ? 'border-blue-500 ring-2 ring-blue-300'
                              : 'border-gray-300 hover:border-blue-300'
                          }`}
                        >
                          <img
                            src={img.thumbnail || img.url}
                            alt={img.caption || `Image ${index + 1}`}
                            className="w-full h-20 object-cover"
                          />
                          {selectedImageIndex === index && (
                            <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                              <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                                ✓
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Edit Actions */}
                  <Tabs value={editAction} onValueChange={(v) => setEditAction(v as EditAction)}>
                    <TabsList className="grid w-full grid-cols-4 bg-yellow-100/50 dark:bg-yellow-900/30">
                      <TabsTrigger value="replace" className="text-xs">Replace</TabsTrigger>
                      <TabsTrigger value="caption" className="text-xs">Caption</TabsTrigger>
                      <TabsTrigger value="url" className="text-xs">URL</TabsTrigger>
                      <TabsTrigger value="thumbnail" className="text-xs">Thumbnail</TabsTrigger>
                    </TabsList>

                    <TabsContent value="replace" className="space-y-3 mt-4">
                      <div>
                        <Label className="text-sm font-semibold">New Image URL</Label>
                        <Input
                          value={editImageUrl}
                          onChange={(e) => setEditImageUrl(e.target.value)}
                          placeholder="https://example.com/new-image.jpg"
                          className="mt-1"
                        />
                      </div>
                      <div className="px-3 py-2 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <p className="text-xs text-gray-700 dark:text-gray-300">
                          ⚠️ This will replace the current image with a new one. Caption will be preserved.
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="caption" className="space-y-3 mt-4">
                      <div>
                        <Label className="text-sm font-semibold">Edit Caption</Label>
                        <Textarea
                          value={editCaption}
                          onChange={(e) => setEditCaption(e.target.value)}
                          placeholder="Enter new caption..."
                          className="mt-1"
                          rows={3}
                        />
                      </div>
                      <div className="px-3 py-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-xs text-gray-700 dark:text-gray-300">
                          💡 Leave empty to remove caption
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="url" className="space-y-3 mt-4">
                      <div>
                        <Label className="text-sm font-semibold">Edit Image URL</Label>
                        <Input
                          value={editUrlValue}
                          onChange={(e) => setEditUrlValue(e.target.value)}
                          placeholder="https://example.com/image.jpg"
                          className="mt-1"
                        />
                      </div>
                      <div className="px-3 py-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-xs text-gray-700 dark:text-gray-300">
                          📝 Update the URL of the current image
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="thumbnail" className="space-y-3 mt-4">
                      <div>
                        <Label className="text-sm font-semibold">Edit Thumbnail URL</Label>
                        <Input
                          value={editThumbnail}
                          onChange={(e) => setEditThumbnail(e.target.value)}
                          placeholder="https://example.com/thumbnail.jpg"
                          className="mt-1"
                        />
                      </div>
                      {editThumbnail && (
                        <div className="relative rounded-lg overflow-hidden border border-border bg-muted/30">
                          <img 
                            src={editThumbnail} 
                            alt="Thumbnail Preview" 
                            className="w-full h-32 object-cover"
                          />
                        </div>
                      )}
                      <div className="px-3 py-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-xs text-gray-700 dark:text-gray-300">
                          🖼️ Leave empty to use main image as thumbnail. Useful for video thumbnails or low-res previews.
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </TabsContent>

                {/* Delete Tab */}
                <TabsContent value="delete" className="space-y-4 mt-4">
                  <Tabs value={deleteAction} onValueChange={(v) => setDeleteAction(v as DeleteAction)}>
                    <TabsList className="grid w-full grid-cols-3 bg-red-100/50 dark:bg-red-900/30">
                      <TabsTrigger value="caption" className="text-xs">Caption</TabsTrigger>
                      <TabsTrigger value="image" className="text-xs">Single</TabsTrigger>
                      <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                    </TabsList>

                    <TabsContent value="caption" className="space-y-3 mt-4">
                      <div>
                        <Label className="text-sm font-semibold">Select Image</Label>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {images.map((img, index) => (
                            <div
                              key={index}
                              onClick={() => setDeleteImageIndex(index)}
                              className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                                deleteImageIndex === index
                                  ? 'border-red-500 ring-2 ring-red-300'
                                  : 'border-gray-300 hover:border-red-300'
                              }`}
                            >
                              <img
                                src={img.thumbnail || img.url}
                                alt={img.caption || `Image ${index + 1}`}
                                className="w-full h-20 object-cover"
                              />
                              {img.caption && (
                                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[8px] px-1 py-0.5 truncate">
                                  {img.caption}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="px-3 py-2 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg">
                        <p className="text-xs text-gray-700 dark:text-gray-300">
                          🗑️ This will remove the caption only. Image will remain.
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="image" className="space-y-3 mt-4">
                      <div>
                        <Label className="text-sm font-semibold">Select Image to Delete</Label>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {images.map((img, index) => (
                            <div
                              key={index}
                              onClick={() => setDeleteImageIndex(index)}
                              className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                                deleteImageIndex === index
                                  ? 'border-red-500 ring-2 ring-red-300'
                                  : 'border-gray-300 hover:border-red-300'
                              }`}
                            >
                              <img
                                src={img.thumbnail || img.url}
                                alt={img.caption || `Image ${index + 1}`}
                                className="w-full h-20 object-cover"
                              />
                              {deleteImageIndex === index && (
                                <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                                  <Trash2 className="w-6 h-6 text-red-600" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="px-3 py-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-xs text-gray-700 dark:text-gray-300">
                          ⚠️ This will permanently delete the selected image
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="all" className="space-y-3 mt-4">
                      <div className="px-4 py-3 bg-red-100 dark:bg-red-950/50 border-2 border-red-300 dark:border-red-700 rounded-lg">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-red-900 dark:text-red-100">
                              Delete All Images
                            </p>
                            <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                              This will permanently delete all {images.length} image(s) from this location. This action cannot be undone.
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {images.map((img, index) => (
                          <div key={index} className="relative rounded-lg overflow-hidden border border-red-300">
                            <img
                              src={img.thumbnail || img.url}
                              alt={img.caption || `Image ${index + 1}`}
                              className="w-full h-16 object-cover opacity-50"
                            />
                            <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center">
                              <X className="w-4 h-4 text-red-700" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </TabsContent>
              </Tabs>
            )}

            {/* No Images State - Show Add Form */}
            {!hasImages && (
              <div className="space-y-4">
                {/* Toggle Single/Bulk Mode */}
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isBulkMode ? 'bg-purple-500' : 'bg-green-500'}`}></div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {isBulkMode ? '📦 Bulk Add Mode' : '📷 Single Image Mode'}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsBulkMode(!isBulkMode)}
                    className="text-xs h-7 px-3"
                  >
                    {isBulkMode ? 'Switch to Single' : 'Switch to Bulk'}
                  </Button>
                </div>

                {!isBulkMode ? (
                  /* Single Image Mode */
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-semibold">Image URL</Label>
                      <Input
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Enter the direct URL to your image
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Caption (Optional)</Label>
                      <Textarea
                        value={newImageCaption}
                        onChange={(e) => setNewImageCaption(e.target.value)}
                        placeholder="Add a caption..."
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Thumbnail URL (Optional)</Label>
                      <Input
                        value={newImageThumbnail}
                        onChange={(e) => setNewImageThumbnail(e.target.value)}
                        placeholder="https://example.com/thumbnail.jpg"
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Leave empty to use main image as thumbnail
                      </p>
                    </div>
                    <div className="px-3 py-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-xs text-gray-700 dark:text-gray-300">
                        💡 Tip: Use image hosting services like imgur.com, postimages.org, or imgbb.com to get image URLs
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Bulk Add Mode */
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-semibold">Image URLs (One per line)</Label>
                      <Textarea
                        value={bulkUrls}
                        onChange={(e) => setBulkUrls(e.target.value)}
                        placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg&#10;https://example.com/image3.jpg"
                        className="mt-1 font-mono text-xs"
                        rows={8}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Paste multiple image URLs, one URL per line
                      </p>
                    </div>
                    <div className="px-3 py-2 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg">
                      <p className="text-xs text-gray-700 dark:text-gray-300">
                        <span className="font-bold">📦 Bulk Mode:</span> Add multiple images at once. Each URL must be on a separate line. Captions can be added individually later via Edit mode.
                      </p>
                    </div>
                    {bulkUrls.trim() && (
                      <div className="px-3 py-2 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                        <p className="text-xs text-green-700 dark:text-green-300">
                          ✓ Ready to add <span className="font-bold">{bulkUrls.split('\n').filter(url => url.trim()).length}</span> image(s)
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={onAddImage.isPending || onUpdateImage.isPending || onDeleteImage.isPending}
              className="bg-white/60 dark:bg-black/60 backdrop-blur-xl"
            >
              Cancel
            </Button>

            {mode === 'add' && (
              <Button
                onClick={isBulkMode ? handleBulkAddImages : handleAddImage}
                disabled={onAddImage.isPending}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                {onAddImage.isPending ? 'Adding...' : isBulkMode ? 'Add Images' : 'Add Image'}
              </Button>
            )}

            {mode === 'edit' && (
              <Button
                onClick={handleEditImage}
                disabled={onUpdateImage.isPending}
                className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white"
              >
                {onUpdateImage.isPending ? 'Updating...' : 'Update'}
              </Button>
            )}

            {mode === 'delete' && (
              <Button
                onClick={() => handleDeleteRequest(deleteAction, deleteImageIndex)}
                disabled={onDeleteImage.isPending}
                className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white"
              >
                {onDeleteImage.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white/95 dark:bg-black/95 backdrop-blur-xl border-2 border-red-300 dark:border-red-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-900 dark:text-red-100">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Confirm Delete
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-700 dark:text-gray-300">
              {pendingDeleteAction?.action === 'caption' && 'Are you sure you want to delete this image caption?'}
              {pendingDeleteAction?.action === 'image' && 'Are you sure you want to delete this image? This action cannot be undone.'}
              {pendingDeleteAction?.action === 'all' && `Are you sure you want to delete all ${images.length} image(s)? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
