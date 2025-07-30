// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

db = db.getSiblingDB('inventory_db');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["username", "password", "role"],
      properties: {
        username: {
          bsonType: "string",
          description: "must be a string and is required"
        },
        password: {
          bsonType: "string",
          description: "must be a string and is required"
        },
        role: {
          bsonType: "string",
          enum: ["admin", "user"],
          description: "must be either 'admin' or 'user'"
        }
      }
    }
  }
});

db.createCollection('products', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "sku", "quantity", "price"],
      properties: {
        name: {
          bsonType: "string",
          description: "must be a string and is required"
        },
        type: {
          bsonType: "string",
          description: "must be a string"
        },
        sku: {
          bsonType: "string",
          description: "must be a string and is required"
        },
        image_url: {
          bsonType: "string",
          description: "must be a string"
        },
        description: {
          bsonType: "string",
          description: "must be a string"
        },
        quantity: {
          bsonType: "int",
          minimum: 0,
          description: "must be a non-negative integer and is required"
        },
        price: {
          bsonType: "double",
          minimum: 0,
          description: "must be a non-negative number and is required"
        }
      }
    }
  }
});

// Create indexes for better performance
db.users.createIndex({ "username": 1 }, { unique: true });
db.products.createIndex({ "sku": 1 }, { unique: true });
db.products.createIndex({ "name": 1 });
db.products.createIndex({ "type": 1 });

print('MongoDB initialization completed successfully!');
print('Database: inventory_db');
print('Collections created: users, products');
print('Indexes created for better performance'); 