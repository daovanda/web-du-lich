"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import {
  getProvincePhotos,
  updateProvinceNotes,
  uploadProvincePhoto,
  addProvincePhoto,
  deletePhoto,
} from "@/app/map/api/api";
import type { ProvincePhoto } from "@/app/map/types/types";

type ProvinceDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  provinceId: string;
  visitedProvinceId: string;
  provinceName: string;
};

export default function ProvinceDetailModal({
  isOpen,
  onClose,
  provinceId,
  visitedProvinceId,
  provinceName,
}: ProvinceDetailModalProps) {
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<ProvincePhoto[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) setUserId(session.user.id);
    };
    getUser();
  }, []);

  // Load photos when modal opens
  useEffect(() => {
    if (isOpen && visitedProvinceId) {
      loadPhotos();
    }
  }, [isOpen, visitedProvinceId]);

  const loadPhotos = async () => {
    const data = await getProvincePhotos(visitedProvinceId);
    if (data) setPhotos(data);
  };

  const handleSaveNotes = async () => {
    if (!notes.trim()) {
      alert("Vui lòng nhập ghi chú!");
      return;
    }
    
    setIsSavingNotes(true);
    const result = await updateProvinceNotes(visitedProvinceId, notes);
    setIsSavingNotes(false);
    
    if (result) {
      alert("✅ Đã lưu ghi chú!");
      setNotes("");
    } else {
      alert("❌ Lỗi khi lưu ghi chú!");
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !userId) return;

    setIsUploading(true);

    for (const file of Array.from(files)) {
      // Upload to storage
      const imageUrl = await uploadProvincePhoto(file, userId, provinceId);
      
      if (imageUrl) {
        // Add to database
        await addProvincePhoto(visitedProvinceId, userId, imageUrl);
      }
    }

    setIsUploading(false);
    loadPhotos(); // Refresh
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDeletePhoto = async (photoId: string, imageUrl: string) => {
    if (!confirm("Xóa ảnh này?")) return;
    
    const success = await deletePhoto(photoId, imageUrl);
    if (success) {
      loadPhotos();
    } else {
      alert("❌ Lỗi khi xóa ảnh!");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">{provinceName}</h2>
              <p className="text-sm text-neutral-500">Thêm ảnh và ghi chú về chuyến đi</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-neutral-900 hover:bg-neutral-800 flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Notes Section */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-white flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Ghi chú
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Viết ghi chú về chuyến đi của bạn..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-green-500 transition-colors resize-none"
                rows={4}
              />
              <button
                onClick={handleSaveNotes}
                disabled={isSavingNotes || !notes.trim()}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-neutral-800 disabled:text-neutral-600 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                {isSavingNotes ? "Đang lưu..." : "Lưu ghi chú"}
              </button>
            </div>

            {/* Photos Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-white flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Ảnh ({photos.length})
                </label>
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {isUploading ? "Đang tải..." : "+ Thêm ảnh"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>

              {/* Photo Grid */}
              {photos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {photos.map((photo) => (
                    <div 
                      key={photo.id} 
                      className="relative group aspect-square rounded-lg overflow-hidden bg-neutral-900 border border-neutral-800"
                    >
                      <img
                        src={photo.image_url}
                        alt={photo.title || "Province photo"}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleDeletePhoto(photo.id, photo.image_url)}
                          className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors"
                        >
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      {/* Photo note if exists */}
                      {photo.note && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                          <p className="text-xs text-white line-clamp-2">{photo.note}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-neutral-600">
                  <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p>Chưa có ảnh nào. Thêm ảnh đầu tiên!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}