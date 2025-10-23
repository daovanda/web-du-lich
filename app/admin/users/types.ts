import { useState } from "react";

export type Profile = {
  id: string;
  full_name: string | null;
  role: "user" | "partner" | "admin";
  username: string | null;
  phone: string | null;
  avatar_url: string | null;
  status: "active" | "banned" | "pending";
  created_at: string;
  last_login_at?: string | null;
};

export type UserStats = {
  services_count: number;
  bookings_count: number;
  service_reviews_count: number;
  location_reviews_count: number;
};

export type Service = {
  id: string;
  title: string;
  type: string;
  created_at: string;
};

export type Booking = {
  id: string;
  service_id: string;
  status: string;
  date_from: string;
  date_to: string;
  created_at: string;
};

export type ServiceReview = {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  service_id: string;
};

export type LocationReview = {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  location_id: string;
};

export type UserHistory = {
  services: Service[];
  bookings: Booking[];
  service_reviews: ServiceReview[];
  location_reviews: LocationReview[];
};