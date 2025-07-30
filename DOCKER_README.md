# Docker Setup for Inventory Management System

This project includes a complete Docker setup for running the Inventory Management System with Node.js backend and MongoDB database.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (usually included with Docker Desktop)

## Quick Start

1. **Clone the repository and navigate to the project directory:**
   ```bash
   cd fiMoney
   ```

2. **Start all services:**
   ```bash
   docker-compose up -d
   ```

3. **Check if services are running:**
   ```bash
   docker-compose ps
   ```

4. **View logs:**
   ```bash
   # All services
   docker-compose logs -f
   
   # Specific service
   docker-compose logs -f backend
   docker-compose logs -f mongodb
   ```

## Services

### 1. Backend API (Node.js/Express)
- **URL:** http://localhost:8080
- **Health Check:** http://localhost:8080/health
- **Container:** inventory-backend

### 2. MongoDB Database
- **Port:** 27017
- **Database:** inventory_db
- **Username:** admin
- **Password:** password123
- **Container:** inventory-mongodb

### 3. MongoDB Express (Admin Interface)
- **URL:** http://localhost:8081
- **Username:** admin
- **Password:** password123
- **Container:** inventory-mongo-express

## API Endpoints

Once the services are running, you can test the API:

### Register User
```bash
curl -X POST http://localhost:8080/register \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password123"}'
```

### Login
```bash
curl -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password123"}'
```

### Add Product (use token from login)
```bash
curl -X POST http://localhost:8080/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "iPhone 15",
    "type": "Electronics", 
    "sku": "IPH-001",
    "quantity": 10,
    "price": 999.99
  }'
```

### Get Products
```bash
curl -X GET http://localhost:8080/products \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Docker Commands

### Start Services
```bash
# Start in background
docker-compose up -d

# Start with logs
docker-compose up
```

### Stop Services
```bash
# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes
docker-compose down -v
```

### Rebuild Services
```bash
# Rebuild backend
docker-compose build backend

# Rebuild all services
docker-compose build
```

### View Logs
```bash
# All services
docker-compose logs

# Follow logs
docker-compose logs -f

# Specific service
docker-compose logs backend
```

### Access Containers
```bash
# Access backend container
docker-compose exec backend sh

# Access MongoDB container
docker-compose exec mongodb mongosh -u admin -p password123
```

## Environment Variables

The following environment variables are configured in `docker-compose.yml`:

### Backend
- `NODE_ENV`: development
- `PORT`: 8080
- `MONGODB_URI`: mongodb://admin:password123@mongodb:27017/inventory_db?authSource=admin
- `JWT_SECRET`: your-super-secret-jwt-key-change-in-production

### MongoDB
- `MONGO_INITDB_ROOT_USERNAME`: admin
- `MONGO_INITDB_ROOT_PASSWORD`: password123
- `MONGO_INITDB_DATABASE`: inventory_db

## Data Persistence

- MongoDB data is persisted in a Docker volume named `mongodb_data`
- The volume is automatically created and managed by Docker

## Development

### Hot Reload
The backend service is configured with volume mounting for hot reload during development. Any changes to the code will automatically restart the application.

### Adding Dependencies
If you add new npm packages to `package.json`, rebuild the backend container:

```bash
docker-compose build backend
docker-compose up -d
```

## Troubleshooting

### Port Conflicts
If you get port conflicts, you can modify the ports in `docker-compose.yml`:

```yaml
ports:
  - "8080:8080"  # Change 8080 to another port
```

### Database Connection Issues
1. Check if MongoDB container is running:
   ```bash
   docker-compose ps mongodb
   ```

2. Check MongoDB logs:
   ```bash
   docker-compose logs mongodb
   ```

3. Restart services:
   ```bash
   docker-compose restart
   ```

### Backend Issues
1. Check backend logs:
   ```bash
   docker-compose logs backend
   ```

2. Rebuild backend:
   ```bash
   docker-compose build backend
   docker-compose up -d
   ```

## Production Considerations

For production deployment:

1. **Change default passwords** in `docker-compose.yml`
2. **Use environment files** for sensitive data
3. **Enable SSL/TLS** for database connections
4. **Set up proper logging** and monitoring
5. **Configure backup strategies** for MongoDB data
6. **Use production-grade MongoDB** (MongoDB Atlas, etc.)

## Clean Up

To completely remove all containers, volumes, and networks:

```bash
docker-compose down -v --remove-orphans
docker system prune -a
```

## Security Notes

- Default passwords are used for development only
- Change all passwords for production use
- Consider using Docker secrets for sensitive data
- Enable MongoDB authentication in production
- Use proper network segmentation 