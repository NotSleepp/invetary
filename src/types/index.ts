export interface User {
  id: string
  username: string
  email: string
  role: string
}

export interface Production {
  id: string
  product_id: string
  quantity: number
  production_date: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  message: string
  read: boolean
  created_at: string
}

export interface Product {
  id: string
  user_id: string
  name: string
  description?: string
  stock_quantity: number
  category_id: string
  cost_price: number
  sale_price: number
  created_at: string
}

export interface Material {
  id: string
  user_id: string
  name: string
  description?: string
  stock_quantity: number
  cost_per_unit: number
  category_id: string
  supplier_id: string
  reorder_level?: number
  reorder_quantity?: number
  created_at: string
}

export interface Recipe {
  id: string;
  product_id: string;
  material_id: string;
  quantity_per_product: number;
  production_cost: number | null;
  product?: Product;
  material?: Material;
}

// Nueva interfaz para manejar múltiples materiales en el formulario
export interface RecipeFormData {
  product_id: string;
  materials: {
    material_id: string;
    quantity_per_product: number;
  }[];
}

export interface ProductionLog {
  id: string
  user_id: string
  product_id: string
  quantity_produced: number
  total_cost?: number
  created_at: string
}

export interface FinancialRecord {
  id: string
  user_id: string
  type: 'income' | 'expense'
  amount: number
  description?: string
  created_at: string
}

export interface Sale {
  id: string;
  date: string;
  amount: number;
  product_name: string;
  user_id?: string;
  product_id?: string;
  quantity_sold?: number;
  sale_price?: number;
  total_revenue?: number; // Marcar como opcional
  created_at?: string;    // Marcar como opcional
}


export interface Category {
  id: string
  name: string
  description?: string
}

export interface Supplier {
  id: string
  name: string
  contact_info?: string
  created_at: string
  email?: string;
  phone?: string;
}

export type PartialSupplier = Partial<Supplier> & Pick<Supplier, 'id'>;

export interface PriceHistory {
  id: string
  product_id?: string
  material_id?: string
  price: number
  effective_date: string
}

export interface Notification {
  id: string
  user_id: string
  message: string
  read: boolean
  created_at: string
}

export interface Role {
  id: string
  name: string
  description?: string
}

export interface UserRole {
  id: string
  user_id: string
  role_id: string
}

export interface Document {
  id: string
  related_table: string
  related_id: string
  file_name: string
  file_path: string
  uploaded_at: string
}

export interface ReportData {
  id: string
  report_name: string
  data: any
}