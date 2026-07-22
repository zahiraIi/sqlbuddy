# Getting Started with SQLBuddy

## Prerequisites

- **Node.js**: 18 or higher
- **npm** or **yarn**: Latest version
- **Microsoft SQL Server**: 2019 or higher (local or remote)
- **SQL Server Management Studio** (optional, for database setup)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/zahiraIi/sqlbuddy.git
cd sqlbuddy
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Copy the example environment file and update with your SQL Server details:

```bash
cp .env.example .env
```

Edit `.env` with your SQL Server connection details:

```env
MSSQL_HOST=localhost
MSSQL_PORT=1433
MSSQL_USER=sa
MSSQL_PASSWORD=YourPassword123
MSSQL_DATABASE=master
MSSQL_POOL_MAX=10
MSSQL_POOL_MIN=2
```

### 4. Build the Project

```bash
npm run build
```

### 5. Start the Server

```bash
npm start
```

You should see output like:

```
✅ Database connected
✅ MCP Server started

🚀 MCP Server initialized with:
  - 4 tools
  - 2 resources

📋 Available Tools:
  • get-schema: Retrieve the complete database schema...
  • execute-query: Execute a SQL query against the database
  • generate-query: Generate a SQL query based on natural language intent
  • semantic-search: Search for relevant tables and columns

📚 Available Resources:
  • sqlbuddy://schema/metadata: Database Schema Metadata
  • sqlbuddy://schema/tables: List of All Tables
```

## Quick Start Examples

### Example 1: Retrieve Database Schema

```typescript
// Get complete database structure
const schema = await mcpServer.getTool('get-schema').handler({});

console.log(schema.schema); // Array of table definitions
```

### Example 2: Generate a Query from Intent

```typescript
// Generate SQL from natural language
const queryTool = mcpServer.getTool('generate-query');
const result = await queryTool.handler({
  intent: 'Show me the top 10 customers by total revenue'
});

console.log(result.query.sql); // Generated SQL
console.log(result.query.explanation); // What the query does
```

### Example 3: Execute a Query

```typescript
// Execute SQL and get results
const executeTool = mcpServer.getTool('execute-query');
const results = await executeTool.handler({
  query: 'SELECT TOP 10 * FROM Customers ORDER BY Revenue DESC'
});

console.log(results.rows); // Query results
```

### Example 4: Semantic Search

```typescript
// Find relevant tables and columns
const searchTool = mcpServer.getTool('semantic-search');
const results = await searchTool.handler({
  query: 'customer information and sales'
});

console.log(results.results); // Matching tables
```

## Development

### Running in Development Mode

For live reloading during development:

```bash
npm run dev
```

### Running Tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

## Integration with LLMs

### Using with Claude

SQLBuddy can be integrated with Claude through the MCP protocol:

```json
{
  "tools": [
    {
      "name": "get-schema",
      "description": "Get database schema",
      "input_schema": { "type": "object", "properties": {} }
    },
    // ... other tools
  ]
}
```

### Using with ChatGPT

Through the OpenAI Assistants API with custom tools:

```javascript
const tool = {
  type: "function",
  function: {
    name: "generate-query",
    description: "Generate SQL from natural language",
    parameters: {
      type: "object",
      properties: {
        intent: { type: "string" }
      }
    }
  }
};
```

## Troubleshooting

### Connection Issues

**Error**: `Database connection failed: Connection timeout`

**Solution**: 
- Verify SQL Server is running
- Check host, port, and credentials in `.env`
- Ensure firewall allows connection

### Query Generation Issues

**Error**: `No relevant tables found for the given intent`

**Solution**:
- Try more specific table names in your intent
- Use semantic search first to understand available tables
- Check database schema with `get-schema`

### Performance Issues

**Slow schema analysis**:
- Schema is cached - clear cache only when schema changes
- For large databases, consider limiting analysis scope

## Next Steps

1. **Explore the Examples**: Check `examples/basic-usage.ts` for more use cases
2. **Read the Architecture**: Understand how components interact in `docs/ARCHITECTURE.md`
3. **Integrate with LLM**: Connect SQLBuddy to your favorite language model
4. **Customize Tools**: Add domain-specific tools in `src/mcp/server.ts`

## Documentation

- [Architecture Guide](./ARCHITECTURE.md) - Deep dive into components
- [API Reference](./API_REFERENCE.md) - Detailed tool and resource specs
- [Examples](../examples/) - Code examples for common tasks

## Support

For issues and questions:
- Check existing [GitHub Issues](https://github.com/zahiraIi/sqlbuddy/issues)
- Read the troubleshooting section above
- Open a new issue with details about your problem

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for more details.