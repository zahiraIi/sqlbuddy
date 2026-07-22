import { MCPServer } from './mcp/server';
import { DatabaseConnection } from './db/connection';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  try {
    // Initialize database connection
    const db = new DatabaseConnection({
      host: process.env.MSSQL_HOST || 'localhost',
      port: parseInt(process.env.MSSQL_PORT || '1433'),
      username: process.env.MSSQL_USER || 'sa',
      password: process.env.MSSQL_PASSWORD || '',
      database: process.env.MSSQL_DATABASE || 'master',
    });

    await db.connect();
    console.log('✅ Database connected');

    // Initialize MCP server
    const mcpServer = new MCPServer(db);
    await mcpServer.start();
    console.log('✅ MCP Server started');

  } catch (error) {
    console.error('❌ Failed to start SQLBuddy:', error);
    process.exit(1);
  }
}

main();