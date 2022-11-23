import { Controller, Get, Post, Body, Patch, Param, Delete, Redirect, Query, Res, Header } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { Response } from 'express';
import { LoginAuthDto } from './dto/login-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService
    ) {}

  @Get('oauth')
  @Redirect('https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-fe0450158bd57a0967d25286f60a880e9dfeaf974652aa249d4b9700a2251a1b&redirect_uri=http%3A%2F%2F10.19.247.186%3A3042%2Fauth%2FfirstJoin&response_type=code', 301)
  redi()
  {
    return("redi");
  }

  @Get('login')
  async login(@Res() response:Response, @Body() loginAuthDto:LoginAuthDto)
  {
    console.log('login');
    await this.authService.login(response, loginAuthDto);
    console.log(response);
    // console.log("login");
    // response.redirect("http://42mogle.com");

    // response.status(302)
    // console.log("response");
    return("확인");
  }

  @Get('firstJoin')
  async firstJoin(@Query('code') code: string)
  {
    console.log("firstJoin 확인");
    console.log(code);
    // console.log(response);
    //회원가입 유무는 여기서
    const userInfo = await this.authService.firstJoin(code);
    console.log(userInfo);
    return(userInfo);
    // return("안녕하세요");
  }

  @Post('secondJoin')
  async secondJoin(@Body()createAuthDto:CreateAuthDto)
  {
    this.authService.secondJoin(createAuthDto);
  }



  @Get('test')
  test(@Res() response: Response)
  {
    response.status(300).send();
    return ('확인');
  }
}
