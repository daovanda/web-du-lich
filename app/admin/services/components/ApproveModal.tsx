"use client";

import { useState, useEffect } from "react";
import { PendingService } from "../types";
import { SERVICE_TYPES } from "../types";
import {
  updatePendingService,
  approvePendingAsService,
} from "../api";
import { uploadImagesToBucket } from "../helpers";

type ApproveForm = {
  title: string;
  description: string;
  type: string;
  location: string;
  price: string;
  images: string[];
  amenities: string;
};

type Props = {
  open: boolean;
  pending: PendingService | null;
  onClose: () => void;
  onApprove: (form: any, files: File[]) => Promise<void>;
  onReject: (reason: string) => void;
  refresh: () => void;
};

export default function ApproveModal({
  open,
  pending,
  onClose,
  onReject,
  refresh,
}: Props) {
  const [form, setForm] = useState<ApproveForm>({
    title: "",
    description: "",
    type: "stay",
    location: "",
    price: "",
    images: [],
    amenities: "",
  });

  const [files, setFiles] = useState<File[]>([]); // ảnh sẽ được upload khi approve
  const [newFiles, setNewFiles] = useState<File[]>([]); // ảnh thêm mới để preview
  const [saving, setSaving] = useState(false);

  function amenitiesToString(amenities: any): string {
    if (!amenities) return "";
    if (typeof amenities === "string") return amenities;
    if (Array.isArray(amenities)) {
      if (amenities.length === 0) return "";
      if (typeof amenities[0] === "string") return amenities.join(", ");
      if (amenities[0]?.name) return amenities.map((a) => a.name).join(", ");
    }
    return "";
  }

  useEffect(() => {
    if (pending) {
      setForm({
        title: pending.title || "",
        description: pending.description || "",
        type: pending.type || "stay",
        location: pending.location || "",
        price: pending.price || "",
        images: Array.isArray(pending.images)
          ? pending.images
          : typeof pending.images === "string"
          ? [pending.images]
          : [],
        amenities: amenitiesToString((pending as any).amenities),
      });
      setFiles([]);
      setNewFiles([]);
    }
  }, [pending]);

  if (!open || !pending) return null;

  /* 📁 Save changes */
  const handleSaveChanges = async () => {
    if (!pending?.id) return;
    setSaving(true);
    try {
      // 📤 Upload ảnh mới nếu có
      let newImageUrls: string[] = [];
      if (newFiles.length > 0) {
        newImageUrls = await uploadImagesToBucket(newFiles, "pending_services_images");
      }

      const allImages = [...form.images, ...newImageUrls];

      await updatePendingService(pending.id, {
        title: form.title,
        description: form.description,
        type: form.type,
        location: form.location,
        price: form.price,
        images: allImages,
        amenities: form.amenities,
      } as any);

      alert("✅ Changes saved.");
      refresh();
      setNewFiles([]); // reset ảnh mới sau khi lưu
    } catch (err: any) {
      console.error(err);
      alert("❌ Save failed: " + (err?.message ?? err));
    } finally {
      setSaving(false);
    }
  };

  /* ✅ Approve */
  const handleApprove = async () => {
    try {
      await approvePendingAsService(pending, form, files);
      alert("✅ Approved and moved to services.");
      refresh();
      onClose();
    } catch (err: any) {
      console.error(err);
      alert("❌ Approve failed: " + (err?.message ?? err));
    }
  };

  /* 🗑️ Remove existing image */
  const handleRemoveImage = (imgUrl: string) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((i) => i !== imgUrl),
    }));
    alert("⚠️ Image removed from preview. Click 'Save Changes' to confirm.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="bg-neutral-900 text-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8 relative border border-neutral-800 shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <h3 className="text-2xl font-semibold">Approve Service</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">
            ✕
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4 text-sm">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded"
            >
              {SERVICE_TYPES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded h-28"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Location</label>
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Price</label>
            <input
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Amenities (comma separated)</label>
            <input
              value={form.amenities}
              onChange={(e) => setForm({ ...form, amenities: e.target.value })}
              placeholder="wifi, pool, gym"
              className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded"
            />
          </div>

          {/* 📸 Images */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Images</label>

            {/* Add Image Button */}
            <button
              type="button"
              onClick={() => document.getElementById("new-images")?.click()}
              className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 rounded text-sm mb-3"
            >
              + Add Images
            </button>
            <input
              id="new-images"
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files && setNewFiles(Array.from(e.target.files))}
            />

            <div className="flex gap-2 flex-wrap mt-2">
              {/* Existing Images */}
              {form.images.map((u, i) => (
                <div key={i} className="relative group">
                  <img
                    src={u}
                    alt={`img-${i}`}
                    className="h-24 w-24 object-cover rounded-lg border border-neutral-700"
                  />
                  <button
                    onClick={() => handleRemoveImage(u)}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-xs opacity-0 group-hover:opacity-100 transition"
                  >
                    ✕
                  </button>
                </div>
              ))}

              {/* New Images Preview */}
              {newFiles.map((f, i) => (
                <div key={`new-${i}`} className="relative">
                  <img
                    src={URL.createObjectURL(f)}
                    alt={`new-${i}`}
                    className="h-24 w-24 object-cover rounded-lg border border-neutral-700 opacity-80"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Owner Info */}
        <div className="mt-6 border-t border-neutral-800 pt-4 text-sm space-y-1">
          <p className="text-xs text-gray-400 uppercase">Owner Information</p>
          <p><span className="text-gray-400">Name:</span> {pending.owner_name || "—"}</p>
          <p><span className="text-gray-400">Phone:</span> {pending.phone || "—"}</p>
          <p><span className="text-gray-400">Email:</span> {pending.email || "—"}</p>
          <p><span className="text-gray-400">Facebook:</span> {pending.facebook || "—"}</p>
          <p><span className="text-gray-400">Zalo:</span> {pending.zalo || "—"}</p>
          <p><span className="text-gray-400">TikTok:</span> {pending.tiktok || "—"}</p>
          <p><span className="text-gray-400">Instagram:</span> {pending.instagram || "—"}</p>
          <p><span className="text-gray-400">Status:</span> {pending.status || "—"}</p>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleSaveChanges}
            disabled={saving}
            className="flex-1 px-4 py-3 rounded bg-neutral-800 hover:bg-neutral-700 transition"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

          <button
            onClick={handleApprove}
            className="flex-1 px-4 py-3 rounded bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 transition text-white font-semibold"
          >
            Approve
          </button>

          <button
            onClick={() => {
              const reason = prompt("Reason for rejection:") || "";
              if (reason) onReject(reason);
            }}
            className="flex-1 px-4 py-3 rounded bg-red-600 hover:bg-red-500 transition text-white font-semibold"
          >
            Reject
          </button>

          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded bg-neutral-700 hover:bg-neutral-600 transition text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
