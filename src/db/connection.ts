import * as sql from 'mssql';

export interface ConnectionConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export class DatabaseConnection {
  private pool: sql.ConnectionPool | null = null;
  private config: sql.config;

  constructor(config: ConnectionConfig) {
    this.config = {
      server: config.host,
      port: config.port,
      user: config.username,
      password: config.password,
      database: config.database,
      authentication: {
        type: 'default',
      },
      options: {
        encrypt: true,
        trustServerCertificate: true,
        connectionTimeout: 30000,
        requestTimeout: 30000,
      },
      pool: {
        max: 10,
        min: 2,
        idleTimeoutMillis: 30000,
      },
    };
  }

  async connect(): Promise<void> {
    try {
      this.pool = new sql.ConnectionPool(this.config);
      await this.pool.connect();
    } catch (error) {
      throw new Error(`Database connection failed: ${error}`);
    }
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.close();
      this.pool = null;
    }
  }

  async query(sqlQuery: string, params?: Record<string, any>): Promise<sql.IResult<any>> {
    if (!this.pool) {
      throw new Error('Database not connected');
    }

    const request = this.pool.request();

    // Add parameters if provided
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        request.input(key, value);
      }
    }

    return request.query(sqlQuery);
  }

  async execute(
    storedProcedure: string,
    params?: Record<string, any>
  ): Promise<sql.IResult<any>> {
    if (!this.pool) {
      throw new Error('Database not connected');
    }

    const request = this.pool.request();

    // Add parameters if provided
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        request.input(key, value);
      }
    }

    return request.execute(storedProcedure);
  }

  async getSchemaMetadata(): Promise<SchemaMetadata> {
    const result = await this.query(`
      SELECT 
        TABLE_SCHEMA as schema_name,
        TABLE_NAME as table_name
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_SCHEMA, TABLE_NAME
    `);

    const tables: TableMetadata[] = [];

    for (const row of result.recordset) {
      const columnsResult = await this.query(`
        SELECT 
          COLUMN_NAME as column_name,
          DATA_TYPE as data_type,
          IS_NULLABLE as is_nullable,
          COLUMN_DEFAULT as default_value
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = @schema
          AND TABLE_NAME = @table
      `, {
        schema: row.schema_name,
        table: row.table_name,
      });

      tables.push({
        schema: row.schema_name,
        name: row.table_name,
        columns: columnsResult.recordset.map((col: any) => ({
          name: col.column_name,
          type: col.data_type,
          nullable: col.is_nullable === 'YES',
          default: col.default_value,
        })),
      });
    }

    return { tables };
  }

  isConnected(): boolean {
    return this.pool !== null && !this.pool.closed;
  }
}

export interface ColumnMetadata {
  name: string;
  type: string;
  nullable: boolean;
  default: string | null;
}

export interface TableMetadata {
  schema: string;
  name: string;
  columns: ColumnMetadata[];
}

export interface SchemaMetadata {
  tables: TableMetadata[];
}