import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { DbmanagerService } from './dbmanager.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { UserInfo } from './entities/user_info.entity';
import { GetUserInfo } from 'src/costom-decorator/get-userInfo.decorator';

@ApiTags('DbManager')
@Controller('dbmanager')
export class DbmanagerController {
	constructor(private readonly dbmanagerService: DbmanagerService) { }

	@UseGuards(JwtAuthGuard)
	@Post('/set/totalMonthInfo') // 해달 달의 정보와 그달의 모든 일자에 대한 정보를 데이터로 남겨논다 //크론
	setTotalMonthInfo(@GetUserInfo() userInfo: UserInfo) {
		return this.dbmanagerService.setTotalMonthInfo(userInfo);
	}

	@UseGuards(JwtAuthGuard)
	@Post("/setcurrent")
	testSetCurrent(@GetUserInfo() userInfo: UserInfo) {
		if (userInfo.isOperator === false)
			throw new UnauthorizedException("Not Operator");
		this.dbmanagerService.upDateThisMonthCurrentAttendance();
	}
}
