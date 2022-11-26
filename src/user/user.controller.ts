import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { stringify } from 'querystring';
import { UserInfo } from 'src/dbmanager/entities/user_info.entity';
import { UserService } from './user.service';
import { ApiParam, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CreateAttendanceDto } from 'src/dbmanager/dto/create-attendance.dto';
import { Certificate } from 'crypto';

// 일단 유저 출석, 개근 수치들은 Statistic module에서 처리하는게 맞는 것 같습니다!
// 유저 정보 관련 -> UserInfo 모듈
// 출석 로직 관련 -> Attendance 모듈
// 출석, 개근 수치 관련 -> Statistic 모듈
// 오퍼레이터 기능 -> Operator 모듈

@ApiTags('user')
@Controller('user')
export class UserController {
	constructor(private userService: UserService) {
		this.userService = userService;
	}

	// GET /user
	@ApiOperation({summary: 'get all users'})
	@Get('/')
	getAllUser(): Promise<UserInfo[]> {
		return this.userService.findAll();
	}

	// GET /user/:intraId
	@ApiOperation({summary: 'get the user having the intraId'})
	@ApiParam({
		name: 'intraId',
		type: 'string',
	})
	@ApiOkResponse({
		description: 'Success'
	})
	@Get('/:intraId')
	getUserInfo(@Param('intraId') intraId: string) {
		return this.userService.getUserInfoByIntraId(intraId);
	}

	
}
