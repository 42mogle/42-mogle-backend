import { Controller, Get, Post, Body, Patch, Param, Delete, Redirect, Query, Res, Header, Headers, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Response, Request } from 'express';
import { LoginAuthDto } from './dto/login-auth.dto';
// import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { Token } from './auth.decorator';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './guard/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private jwtService: JwtService
    ) {}

  @Get('oauth')
  @Redirect('https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-fe0450158bd57a0967d25286f60a880e9dfeaf974652aa249d4b9700a2251a1b&redirect_uri=http%3A%2F%2F10.19.247.186%3A3042%2Fauth%2FfirstJoin&response_type=code', 301)
  redi()
  {
    return("redi");
  }

  @Post('login')
  async login(@Res() response:Response, @Body() loginAuthDto:LoginAuthDto)
  {
    console.log('login');
    console.log(loginAuthDto);

    // response.setHeader('Set-cookie', await this.authService.login(response, loginAuthDto));
    // response.cookie("accessToken", await this.authService.login(response, loginAuthDto),
    // {
    //   httpOnly: true,
    //   secure: true,
    //   sameSite: "none",
    //   maxAge: 24 * 60 * 60 * 1000 //1 day
    // }
    // );
    // console.log(response);
    response.send({accessToken: await this.authService.login(response, loginAuthDto)});
    // return(response.send({message:'로그인 성공'}));
    // return("로그인 확인")
  }

  @Post('logout')
  logout(@Res() response:Response)
  {
    //쿠키 자용시
    response.cookie("accessToken","",
    {
      httpOnly: true,
      maxAge: 0
    })
    response.send({message:'로그아웃'});
    //로컬스토리지는 프론트엔드에서 로컬스토리지에 토큰 지우는 방식으로
  }

  @Get('firstJoin')
  async firstJoin(@Query('code') code: string)
  {
    console.log("firstJoin 확인");
    console.log(code);

    //회원가입 유무는 여기서
    const userInfo = await this.authService.firstJoin(code);
    console.log(userInfo);
    return(userInfo);
  }

  @Post('secondJoin')
  async secondJoin(@Body() createAuthDto:CreateAuthDto)
  {
    console.log("secondJoin 확인");
    console.log(createAuthDto);
    return(await this.authService.secondJoin(createAuthDto));
  }

  @Post('test')
  test(@Body() loginAuthDto: LoginAuthDto)
  {
    return (this.authService.createrAcessToken(loginAuthDto));
  }

  @UseGuards(JwtAuthGuard)
  @Get('test2')
  test2(@Token() token:string)
  {
    // console.log(this.jwtService.verify(token));
    return ("리턴")
  }

  @UseGuards(JwtAuthGuard)
  @Get('test3')
  test3(@Token() token:string)
  {
    console.log(this.jwtService.verify(token));
    console.log("토큰 " + token);
    return ("리턴")
  }
}
