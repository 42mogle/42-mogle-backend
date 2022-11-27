import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export const typeORMConfig : TypeOrmModuleOptions = {
	type: 'postgres',
	host: 'localhost',
	port: 5432,
	username: 'postgres',
	password: 'postgres',
	database: 'dbtest2',
	entities: [
		__dirname + '/../**/*.entity.{js,ts}'
	],
	synchronize: true
}
