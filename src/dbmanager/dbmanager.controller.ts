import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UnauthorizedException, Inject } from '@nestjs/common';
import { DbmanagerService } from './dbmanager.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserInfo } from './entities/user_info.entity';
import { GetUserInfo } from 'src/costom-decorator/get-userInfo.decorator';
import { WinstonLogger, WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@ApiTags('DbManager')
@Controller('dbmanager')
export class DbmanagerController {
	constructor(
		private readonly dbmanagerService: DbmanagerService,
		@Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: WinstonLogger,
		) { }

	@Post('/set/totalMonthInfo') // 해달 달의 정보와 그달의 모든 일자에 대한 정보를 데이터로 남겨논다 //크론
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth('access-token')
	@ApiOperation({summary: 'set total month info'})
	@ApiResponse({
		status: 201, 
		description: 'Success', 
		// todo: Set type using dto
	})
	@ApiResponse({
		status: 401,
		description: 'Error: Unauthorized (Blocked by JwtAuthGuard)'
	})
	setTotalMonthInfo(@GetUserInfo() userInfo: UserInfo) {
		console.log(`[ POST /dbmanager/set/totalMonthInfo ]`);
		this.logger.log(`[ POST /dbmanager/set/totalMonthInfo ]`, userInfo.intraId);
		return this.dbmanagerService.setTotalMonthInfo(userInfo);
	}
	
	@Post("/setcurrent")
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth('access-token')
	@ApiOperation({summary: 'set current'})
	@ApiResponse({
		status: 201, 
		description: 'Success', 
		// todo: Set type using dto
	})
	@ApiResponse({
		status: 401,
		description: 'Error: Unauthorized (Blocked by JwtAuthGuard)'
	})
	testSetCurrent(@GetUserInfo() userInfo: UserInfo) {
		this.logger.log(`[ POST /dbmanager/setcurrent ]`, JSON.stringify(userInfo));
		if (userInfo.isOperator === false)
			throw new UnauthorizedException("Not Operator");
		this.dbmanagerService.upDateThisMonthCurrentAttendance();
	}
}
