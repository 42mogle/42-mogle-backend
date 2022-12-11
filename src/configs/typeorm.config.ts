import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import * as dotenv from 'dotenv';
import * as config from 'config';

dotenv.config();
const dbConfig = config.get('db');

export const typeOrmConfig: TypeOrmModuleOptions = {
	type: dbConfig.type,
	host: process.env.DB_HOST || dbConfig.host,
	port: process.env.DB_PORT || dbConfig.port,
	username: process.env.DB_USERNAME || dbConfig.username,
	password: process.env.DB_PASSWORD || dbConfig.password,
	database: process.env.DB_DATABASE_NAME || dbConfig.database,
	entities: [
		__dirname + '/../**/*.entity.{js,ts}'
	],
	synchronize: dbConfig.synchronize
}
