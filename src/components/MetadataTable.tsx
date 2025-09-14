import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Filter, X, Search } from 'lucide-react';

interface MetadataItem {
  id: number;
  proposal_type: string;
  cycle: string;
  exclusive_access_period_months: number;
  instrument_mode: string;
  pi_and_co_pis: string;
  prime_parallel_time_hours: string;
  program_title: string;
  type: string;
}

interface MetadataTableProps {
  data: MetadataItem[];
}

export function MetadataTable({ data }: MetadataTableProps) {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 50;

  const columns = [
    { key: 'id', label: 'ID', type: 'number' },
    { key: 'program_title', label: 'Program Title', type: 'text' },
    { key: 'type', label: 'Type', type: 'select' },
    { key: 'cycle', label: 'Cycle', type: 'select' },
    { key: 'instrument_mode', label: 'Instrument Mode', type: 'text' },
    { key: 'exclusive_access_period_months', label: 'Access Period (Months)', type: 'number' },
    { key: 'pi_and_co_pis', label: 'PI & Co-PIs', type: 'text' },
    { key: 'prime_parallel_time_hours', label: 'Time (Hours)', type: 'text' }
  ];

  const filteredData = useMemo(() => {
    return data.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        const itemValue = String(item[key as keyof MetadataItem]).toLowerCase();
        return itemValue.includes(value.toLowerCase());
      });
    });
  }, [data, filters]);

  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof MetadataItem];
      const bValue = b[sortConfig.key as keyof MetadataItem];

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      if (sortConfig.direction === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  }, [filteredData, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / ITEMS_PER_PAGE));
  const page = Math.min(currentPage, totalPages);
  const paginatedData = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return sortedData.slice(start, end);
  }, [sortedData, page]);
  const startIndex = sortedData.length === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1;
  const endIndex = Math.min(page * ITEMS_PER_PAGE, sortedData.length);

  const handleSort = (key: string) => {
    setCurrentPage(1);
    setSortConfig(current => {
      if (current?.key === key) {
        return {
          key,
          direction: current.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return { key, direction: 'asc' };
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    setCurrentPage(1);
    setFilters(current => ({
      ...current,
      [key]: value
    }));
  };

  const clearFilter = (key: string) => {
    setCurrentPage(1);
    setFilters(current => {
      const newFilters = { ...current };
      delete newFilters[key];
      return newFilters;
    });
  };

  const getUniqueValues = (key: string) => {
    return [...new Set(data.map(item => String(item[key as keyof MetadataItem])))];
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/50">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
          <Filter className="h-5 w-5 mr-2" />
          Metadata Table ({sortedData.length} items)
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          Filter and sort through proposal metadata
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200 dark:bg-gray-900/50 dark:border-gray-700">
            <tr>
              {columns.map(column => (
                <th key={column.key} className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort(column.key)}
                    className="flex items-center space-x-1 text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <span>{column.label}</span>
                    <ChevronDown
                      className={`h-3 w-3 transition-transform ${sortConfig?.key === column.key
                        ? sortConfig.direction === 'desc' ? 'rotate-180' : ''
                        : 'opacity-50'
                        }`}
                    />
                  </button>
                </th>
              ))}
            </tr>
            <tr className="bg-white dark:bg-gray-800">
              {columns.map(column => (
                <th key={`filter-${column.key}`} className="px-4 py-2">
                  <div className="relative">
                    {column.type === 'select' ? (
                      <select
                        value={filters[column.key] || ''}
                        onChange={(e) => handleFilterChange(column.key, e.target.value)}
                        className="w-full text-xs border border-gray-200 rounded px-2 py-1 bg-white dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All</option>
                        {getUniqueValues(column.key).map(value => (
                          <option key={value} value={value}>{value}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Filter..."
                          value={filters[column.key] || ''}
                          onChange={(e) => handleFilterChange(column.key, e.target.value)}
                          className="w-full text-xs border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 rounded pl-6 pr-6 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {filters[column.key] && (
                          <button
                            onClick={() => clearFilter(column.key)}
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedData.map((item, index) => (
              <tr key={item.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-25 dark:bg-gray-900/40'}`}>
                <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-gray-100">{item.id}</td>
                <td className="px-4 py-3 text-sm max-w-xs truncate" title={item.program_title}>
                  <Link
                    to={`/proposal/${item.id}`}
                    className="text-blue-600 hover:text-blue-700 transition-colors font-medium"
                  >
                    {item.program_title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.type === 'GO' ? 'bg-blue-100 text-blue-800' :
                    item.type === 'GTO' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                    {item.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.cycle}</td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate" title={item.instrument_mode}>
                  {item.instrument_mode}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 text-center">{item.exclusive_access_period_months}</td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate" title={item.pi_and_co_pis}>
                  {item.pi_and_co_pis}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.prime_parallel_time_hours}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedData.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/50">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Showing {startIndex}-{endIndex} of {sortedData.length}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-sm rounded border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 text-sm rounded border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {sortedData.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No items match the current filters</p>
        </div>
      )}
    </div>
  );
}