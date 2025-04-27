import React, { useState, useEffect } from 'react';
import { AlertCircle, Clock, ChevronRight } from 'lucide-react';
import { getCategories, getItemsByCategory } from '../../lib/api';
import type { CategoryWithSubcategories, ItemWithDetails } from '../../lib/types';

const ActiveRentals: React.FC = () => {
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [items, setItems] = useState<ItemWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedSubCategory) {
      loadItems(selectedSubCategory);
    }
  }, [selectedSubCategory]);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const loadItems = async (categoryId: string) => {
    try {
      setLoading(true);
      const data = await getItemsByCategory(categoryId);
      setItems(data);
    } catch (err) {
      setError('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const handleMainCategorySelect = (categoryId: string) => {
    setSelectedMainCategory(categoryId);
    setSelectedSubCategory(null);
    setItems([]);
  };

  const handleSubCategorySelect = (categoryId: string) => {
    setSelectedSubCategory(categoryId);
  };

  const isOverdue = (dueDate: string) => {
    return new Date() > new Date(dueDate);
  };

  if (loading && categories.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  // Render main categories grid view
  if (!selectedMainCategory) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Browse Categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map(category => (
            <div 
              key={category.id}
              onClick={() => handleMainCategorySelect(category.id)}
              className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="h-40 bg-orange-500 flex items-center justify-center p-4">
                {category.imageUrl ? (
                  <img 
                    src={category.imageUrl} 
                    alt={category.name} 
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-white text-4xl">{category.name.charAt(0)}</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                {category.subcategories && (
                  <p className="text-sm text-gray-500 mt-1">
                    {category.subcategories.length} subcategories
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Get the selected main category
  const mainCategory = categories.find(c => c.id === selectedMainCategory);
  
  // Render subcategories grid view
  if (!selectedSubCategory && mainCategory) {
    return (
      <div className="space-y-6">
        <div className="flex items-center mb-4">
          <button 
            onClick={() => setSelectedMainCategory(null)}
            className="text-primary-600 hover:text-primary-800 mr-2"
          >
            ← Back to Categories
          </button>
          <h2 className="text-xl font-semibold text-gray-800">{mainCategory.name}</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {mainCategory.subcategories?.map(subCategory => (
            <div 
              key={subCategory.id}
              onClick={() => handleSubCategorySelect(subCategory.id)}
              className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="h-40 bg-indigo-100 flex items-center justify-center p-4">
                {subCategory.imageUrl ? (
                  <img 
                    src={subCategory.imageUrl} 
                    alt={subCategory.name} 
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="w-16 h-16 bg-indigo-200 rounded-full flex items-center justify-center">
                    <span className="text-indigo-700 text-2xl">{subCategory.name.charAt(0)}</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900">{subCategory.name}</h3>
                {subCategory.items && (
                  <p className="text-sm text-gray-500 mt-1">
                    {subCategory.items.length} items
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Find the selected subcategory
  const subCategory = mainCategory?.subcategories?.find(s => s.id === selectedSubCategory);

  // Render items and their rentals
  return (
    <div className="space-y-6">
      <div className="flex items-center mb-4">
        <button 
          onClick={() => setSelectedSubCategory(null)}
          className="text-primary-600 hover:text-primary-800 mr-2"
        >
          ← Back to {mainCategory?.name}
        </button>
        <h2 className="text-xl font-semibold text-gray-800">{subCategory?.name}</h2>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : items.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          No items found in this category
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-lg border shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                  <span className="text-sm text-gray-500">
                    {item.available_quantity} / {item.total_quantity} available
                  </span>
                </div>
                {item.model_number && (
                  <p className="text-sm text-gray-500">Model: {item.model_number}</p>
                )}
              </div>
              
              {item.rentals.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {item.rentals.map(rental => (
                    <div key={rental.id} className="px-4 py-3">
                      <p className="font-medium text-gray-900">{rental.student.name}</p>
                      <p className="text-sm text-gray-500">
                        Serial: {rental.serial_number.serial_number}
                      </p>
                      <div className="flex items-center mt-1">
                        <Clock className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-500">
                          Due: {new Date(rental.due_date).toLocaleDateString()}
                        </span>
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                          isOverdue(rental.due_date)
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {isOverdue(rental.due_date) ? 'Overdue' : 'Active'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500">
                  No active rentals
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActiveRentals;