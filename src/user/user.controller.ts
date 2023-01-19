import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { UserInfo } from 'src/dbmanager/entities/user_info.entity';
import { ApiParam, ApiOperation, ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { Body, Controller, Get, Inject, Patch, UseGuards, UnauthorizedException } from '@nestjs/common';
import { GetUserInfo } from 'src/costom-decorator/get-userInfo.decorator';
import { WinstonLogger, WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { UserInfoDto } from './dto/user-info.dto';
import { PasswordDto } from './dto/password.dto';

@ApiTags('User')
@Controller('user')
export class UserController {
	constructor(
		private readonly userService: UserService,
		@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: WinstonLogger,
		) {
		this.userService = userService;
	}

	// todo: modify RestAPI name
	/**
	 * GET /user/getUserInfo
	 */
	@Get('getUserInfo')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth('access-token')
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

	/**
	 * PATCH /user/password
	 */
	@Patch('password')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth('access-token')
	@ApiOperation({
		summary: 'Modify user password',
		description: '유저 비밀번호 변경하기'
	})
	@ApiResponse({
		status: 201, 
		description: 'Success',
	})
	@ApiResponse({
		status: 401,
		description: 'Error: Unauthorized (Blocked by JwtAuthGuard: No JWT access-token)'
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden'
	})
	async modifyUserPassword(@GetUserInfo() userInfo: UserInfo, @Body() passwordDto: PasswordDto): Promise<void> {
		this.logger.log("[PATCH /user/password] requested.", userInfo.intraId);
		await this.userService.modifyUserPassword(userInfo, passwordDto);
		return ;
	}

	@Get('operatorStatus')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth('access-token')
	getUsersOperatorStatus(@GetUserInfo() userInfo: UserInfo) {
		this.logger.log("[GET] /user/operatorStatus", userInfo.intraId)
		if (!userInfo.isOperator) {
			this.logger.log(userInfo.intraId + " is not operator")
			throw new UnauthorizedException()
		}
		return this.userService.getAllUsersOperatorInfo();
	}
}

