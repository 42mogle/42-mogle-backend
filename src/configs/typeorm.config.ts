import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import * as dotenv from 'dotenv';
import * as config from 'config';

dotenv.config();
const dbConfig = config.get('db');

export const typeOrmConfig: TypeOrmModuleOptions = {
	type: dbConfig.type,
	host: process.env.POSTGRES_HOST || dbConfig.host,
	port: process.env.POSTGRES_PORT || dbConfig.port,
	username: process.env.POSTGRES_USER || dbConfig.username,
	password: process.env.POSTGRES_PASSWORD || dbConfig.password,
	database: process.env.POSTGRES_DB || dbConfig.database,
	entities: [
		__dirname + '/../**/*.entity.{js,ts}'
	],
	synchronize: process.env.DB_SYNC || dbConfig.synchronize
}
