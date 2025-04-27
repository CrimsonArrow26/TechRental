import React, { useState } from 'react';
import { Calendar, CheckCircle } from 'lucide-react';
import { Product } from '../../contexts/InventoryContext';

interface RentalFormProps {
  product: Product;
  studentId: string;
  onRent: (productId: string, studentId: string, dueDate: string) => Promise<string>;
  onSuccess: (serialNumber: string) => void;
}

const RentalForm: React.FC<RentalFormProps> = ({ product, studentId, onRent, onSuccess }) => {
  const [dueDate, setDueDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Calculate min date (today) and max date (3 months from now)
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];
  
  const maxDate = new Date();
  maxDate.setMonth(today.getMonth() + 3);
  const maxDateString = maxDate.toISOString().split('T')[0];
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dueDate) {
      setError('Please select a return date');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const serialNumber = await onRent(product.id, studentId, dueDate);
      onSuccess(serialNumber);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during rental');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (product.availableQuantity === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
        <p className="text-red-600 font-medium">This item is currently out of stock.</p>
        <p className="text-gray-600 text-sm mt-2">Please check back later or select another item.</p>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-md p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Rent This Item</h3>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
      
      <div className="mb-4">
        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
          Return By Date
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="dueDate"
            type="date"
            className="pl-10 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            min={minDate}
            max={maxDateString}
            disabled={isLoading}
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">Maximum rental period is 3 months.</p>
      </div>
      
      <div className="flex items-center text-sm text-gray-600 mb-4">
        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
        <span>{product.availableQuantity} items available for rent</span>
      </div>
      
      <button
        type="submit"
        disabled={isLoading || !dueDate}
        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
          ${isLoading || !dueDate ? 
            'bg-gray-400 cursor-not-allowed' : 
            'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
          }`}
      >
        {isLoading ? 'Processing...' : 'Rent Now'}
      </button>
    </form>
  );
};

export default RentalForm;