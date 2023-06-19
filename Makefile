NAME = 42mogle-backend

DC = docker compose
DC_FILE = ./compose.yaml

all: $(NAME)

$(NAME):
	$(DC) -f $(DC_FILE) up -d

down:
	$(DC) -f $(DC_FILE) down

re:
	$(DC) -f $(DC_FILE) down
	$(DC) -f $(DC_FILE) build
	$(DC) -f $(DC_FILE) up -d

build:
	$(DC) -f $(DC_FILE) build

logs:
	$(DC) -f $(DC_FILE) logs -f

ps:
	$(DC) -f $(DC_FILE) ps

restart:
	$(DC) -f $(DC_FILE) restart

clean:
	$(DC) -f $(DC_FILE) down --rmi all --remove-orphans

fclean:
	$(DC) -f $(DC_FILE) down -v --rmi all --remove-orphans

.PHONY: all down re logs ps restart clean fclean
