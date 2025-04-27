import React, { useState } from 'react';
import { Package, Users, Search } from 'lucide-react';
import ActiveRentals from '../components/admin/ActiveRentals';
import StudentManagement from '../components/admin/StudentManagement';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rentals' | 'students'>('rentals');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">
              Manage rentals and monitor student activities
            </p>
          </div>
          
          {/* Tab Navigation */}
          <div className="mt-4 md:mt-0">
            <div className="inline-flex rounded-md shadow-sm">
              <button
                onClick={() => setActiveTab('rentals')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'rentals'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } border border-gray-300 rounded-l-md`}
              >
                <Package className="h-4 w-4 inline mr-1" />
                Active Rentals
              </button>
              <button
                onClick={() => setActiveTab('students')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'students'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } border border-gray-300 rounded-r-md`}
              >
                <Users className="h-4 w-4 inline mr-1" />
                Students
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        {activeTab === 'students' && (
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Search students by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Content */}
        {activeTab === 'rentals' ? (
          <ActiveRentals />
        ) : (
          <StudentManagement searchQuery={searchQuery} />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;