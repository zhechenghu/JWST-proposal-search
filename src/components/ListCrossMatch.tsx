import { useMemo, useState } from 'react';
import { SearchEngine, SearchableDocument } from '../utils/searchEngine';
import { Search, Loader2, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ListCrossMatchProps {
    searchEngine: SearchEngine;
}

interface CrossMatchRow {
    term: string;
    fuzzy: string[]; // proposal ids as strings
    exact: string[]; // proposal ids as strings
    contains: string[]; // proposal ids as strings
}

export function ListCrossMatch({ searchEngine }: ListCrossMatchProps) {
    const [input, setInput] = useState('');
    const [rows, setRows] = useState<CrossMatchRow[]>([]);
    const [isRunning, setIsRunning] = useState(false);

    const allDocuments = useMemo(() => searchEngine.getAllDocuments(), [searchEngine]);

    const runCrossMatch = () => {
        const terms = input
            .split(',')
            .map(t => t.trim())
            .filter(t => t.length > 0);

        if (terms.length === 0) {
            setRows([]);
            return;
        }

        setIsRunning(true);

        // For each term, run a fuzzy search via SearchEngine, a substring contains search, and an exact search
        const computedRows: CrossMatchRow[] = terms.map(term => {
            // Fuzzy via existing engine
            const fuzzyDocs: SearchableDocument[] = searchEngine.search(term);
            const fuzzyIds = Array.from(new Set(fuzzyDocs.map(d => String(d.metadata.id))));

            // Contains: case-insensitive substring check in key fields
            const normalized = term.toLowerCase();
            const containsIds = Array.from(new Set(
                allDocuments
                    .filter(doc => {
                        const idStr = String(doc.metadata.id);
                        const fields = [
                            doc.content || '',
                            (doc.metadata.program_title || ''),
                            (doc.metadata.pi_and_co_pis || ''),
                            (doc.metadata.instrument_mode || '')
                        ].map(s => s.toLowerCase());
                        const contentContains = fields.some(f => f.includes(normalized));
                        const idContains = idStr.includes(term);
                        return contentContains || idContains;
                    })
                    .map(d => String(d.metadata.id))
            ));

            // Exact: look for exact term matches in key fields.
            // We consider exact when term occurs as a whole word in either content or metadata fields.
            const wordBoundary = new RegExp(`(^|[^a-zA-Z0-9_])${escapeRegExp(normalized)}([^a-zA-Z0-9_]|$)`);

            const exactIds = Array.from(new Set(
                allDocuments
                    .filter(doc => {
                        const contentMatch = wordBoundary.test(doc.content.toLowerCase());
                        const titleMatch = wordBoundary.test((doc.metadata.program_title || '').toLowerCase());
                        const piMatch = wordBoundary.test((doc.metadata.pi_and_co_pis || '').toLowerCase());
                        const instrMatch = wordBoundary.test((doc.metadata.instrument_mode || '').toLowerCase());
                        const idMatch = String(doc.metadata.id) === term;
                        return contentMatch || titleMatch || piMatch || instrMatch || idMatch;
                    })
                    .map(d => String(d.metadata.id))
            ));

            return { term, fuzzy: fuzzyIds, contains: containsIds, exact: exactIds };
        });

        setRows(computedRows);
        setIsRunning(false);
    };

    const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const renderIdLinks = (ids: string[]) => {
        if (ids.length === 0) {
            return <span className="text-gray-400">—</span>;
        }
        return ids.map((id, idx) => (
            <span key={`${id}-${idx}`}>
                <Link
                    to={`/proposal/${id}`}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                    {id}
                </Link>
                {idx < ids.length - 1 ? ', ' : ''}
            </span>
        ));
    };

    const downloadCSV = () => {
        if (rows.length === 0) return;
        const toCsvValue = (v: string) => '"' + v.replace(/"/g, '""') + '"';
        const header = ['Terms', 'Fuzzy Search Results', 'Contains Match Results', 'Exact Match Results'];
        const lines: string[] = [header.map(toCsvValue).join(',')];
        rows.forEach(r => {
            const fuzzy = r.fuzzy.join(', ');
            const contains = r.contains.join(', ');
            const exact = r.exact.join(', ');
            lines.push([r.term, fuzzy, contains, exact].map(toCsvValue).join(','));
        });
        const csv = lines.join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cross_match.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Comma-separated terms</label>
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && input.trim() && !isRunning) {
                                runCrossMatch();
                            }
                        }}
                        placeholder="e.g. NGC 1068, M82, 1234"
                        className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200"
                    />
                    <button
                        onClick={runCrossMatch}
                        disabled={!input.trim() || isRunning}
                        className={`inline-flex items-center px-4 py-2 text-white rounded-lg shadow-sm transition-colors duration-200 ${input.trim() && !isRunning ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed dark:bg-gray-700'}`}
                    >
                        {isRunning ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Search className="h-5 w-5 mr-2" />}
                        {isRunning ? 'Cross Matching…' : 'Cross Match'}
                    </button>
                    <button
                        onClick={downloadCSV}
                        disabled={rows.length === 0}
                        className={`inline-flex items-center px-4 py-2 rounded-lg shadow-sm transition-colors duration-200 ${rows.length > 0 ? 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'}`}
                    >
                        <Download className="h-5 w-5 mr-2" />
                        Download CSV
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase dark:text-gray-300">Terms</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase dark:text-gray-300">Fuzzy Search Proposal IDs</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase dark:text-gray-300">Contains Proposal IDs</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase dark:text-gray-300">Exact Match Proposal IDs</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {rows.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                                    Enter terms above and click Cross Match
                                </td>
                            </tr>
                        ) : (
                            rows.map((row) => (
                                <tr key={row.term} className="bg-white dark:bg-gray-800">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{row.term}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">{renderIdLinks(row.fuzzy)}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">{renderIdLinks(row.contains)}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">{renderIdLinks(row.exact)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}


