import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import * as dotenv from 'dotenv';
import * as config from 'config';

dotenv.config();
const dbConfig = config.get('db');

export const typeOrmConfig: TypeOrmModuleOptions = {
	type: dbConfig.type,
	host: process.env.DATABASE_HOST || dbConfig.host,
	port: process.env.DATABASE_PORT || dbConfig.port,
	username: process.env.DATABASE_USERNAME || dbConfig.username,
	password: process.env.DATABASE_PASSWORD || dbConfig.password,
	database: process.env.DATABASE_DBNAME || dbConfig.database,
	entities: [
		__dirname + '/../**/*.entity.{js,ts}'
	],
	synchronize: process.env.DATABASE_SYNC || dbConfig.synchronize
}
