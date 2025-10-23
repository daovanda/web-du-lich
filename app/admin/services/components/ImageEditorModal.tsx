// components/ImageEditorModal.tsx
"use client";

import { useRef, useState } from "react";
import {
  handleAvatarChange,
  handleAdditionalFilesChange,
  removeAvatar,
  removeAdditionalImage,
  handleRemoveExistingImage,
} from "../imageHandlers"; // Đường dẫn điều chỉnh nếu cần

type ImageEditorModalProps = {
  open: boolean;
  initialAvatarUrl?: string | null;
  initialImages?: string[];
  onClose: () => void;
  onSave: (data: {
    avatarFile: File | null;
    additionalFiles: File[];
    existingImages: string[];
  }) => Promise<void>;
  maxAdditionalImages?: number; // Tối đa ảnh phụ (tổng)
  maxFileSizeMB?: number;
  isLoading?: boolean;
};

export default function ImageEditorModal({
  open,
  initialAvatarUrl,
  initialImages = [],
  onClose,
  onSave,
  maxAdditionalImages = 9,
  maxFileSizeMB = 5,
  isLoading: externalLoading = false,
}: ImageEditorModalProps) {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(initialImages);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const additionalInputRef = useRef<HTMLInputElement | null>(null);

  if (!open) return null;

  const totalImages = existingImages.length + additionalFiles.length;
  const isUploading = isSaving || externalLoading;

  const handleSave = async () => {
    setError(null);
    setIsSaving(true);
    try {
      await onSave({
        avatarFile,
        additionalFiles,
        existingImages,
      });
      // Reset nếu cần
      setAvatarFile(null);
      setAdditionalFiles([]);
      onClose();
    } catch (err: any) {
      setError(err.message || "Lỗi khi lưu ảnh");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-neutral-700">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Chỉnh sửa ảnh</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">
            X
          </button>
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-900/20 p-2 rounded-lg border border-red-500 mb-4">
            {error}
          </p>
        )}

        {/* Ảnh đại diện */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">Ảnh đại diện</label>
          {(initialAvatarUrl || avatarFile) && (
            <div className="flex items-center gap-3 p-3 bg-gray-900 border border-gray-700 rounded-lg mb-3">
              <img
                src={avatarFile ? URL.createObjectURL(avatarFile) : initialAvatarUrl!}
                alt="Avatar"
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="flex-1">
                <p className="text-white text-sm font-medium">
                  {avatarFile ? avatarFile.name : "Ảnh đại diện hiện tại"}
                </p>
                {avatarFile && (
                  <p className="text-gray-400 text-xs">
                    {(avatarFile.size / 1024 / 1024).toFixed(1)}MB
                  </p>
                )}
              </div>
              <button
                onClick={() =>
                  avatarFile
                    ? removeAvatar(setAvatarFile, setError, avatarInputRef)
                    : setExistingImages([])
                }
                className="text-red-400 hover:text-red-300"
              >
                X
              </button>
            </div>
          )}
          <button
            onClick={() => avatarInputRef.current?.click()}
            disabled={isUploading}
            className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium text-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang tải lên...
              </>
            ) : (
              <>Chọn ảnh đại diện mới</>
            )}
          </button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleAvatarChange(e, setError, setAvatarFile, avatarInputRef)}
          />
        </div>

        {/* Ảnh phụ */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Ảnh phụ ({totalImages}/{maxAdditionalImages})
          </label>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {existingImages.map((url, i) => (
              <div key={`existing-${i}`} className="relative group">
                <img
                  src={url}
                  alt=""
                  className="w-full h-24 object-cover rounded-lg border border-neutral-600"
                />
                <button
                  onClick={() => handleRemoveExistingImage(url, setExistingImages)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs opacity-0 group-hover:opacity-100 transition"
                >
                  X
                </button>
              </div>
            ))}
            {additionalFiles.map((file, i) => (
              <div key={`new-${i}`} className="relative group">
                <img
                  src={URL.createObjectURL(file)}
                  alt=""
                  className="w-full h-24 object-cover rounded-lg border border-neutral-600"
                />
                <button
                  onClick={() =>
                    removeAdditionalImage(i, setAdditionalFiles, setError, additionalInputRef, additionalFiles)
                  }
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs opacity-0 group-hover:opacity-100 transition"
                >
                  X
                </button>
              </div>
            ))}
            {totalImages < maxAdditionalImages && (
              <button
                onClick={() => additionalInputRef.current?.click()}
                disabled={isUploading}
                className="w-full h-24 border-2 border-dashed border-neutral-600 rounded-lg flex items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-400 transition disabled:opacity-50"
              >
                {isUploading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="text-3xl">+</span>
                )}
              </button>
            )}
          </div>
          <input
            ref={additionalInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleAdditionalFilesChange(e, setError, setAdditionalFiles, additionalInputRef)}
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-white disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={isUploading || (!avatarFile && additionalFiles.length === 0 && existingImages.length === initialImages.length)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white disabled:opacity-50 flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang lưu...
              </>
            ) : (
              "Lưu thay đổi"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}