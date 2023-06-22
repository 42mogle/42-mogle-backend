import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { DbmanagerModule } from '../dbmanager/dbmanager.module';

@Module({
  imports: [
    DbmanagerModule
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
