// SQLBuddy MCP Tool Definitions
// Format: .axi (AI Executable Interface)

tool get-schema {
  name: "get-schema"
  description: "Retrieve the complete database schema with table and column information"
  
  input {
    type: object
    properties {}
    required: []
  }
  
  output {
    type: object
    properties {
      success: { type: boolean }
      schema: {
        type: array
        items: {
          type: object
          properties {
            fullName: { type: string }
            schema: { type: string }
            name: { type: string }
            description: { type: string }
            columns: {
              type: array
              items: {
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
            primaryKeys: { type: array, items: { type: string } }
            foreignKeys: {
              type: array
              items: {
                type: object
                properties {
                  column: { type: string }
                  referencedTable: { type: string }
                  referencedColumn: { type: string }
                }
              }
            }
          }
        }
      }
    }
  }
}

tool execute-query {
  name: "execute-query"
  description: "Execute a SQL query against the database. Use with caution - ensure queries are safe and optimized."
  
  input {
    type: object
    properties {
      query: {
        type: string
        description: "The SQL query to execute"
      }
    }
    required: ["query"]
  }
  
  output {
    type: object
    properties {
      success: { type: boolean }
      rowsAffected: { type: number }
      error: { type: string }
      rows: {
        type: array
        items: { type: object }
      }
    }
  }
}

tool generate-query {
  name: "generate-query"
  description: "Generate a SQL query based on natural language intent. The system will analyze your request, find relevant tables, and generate an optimized query without requiring you to know the schema."
  
  input {
    type: object
    properties {
      intent: {
        type: string
        description: "Natural language description of what data you want (e.g., 'Show me the top 10 customers by revenue', 'Count total orders last month')"
      }
    }
    required: ["intent"]
  }
  
  output {
    type: object
    properties {
      success: { type: boolean }
      query: {
        type: object
        properties {
          sql: {
            type: string
            description: "The generated SQL query"
          }
          explanation: {
            type: string
            description: "Human-readable explanation of what the query does"
          }
          tables: {
            type: array
            items: { type: string }
            description: "List of tables used in the query"
          }
          confidence: {
            type: number
            description: "Confidence score (0-1) of query accuracy"
          }
        }
      }
      error: { type: string }
    }
  }
}

tool semantic-search {
  name: "semantic-search"
  description: "Search for relevant tables and columns based on semantic meaning. Useful for understanding the database structure without manual exploration."
  
  input {
    type: object
    properties {
      query: {
        type: string
        description: "Search query or concept (e.g., 'customer information', 'sales transactions', 'user accounts')"
      }
    }
    required: ["query"]
  }
  
  output {
    type: object
    properties {
      success: { type: boolean }
      results: {
        type: array
        items: {
          type: object
          properties {
            name: { type: string }
            schema: { type: string }
            columns: {
              type: array
              items: {
                type: object
                properties {
                  name: { type: string }
                  type: { type: string }
                }
              }
            }
          }
        }
      }
      error: { type: string }
    }
  }
}