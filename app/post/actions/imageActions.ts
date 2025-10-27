import imageCompression from "browser-image-compression";
import { supabase } from "@/lib/supabase";
import { ImageItem } from "../types";

export const autoCrop = async (originalFile: File, aspect: number): Promise<ImageItem> => {
  const img = document.createElement("img");
  img.src = URL.createObjectURL(originalFile);
  await new Promise((res) => (img.onload = res));

  const imgW = img.width;
  const imgH = img.height;
  const imgAspect = imgW / imgH;

  let cropW, cropH;

  if (imgAspect > aspect) {
    cropH = imgH;
    cropW = cropH * aspect;
  } else {
    cropW = imgW;
    cropH = cropW / aspect;
  }

  const cropX = (imgW - cropW) / 2;
  const cropY = (imgH - cropH) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = cropW;
  canvas.height = cropH;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

  const blob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), "image/jpeg", 0.9));

  const cropped = new File([blob], `cropped-${Date.now()}.jpg`, { type: "image/jpeg" });
  return { original: originalFile, cropped, preview: URL.createObjectURL(cropped) };
};

export const cropFile = async (imageSrc: string, croppedAreaPixels: any, originalFile: File): Promise<ImageItem> => {
  const img = document.createElement("img");
  img.src = imageSrc;
  await new Promise((res) => (img.onload = res));

  const canvas = document.createElement("canvas");
  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;
  const ctx = canvas.getContext("2d")!;

  ctx.drawImage(
    img,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height
  );

  const blob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), "image/jpeg", 0.9));

  const cropped = new File([blob], `manual-${Date.now()}.jpg`, { type: "image/jpeg" });
  return { original: originalFile, cropped, preview: URL.createObjectURL(cropped) };
};

export const handleSelectImages = async (
  files: FileList | null,
  event: any,
  aspect: number,
  setImages: (images: ImageItem[] | ((prev: ImageItem[]) => ImageItem[])) => void
) => {
  if (!files) return;
  const raw = Array.from(files)[0];
  if (!raw) return;
  if (raw.size > 50 * 1024 * 1024) {
    alert("⚠️ Ảnh vượt 50MB");
    return;
  }

  const compressed = await imageCompression(raw, { maxSizeMB: 2, maxWidthOrHeight: 2000 });
  const newItem = await autoCrop(compressed, aspect);
  setImages((prev) => [...prev, newItem]);

  if (event?.target) event.target.value = "";
};

export const uploadImages = async (postId: string, images: ImageItem[]) => {
  const urls: string[] = [];
  for (const file of images.map((i) => i.cropped)) {
    const ext = file.name.split(".").pop();
    const path = `${postId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("post_images").upload(path, file);
    if (!error) {
      urls.push(supabase.storage.from("post_images").getPublicUrl(path).data.publicUrl);
    }
  }
  return urls;
};