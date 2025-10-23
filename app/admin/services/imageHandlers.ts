// utils/imageHandlers.ts
import { RefObject } from "react";

export const validateFiles = (
  files: File[],
  maxFiles = 10,
  maxSizeMB = 5
): string | null => {
  const maxSize = maxSizeMB * 1024 * 1024;
  if (files.length > maxFiles) return `Tối đa ${maxFiles} hình ảnh`;
  for (const f of files) {
    if (f.size > maxSize) return `File "${f.name}" quá lớn (tối đa ${maxSizeMB}MB)`;
    if (!f.type.startsWith("image/")) return `File "${f.name}" không phải hình ảnh hợp lệ`;
  }
  return null;
};

export const handleAvatarChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  setAvatarFile: React.Dispatch<React.SetStateAction<File | null>>,
  inputRef?: RefObject<HTMLInputElement | null>   // ← cho phép null
) => {
  if (!e.target.files || e.target.files.length === 0) return;
  const f = e.target.files[0];
  const err = validateFiles([f]);
  if (err) return setError(err);
  setAvatarFile(f);
  setError(null);
  if (inputRef?.current) inputRef.current.value = "";
};

export const handleAdditionalFilesChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  setAdditionalFiles: React.Dispatch<React.SetStateAction<File[]>>,
  inputRef?: RefObject<HTMLInputElement | null>   // ← cho phép null
) => {
  if (!e.target.files) return;
  const arr = Array.from(e.target.files);
  const err = validateFiles(arr);
  if (err) return setError(err);
  setAdditionalFiles(arr);
  setError(null);
  if (inputRef?.current && arr.length === 0) inputRef.current.value = "";
};

export const removeAvatar = (
  setAvatarFile: React.Dispatch<React.SetStateAction<File | null>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  inputRef?: RefObject<HTMLInputElement | null>   // ← cho phép null
) => {
  setAvatarFile(null);
  setError(null);
  if (inputRef?.current) inputRef.current.value = "";
};

export const removeAdditionalImage = (
  index: number,
  setAdditionalFiles: React.Dispatch<React.SetStateAction<File[]>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  inputRef?: RefObject<HTMLInputElement | null>,  // ← cho phép null
  additionalFiles?: File[]
) => {
  setAdditionalFiles(prev => prev.filter((_, i) => i !== index));
  setError(null);
  if (inputRef?.current && additionalFiles && additionalFiles.length - 1 === 0)
    inputRef.current.value = "";
};

export const handleRemoveExistingImage = (
  url: string,
  setExistingImages: React.Dispatch<React.SetStateAction<string[]>>
) => {
  setExistingImages(prev => prev.filter(u => u !== url));
};