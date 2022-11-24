import { Controller, Get, Post, Body, Patch, Param, Delete, Redirect, Query, Res, Header, Headers, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Response, Request } from 'express';
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
    response.cookie("accessToken","",
    {
      httpOnly: true,
      maxAge: 0
    })
    response.send({message:'로그아웃'});
    
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



  @Get('test')
  test(@Headers() h:string, @Res() response: Response, @Req() req: Request)
  {
    console.log("test");
    console.log(req.headers);
    response.send({message: "test확인"});
  }
}
