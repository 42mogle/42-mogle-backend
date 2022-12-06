import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export const typeORMConfig : TypeOrmModuleOptions = {
	type: 'postgres',
	host: 'localhost',
	port: 5432,
	username: 'postgres',	// info: 클러스터 맥에서 homebrew로 설치한 DB 사용시 등록된 user명으로 사용 (ex. mgo)
	password: 'postgres',
	database: 'beta_test2',
	entities: [
		__dirname + '/../**/*.entity.{js,ts}'
	],
	synchronize: true		// deploy할 때 false로 해야 DB table columns가 안전함
}
