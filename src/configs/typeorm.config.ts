import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { User } from "src/dbmanager/entities/user.entity";

export const typeORMConfig : TypeOrmModuleOptions = {
	type: 'postgres',
	host: 'localhost',
	port: 5432,
	username: 'postgres',
	password: 'postgres',
	database: 'mogle-app',
	//entities: [__dirname + '/../**/*.entity.{js,ts}'],
	entities: [User],
	synchronize: true
}