NAME = 42mogle-backend

DC = docker compose
DC_FILE_PROD = ./docker/prod/compose.yaml
DC_FILE_TEST = ./docker/test/compose.yaml

all: $(NAME)

$(NAME):
	$(DC) -f $(DC_FILE_PROD) up -d

down:
	$(DC) -f $(DC_FILE_PROD) down

re:
	$(DC) -f $(DC_FILE_PROD) down
	$(DC) -f $(DC_FILE_PROD) build
	$(DC) -f $(DC_FILE_PROD) up -d

build:
	$(DC) -f $(DC_FILE_PROD) build

logs:
	$(DC) -f $(DC_FILE_PROD) logs -f

ps:
	$(DC) -f $(DC_FILE_PROD) ps

restart:
	$(DC) -f $(DC_FILE_PROD) restart

clean:
	$(DC) -f $(DC_FILE_PROD) down --rmi all --remove-orphans

fclean:
	$(DC) -f $(DC_FILE_PROD) down -v --rmi all --remove-orphans

build-testing:
	$(DC) -f $(DC_FILE_TEST) build

testing:
	$(DC) -f $(DC_FILE_TEST) up --abort-on-container-exit
	$(DC) -f $(DC_FILE_TEST) logs -f &
	wait $!
	$(DC) -f $(DC_FILE_TEST) down

down-testing:
	$(DC) -f $(DC_FILE_TEST) down

.PHONY: all down re logs ps restart clean fclean
