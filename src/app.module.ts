import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { User } from './user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'test',
      // entities: [__dirname + '/../s**/*.entity.{js,ts}'],
      entities: [User],
      synchronize: true
    }),
    UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
