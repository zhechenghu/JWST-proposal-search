import { useMemo, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { SearchEngine, SearchableDocument } from './utils/searchEngine';
import { SearchBar } from './components/SearchBar';
import { SearchResults } from './components/SearchResults';
import { MetadataTable } from './components/MetadataTable';
import { ProposalPage } from './components/ProposalPage';
import { Telescope, Database, Search as SearchIcon, Github, ListChecks } from 'lucide-react';
import { ListCrossMatch } from './components/ListCrossMatch.tsx';
import { ThemeToggle } from './components/ThemeToggle';

// moved into component to ensure HMR re-instantiates

function HomePage() {
  const [searchResults, setSearchResults] = useState<SearchableDocument[]>([]);
  const [currentQuery, setCurrentQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'search' | 'metadata' | 'crossmatch'>('search');

  const searchEngine = useMemo(() => new SearchEngine(), []);

  const handleSearch = (query: string) => {
    setCurrentQuery(query);
    if (query.trim()) {
      const results = searchEngine.search(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const metadataItems = searchEngine.getMetadata();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                <Telescope className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  JWST Proposals Database
                </h1>
                <p className="text-sm text-gray-600 mt-1 dark:text-gray-300">
                  Search through the abstract, observation tables and descriptions of approved JWST proposals
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <a
                href="https://github.com/zhechenghu/JWST-proposal-search"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 shadow-sm transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
                aria-label="View on GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8 flex justify-center">
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('search')}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'search' ? 'bg-blue-600 text-white shadow' : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700'
                }`}
            >
              <SearchIcon className="h-4 w-4 mr-2" />
              Single Search
            </button>
            <button
              onClick={() => setActiveTab('crossmatch')}
              className={`ml-1 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'crossmatch' ? 'bg-blue-600 text-white shadow' : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700'
                }`}
            >
              <ListChecks className="h-4 w-4 mr-2" />
              List Cross Match
            </button>
            <button
              onClick={() => setActiveTab('metadata')}
              className={`ml-1 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'metadata' ? 'bg-blue-600 text-white shadow' : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700'
                }`}
            >
              <Database className="h-4 w-4 mr-2" />
              Metadata
            </button>
          </div>
        </div>

        {activeTab === 'search' && (
          <section className="mb-12">
            <div className="mb-8">
              <SearchBar onSearch={handleSearch} />
            </div>
            <SearchResults results={searchResults} query={currentQuery} />
          </section>
        )}

        {activeTab === 'crossmatch' && (
          <section className="mt-16">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <ListChecks className="h-8 w-8 text-blue-600" />
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  List Cross Match
                </h2>
              </div>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto dark:text-gray-300">
                Enter a comma-separated list of terms, e.g., list of source names.
                Each term will be searched in three ways: fuzzy, contains, and whole-word exact matching.
                Matched proposal IDs will be listed.
              </p>
            </div>
            <ListCrossMatch searchEngine={searchEngine} />
          </section>
        )}

        {activeTab === 'metadata' && (
          <section className="mt-16">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <Database className="h-8 w-8 text-blue-600" />
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Proposal Metadata
                </h2>
              </div>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto dark:text-gray-300">
                Browse and filter research proposals by their metadata. Each column can be filtered independently.
              </p>
            </div>
            <MetadataTable data={metadataItems} />
          </section>
        )}



        {/* Statistics */}
        <section className="mt-16 bg-white rounded-xl shadow-sm border border-gray-200 p-8 dark:bg-gray-800 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2 dark:text-blue-400">
                {metadataItems.length}
              </div>
              <div className="text-sm text-gray-600 uppercase tracking-wide dark:text-gray-300">
                Total Proposals
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2 dark:text-green-400">
                4
              </div>
              <div className="text-sm text-gray-600 uppercase tracking-wide dark:text-gray-300">
                Observation Cycles
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2 dark:text-purple-400">
                2025-09-14
              </div>
              <div className="text-sm text-gray-600 uppercase tracking-wide dark:text-gray-300">
                Last Update
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-white shadow-sm border-t border-gray-200 dark:bg-gray-900 dark:border-gray-800 dark:text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <SearchIcon className="h-5 w-5" />
              <span className="text-sm">
                Powered by Fuse.js
              </span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Zhecheng Hu © 2025
              <br />
              For educational and research purposes. Not affiliated with NASA, ESA, or the JWST mission.
            </div>
            <div className="text-sm">
              Data from <a href="https://www.stsci.edu/jwst/science-execution/approved-programs" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">STScI</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/proposal/:id" element={<ProposalPage />} />
    </Routes>
  );
}

export default App;