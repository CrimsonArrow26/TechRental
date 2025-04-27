import { createClient } from '@supabase/supabase-js';
import type {
  Category,
  Item,
  SerialNumber,
  Rental,
  CategoryWithSubcategories,
  ItemWithDetails,
  RentalWithDetails,
} from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Categories
export const getCategories = async (): Promise<CategoryWithSubcategories[]> => {
  const { data: mainCategories, error: mainError } = await supabase
    .from('categories')
    .select('*')
    .is('parent_id', null)
    .order('name');

  if (mainError) throw mainError;

  const categoriesWithSubs = await Promise.all(
    mainCategories.map(async (category) => {
      const { data: subcategories, error: subError } = await supabase
        .from('categories')
        .select('*')
        .eq('parent_id', category.id)
        .order('name');

      if (subError) throw subError;

      return {
        ...category,
        subcategories: subcategories || [],
      };
    })
  );

  return categoriesWithSubs;
};

// Items
export const getItemsByCategory = async (categoryId: string): Promise<ItemWithDetails[]> => {
  // First, get all subcategories of the selected category
  const { data: subcategories, error: subError } = await supabase
    .from('categories')
    .select('id')
    .eq('parent_id', categoryId);

  if (subError) throw subError;

  // Create an array of category IDs to search (including the main category and its subcategories)
  const categoryIds = [categoryId, ...(subcategories?.map(sub => sub.id) || [])];

  const { data, error } = await supabase
    .from('items')
    .select(`
      *,
      category:categories(*),
      serial_numbers!inner(*),
      rentals!inner(
        *,
        student:students!inner(
          id,
          name,
          email,
          registration_number
        )
      )
    `)
    .in('category_id', categoryIds)
    .eq('rentals.status', 'active');

  if (error) throw error;
  return data || [];
};

// Rentals
export const getRentals = async (): Promise<RentalWithDetails[]> => {
  const { data, error } = await supabase
    .from('rentals')
    .select(`
      *,
      student:students(
        id,
        name,
        email,
        registration_number
      ),
      item:items(*),
      serial_number:serial_numbers(*)
    `)
    .eq('status', 'active')
    .order('issued_date', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const processReturn = async (rentalId: string): Promise<void> => {
  // Start a transaction
  const { data: rental, error: rentalError } = await supabase
    .from('rentals')
    .update({
      status: 'returned',
      return_date: new Date().toISOString()
    })
    .eq('id', rentalId)
    .select('serial_number_id, item_id')
    .single();

  if (rentalError) throw rentalError;

  if (rental) {
    // Update serial number status
    const { error: serialError } = await supabase
      .from('serial_numbers')
      .update({ status: 'available' })
      .eq('id', rental.serial_number_id);

    if (serialError) throw serialError;

    // Update item available quantity
    const { error: itemError } = await supabase
      .from('items')
      .update({
        available_quantity: supabase.rpc('increment', { row_id: rental.item_id })
      })
      .eq('id', rental.item_id);

    if (itemError) throw itemError;
  }
};

// Students
export const searchStudents = async (query: string): Promise<any[]> => {
  const { data, error } = await supabase
    .from('students')
    .select(`
      *,
      rentals!inner(
        id,
        issued_date,
        due_date,
        status,
        item:items(
          id,
          name,
          model_number
        ),
        serial_number:serial_numbers(
          id,
          serial_number
        )
      )
    `)
    .or(`name.ilike.%${query}%,registration_number.ilike.%${query}%`)
    .eq('rentals.status', 'active')
    .order('name');

  if (error) throw error;
  return data || [];
};