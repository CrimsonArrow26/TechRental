import React, { useState, useEffect } from 'react';
import { useInventory, Product } from '../contexts/InventoryContext';
import ProductCard from '../components/product/ProductCard';
import SearchAndFilter from '../components/ui/SearchAndFilter';

const ProductCatalog: React.FC = () => {
  const { products, categories, isLoading } = useInventory();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    // Filter products based on search query and selected categories
    let filtered = [...products];
    
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) || 
        product.description.toLowerCase().includes(query)
      );
    }
    
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product => 
        selectedCategories.includes(product.category)
      );
    }
    
    setFilteredProducts(filtered);
  }, [products, searchQuery, selectedCategories]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (categories: string[]) => {
    setSelectedCategories(categories);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Electronics Catalog</h1>
        
        <SearchAndFilter 
          categories={categories}
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
        />
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            <div className="mb-6 flex justify-between items-center">
              <p className="text-gray-600">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'} available
              </p>
              {(searchQuery || selectedCategories.length > 0) && (
                <div className="text-sm">
                  {searchQuery && (
                    <span className="mr-2 bg-gray-100 text-gray-700 px-2 py-1 rounded-md">
                      Search: {searchQuery}
                    </span>
                  )}
                  {selectedCategories.map(category => (
                    <span key={category} className="mr-2 bg-primary-100 text-primary-700 px-2 py-1 rounded-md">
                      {category}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600">
                  Try adjusting your search or filter criteria to find what you're looking for.
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductCatalog;