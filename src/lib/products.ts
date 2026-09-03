import { supabase } from "@/integrations/supabase/client";

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string | null;
  special_offer: string | null;
  featured: boolean;
  in_stock: boolean;
  created_at: string;
};

export const CATEGORIES = ["Salah Tracker", "Laminated Charts", "Flash Cards", "Wall Posters"] as const;

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Product[];
}

export const productsQuery = {
  queryKey: ["products"],
  queryFn: fetchProducts,
};
