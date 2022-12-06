import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { DbmanagerService } from './dbmanager.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from 'src/attendance/dto/create-user.dto';

@ApiTags('DbManager')
@Controller('dbmanager')
export class DbmanagerController {
	constructor(private readonly dbmanagerService: DbmanagerService) { }

	@UseGuards(JwtAuthGuard)
	@Post('/set/totalMonthInfo/:intraId') // 해달 달의 정보와 그달의 모든 일자에 대한 정보를 데이터로 남겨논다 //크론
	setTotalMonthInfo(@Param("intraId") intraId: string) {
		return this.dbmanagerService.setTotalMonthInfo(intraId);
	}

	@UseGuards(JwtAuthGuard)
	@Post("/test/setcurrent")
	testSetCurrent() {
		this.dbmanagerService.upDateThisMonthCurrentAttendance();
	}
}
