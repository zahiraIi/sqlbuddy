import { DatabaseConnection, SchemaMetadata, TableMetadata, ColumnMetadata } from './connection';

export interface TableDescription {
  fullName: string;
  schema: string;
  name: string;
  description: string;
  columns: ColumnDescription[];
  primaryKeys: string[];
  foreignKeys: ForeignKeyInfo[];
}

export interface ColumnDescription {
  name: string;
  type: string;
  nullable: boolean;
  default?: string;
  description: string;
}

export interface ForeignKeyInfo {
  column: string;
  referencedTable: string;
  referencedColumn: string;
}

export class SchemaAnalyzer {
  private db: DatabaseConnection;
  private schemaCache: Map<string, TableDescription[]> = new Map();
  private metadataCache: SchemaMetadata | null = null;

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  async analyzeSchema(): Promise<TableDescription[]> {
    const metadata = await this.db.getSchemaMetadata();

    const tables: TableDescription[] = [];

    for (const table of metadata.tables) {
      const primaryKeys = await this.getPrimaryKeys(table.schema, table.name);
      const foreignKeys = await this.getForeignKeys(table.schema, table.name);

      tables.push({
        fullName: `${table.schema}.${table.name}`,
        schema: table.schema,
        name: table.name,
        description: this.generateTableDescription(table.name, table.columns),
        columns: table.columns.map((col) => ({
          name: col.name,
          type: col.type,
          nullable: col.nullable,
          default: col.default || undefined,
          description: this.generateColumnDescription(col.name, col.type),
        })),
        primaryKeys,
        foreignKeys,
      });
    }

    return tables;
  }

  async getPrimaryKeys(schema: string, table: string): Promise<string[]> {
    const result = await this.db.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = @schema
        AND TABLE_NAME = @table
        AND CONSTRAINT_NAME LIKE 'PK_%'
    `, { schema, table });

    return result.recordset.map((row: any) => row.COLUMN_NAME);
  }

  async getForeignKeys(schema: string, table: string): Promise<ForeignKeyInfo[]> {
    const result = await this.db.query(`
      SELECT 
        KCU.COLUMN_NAME,
        KCU.REFERENCED_TABLE_NAME,
        KCU.REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS RC
      JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE KCU 
        ON RC.CONSTRAINT_NAME = KCU.CONSTRAINT_NAME
      WHERE KCU.TABLE_SCHEMA = @schema
        AND KCU.TABLE_NAME = @table
    `, { schema, table });

    return result.recordset.map((row: any) => ({
      column: row.COLUMN_NAME,
      referencedTable: row.REFERENCED_TABLE_NAME,
      referencedColumn: row.REFERENCED_COLUMN_NAME,
    }));
  }

  private generateTableDescription(tableName: string, columns: ColumnMetadata[]): string {
    const columnNames = columns.map((c) => c.name).join(', ');
    return `Table '${tableName}' with columns: ${columnNames}`;
  }

  private generateColumnDescription(columnName: string, dataType: string): string {
    return `${columnName} of type ${dataType}`;
  }

  clearCache(): void {
    this.schemaCache.clear();
    this.metadataCache = null;
  }
}