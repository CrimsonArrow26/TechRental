import React, { useState, useEffect } from 'react';
import { AlertCircle, Clock, ChevronRight, Package } from 'lucide-react';
import { useInventory } from '../../contexts/InventoryContext';

interface ActiveRentalsProps {
  onStudentClick: (studentId: string) => void;
}

const ActiveRentals: React.FC<ActiveRentalsProps> = ({ onStudentClick }) => {
  const { categories, getRentalsByCategory, handleReturnItem } = useInventory();
  const [selectedMainCategory, setSelectedMainCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReturnModal, setShowReturnModal] = useState<string | null>(null);
  const [returnSuccess, setReturnSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (selectedMainCategory) {
      const rentals = getRentalsByCategory(selectedMainCategory);
      setItems(rentals);
      setLoading(false);
    }
  }, [selectedMainCategory, getRentalsByCategory]);

  const handleMainCategorySelect = (categoryId: string) => {
    setSelectedMainCategory(categoryId);
    setSelectedSubCategory(null);
    setItems([]);
  };

  const handleSubCategorySelect = (categoryId: string) => {
    setSelectedSubCategory(categoryId);
  };

  const handleReturnClick = (itemId: string) => {
    setShowReturnModal(itemId);
  };

  const handleReturnConfirm = async (itemId: string, serialNumber: string) => {
    try {
      handleReturnItem(itemId, serialNumber);
      setShowReturnModal(null);
      setReturnSuccess('Item returned successfully');
      setTimeout(() => setReturnSuccess(null), 3000);
      // Refresh the items list
      if (selectedMainCategory) {
        const rentals = getRentalsByCategory(selectedMainCategory);
        setItems(rentals);
      }
    } catch (err) {
      setError('Failed to process return');
    }
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

  // Render main categories
  if (!selectedMainCategory) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Component Categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map(category => (
            <div 
              key={category.main}
              onClick={() => handleMainCategorySelect(category.main)}
              className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="p-6">
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
    );
  }

  // Render subcategories
  if (!selectedSubCategory) {
    const mainCategory = categories.find(c => c.main === selectedMainCategory);
    return (
      <div className="space-y-6">
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
              onClick={() => handleSubCategorySelect(subcategory)}
              className="bg-white rounded-lg shadow-md p-6 cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-lg"
            >
              <h3 className="text-lg font-medium text-gray-900">{subcategory}</h3>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Render items in subcategory
  const mainCategory = categories.find(c => c.main === selectedMainCategory);

  return (
    <div className="space-y-6">
      {returnSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
          <p className="text-green-700">{returnSuccess}</p>
        </div>
      )}

      <div className="flex items-center mb-6">
        <button
          onClick={() => setSelectedSubCategory(null)}
          className="text-primary-600 hover:text-primary-700 mr-4"
        >
          ← Back to {mainCategory?.main}
        </button>
        <h2 className="text-xl font-semibold text-gray-800">{selectedSubCategory}</h2>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Items Rented
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {(() => {
              // Filter items for the selected subcategory
              const filtered = items.filter(item => item.product.subCategory === selectedSubCategory);
              // Group by student
              const studentMap: Record<string, { name: string, count: number, productIds: string[], rentalIds: string[], dueDates: string[], issueDates: string[] }> = {};
              filtered.forEach(item => {
                item.rentals.forEach((rental: any) => {
                  if (!studentMap[rental.studentId]) {
                    studentMap[rental.studentId] = {
                      name: rental.studentName,
                      count: 0,
                      productIds: [],
                      rentalIds: [],
                      dueDates: [],
                      issueDates: []
                    };
                  }
                  studentMap[rental.studentId].count += 1;
                  studentMap[rental.studentId].productIds.push(item.product.id);
                  studentMap[rental.studentId].rentalIds.push(rental.serialNumber);
                  studentMap[rental.studentId].dueDates.push(rental.dueDate);
                  studentMap[rental.studentId].issueDates.push(rental.issuedDate);
                });
              });
              return Object.entries(studentMap).map(([studentId, info]) => (
                <tr key={studentId} className="cursor-pointer hover:bg-gray-50" onClick={() => onStudentClick(studentId)}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-700">
                    {info.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {selectedSubCategory} x{info.count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {/* Optionally, you can add a button to return all or show details */}
                  </td>
                </tr>
              ));
            })()}
          </tbody>
        </table>
      </div>

      {/* Return Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Return</h3>
            <p className="text-gray-600 mb-4">Are you sure you want to return this item?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowReturnModal(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const item = items.find(i => i.product.id === showReturnModal);
                  if (item) {
                    handleReturnConfirm(item.product.id, item.rentals[0].serialNumber);
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md"
              >
                Confirm Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveRentals;