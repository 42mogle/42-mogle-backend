import { Controller, Get, Post, Body, Query, Res, Inject } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { AuthDto } from './dto/auth.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IntraIdDto } from './dto/intraId.dto';
import { WinstonLogger, WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { UserInfo } from '../dbmanager/entities/user_info.entity';
import { UserBasicInfo } from './dto/userInfo.dto';
import { DbmanagerService } from '../dbmanager/dbmanager.service';
import { GetUserInfo } from '../costom-decorator/get-userInfo.decorator';
import { userInfo } from 'os';

@ApiTags('Auth')
@Controller('serverAuth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: WinstonLogger
    ) {}

  /**
   * GET /serverAuth/firstJoin?code=${code}
   */
  @Get('firstJoin')
  @ApiOperation({summary: 'get a user info from 42OAuth'})
	@ApiResponse({
		status: 200, 
		description: 'Success', 
    type: AuthDto
	})
  @ApiResponse({
		status: 401,
		description: '42 api에서 토큰 발급 실패'
	})
  @ApiResponse({
		status: 403,
		description: '이미 회원가입한 사용자'
	})
  @ApiResponse({
		status: 404,
		description: 'api.intra.42.fr/v2/me 요청 실패'
	})
  async firstJoin(@Query('code') code: string) {
    console.log("[ GET /serverAuth/firstJoin ] requested.");
    // todo: Rename to checkingAlreadySignedIn
    const intraIdDto: IntraIdDto = await this.authService.firstJoin(code);
    this.logger.log("[ GET /serverAuth/firstJoin ] requested.", intraIdDto.intraId);
    console.log(`intraId: [${intraIdDto.intraId}]`);
    return(intraIdDto);
  }

  @Get('42oauth/jwt')
  async getJwtBy42OAuthCode(@Query('code') code: string) {
    
    return await this.authService.getJwtBy42OAuthCode(code);
  }

  /**
   * POST /serverAuth/secondJoin
   */
  @Post('secondJoin')
  @ApiOperation({summary: 'request a user sign-in'})
	@ApiResponse({
		status: 201, 
		description: 'Success',
    type: String
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden'
	})
  async secondJoin(@Body() authDto:AuthDto) {
    console.log("[ POST /serverAuth/secondJoin ] requested.");
    console.log(`authDto.intraId: [${authDto.intraId}]`);
    this.logger.log("[ POST /serverAuth/secondJoin ] requested.", authDto.intraId);
    return(await this.authService.secondJoin(authDto));
  }

  /**
   * POST /serverAuth/login
   */
   @Post('login')
   @ApiOperation({summary: 'request user login'})
   @ApiResponse({
     status: 201, 
     description: 'Success'
   })
   @ApiResponse({
     status: 401,
     description: 'Unauthorized'
   })
   async login(@Res() response: Response, @Body() authDto: AuthDto) {
     console.log("[ POST /serverAuth/login ] requested.");
     console.log(`authDto.intraId: [${authDto.intraId}]`);
     this.logger.log("[ POST /serverAuth/login ] requested.", authDto.intraId);
     const accessToken = await this.authService.login(authDto);
     response.send({ accessToken });
     return ;
   }
 
   /**
    * POST /serverAuth/logout
    */
   @Post('logout')
   @ApiOperation({summary: 'request user logout'})
   @ApiResponse({
     status: 201, 
     description: 'Success'
   })
   @ApiResponse({
     status: 403,
     description: 'Forbidden'
   })
   logout(@Res() response:Response) {
     console.log(`[ POST /serverAuth/logout ] requested.`);
     response.send({ message:'로그아웃' });
     this.logger.log("[ POST /serverAuth/logout ] requested.");
     return ;
   } 
}
