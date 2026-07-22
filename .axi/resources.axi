// SQLBuddy MCP Resource Definitions
// Format: .axi (AI Executable Interface)

resource schema-metadata {
  uri: "sqlbuddy://schema/metadata"
  mimeType: "application/json"
  name: "Database Schema Metadata"
  description: "Complete metadata about all tables, columns, and relationships in the database"
  
  schema {
    type: array
    items {
      type: object
      properties {
        fullName: {
          type: string
          description: "Fully qualified table name (schema.table)"
        }
        schema: {
          type: string
          description: "Schema name"
        }
        name: {
          type: string
          description: "Table name"
        }
        description: {
          type: string
          description: "Human-readable description of the table"
        }
        columns: {
          type: array
          items {
            type: object
            properties {
              name: { type: string }
              type: { type: string }
              nullable: { type: boolean }
              default: { type: string }
              description: { type: string }
            }
          }
        }
        primaryKeys: {
          type: array
          items: { type: string }
          description: "Primary key column names"
        }
        foreignKeys: {
          type: array
          items {
            type: object
            properties {
              column: { type: string }
              referencedTable: { type: string }
              referencedColumn: { type: string }
            }
          }
          description: "Foreign key relationships"
        }
      }
    }
  }
}

resource tables-list {
  uri: "sqlbuddy://schema/tables"
  mimeType: "application/json"
  name: "List of All Tables"
  description: "Quick reference list of all available tables with column counts"
  
  schema {
    type: array
    items {
      type: object
      properties {
        name: {
          type: string
          description: "Table name"
        }
        schema: {
          type: string
          description: "Schema name"
        }
        columnCount: {
          type: number
          description: "Number of columns in the table"
        }
      }
    }
  }
}