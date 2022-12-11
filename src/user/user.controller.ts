import { UserService } from './user.service';
import { UserInfoDto } from './dto/user-info.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { UserInfo } from 'src/dbmanager/entities/user_info.entity';
import { ApiParam, ApiOperation, ApiTags, ApiResponse, ApiCreatedResponse, ApiBearerAuth } from '@nestjs/swagger'
import { Controller, Get, Inject, Param, UseGuards } from '@nestjs/common';
import { GetUserInfo } from 'src/costom-decorator/get-userInfo.decorator';
import { WinstonLogger, WINSTON_MODULE_PROVIDER } from 'nest-winston';

@ApiTags('User')
@Controller('user')
export class UserController {
	constructor(
		private readonly userService: UserService,
		@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: WinstonLogger,
		) {
		this.userService = userService;
	}

	// GET /user/getUserInfo
	@Get('getUserInfo')
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
	getUserInfo(@GetUserInfo() userInfo: UserInfo): UserInfoDto {
		this.logger.log("[GET /user/getUserInfo] requested.", JSON.stringify(userInfo));
		const userInfoDto: UserInfoDto = {
			intraId: userInfo.intraId,
			isOperator: userInfo.isOperator,
			photoUrl: userInfo.photoUrl
		};
		return userInfoDto;
	}
}
