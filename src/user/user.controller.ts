import { Controller, Get, Param } from '@nestjs/common';
import { User } from 'src/dbmanager/entities/user.entity';
import { UserService } from './user.service';
import { ApiParam, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'

interface TestingUserInfo {
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
	
}
