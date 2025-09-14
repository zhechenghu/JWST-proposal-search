
import { Link } from 'react-router-dom';
import { FileText, Calendar, User, Clock, Settings } from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  content: string;
  metadata: {
    id: number;
    proposal_type: string;
    cycle: string;
    exclusive_access_period_months: number;
    instrument_mode: string;
    pi_and_co_pis: string;
    prime_parallel_time_hours: string;
    program_title: string;
    type: string;
  };
  matches?: any[];
}

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
}

export function SearchResults({ results, query }: SearchResultsProps) {
  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  const getSnippet = (content: string, query: string) => {
    if (!query) return content.slice(0, 200) + '...';

    const lowerContent = content.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerContent.indexOf(lowerQuery);

    if (index === -1) return content.slice(0, 200) + '...';

    const start = Math.max(0, index - 100);
    const end = Math.min(content.length, index + query.length + 100);

    return '...' + content.slice(start, end) + '...';
  };

  if (!query) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg">Enter a search term to find relevant documents</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg">No documents found for "{query}"</p>
        <p className="text-sm mt-2">Try adjusting your search terms</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          Search Results ({results.length})
        </h2>
        <span className="text-sm text-gray-600 dark:text-gray-500 text-center">
          Found {results.length} documents matching "{query}"
          <br />
          Note: No highlight means no exact match - check proposals carefully
        </span>
      </div>

      {results.map((result) => (
        <div
          key={result.id}
          className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200 dark:bg-gray-800 dark:border-gray-700"
        >
          <div className="flex items-start justify-between mb-3">
            <Link
              to={`/proposal/${result.metadata.id}`}
              className="text-lg font-semibold text-gray-900 dark:text-white flex-1 hover:text-blue-600 transition-colors"
            >
              {highlightText(result.metadata.program_title, query)}
            </Link>
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 ml-4">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                {result.metadata.type}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-300 mb-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>{result.metadata.cycle}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>{result.metadata.exclusive_access_period_months} months</span>
            </div>
            <div className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>{result.metadata.instrument_mode}</span>
            </div>
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span className="truncate">{result.metadata.pi_and_co_pis.split(' ')[1]}</span>
            </div>
          </div>

          <div className="text-gray-700 dark:text-gray-200 leading-relaxed">
            {highlightText(getSnippet(result.content, query), query)}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
            <Link
              to={`/proposal/${result.metadata.id}`}
              className="text-blue-600 hover:text-blue-700 transition-colors"
            >
              More Information →
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}