# SQLBuddy - Microsoft SQL Server MCP

A Model Context Protocol (MCP) server for Microsoft SQL Server that enables LLMs to intelligently query databases without requiring manual table/schema exploration.

## Features

- 🧠 **Intelligent Query Generation**: LLMs generate smart SQL queries without parsing through each database/table
- 🔍 **Semantic Search**: Understand database schemas and traverse data intelligently
- 🚀 **MCP Compatible**: Built using Model Context Protocol standards
- 🔐 **Secure**: Connection pooling and parameterized queries
- 📊 **Schema Intelligence**: Automatic schema analysis and metadata caching

## Architecture

SQLBuddy uses the `.axi` format for defining resources and tools that LLMs can interact with:

- **Tools**: Query execution, schema exploration, semantic search
- **Resources**: Database metadata, schema definitions, query results
- **Capabilities**: Caching, batch operations, transaction support

## Getting Started

### Prerequisites

- Node.js 18+
- Microsoft SQL Server 2019+
- npm or yarn

### Installation

```bash
git clone https://github.com/zahiraIi/sqlbuddy.git
cd sqlbuddy
npm install
```

### Configuration

Create a `.env` file:

```env
MSSQL_HOST=localhost
MSSQL_PORT=1433
MSSQL_USER=sa
MSSQL_PASSWORD=YourPassword123
MSSQL_DATABASE=master
```

### Running the MCP Server

```bash
npm start
```

## Usage

### Example: LLM Query Without Schema Knowledge

```
LLM: "What are the top 5 customers by revenue?"

SQLBuddy:
1. Analyzes database schema
2. Identifies relevant tables and relationships
3. Generates optimized SQL query
4. Returns results with metadata
```

## Project Structure

```
sqlbuddy/
├── src/
│   ├── mcp/
│   │   ├── server.ts           # MCP server setup
│   │   ├── tools.axi           # Tool definitions
│   │   └── resources.axi       # Resource definitions
│   ├── db/
│   │   ├── connection.ts       # SQL Server connection pooling
│   │   ├── schema-analyzer.ts  # Schema metadata extraction
│   │   └── query-builder.ts    # Intelligent query generation
│   ├── semantic/
│   │   ├── embeddings.ts       # Semantic search embeddings
│   │   └── schema-mapper.ts    # Schema to semantic mapping
│   └── index.ts                # Entry point
├── .axi/
│   ├── tools.axi               # MCP tool definitions
│   └── resources.axi           # MCP resource definitions
├── package.json
└── README.md
```

## License

MIT