// Database types
export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  created_at: string;
}

export interface Item {
  id: string;
  name: string;
  description: string | null;
  category_id: string;
  model_number: string | null;
  total_quantity: number;
  available_quantity: number;
  created_at: string;
}

export interface SerialNumber {
  id: string;
  item_id: string;
  serial_number: string;
  status: 'available' | 'rented';
  created_at: string;
}

export interface Rental {
  id: string;
  student_id: string;
  item_id: string;
  serial_number_id: string;
  issued_date: string;
  due_date: string;
  return_date: string | null;
  status: 'active' | 'returned' | 'overdue';
  created_at: string;
}

// Extended types with relationships
export interface CategoryWithSubcategories extends Category {
  subcategories: CategoryWithSubcategories[];
  items: ItemWithDetails[];
}

export interface ItemWithDetails extends Item {
  category: Category;
  serial_numbers: SerialNumber[];
  rentals: RentalWithDetails[];
}

export interface RentalWithDetails extends Rental {
  student: {
    id: string;
    name: string;
    email: string;
    registration_number: string;
  };
  item: Item;
  serial_number: SerialNumber;
}

// State types
export interface RentalManagementState {
  categories: CategoryWithSubcategories[];
  selectedCategory: string | null;
  selectedItem: string | null;
  searchQuery: string;
  loading: boolean;
  error: string | null;
}