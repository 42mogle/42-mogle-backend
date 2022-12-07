import { TypeOrmModuleOptions } from "@nestjs/typeorm";

// todo: set all in .env
export const typeORMConfig : TypeOrmModuleOptions = {
	type: 'postgres',
	host: 'localhost',
	port: 5432,
	username: 'postgres',
	password: 'postgres',
	database: 'beta_test2',
	entities: [
		__dirname + '/../**/*.entity.{js,ts}'
	],
	synchronize: true
}
