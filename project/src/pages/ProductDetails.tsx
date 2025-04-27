import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, ShieldCheck, AlertCircle } from 'lucide-react';
import { useInventory } from '../contexts/InventoryContext';
import { useAuth } from '../contexts/AuthContext';
import RentalForm from '../components/rental/RentalForm';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getProduct, rentProduct } = useInventory();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const product = getProduct(id || '');
  
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/catalog"
            className="inline-flex items-center text-primary-600 hover:text-primary-800"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }
  
  const handleRentSuccess = (serialNumber: string) => {
    setSuccessMessage(`Successfully rented item with serial number: ${serialNumber}`);
    // Optionally redirect to dashboard after a delay
    setTimeout(() => {
      navigate('/dashboard');
    }, 3000);
  };
  
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <Link to="/" className="hover:text-primary-600">Home</Link>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li>
              <Link to="/catalog" className="hover:text-primary-600">Catalog</Link>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li className="text-gray-900 font-medium truncate">
              {product.name}
            </li>
          </ol>
        </nav>
        
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
            <div className="flex">
              <ShieldCheck className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
              <div>
                <p className="text-green-700 font-medium">{successMessage}</p>
                <p className="text-green-600 text-sm mt-1">
                  Redirecting to your dashboard...
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="md:flex">
            {/* Product Image */}
            <div className="md:w-1/2">
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="w-full h-full object-cover object-center"
                style={{ maxHeight: '400px' }}
              />
            </div>
            
            {/* Product Details */}
            <div className="md:w-1/2 p-6 md:p-8">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
                  <p className="text-sm text-primary-600 mb-4">{product.category}</p>
                </div>
                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  {product.availableQuantity} available
                </div>
              </div>
              
              <p className="text-gray-600 mb-6">{product.description}</p>
              
              <div className="border-t border-gray-200 pt-6 mb-6">
                <div className="flex items-center mb-4">
                  <Clock className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-gray-700">
                    Maximum rental period: <span className="font-medium">3 months</span>
                  </span>
                </div>
                
                <div className="flex items-center">
                  <ShieldCheck className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-700">
                    Each item has a unique serial number for tracking
                  </span>
                </div>
              </div>
              
              {/* Rental Form or Login Prompt */}
              {isAuthenticated && user?.role === 'student' ? (
                <RentalForm
                  product={product}
                  studentId={user.id}
                  onRent={rentProduct}
                  onSuccess={handleRentSuccess}
                />
              ) : isAuthenticated ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <p className="text-yellow-700">
                    Only students can rent equipment. Staff and admins can manage inventory instead.
                  </p>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-center">
                  <p className="text-gray-700 mb-3">
                    Please log in with your student account to rent this item.
                  </p>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Back to catalog */}
        <div className="flex justify-start">
          <Link
            to="/catalog"
            className="inline-flex items-center text-primary-600 hover:text-primary-800"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back to Catalog
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;