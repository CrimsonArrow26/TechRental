import React, { useState } from 'react';
import { useInventory } from '../contexts/InventoryContext';
import { useAuth } from '../contexts/AuthContext';

const ProductCatalog: React.FC = () => {
  const { products, categories, isLoading, updateProductQuantity } = useInventory();
  const { user } = useAuth();
  const [editQuantities, setEditQuantities] = useState<Record<string, number>>({});
  const [showConfirmation, setShowConfirmation] = useState(false);

  const filteredProducts = products.filter(product => product.category === categories[0]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Product Catalog</h1>
      <table className="min-w-full divide-y divide-gray-200 mb-4">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Available</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
            {user?.role === 'admin' && (
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            )}
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
                    disabled={user?.role !== 'admin'}
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
                    disabled={user?.role !== 'admin'}
                  >
                    &gt;
                  </button>
                </div>
              </td>
              {user?.role === 'admin' && (
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
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductCatalog; 