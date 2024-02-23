# COLORS
GREEN := "\033[32m"
YELLOW := "\033[33m"
BLUE := "\033[34m"
NC := "\033[0m"

# COMMANDS
all:
	@echo $(BLUE)🐋 Docker containers are starting... $(NC)
	@docker-compose up --build -d
	@echo $(GREEN)✅ Successfully started! $(NC)
.PHONY: all

dev: stop
	@echo $(BLUE)🚧 Development containers are starting... $(NC)
	@docker-compose -f ./docker-compose.dev.yml up -d --build
.PHONY: dev

down:
	@docker-compose -f ./docker-compose.yml down
.PHONY: down

build:
	@docker-compose -f ./docker-compose.yml build
.PHONY: build

re: down build all
.PHONY: re

logs:
	@docker-compose -f ./docker-compose.yml logs -f
.PHONY: logs

ps:
	@docker-compose -f ./docker-compose.yml ps
.PHONY: ps

restart:
	@docker-compose -f ./docker-compose.yml restart
.PHONY: restart

clean:
	@docker-compose -f ./docker-compose.yml down --rmi all --remove-orphans
.PHONY: clean

fclean:
	@docker-compose -f ./docker-compose.yml down -v --rmi all --remove-orphans
.PHONY: fclean

prune: stop
	@echo $(BLUE)"docker system prune will be executed"$(NC)
	@docker system prune -a -f --volumes
.PHONY: prune

stop:
	@if [ $$(docker ps -q | wc -l) -gt 0 ]; then \
		echo $(BLUE)🛑 Stopping containers... $(NC); \
		docker stop $$(docker ps -q); \
	else \
		echo $(YELLOW)No running containers found. $(NC); \
	fi
.PHONY: stop
