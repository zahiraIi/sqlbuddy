import { SchemaAnalyzer, TableDescription } from './schema-analyzer';

export interface QueryGenerationRequest {
  intent: string;
  context?: Record<string, any>;
}

export interface GeneratedQuery {
  sql: string;
  explanation: string;
  tables: string[];
  confidence: number;
}

export class QueryBuilder {
  private analyzer: SchemaAnalyzer;
  private schemaInfo: TableDescription[] = [];

  constructor(analyzer: SchemaAnalyzer) {
    this.analyzer = analyzer;
  }

  async initialize(): Promise<void> {
    this.schemaInfo = await this.analyzer.analyzeSchema();
  }

  async generateQuery(request: QueryGenerationRequest): Promise<GeneratedQuery> {
    // Semantic search to find relevant tables
    const relevantTables = this.findRelevantTables(request.intent);

    if (relevantTables.length === 0) {
      throw new Error('No relevant tables found for the given intent');
    }

    // Build base query structure
    const query = this.buildQuery(request.intent, relevantTables);

    return {
      sql: query,
      explanation: `Query searches ${relevantTables.map((t) => t.name).join(', ')} tables`,
      tables: relevantTables.map((t) => t.fullName),
      confidence: this.calculateConfidence(relevantTables),
    };
  }

  private findRelevantTables(intent: string): TableDescription[] {
    const keywords = intent.toLowerCase().split(/\s+/);
    const scored: Array<[TableDescription, number]> = [];

    for (const table of this.schemaInfo) {
      let score = 0;

      // Check table name match
      for (const keyword of keywords) {
        if (table.name.toLowerCase().includes(keyword)) {
          score += 10;
        }
      }

      // Check column name matches
      for (const column of table.columns) {
        for (const keyword of keywords) {
          if (column.name.toLowerCase().includes(keyword)) {
            score += 5;
          }
        }
      }

      if (score > 0) {
        scored.push([table, score]);
      }
    }

    // Sort by score and return top matches
    return scored
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([table]) => table);
  }

  private buildQuery(intent: string, tables: TableDescription[]): string {
    const mainTable = tables[0];

    // Simple query builder - can be extended for complex cases
    if (
      intent.toLowerCase().includes('top') ||
      intent.toLowerCase().includes('most') ||
      intent.toLowerCase().includes('highest')
    ) {
      const column = this.findMostRelevantColumn(mainTable, intent);
      return `SELECT TOP 10 * FROM ${mainTable.fullName} ORDER BY ${column} DESC`;
    }

    if (intent.toLowerCase().includes('count') || intent.toLowerCase().includes('how many')) {
      return `SELECT COUNT(*) as count FROM ${mainTable.fullName}`;
    }

    // Default: SELECT all
    return `SELECT TOP 100 * FROM ${mainTable.fullName}`;
  }

  private findMostRelevantColumn(table: TableDescription, intent: string): string {
    const keywords = intent.toLowerCase().split(/\s+/);
    let bestMatch = table.columns[0].name;
    let bestScore = 0;

    for (const column of table.columns) {
      let score = 0;
      for (const keyword of keywords) {
        if (column.name.toLowerCase().includes(keyword)) {
          score += 10;
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = column.name;
      }
    }

    return bestMatch;
  }

  private calculateConfidence(tables: TableDescription[]): number {
    // Confidence based on number of matching tables
    // More matches = higher confidence
    return Math.min(0.5 + tables.length * 0.1, 0.95);
  }
}