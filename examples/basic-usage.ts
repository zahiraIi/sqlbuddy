/**
 * SQLBuddy Basic Usage Examples
 * Demonstrates how to use SQLBuddy for intelligent database querying
 */

import { DatabaseConnection } from '../src/db/connection';
import { SchemaAnalyzer } from '../src/db/schema-analyzer';
import { QueryBuilder } from '../src/db/query-builder';

async function example1_GetSchema() {
  console.log('\n=== Example 1: Get Database Schema ===\n');

  const db = new DatabaseConnection({
    host: 'localhost',
    port: 1433,
    username: 'sa',
    password: 'YourPassword123',
    database: 'AdventureWorks',
  });

  await db.connect();

  const analyzer = new SchemaAnalyzer(db);
  const schema = await analyzer.analyzeSchema();

  console.log(`Found ${schema.length} tables:`);
  schema.slice(0, 5).forEach((table) => {
    console.log(`\n📊 ${table.fullName}`);
    console.log(`   Columns: ${table.columns.map((c) => c.name).join(', ')}`);
    if (table.primaryKeys.length > 0) {
      console.log(`   Primary Keys: ${table.primaryKeys.join(', ')}`);
    }
  });

  await db.disconnect();
}

async function example2_GenerateQueryFromIntent() {
  console.log('\n=== Example 2: Generate Query from Natural Language ===\n');

  const db = new DatabaseConnection({
    host: 'localhost',
    port: 1433,
    username: 'sa',
    password: 'YourPassword123',
    database: 'AdventureWorks',
  });

  await db.connect();

  const analyzer = new SchemaAnalyzer(db);
  const queryBuilder = new QueryBuilder(analyzer);
  await queryBuilder.initialize();

  // Generate a query from natural language intent
  const generated = await queryBuilder.generateQuery({
    intent: 'Show me the top 10 customers by total order value',
  });

  console.log('Intent: Show me the top 10 customers by total order value');
  console.log(`\nGenerated SQL:\n${generated.sql}`);
  console.log(`\nTables Used: ${generated.tables.join(', ')}`);
  console.log(`Confidence: ${(generated.confidence * 100).toFixed(1)}%`);

  await db.disconnect();
}

async function example3_ExecuteQuerySafely() {
  console.log('\n=== Example 3: Execute Query Safely ===\n');

  const db = new DatabaseConnection({
    host: 'localhost',
    port: 1433,
    username: 'sa',
    password: 'YourPassword123',
    database: 'AdventureWorks',
  });

  await db.connect();

  // Execute a simple query
  const result = await db.query('SELECT TOP 5 * FROM Person.Person');

  console.log(`Retrieved ${result.recordset.length} rows`);
  console.log('Sample data:');
  console.log(result.recordset[0]);

  await db.disconnect();
}

async function example4_SemanticSearch() {
  console.log('\n=== Example 4: Semantic Search ===\n');

  const db = new DatabaseConnection({
    host: 'localhost',
    port: 1433,
    username: 'sa',
    password: 'YourPassword123',
    database: 'AdventureWorks',
  });

  await db.connect();

  const analyzer = new SchemaAnalyzer(db);
  const schema = await analyzer.analyzeSchema();

  // Find tables related to 'customer'
  const customerTables = schema.filter((table) =>
    table.name.toLowerCase().includes('customer')
  );

  console.log('Tables related to "customer":');
  customerTables.forEach((table) => {
    console.log(`\n📊 ${table.fullName}`);
    console.log(
      `   Columns: ${table.columns
        .map((c) => c.name)
        .join(', ')
        .substring(0, 60)}...`
    );
  });

  await db.disconnect();
}

// Run examples
async function main() {
  try {
    await example1_GetSchema();
    await example2_GenerateQueryFromIntent();
    await example3_ExecuteQuerySafely();
    await example4_SemanticSearch();
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

main();