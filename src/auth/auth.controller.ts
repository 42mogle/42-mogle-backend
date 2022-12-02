import { Controller, Get, Post, Body, Redirect, Query, Res, UseGuards, Delete, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response, Request, query } from 'express';
import { Token } from './auth.decorator';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { AuthDto } from './dto/auth.dto';
import { ApiCreatedResponse, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('serverAuth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService
    ) {}

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
  async login(@Res() response: Response, @Body() authDto: AuthDto)
  {
    console.log("[POST /serverAuth/login] requested.");
    console.log("[AuthoDto]:")
    console.log(authDto);

    const accessToken = await this.authService.login(response, authDto);
    console.log("[accessToken]:");
    console.log(accessToken);
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
  logout(@Res() response:Response)
  {
    /** 
     * When using cookie (saving accessToken in cookie), run below code.
     */
    // response.cookie("accessToken","",
    // {
    //   httpOnly: true,
    //   maxAge: 0
    // })

    /** 
     * When using local storage, the front-end removes the accessToken.
     */

    response.send({message:'로그아웃'});
    return ;
  }

  /**
   * GET /serverAuth/firstJoin
   */
  @Get('firstJoin')
  @ApiOperation({summary: 'get a user info from 42OAuth'})
	@ApiResponse({
		status: 200, 
		description: 'Success', 
    type: AuthDto
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden'
	})
  async firstJoin(@Query('code') code: string)
  {
    console.log("[GET /serverAuth/firstJoin] requested.");
    console.log("[42OAuth code]:");
    console.log(code);

    // todo: Rename to checkingAlreadySignedIn
    const userInfo = await this.authService.firstJoin(code);
    console.log("[userInfo]:");
    console.log(userInfo);
    return(userInfo);
  }

  @Post('secondJoin')
  @ApiOperation({summary: 'request user join'})
	@ApiResponse({
		status: 201, 
		description: 'Success',
    type: String
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden'
	})
  async secondJoin(@Body() authDto:AuthDto)
  {
    console.log("secondJoin 확인");
    console.log(authDto);
    return(await this.authService.secondJoin(authDto));
  }

  // todo: Remove
  // test
  @Get('test0')
  @ApiOperation({summary: 'for testing'})
  test0()
  {
    console.log("hello");
    return("test0")
  }
  
  // todo: Remove
  // test
  @Post('test')
	@ApiCreatedResponse({
		description: '테스트',
		schema: {
			example: {
				intraId: 'mgo',
				isOperator: true,
				photoUrl: 'https://awesome.photo'
			}
		}
	})
  @ApiOperation({summary: 'for testing'})
  async test(@Body() authDto: AuthDto)
  {
    // response.cookie("accessToken", this.authService.createrAcessToken(authDto),
    // {
    //   httpOnly: true,
    //   secure: true,
    //   sameSite: "none",
    //   maxAge: 24 * 60 * 60 * 1000 //1 day
    // })
    // return(response.send({message:'로그인 성공'}));
    return (this.authService.createrAcessToken(authDto));
  }

  // todo: Remove
  // test
  @Post('test2')
  @ApiOperation({summary: 'for testing'})
  test2(@Token() token:string)
  {
    console.log(this.jwtService.verify(token));
    console.log("토큰 " + token);
    return ("test2 리턴")
  }

  // todo: Remove
  // test
  @UseGuards(JwtAuthGuard)
  @Post('test3')
  @ApiOperation({summary: 'for testing'})
  test3(@Token() token:string)
  {
    console.log(this.jwtService.verify(token));
    console.log("토큰 " + token);
    return ("test3 리턴")
  }

  // todo: Remove
  @Get('oauth')
  @ApiOperation({summary: 'for testing'})
  @Redirect('https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-fe0450158bd57a0967d25286f60a880e9dfeaf974652aa249d4b9700a2251a1b&redirect_uri=http%3A%2F%2F10.19.247.186%3A3042%2Fauth%2FfirstJoin&response_type=code', 301)
  redi()
  {
    return("redi");
  }

  @Delete('delete')
  async DeleteUser(@Query('intraId') intraId:string)
  {
    console.log(await this.authService.DeleteUser(intraId));
    console.log(intraId + " 삭제완료");
  }
}
