import { useMemo } from 'react';
import { useParams, Link, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Clock, Settings, FileText } from 'lucide-react';
import { SearchEngine } from '../utils/searchEngine';
import { marked } from 'marked';
import { ThemeToggle } from './ThemeToggle';

// Configure marked options for better rendering
marked.setOptions({
  breaks: true,
  gfm: true,
});

// instantiate within component with useMemo for HMR friendliness

export function ProposalPage() {
  const { id } = useParams<{ id: string }>();
  const searchEngine = useMemo(() => new SearchEngine(), []);
  const location = useLocation();
  const [sp] = useSearchParams();
  const origin = ((location.state as any)?.origin || sp.get('origin') || '') as string;

  const document = searchEngine.getAllDocuments().find(doc =>
    doc.metadata.id.toString() === id
  );

  if (!document) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Proposal Not Found</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">The requested proposal could not be found.</p>
          <Link
            to={origin === 'crossmatch' ? `/?tab=crossmatch` : `/?tab=search`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Results
          </Link>
        </div>
      </div>
    );
  }

  const htmlContent = marked.parse(document.content);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start justify-between mb-4">
            <Link
              to={origin === 'crossmatch' ? `/?tab=crossmatch` : `/?tab=search`}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Results
            </Link>
            <ThemeToggle />
          </div>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {document.metadata.program_title}
              </h1>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${document.metadata.type === 'GO' ? 'bg-blue-100 text-blue-800' :
                  document.metadata.type === 'GTO' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                  {document.metadata.type}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ID: {document.metadata.id}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metadata Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8 dark:bg-gray-800 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Proposal Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-300">Cycle:</span>
              <span className="font-medium">{document.metadata.cycle}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-300">Access Period:</span>
              <span className="font-medium">{document.metadata.exclusive_access_period_months} months</span>
            </div>
            <div className="flex items-center space-x-2">
              <Settings className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-300">Instrument:</span>
              <span className="font-medium">{document.metadata.instrument_mode}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-300">Time:</span>
              <span className="font-medium">{document.metadata.prime_parallel_time_hours} hours</span>
            </div>
            <div className="flex items-start space-x-2 md:col-span-2">
              <User className="h-4 w-4 text-gray-400 mt-0.5" />
              <span className="text-gray-600 dark:text-gray-300">Investigators:</span>
              <span className="font-medium">{document.metadata.pi_and_co_pis}</span>
            </div>
          </div>
        </div>

        {/* Document Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 dark:bg-gray-800 dark:border-gray-700">
          <div
            className="markdown max-w-none"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>
      </main>
    </div>
  );
}