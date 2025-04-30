import { supabase } from '../lib/supabaseClient';
import React, { createContext, useState, useEffect, useContext } from 'react';

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category_id: string;
  // ...other fields
}

interface InventoryContextType {
  products: Product[];
  categories: Category[];
  mainCategories: Category[];
  getSubcategories: (parentId: string) => Category[];
  filterProductsBySubcategory: (subcategoryId: string) => Product[];
  statistics: any;
  isLoading: boolean;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [statistics, setStatistics] = useState({
    totalComponents: 0,
    activeRentals: 0,
    satisfactionRate: 95,
    totalStudents: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const { data: items } = await supabase.from('items').select('*');
      const { data: cats } = await supabase.from('categories').select('*');
      setProducts(items || []);
      setCategories(cats || []);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const mainCategories = categories.filter(cat => !cat.parent_id);
  const getSubcategories = (parentId: string) => categories.filter(cat => cat.parent_id === parentId);
  const filterProductsBySubcategory = (subcategoryId: string) => products.filter(p => p.category_id === subcategoryId);

  return (
    <InventoryContext.Provider value={{
      products,
      categories,
      mainCategories,
      getSubcategories,
      filterProductsBySubcategory,
      statistics,
      isLoading
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}; 