import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from 'src/dbmanager/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbmanagerService } from 'src/dbmanager/dbmanager.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService, DbmanagerService]
})
export class UserModule {}
