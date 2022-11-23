import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AttendanceModule } from './attendance/attendance.module';
import { OperatorModule } from './operator/operator.module';
import { StatisticModule } from './statistic/statistic.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMConfig } from './configs/typeorm.config';
import { DbmanagerModule } from './dbmanager/dbmanager.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeORMConfig), 
    UserModule, 
    AttendanceModule, 
    OperatorModule, 
    StatisticModule,
    DbmanagerModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
