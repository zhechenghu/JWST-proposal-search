import { useMemo, useState, useEffect } from 'react';
import { Routes, Route, useSearchParams } from 'react-router-dom';
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

  const [searchParams, setSearchParams] = useSearchParams();
  const searchEngine = useMemo(() => new SearchEngine(), []);

  // Restore tab from URL and search state from sessionStorage
  useEffect(() => {
    const tabParam = (searchParams.get('tab') as 'search' | 'metadata' | 'crossmatch') || 'search';
    setActiveTab(tabParam);
  }, [searchParams]);

  useEffect(() => {
    const STORAGE_QUERY_KEY = 'search:query';
    const STORAGE_IDS_KEY = 'search:ids';
    try {
      const savedQuery = sessionStorage.getItem(STORAGE_QUERY_KEY) || '';
      const savedIds = sessionStorage.getItem(STORAGE_IDS_KEY);
      setCurrentQuery(savedQuery);
      if (savedIds) {
        const ids: Array<string | number> = JSON.parse(savedIds);
        const idSet = new Set(ids.map(String));
        const docs = searchEngine.getAllDocuments().filter(d => idSet.has(String(d.metadata.id)));
        setSearchResults(docs);
      } else {
        setSearchResults([]);
      }
    } catch (_) {
      setSearchResults([]);
    }
  }, [searchEngine]);

  const handleSearch = (query: string) => {
    setCurrentQuery(query);
    const params = new URLSearchParams(searchParams);
    params.delete('q');
    params.set('tab', 'search');
    setSearchParams(params);

    if (query.trim()) {
      const results = searchEngine.search(query);
      setSearchResults(results);
      try {
        sessionStorage.setItem('search:query', query);
        sessionStorage.setItem('search:ids', JSON.stringify(results.map(r => r.metadata.id)));
      } catch (_) { }
    } else {
      setSearchResults([]);
      try {
        sessionStorage.removeItem('search:query');
        sessionStorage.removeItem('search:ids');
      } catch (_) { }
    }
  };

  const setTab = (tab: 'search' | 'crossmatch' | 'metadata') => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams);
    // Ensure legacy q param is removed when switching tabs
    params.delete('q');
    params.set('tab', tab);
    setSearchParams(params);
  };

  const metadataItems = searchEngine.getMetadata();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-950 dark:to-gray-900">
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
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8 flex justify-center">
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <button
              onClick={() => setTab('search')}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'search' ? 'bg-blue-600 text-white shadow' : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700'
                }`}
            >
              <SearchIcon className="h-4 w-4 mr-2" />
              Single Search
            </button>
            <button
              onClick={() => setTab('crossmatch')}
              className={`ml-1 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'crossmatch' ? 'bg-blue-600 text-white shadow' : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700'
                }`}
            >
              <ListChecks className="h-4 w-4 mr-2" />
              List Cross Match
            </button>
            <button
              onClick={() => setTab('metadata')}
              className={`ml-1 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'metadata' ? 'bg-blue-600 text-white shadow' : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700'
                }`}
            >
              <Database className="h-4 w-4 mr-2" />
              Metadata
            </button>
          </div>
        </div>

        <section className={`${activeTab === 'search' ? '' : 'hidden'} mb-12`}>
          <div className="mb-8">
            <SearchBar onSearch={handleSearch} initialQuery={currentQuery} />
          </div>
          <SearchResults results={searchResults} query={currentQuery} />
        </section>

        <section className={`${activeTab === 'crossmatch' ? '' : 'hidden'} mt-16`}>
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <ListChecks className="h-8 w-8 text-blue-600" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                List Cross Match
              </h2>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto dark:text-gray-300">
              Enter a comma-separated list of terms (e.g., source names).
              Each term is searched in three ways: fuzzy match, substring match, and exact whole-word match.
              All matching proposal IDs will be displayed. The search runs locally in your browser. Processing about 50 terms takes ~12 seconds.
            </p>
          </div>
          <ListCrossMatch searchEngine={searchEngine} />
        </section>

        <section className={`${activeTab === 'metadata' ? '' : 'hidden'} mt-16`}>
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
      <footer className="mt-auto bg-white shadow-sm border-t border-gray-200 dark:bg-gray-900 dark:border-gray-800 dark:text-white">
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