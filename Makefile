.PHONY: frontend-install frontend-dev backend-build backend-test docker-up docker-down clean

frontend-install:
	cd frontend && corepack enable && pnpm install

frontend-dev:
	cd frontend && pnpm dev

backend-build:
	cd nakama && go mod tidy && go build -buildmode=plugin -o backend.so

backend-test:
	cd nakama && go test ./...

docker-up:
	docker compose -f deploy/docker-compose.yml up --build

docker-down:
	docker compose -f deploy/docker-compose.yml down

clean:
	rm -f nakama/backend.so
	rm -rf frontend/node_modules
	rm -rf frontend/dist