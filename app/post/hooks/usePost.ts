import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ImageItem } from "../types";

export const usePost = () => {
  const [user, setUser] = useState<any>(null);
  const [caption, setCaption] = useState("");
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [cropTargetIndex, setCropTargetIndex] = useState<number | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [aspect, setAspect] = useState(1);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user || null);
    });
  }, []);

  const handleDragStart = (index: number) => setDragIndex(index);

  const handleDrop = (index: number) => {
    if (dragIndex === null) return;
    const newImages = [...images];
    const [moved] = newImages.splice(dragIndex, 1);
    newImages.splice(index, 0, moved);
    setImages(newImages);
    setDragIndex(null);
    setCurrentIndex(0); // Reset to cover image
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (currentIndex > 0 && currentIndex >= images.length - 1) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.changedTouches[0].screenX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setTouchEndX(e.changedTouches[0].screenX);
    if (touchStartX - touchEndX > 50) {
      setCurrentIndex((i) => Math.min(images.length - 1, i + 1));
    }
    if (touchEndX - touchStartX > 50) {
      setCurrentIndex((i) => Math.max(0, i - 1));
    }
  };

  return {
    user,
    caption,
    setCaption,
    serviceId,
    setServiceId,
    images,
    setImages,
    loading,
    setLoading,
    currentIndex,
    setCurrentIndex,
    cropImage,
    setCropImage,
    cropTargetIndex,
    setCropTargetIndex,
    crop,
    setCrop,
    zoom,
    setZoom,
    croppedAreaPixels,
    setCroppedAreaPixels,
    aspect,
    setAspect,
    previewOpen,
    setPreviewOpen,
    dragIndex,
    handleDragStart,
    handleDrop,
    removeImage,
    touchStartX,
    touchEndX,
    handleTouchStart,
    handleTouchEnd,
  };
};