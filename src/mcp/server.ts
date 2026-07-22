import { DatabaseConnection } from '../db/connection';
import { SchemaAnalyzer } from '../db/schema-analyzer';
import { QueryBuilder } from '../db/query-builder';

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, any>;
  handler: (input: any) => Promise<any>;
}

export interface MCPResource {
  uri: string;
  mimeType: string;
  name: string;
  get: () => Promise<string>;
}

export class MCPServer {
  private db: DatabaseConnection;
  private analyzer: SchemaAnalyzer;
  private queryBuilder: QueryBuilder;
  private tools: Map<string, MCPTool> = new Map();
  private resources: Map<string, MCPResource> = new Map();

  constructor(db: DatabaseConnection) {
    this.db = db;
    this.analyzer = new SchemaAnalyzer(db);
    this.queryBuilder = new QueryBuilder(this.analyzer);
    this.registerTools();
    this.registerResources();
  }

  private registerTools(): void {
    // Tool: Get Database Schema
    this.tools.set('get-schema', {
      name: 'get-schema',
      description: 'Retrieve the complete database schema with table and column information',
      inputSchema: {
        type: 'object',
        properties: {},
        required: [],
      },
      handler: async () => this.handleGetSchema(),
    });

    // Tool: Execute Query
    this.tools.set('execute-query', {
      name: 'execute-query',
      description: 'Execute a SQL query against the database',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The SQL query to execute',
          },
        },
        required: ['query'],
      },
      handler: async (input) => this.handleExecuteQuery(input.query),
    });

    // Tool: Generate Query from Intent
    this.tools.set('generate-query', {
      name: 'generate-query',
      description:
        'Generate a SQL query based on natural language intent without requiring full schema knowledge',
      inputSchema: {
        type: 'object',
        properties: {
          intent: {
            type: 'string',
            description: 'Natural language description of what data you want',
          },
        },
        required: ['intent'],
      },
      handler: async (input) => this.handleGenerateQuery(input.intent),
    });

    // Tool: Semantic Search
    this.tools.set('semantic-search', {
      name: 'semantic-search',
      description: 'Search for relevant tables and columns based on semantic meaning',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query or concept',
          },
        },
        required: ['query'],
      },
      handler: async (input) => this.handleSemanticSearch(input.query),
    });
  }

  private registerResources(): void {
    // Resource: Schema Metadata
    this.resources.set('schema-metadata', {
      uri: 'sqlbuddy://schema/metadata',
      mimeType: 'application/json',
      name: 'Database Schema Metadata',
      get: async () => {
        const schema = await this.analyzer.analyzeSchema();
        return JSON.stringify(schema, null, 2);
      },
    });

    // Resource: Table List
    this.resources.set('tables-list', {
      uri: 'sqlbuddy://schema/tables',
      mimeType: 'application/json',
      name: 'List of All Tables',
      get: async () => {
        const schema = await this.analyzer.analyzeSchema();
        return JSON.stringify(
          schema.map((t) => ({
            name: t.name,
            schema: t.schema,
            columnCount: t.columns.length,
          })),
          null,
          2
        );
      },
    });
  }

  private async handleGetSchema(): Promise<any> {
    return {
      success: true,
      schema: await this.analyzer.analyzeSchema(),
    };
  }

  private async handleExecuteQuery(query: string): Promise<any> {
    try {
      const result = await this.db.query(query);
      return {
        success: true,
        rowsAffected: result.rowsAffected[0],
        rows: result.recordset,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Query execution failed',
      };
    }
  }

  private async handleGenerateQuery(intent: string): Promise<any> {
    try {
      await this.queryBuilder.initialize();
      const generated = await this.queryBuilder.generateQuery({ intent });
      return {
        success: true,
        query: generated,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Query generation failed',
      };
    }
  }

  private async handleSemanticSearch(searchQuery: string): Promise<any> {
    try {
      const schema = await this.analyzer.analyzeSchema();
      const keywords = searchQuery.toLowerCase().split(/\s+/);

      const results = schema
        .map((table) => {
          let relevanceScore = 0;

          for (const keyword of keywords) {
            if (table.name.toLowerCase().includes(keyword)) {
              relevanceScore += 10;
            }
            for (const column of table.columns) {
              if (column.name.toLowerCase().includes(keyword)) {
                relevanceScore += 5;
              }
            }
          }

          return { table, relevanceScore };
        })
        .filter((r) => r.relevanceScore > 0)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 10)
        .map((r) => r.table);

      return {
        success: true,
        results,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Search failed',
      };
    }
  }

  async start(): Promise<void> {
    console.log('🚀 MCP Server initialized with:');
    console.log(`  - ${this.tools.size} tools`);
    console.log(`  - ${this.resources.size} resources`);

    // Log available tools
    console.log('\n📋 Available Tools:');
    for (const [name, tool] of this.tools) {
      console.log(`  • ${name}: ${tool.description}`);
    }

    // Log available resources
    console.log('\n📚 Available Resources:');
    for (const [name, resource] of this.resources) {
      console.log(`  • ${resource.uri}: ${resource.name}`);
    }
  }

  getTool(name: string): MCPTool | undefined {
    return this.tools.get(name);
  }

  getResource(uri: string): MCPResource | undefined {
    return this.resources.get(uri);
  }

  listTools(): MCPTool[] {
    return Array.from(this.tools.values());
  }

  listResources(): MCPResource[] {
    return Array.from(this.resources.values());
  }
}