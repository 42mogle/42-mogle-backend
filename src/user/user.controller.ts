import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { stringify } from 'querystring';
import { UserInfo } from 'src/dbmanager/entities/user_info.entity';
import { UserService } from './user.service';
import { ApiParam, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CreateAttendanceDto } from 'src/dbmanager/dto/create-attendance.dto';
import { Certificate } from 'crypto';

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

	@Post('/attendance')
	pushButton(@Body() createAttendanceDto: CreateAttendanceDto) {
		return this.userService.AttendanceCertification(createAttendanceDto);
	}
	
}
