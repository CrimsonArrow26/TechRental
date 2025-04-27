import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { CategoryWithSubcategories } from '../../lib/types';

interface CategoryTreeProps {
  category: CategoryWithSubcategories;
  level?: number;
  onSelect: (categoryId: string) => void;
  selectedId: string | null;
  expandedIds: Set<string>;
  onToggle: (categoryId: string) => void;
}

const CategoryTree: React.FC<CategoryTreeProps> = ({
  category,
  level = 0,
  onSelect,
  selectedId,
  expandedIds,
  onToggle,
}) => {
  const isExpanded = expandedIds.has(category.id);
  const isSelected = selectedId === category.id;
  
  return (
    <div className="w-full">
      <button
        onClick={() => {
          onToggle(category.id);
          onSelect(category.id);
        }}
        className={`w-full text-left px-4 py-2 flex items-center hover:bg-gray-50 ${
          isSelected ? 'bg-primary-50' : ''
        }`}
        style={{ paddingLeft: `${(level + 1) * 1}rem` }}
      >
        {category.subcategories?.length > 0 && (
          <span className="mr-2">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )}
          </span>
        )}
        <span className={`${isSelected ? 'text-primary-600 font-medium' : 'text-gray-700'}`}>
          {category.name}
        </span>
        {category.items?.length > 0 && (
          <span className="ml-auto text-xs text-gray-500">
            {category.items.length} items
          </span>
        )}
      </button>
      
      {isExpanded && category.subcategories?.map(subcategory => (
        <CategoryTree
          key={subcategory.id}
          category={subcategory}
          level={level + 1}
          onSelect={onSelect}
          selectedId={selectedId}
          expandedIds={expandedIds}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
};

export default CategoryTree;