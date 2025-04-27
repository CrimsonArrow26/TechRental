import React from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { Product } from '../../contexts/InventoryContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { id, name, description, imageUrl, availableQuantity, totalQuantity } = product;
  
  // Calculate availability percentage
  const availabilityPercentage = Math.round((availableQuantity / totalQuantity) * 100);
  
  // Determine availability status and colors
  let availabilityStatus: string;
  let statusColor: string;
  let progressColor: string;
  
  if (availabilityPercentage > 66) {
    availabilityStatus = 'Available';
    statusColor = 'text-green-600';
    progressColor = 'bg-green-500';
  } else if (availabilityPercentage > 33) {
    availabilityStatus = 'Limited';
    statusColor = 'text-yellow-600';
    progressColor = 'bg-yellow-500';
  } else {
    availabilityStatus = 'Low Stock';
    statusColor = 'text-red-600';
    progressColor = 'bg-red-500';
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="h-48 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={name} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{name}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>
        
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Clock className="h-4 w-4 text-gray-500 mr-1" />
            <span className="text-sm text-gray-500">Rental available</span>
          </div>
          <span className={`text-sm font-medium ${statusColor}`}>{availabilityStatus}</span>
        </div>
        
        {/* Availability progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className={`${progressColor} h-2 rounded-full`} 
            style={{ width: `${availabilityPercentage}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">{availableQuantity} of {totalQuantity} available</span>
          <Link 
            to={`/product/${id}`} 
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-md transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;