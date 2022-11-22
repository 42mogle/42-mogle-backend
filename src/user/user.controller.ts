import { Controller, Get, Param } from '@nestjs/common';
import { User } from 'src/dbmanager/entities/user.entity';
import { UserService } from './user.service';

interface TestingUserInfo {
	intraId: string;
	isAdmin: boolean;
}

@Controller('user')
export class UserController {
	constructor(private userService: UserService) {
		this.userService = userService;
	}

	// GET /user/
	@Get('/')
	getAllUser(): Promise<User[]> {
		return this.userService.findAll();
	}

	// GET /user/:intra_id
	@Get('/:intra_id')
	getUserInfo(@Param('intra_id') intra_id: string) {
		return this.userService.getUserInfoByIntraId(intra_id);
	}
	
}
