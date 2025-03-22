import React from 'react';
import { ArrowUpDown } from 'lucide-react';

export interface SortConfig<T> {
  key: keyof T | string;
  direction: 'ascending' | 'descending';
}

interface SortableColumnHeaderProps<T> {
  label: string;
  sortKey: keyof T | string;
  currentSort: SortConfig<T> | null;
  onSort: (key: keyof T | string) => void;
  className?: string;
}

function SortableColumnHeader<T>({
  label,
  sortKey,
  currentSort,
  onSort,
  className = ''
}: SortableColumnHeaderProps<T>) {
  const isSorted = currentSort?.key === sortKey;
  const isAscending = isSorted && currentSort.direction === 'ascending';
  
  return (
    <th
      className={`px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer ${className}`}
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center">
        {label}
        <ArrowUpDown
          size={14}
          className={`ml-1 ${
            isSorted
              ? `text-blue-600 ${!isAscending ? 'rotate-180' : ''}`
              : 'text-gray-400'
          }`}
        />
      </div>
    </th>
  );
}

export default SortableColumnHeader; 