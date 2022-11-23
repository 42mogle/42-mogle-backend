import { Module } from '@nestjs/common';
import { DbmanagerService } from './dbmanager.service';
import { DbmanagerController } from './dbmanager.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/dbmanager/entities/user.entity';
import { MonthInfo } from './entities/month.info.entity';
import { DayInfo } from './entities/day.info.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [User, MonthInfo, DayInfo]
    ),
  ],
  controllers: [DbmanagerController],
  providers: [DbmanagerService]
})
export class DbmanagerModule {}
