up:
	docker compose -f dev.yml --env-file .env.dev up

build:
	docker compose -f dev.yml --env-file .env.dev up --build

down:
	docker compose -f dev.yml down