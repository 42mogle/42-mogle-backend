import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { stringify } from 'querystring';
import { User } from 'src/dbmanager/entities/user.entity';
import { UserService } from './user.service';
import { ApiParam, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CreateAttendanceDto } from 'src/dbmanager/dto/create-attendance.dto';
import { Certificate } from 'crypto';

class TestingUserInfo {
	intraId: string;
	isAdmin: boolean;
}

@ApiTags('user')
@Controller('user')
export class UserController {
	constructor(private userService: UserService) {
		this.userService = userService;
	}

	// GET /user
	@ApiOperation({summary: 'get all users'})
	@Get('/')
	getAllUser(): Promise<User[]> {
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

	@Post('/attendance')
	pushButton(@Body() createAttendanceDto: CreateAttendanceDto) {
		console.log(createAttendanceDto.intraId);
		console.log(createAttendanceDto.todayWord);
		return this.userService.AttendanceCertification(createAttendanceDto);
	}
	
}
