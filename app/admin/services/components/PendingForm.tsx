"use client";

import { useState } from "react";
import { SERVICE_TYPES } from "../types";

type PendingFormData = {
  title: string;
  type: string;
  description: string;
  location: string;
  price: string;
  images: string[];
  owner_name: string;
  phone: string;
  email: string;
  facebook: string;
  zalo: string;
  tiktok: string;
  instagram: string;
  amenities: string; // ✅ thêm trường amenities
};

type PendingFormProps = {
  onSubmit: (form: PendingFormData, files: File[]) => Promise<void>;
  loading: boolean;
};

export default function PendingForm({ onSubmit, loading }: PendingFormProps) {
  const [form, setForm] = useState<PendingFormData>({
    title: "",
    type: "stay",
    description: "",
    location: "",
    price: "",
    images: [],
    owner_name: "",
    phone: "",
    email: "",
    facebook: "",
    zalo: "",
    tiktok: "",
    instagram: "",
    amenities: "",
  });

  const [files, setFiles] = useState<File[]>([]);

  const handleSubmit = async () => {
    await onSubmit(form, files);
    alert("✅ Dịch vụ đã được thêm vào danh sách chờ duyệt!");

    setForm({
      title: "",
      type: "stay",
      description: "",
      location: "",
      price: "",
      images: [],
      owner_name: "",
      phone: "",
      email: "",
      facebook: "",
      zalo: "",
      tiktok: "",
      instagram: "",
      amenities: "",
    });
    setFiles([]);
  };

  return (
    <div className="bg-neutral-900 rounded-2xl p-8 border border-neutral-800 shadow-lg">
      <h3 className="text-2xl font-semibold mb-6 text-white tracking-tight">
        ➕ Add Pending Service
      </h3>

      <div className="space-y-4">
        {/* Basic Info */}
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Service Title"
          className="w-full p-3 bg-neutral-800 rounded-xl text-white placeholder-gray-500 border border-neutral-700 focus:border-purple-500 outline-none"
        />

        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="w-full p-3 bg-neutral-800 rounded-xl text-white border border-neutral-700 focus:border-purple-500 outline-none"
        >
          {SERVICE_TYPES.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Description"
          className="w-full p-3 bg-neutral-800 rounded-xl text-white placeholder-gray-500 border border-neutral-700 focus:border-purple-500 outline-none h-28 resize-none"
        />

        <input
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          placeholder="Location"
          className="w-full p-3 bg-neutral-800 rounded-xl text-white placeholder-gray-500 border border-neutral-700 focus:border-purple-500 outline-none"
        />

        <input
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          placeholder="Price"
          className="w-full p-3 bg-neutral-800 rounded-xl text-white placeholder-gray-500 border border-neutral-700 focus:border-purple-500 outline-none"
        />

        {/* ✅ Amenities */}
        <input
          value={form.amenities}
          onChange={(e) => setForm({ ...form, amenities: e.target.value })}
          placeholder="Amenities (comma separated, e.g. wifi, pool, gym)"
          className="w-full p-3 bg-neutral-800 rounded-xl text-white placeholder-gray-500 border border-neutral-700 focus:border-purple-500 outline-none"
        />

        {/* Upload Images */}
        <div>
          <p className="text-sm text-gray-400 mb-2">Images</p>
          <button
            type="button"
            onClick={() => document.getElementById("pending-files")?.click()}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold hover:opacity-90 transition"
          >
            📷 Upload Images
          </button>
          <input
            id="pending-files"
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (!e.target.files) return;
              setFiles(Array.from(e.target.files));
            }}
          />

          {files.length > 0 && (
            <div className="flex gap-3 flex-wrap mt-4">
              {files.map((file, i) => (
                <div key={i} className="relative group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`preview-${i}`}
                    className="h-24 w-24 object-cover rounded-xl border border-neutral-700"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Owner Info */}
        <div className="mt-8 pt-4 border-t border-neutral-800">
          <h4 className="text-sm text-gray-400 uppercase mb-4">Owner Information</h4>
          <div className="space-y-3">
            <input
              value={form.owner_name}
              onChange={(e) => setForm({ ...form, owner_name: e.target.value })}
              placeholder="Owner Name"
              className="w-full p-3 bg-neutral-800 rounded-xl text-white placeholder-gray-500 border border-neutral-700 focus:border-purple-500 outline-none"
            />
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Phone"
              className="w-full p-3 bg-neutral-800 rounded-xl text-white placeholder-gray-500 border border-neutral-700 focus:border-purple-500 outline-none"
            />
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Email"
              className="w-full p-3 bg-neutral-800 rounded-xl text-white placeholder-gray-500 border border-neutral-700 focus:border-purple-500 outline-none"
            />
            <input
              value={form.facebook}
              onChange={(e) => setForm({ ...form, facebook: e.target.value })}
              placeholder="Facebook"
              className="w-full p-3 bg-neutral-800 rounded-xl text-white placeholder-gray-500 border border-neutral-700 focus:border-purple-500 outline-none"
            />
            <input
              value={form.zalo}
              onChange={(e) => setForm({ ...form, zalo: e.target.value })}
              placeholder="Zalo"
              className="w-full p-3 bg-neutral-800 rounded-xl text-white placeholder-gray-500 border border-neutral-700 focus:border-purple-500 outline-none"
            />
            <input
              value={form.tiktok}
              onChange={(e) => setForm({ ...form, tiktok: e.target.value })}
              placeholder="TikTok"
              className="w-full p-3 bg-neutral-800 rounded-xl text-white placeholder-gray-500 border border-neutral-700 focus:border-purple-500 outline-none"
            />
            <input
              value={form.instagram}
              onChange={(e) => setForm({ ...form, instagram: e.target.value })}
              placeholder="Instagram"
              className="w-full p-3 bg-neutral-800 rounded-xl text-white placeholder-gray-500 border border-neutral-700 focus:border-purple-500 outline-none"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-6">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold text-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Adding..." : "➕ Add Pending Service"}
          </button>
        </div>
      </div>
    </div>
  );
}
