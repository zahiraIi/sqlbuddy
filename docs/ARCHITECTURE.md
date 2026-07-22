# SQLBuddy Architecture

## Overview

SQLBuddy is a Model Context Protocol (MCP) server designed to enable LLMs to intelligently query Microsoft SQL Server databases without requiring manual schema exploration.

## Key Components

### 1. Database Connection Layer (`src/db/connection.ts`)

Manages the connection to Microsoft SQL Server with:
- Connection pooling for performance
- Parameterized queries for security
- Schema metadata retrieval
- Query execution with error handling

**Key Methods:**
- `connect()` - Establish connection pool
- `query(sql, params)` - Execute parameterized queries
- `execute(storedProcedure, params)` - Execute stored procedures
- `getSchemaMetadata()` - Retrieve table/column information

### 2. Schema Analyzer (`src/db/schema-analyzer.ts`)

Analyzes and understands the database structure:
- Extracts table metadata (columns, types, constraints)
- Identifies primary and foreign keys
- Generates human-readable descriptions
- Caches schema information for performance

**Key Methods:**
- `analyzeSchema()` - Get complete schema analysis
- `getPrimaryKeys()` - Extract primary key columns
- `getForeignKeys()` - Extract foreign key relationships

### 3. Query Builder (`src/db/query-builder.ts`)

Generates SQL queries from natural language intent:
- Uses semantic understanding to find relevant tables
- Builds appropriate SQL statements
- Provides confidence scores
- Includes explanations of generated queries

**Key Methods:**
- `generateQuery(intent)` - Generate SQL from natural language
- `findRelevantTables()` - Semantic table matching
- `buildQuery()` - Construct SQL statement

### 4. MCP Server (`src/mcp/server.ts`)

Implements Model Context Protocol with:
- **Tools** - Functions that LLMs can call
- **Resources** - Data sources LLMs can access

**Available Tools:**
1. `get-schema` - Retrieve complete database schema
2. `execute-query` - Run SQL queries
3. `generate-query` - Create queries from intent
4. `semantic-search` - Find relevant tables/columns

**Available Resources:**
1. `schema-metadata` - Full schema information
2. `tables-list` - Quick table reference

## Workflow

### Standard Query Flow

```
User Intent
    ↓
LLM calls generate-query tool
    ↓
Query Builder analyzes intent
    ↓
Schema Analyzer finds relevant tables
    ↓
Query Builder generates SQL
    ↓
LLM executes query with execute-query tool
    ↓
Database Connection runs SQL
    ↓
Results returned to LLM
    ↓
LLM processes results
```

### Semantic Search Flow

```
User Search Query
    ↓
LLM calls semantic-search tool
    ↓
Schema Analyzer matches keywords to tables/columns
    ↓
Relevance scoring
    ↓
Top matches returned to LLM
    ↓
LLM can then call generate-query for next steps
```

## .axi Format

SQLBuddy uses `.axi` (AI Executable Interface) format for defining:
- Tool specifications and schemas
- Resource definitions and access patterns
- Input/output contracts

**Files:**
- `.axi/tools.axi` - Tool definitions
- `.axi/resources.axi` - Resource definitions

## Security Considerations

### 1. Parameterized Queries
All user input is passed through parameterized queries to prevent SQL injection.

### 2. Query Validation
- Generated queries are analyzed before execution
- LLMs should validate queries before running them

### 3. Connection Security
- Uses encrypted connections to SQL Server
- Connection pooling prevents resource exhaustion
- Configurable connection timeouts

## Performance

### Caching Strategy
- Schema metadata is cached after first analysis
- Can be cleared with `clearCache()`
- Reduces database overhead for repeated operations

### Query Optimization
- Connection pooling for better throughput
- Parameterized queries reduce parsing overhead
- Schema indexing for semantic searches

## Extensibility

### Adding New Tools

1. Define the tool in `.axi/tools.axi`
2. Implement the handler in `MCPServer`
3. Add to the `registerTools()` method

Example:
```typescript
this.tools.set('new-tool', {
  name: 'new-tool',
  description: 'Tool description',
  inputSchema: { /* schema */ },
  handler: async (input) => { /* implementation */ }
});
```

### Adding New Resources

1. Define the resource in `.axi/resources.axi`
2. Create the getter function
3. Register in `registerResources()`

## Database Support

Currently supports:
- Microsoft SQL Server 2019+
- SQL Server 2022

Future support planned for:
- Azure SQL Database
- SQL Server on Linux
- Other SQL variants via abstraction layer

## Error Handling

Comprehensive error handling at multiple levels:

1. **Connection errors** - Handled with retry logic
2. **Query errors** - Detailed error messages returned
3. **Schema errors** - Graceful fallbacks
4. **Tool errors** - Wrapped in success/error response

## Monitoring and Logging

- Connection state tracking
- Query execution logging
- Schema analysis timing
- Error aggregation