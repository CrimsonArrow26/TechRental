import React, { useState, useEffect } from 'react';
import { useInventory, Product } from '../contexts/InventoryContext';
import ProductCard from '../components/product/ProductCard';
import SearchAndFilter from '../components/ui/SearchAndFilter';
import { useAuth } from '../contexts/AuthContext';
import { Package } from 'lucide-react';

const ProductCatalog: React.FC = () => {
  const { products, categories, isLoading, updateProductQuantity } = useInventory();
  const { user } = useAuth();
  const [selectedMainCategory, setSelectedMainCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [editQuantities, setEditQuantities] = useState<Record<string, number>>({});
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Get filtered products for selected subcategory
  const filteredProducts = selectedMainCategory && selectedSubCategory
    ? products.filter(
        p => p.mainCategory === selectedMainCategory && p.subCategory === selectedSubCategory
      )
    : [];

  // Main category selection UI
  if (!selectedMainCategory) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Component Categories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map(category => (
              <div 
                key={category.main}
                onClick={() => setSelectedMainCategory(category.main)}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="p-6 flex flex-col items-center">
                  <Package className="h-8 w-8 text-primary-600 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">{category.main}</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {category.sub.length} subcategories
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Subcategory selection UI
  if (!selectedSubCategory) {
    const mainCategory = categories.find(c => c.main === selectedMainCategory);
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-6">
            <button
              onClick={() => setSelectedMainCategory(null)}
              className="text-primary-600 hover:text-primary-700 mr-4"
            >
              ← Back to Categories
            </button>
            <h2 className="text-xl font-semibold text-gray-800">{mainCategory?.main}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {mainCategory?.sub.map(subcategory => (
              <div
                key={subcategory}
                onClick={() => setSelectedSubCategory(subcategory)}
                className="bg-white rounded-lg shadow-md p-6 cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-lg"
              >
                <h3 className="text-lg font-medium text-gray-900">{subcategory}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Inventory management for selected subcategory
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={() => setSelectedSubCategory(null)}
            className="text-primary-600 hover:text-primary-700 mr-4"
          >
            ← Back to {selectedMainCategory}
          </button>
          <h2 className="text-xl font-semibold text-gray-800">{selectedSubCategory}</h2>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-1">Inventory Management</h2>
          {showConfirmation && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded text-center">
              Inventory has been updated
            </div>
          )}
          <table className="min-w-full divide-y divide-gray-200 mb-4">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Available</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map(product => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{product.availableQuantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200"
                        onClick={() => setEditQuantities(q => ({ ...q, [product.id]: Math.max((q[product.id] ?? product.totalQuantity) - 1, product.availableQuantity) }))}
                        aria-label="Decrease"
                        type="button"
                      >
                        &lt;
                      </button>
                      <span className="w-10 text-center text-lg font-semibold">
                        {editQuantities[product.id] ?? product.totalQuantity}
                      </span>
                      <button
                        className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200"
                        onClick={() => setEditQuantities(q => ({ ...q, [product.id]: (q[product.id] ?? product.totalQuantity) + 1 }))}
                        aria-label="Increase"
                        type="button"
                      >
                        &gt;
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    <button
                      className="text-blue-700 font-medium mr-2 focus:outline-none"
                      style={{ textDecoration: 'none' }}
                      onClick={() => {
                        updateProductQuantity(product.id, editQuantities[product.id] ?? product.totalQuantity);
                        setShowConfirmation(true);
                        setTimeout(() => setShowConfirmation(false), 2000);
                      }}
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductCatalog;