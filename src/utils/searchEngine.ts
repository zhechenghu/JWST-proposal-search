import Fuse from 'fuse.js';
import matter from 'gray-matter';

export interface SearchableDocument {
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
}

// Load markdown files from /src/data with Vite HMR support
const files = import.meta.glob('/src/data/*.md', { as: 'raw', eager: true }) as Record<string, string>;
const markdownFiles = Object.entries(files).map(([path, content]) => ({
  filename: path.split('/').pop()!,
  content
}));

export class SearchEngine {
  private documents: SearchableDocument[] = [];
  private fuse: Fuse<SearchableDocument>;

  constructor() {
    this.initializeDocuments();

    // Configure Fuse.js for improved recall and robust field weighting
    const options = {
      keys: [
        { name: 'metadata.id', weight: 1.0 },
        { name: 'metadata.program_title', weight: 0.9 },
        { name: 'content', weight: 0.7 },
        { name: 'metadata.pi_and_co_pis', weight: 0.5 },
        { name: 'metadata.instrument_mode', weight: 0.6 },
        { name: 'metadata.type', weight: 0.4 },
        { name: 'metadata.cycle', weight: 0.3 }
      ],
      threshold: 0.15,
      includeMatches: true,
      includeScore: true,
      minMatchCharLength: 2,
      ignoreLocation: true,
      ignoreFieldNorm: true,
      findAllMatches: true
    };

    this.fuse = new Fuse(this.documents, options);
  }

  private initializeDocuments() {
    this.documents = markdownFiles.map(file => {
      const parsed = matter(file.content);
      return {
        id: file.filename,
        title: parsed.data.program_title || 'Untitled',
        content: parsed.content,
        metadata: parsed.data as any
      };
    });
  }

  search(query: string): SearchableDocument[] {
    if (!query.trim()) {
      return [];
    }

    const results = this.fuse.search(query);
    return results.map(result => ({
      ...result.item,
      matches: result.matches
    }));
  }

  getAllDocuments(): SearchableDocument[] {
    return this.documents;
  }

  getMetadata() {
    return this.documents.map(doc => doc.metadata);
  }
}