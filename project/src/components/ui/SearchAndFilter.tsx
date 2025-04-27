import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';

interface SearchAndFilterProps {
  categories: string[];
  onSearch: (query: string) => void;
  onFilterChange: (categories: string[]) => void;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  categories,
  onSearch,
  onFilterChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => {
      const newCategories = prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category];
      
      onFilterChange(newCategories);
      return newCategories;
    });
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    onFilterChange([]);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search input */}
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Search for products..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        
        {/* Filter button */}
        <button
          className={`flex items-center px-4 py-2 border ${
            isFilterOpen ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-300 text-gray-700'
          } rounded-md shadow-sm text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500`}
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <Filter className="h-5 w-5 mr-2" />
          Filters
          {selectedCategories.length > 0 && (
            <span className="ml-2 bg-primary-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {selectedCategories.length}
            </span>
          )}
        </button>
      </div>
      
      {/* Filter dropdown */}
      {isFilterOpen && (
        <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-gray-700">Filter by Category</h3>
            {selectedCategories.length > 0 && (
              <button
                className="text-sm text-primary-600 hover:text-primary-800 flex items-center"
                onClick={clearFilters}
              >
                <X className="h-4 w-4 mr-1" />
                Clear filters
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {categories.map(category => (
              <div key={category} className="flex items-center">
                <input
                  id={`category-${category}`}
                  name="category"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleCategoryToggle(category)}
                />
                <label
                  htmlFor={`category-${category}`}
                  className="ml-2 text-sm text-gray-700"
                >
                  {category}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchAndFilter;