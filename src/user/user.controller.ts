import { UserService } from './user.service';
import { UserInfoDto } from './dto/user-info.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { UserInfo } from 'src/dbmanager/entities/user_info.entity';
import { ApiParam, ApiOperation, ApiTags, ApiResponse, ApiCreatedResponse, ApiBearerAuth } from '@nestjs/swagger'
import { Controller, Get, Param, UseGuards } from '@nestjs/common';

@ApiTags('User')
@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {
		this.userService = userService;
	}

	// GET /user/{intraId}
	@Get('/:intraId')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth('access-token') // setting JWT token key
	@ApiOperation({
		summary: 'get the user information',
		description: '유저 정보 요청 API'
	})
	@ApiParam({
		name: 'intraId',
		type: String,
	})
	@ApiResponse({
		status: 200, 
		description: 'Success', 
		type: UserInfoDto,
	})
	@ApiResponse({
		status: 401,
		description: 'Error: Unauthorized (Blocked by JwtAuthGuard: No JWT access-token)'
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden'
	})
	async getUserInfo(@Param('intraId') intraId: string): Promise<UserInfoDto> {
		return await this.userService.getUserInfoByIntraId(intraId);
	}

	// todo: Remove
	// GET /user //현재는 사용되지 않음
	@ApiOperation({summary: 'get all users'})
	@UseGuards(JwtAuthGuard)
	@Get('/')
	getAllUser(): Promise<UserInfo[]> {
		return this.userService.findAll();
	}
}
