import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { DbmanagerService } from './dbmanager.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('DbManager')
@Controller('dbmanager')
export class DbmanagerController {
	constructor(private readonly dbmanagerService: DbmanagerService) { }

	@UseGuards(JwtAuthGuard)
	@Post('/user') //삭제 예정
	createUser(@Body() createUserDto: CreateUserDto) {
		console.log("in DbmanagerController.createUser()");
		console.log(createUserDto);
		return this.dbmanagerService.createUser(createUserDto);
	}

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

	@UseGuards(JwtAuthGuard)
	@Post('/test/createMockUp')
	tt() {
		this.dbmanagerService.createMockUp()
	}

	@UseGuards(JwtAuthGuard)
	@Post('test/:intraId/:num/setatc')
	ILikeTT(@Param("intraId, num") intraId: string, num: number) {
		this.dbmanagerService.atc(intraId, num);
	}

}
