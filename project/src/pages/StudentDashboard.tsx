import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useInventory } from '../contexts/InventoryContext';
import { Clock, AlertTriangle } from 'lucide-react';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { getStudentRentals } = useInventory();
  
  if (!user) {
    return null; // Should be handled by ProtectedRoute
  }
  
  const studentRentals = getStudentRentals(user.id);
  
  // Sort rentals by due date (closest first)
  const sortedRentals = [...studentRentals].sort((a, b) => {
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
  
  // Function to check if a rental is overdue
  const isOverdue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    return today > due;
  };
  
  // Function to calculate days left
  const getDaysLeft = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Dashboard</h1>
        <p className="text-gray-600 mb-8">
          View your current rentals and rental history.
        </p>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-medium text-gray-900">Student Information</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Name</h3>
                <p className="mt-1 text-lg text-gray-900">{user.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="mt-1 text-lg text-gray-900">{user.email}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Student ID</h3>
                <p className="mt-1 text-lg text-gray-900">{user.serialId || 'Not available'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Current Rentals</h3>
                <p className="mt-1 text-lg text-gray-900">{studentRentals.length}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-medium text-gray-900">Current Rentals</h2>
          </div>
          
          {studentRentals.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-600">You don't have any active rentals.</p>
              <a 
                href="/catalog" 
                className="mt-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Browse Catalog
              </a>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {sortedRentals.map((rental) => {
                const daysLeft = getDaysLeft(rental.dueDate);
                const overdueStatus = isOverdue(rental.dueDate);
                
                let statusColor = 'bg-green-100 text-green-800';
                let statusText = `${daysLeft} days left`;
                let statusIcon = <Clock className="h-4 w-4 mr-1" />;
                
                if (overdueStatus) {
                  statusColor = 'bg-red-100 text-red-800';
                  statusText = `Overdue by ${Math.abs(daysLeft)} days`;
                  statusIcon = <AlertTriangle className="h-4 w-4 mr-1" />;
                } else if (daysLeft <= 3) {
                  statusColor = 'bg-yellow-100 text-yellow-800';
                  statusIcon = <AlertTriangle className="h-4 w-4 mr-1" />;
                }
                
                return (
                  <div key={`${rental.product.id}-${rental.serialNumber}`} className="p-6">
                    <div className="md:flex md:justify-between md:items-center">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <img 
                            src={rental.product.imageUrl} 
                            alt={rental.product.name} 
                            className="h-16 w-16 object-cover rounded-md mr-4" 
                          />
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {rental.product.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Serial Number: {rental.serialNumber}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex items-center">
                          <div className={`flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                            {statusIcon}
                            {statusText}
                          </div>
                          <span className="ml-4 text-sm text-gray-500">
                            Issued: {new Date(rental.issuedDate).toLocaleDateString()}
                          </span>
                          <span className="mx-2 text-gray-300">|</span>
                          <span className="text-sm text-gray-500">
                            Due: {new Date(rental.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;