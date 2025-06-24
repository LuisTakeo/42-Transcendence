# Start containers
up:
	docker-compose up -d

# Stop containers
down:
	docker-compose down

# Rebuild and start containers
build:
	docker-compose up -d --build

# Restart containers
restart:
	docker-compose restart

# Show logs
logs:
	docker-compose logs -f

# Clean unused containers, images and volumes
clean:
	docker-compose down -v
	docker system prune -f

# Start in development mode
dev:
	FRONT_PORT=3043 BACK_PORT=3143 docker-compose up -d --build

# Start in production mode
prod:
	FRONT_PORT=3042 BACK_PORT=3142 docker-compose up -d --build


# Frontend logs
frontend-logs:
	docker-compose logs -f frontend

# Restart frontend
frontend-restart:
	docker-compose restart frontend


# Backend logs
backend-logs:
	docker-compose logs -f backend

# Restart backend
backend-restart:
	docker-compose restart backend

# Main commands
.PHONY: up down build restart logs clean dev prod
# Frontend specific commands
.PHONY: frontend-logs frontend-restart
# Backend specific commands
.PHONY: backend-logs backend-restart