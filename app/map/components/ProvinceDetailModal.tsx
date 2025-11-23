"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  getProvincePhotos,
  updateProvinceNotes,
  uploadProvincePhoto,
  addProvincePhoto,
  deletePhoto,
  updatePhoto,
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
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // ✅ Photo editing state
  const [editingPhoto, setEditingPhoto] = useState<string | null>(null);
  const [photoTitle, setPhotoTitle] = useState("");
  const [photoNote, setPhotoNote] = useState("");
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Load user
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (session?.user && mountedRef.current) {
          setUserId(session.user.id);
        }
      } catch (err) {
        console.error("Failed to get user:", err);
        setError("Không thể tải thông tin người dùng");
      }
    };
    getUser();
  }, []);

  useEffect(() => {
    if (isOpen && visitedProvinceId) {
      loadProvinceData();
    }
  }, [isOpen, visitedProvinceId]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        if (mountedRef.current) setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const loadProvinceData = useCallback(async () => {
    if (!mountedRef.current) return;
    
    setIsLoadingPhotos(true);
    setIsLoadingNotes(true);
    setError(null);
    
    try {
      const photosData = await getProvincePhotos(visitedProvinceId);
      
      const { data: provinceData, error: notesError } = await supabase
        .from('visited_provinces')
        .select('notes')
        .eq('id', visitedProvinceId)
        .single();

      if (notesError && notesError.code !== 'PGRST116') {
        console.error("Failed to load notes:", notesError);
      }

      if (mountedRef.current) {
        if (photosData) {
          setPhotos(photosData);
        } else {
          setPhotos([]);
        }

        if (provinceData?.notes) {
          setNotes(provinceData.notes);
        }
      }
    } catch (err) {
      console.error("Failed to load province data:", err);
      if (mountedRef.current) {
        setError("Không thể tải dữ liệu");
      }
    } finally {
      if (mountedRef.current) {
        setIsLoadingPhotos(false);
        setIsLoadingNotes(false);
      }
    }
  }, [visitedProvinceId]);

  const loadPhotos = useCallback(async () => {
    if (!mountedRef.current) return;
    
    setIsLoadingPhotos(true);
    
    try {
      const data = await getProvincePhotos(visitedProvinceId);
      if (mountedRef.current && data) {
        setPhotos(data);
      }
    } catch (err) {
      console.error("Failed to load photos:", err);
    } finally {
      if (mountedRef.current) {
        setIsLoadingPhotos(false);
      }
    }
  }, [visitedProvinceId]);

  const handleSaveNotes = useCallback(async () => {
    if (!notes.trim()) {
      setError("Vui lòng nhập ghi chú!");
      return;
    }
    
    setIsSavingNotes(true);
    setError(null);
    
    try {
      const result = await updateProvinceNotes(visitedProvinceId, notes);
      
      if (mountedRef.current) {
        if (result) {
          setError("✅ Đã lưu ghi chú!");
        } else {
          setError("❌ Lỗi khi lưu ghi chú!");
        }
      }
    } catch (err) {
      console.error("Failed to save notes:", err);
      if (mountedRef.current) {
        setError("❌ Lỗi khi lưu ghi chú!");
      }
    } finally {
      if (mountedRef.current) {
        setIsSavingNotes(false);
      }
    }
  }, [notes, visitedProvinceId]);

  const handlePhotoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !userId || files.length === 0) return;

    const validFiles = Array.from(files).filter(file => {
      const isImage = file.type.startsWith('image/');
      const isUnder10MB = file.size <= 10 * 1024 * 1024;
      
      if (!isImage) {
        setError(`${file.name} không phải là file ảnh`);
        return false;
      }
      if (!isUnder10MB) {
        setError(`${file.name} quá lớn (tối đa 10MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    let successCount = 0;
    const totalFiles = validFiles.length;

    try {
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        
        setUploadProgress(Math.round((i / totalFiles) * 100));
        
        const imageUrl = await uploadProvincePhoto(file, userId, provinceId);
        
        if (imageUrl && mountedRef.current) {
          const added = await addProvincePhoto(visitedProvinceId, userId, imageUrl);
          if (added) {
            successCount++;
          }
        }
      }

      setUploadProgress(100);

      if (mountedRef.current) {
        if (successCount === totalFiles) {
          setError(`✅ Đã tải lên ${successCount} ảnh`);
        } else if (successCount > 0) {
          setError(`⚠️ Đã tải lên ${successCount}/${totalFiles} ảnh`);
        } else {
          setError("❌ Không thể tải lên ảnh");
        }
        
        await loadPhotos();
      }
    } catch (err) {
      console.error("Upload error:", err);
      if (mountedRef.current) {
        setError("❌ Lỗi khi tải ảnh lên");
      }
    } finally {
      if (mountedRef.current) {
        setIsUploading(false);
        setUploadProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  }, [userId, provinceId, visitedProvinceId, loadPhotos]);

  const handleDeletePhoto = useCallback(async (photoId: string, imageUrl: string) => {
    if (!confirm("Xóa ảnh này?")) return;
    
    setError(null);
    
    try {
      const success = await deletePhoto(photoId, imageUrl);
      
      if (mountedRef.current) {
        if (success) {
          setError("✅ Đã xóa ảnh");
          await loadPhotos();
        } else {
          setError("❌ Lỗi khi xóa ảnh!");
        }
      }
    } catch (err) {
      console.error("Delete error:", err);
      if (mountedRef.current) {
        setError("❌ Lỗi khi xóa ảnh!");
      }
    }
  }, [loadPhotos]);

  // ✅ Edit photo - open edit mode
  const handleEditPhoto = useCallback((photo: ProvincePhoto) => {
    setEditingPhoto(photo.id);
    setPhotoTitle(photo.title || "");
    setPhotoNote(photo.note || "");
  }, []);

  // ✅ Save photo edits
  const handleSavePhotoEdit = useCallback(async (photoId: string) => {
    setIsSavingPhoto(true);
    setError(null);
    
    try {
      const result = await updatePhoto(photoId, {
        title: photoTitle.trim() || null,
        note: photoNote.trim() || null,
      });
      
      if (mountedRef.current) {
        if (result) {
          setError("✅ Đã cập nhật ảnh!");
          setEditingPhoto(null);
          setPhotoTitle("");
          setPhotoNote("");
          await loadPhotos();
        } else {
          setError("❌ Lỗi khi cập nhật!");
        }
      }
    } catch (err) {
      console.error("Failed to update photo:", err);
      if (mountedRef.current) {
        setError("❌ Lỗi khi cập nhật!");
      }
    } finally {
      if (mountedRef.current) {
        setIsSavingPhoto(false);
      }
    }
  }, [photoTitle, photoNote, loadPhotos]);

  // ✅ Cancel edit
  const handleCancelEdit = useCallback(() => {
    setEditingPhoto(null);
    setPhotoTitle("");
    setPhotoNote("");
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (editingPhoto) {
          handleCancelEdit();
        } else {
          onClose();
        }
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, editingPhoto, handleCancelEdit, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        role="presentation"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto animate-scale-in"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-labelledby="modal-title"
        >
          
          {/* Error Toast */}
          {error && (
            <div className={`absolute top-4 right-4 z-10 px-4 py-2 rounded-lg shadow-lg animate-slide-in ${
              error.startsWith('✅') ? 'bg-green-600' : 
              error.startsWith('⚠️') ? 'bg-yellow-600' : 
              'bg-red-600'
            } text-white text-sm max-w-xs`}>
              {error}
            </div>
          )}

          {/* Header */}
          <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
            <div>
              <h2 id="modal-title" className="text-xl font-bold text-white">{provinceName}</h2>
              <p className="text-sm text-neutral-500">Thêm ảnh và ghi chú về chuyến đi</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-neutral-900 hover:bg-neutral-800 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
              aria-label="Đóng modal"
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
              <label 
                htmlFor="notes-input"
                className="text-sm font-semibold text-white flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Ghi chú chung
              </label>

              {isLoadingNotes ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-500"></div>
                </div>
              ) : (
                <>
                  <textarea
                    id="notes-input"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Viết ghi chú chung về chuyến đi..."
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-green-500 transition-colors resize-none"
                    rows={4}
                    maxLength={1000}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-600">{notes.length}/1000</span>
                    <button
                      onClick={handleSaveNotes}
                      disabled={isSavingNotes || !notes.trim()}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-neutral-800 disabled:text-neutral-600 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {isSavingNotes ? "Đang lưu..." : "Lưu ghi chú"}
                    </button>
                  </div>
                </>
              )}
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
                  disabled={isUploading || isLoadingPhotos}
                  className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {isUploading ? `Đang tải... ${uploadProgress}%` : "+ Thêm ảnh"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>

              {/* Upload Progress Bar */}
              {isUploading && uploadProgress > 0 && (
                <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-green-600 h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

              {/* Photo Grid */}
              {isLoadingPhotos ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                </div>
              ) : photos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {photos.map((photo) => (
                    <div 
                      key={photo.id} 
                      className="relative group bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden"
                    >
                      {/* Image */}
                      <div className="aspect-video relative">
                        <img
                          src={photo.image_url}
                          alt={photo.title || "Ảnh tỉnh thành"}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        
                        {/* Hover Actions */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                          <button
                            onClick={() => handleEditPhoto(photo)}
                            className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition-colors"
                            title="Chỉnh sửa"
                          >
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeletePhoto(photo.id, photo.image_url)}
                            className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors"
                            title="Xóa"
                          >
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Info Section */}
                      {editingPhoto === photo.id ? (
                        // ✅ EDIT MODE
                        <div className="p-3 space-y-2">
                          <input
                            type="text"
                            value={photoTitle}
                            onChange={(e) => setPhotoTitle(e.target.value)}
                            placeholder="Tiêu đề ảnh..."
                            className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500"
                            maxLength={100}
                          />
                          <textarea
                            value={photoNote}
                            onChange={(e) => setPhotoNote(e.target.value)}
                            placeholder="Ghi chú cho ảnh này..."
                            className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500 resize-none"
                            rows={2}
                            maxLength={200}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSavePhotoEdit(photo.id)}
                              disabled={isSavingPhoto}
                              className="flex-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-700 text-white rounded text-xs font-medium transition-colors"
                            >
                              {isSavingPhoto ? "Đang lưu..." : "Lưu"}
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              disabled={isSavingPhoto}
                              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-700 text-neutral-300 rounded text-xs font-medium transition-colors"
                            >
                              Hủy
                            </button>
                          </div>
                        </div>
                      ) : (
                        // ✅ VIEW MODE
                        <div className="p-3">
                          {photo.title && (
                            <h4 className="text-sm font-semibold text-white mb-1">{photo.title}</h4>
                          )}
                          {photo.note && (
                            <p className="text-xs text-neutral-400 line-clamp-2">{photo.note}</p>
                          )}
                          {!photo.title && !photo.note && (
                            <p className="text-xs text-neutral-600 italic">Chưa có tiêu đề và ghi chú</p>
                          )}
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

      {/* Styles */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}