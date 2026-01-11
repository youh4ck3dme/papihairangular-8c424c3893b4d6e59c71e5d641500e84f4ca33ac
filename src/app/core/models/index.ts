export * from "./blog-post.interface";
export * from "./api-responses.interface";

export interface Stylist {
  id: string;
  name: string;
  title: string;
  imageUrl: string;
  services: string[]; // array of service IDs
  description: string;
  skills: string[];
}

export interface SalonService {
  id: string;
  name: string;
  duration: number; // in minutes
  price: number;
  category: "Dámske" | "Pánske" | "Farbenie" | "Ostatné";
  description?: string;
  breakdown?: { name: string; price?: string | number; included: boolean }[];
  isLookbook?: boolean;
  imageUrl?: string;
}

// Appointment interface is kept for now as it's still referenced by mock-appointments.ts (which is being deleted, then this can be removed too)
export interface Appointment {
  id: string;
  userId: string;
  stylistId: string;
  serviceId: string;
  startTime: Date;
  endTime: Date;
  status: "upcoming" | "completed" | "cancelled";
}
