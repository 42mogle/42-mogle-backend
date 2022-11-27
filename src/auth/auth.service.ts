import { HttpException, HttpStatus, Injectable, Res } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { HttpService } from '@nestjs/axios'
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { LoginAuthDto } from './dto/login-auth.dto';
import { Auth } from './entities/auth.entity';
import * as bcrypt from 'bcrypt';
import { jwtConstants } from './strategy/jwtConstants';


@Injectable()
export class AuthService {
  constructor(
    private readonly httpService: HttpService,
    private jwtService: JwtService,
    @InjectRepository(Auth)
    private usersRepository: Repository<Auth>,
  ) { }


  //42oauth 엑세스 토큰 받아오기
  async getOauthToken(code: string) {
    const payload = {
      grant_type: 'authorization_code',
      client_id: 'u-s4t2ud-ffa1eb7dfe8ca1260f9d27ba33051536d23c76cd1ab09f489cb233c7e8e5e065',
      client_secret: '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',
      redirect_uri: 'http://10.19.220.34:3000/auth',
      code
    };
    let ret: string;
    await this.httpService.axiosRef
      .post('https://api.intra.42.fr/oauth/token', JSON.stringify(payload), {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then((res) => {
        ret = res.data.access_token;
        console.log("getAccessToken 성공");
      })
      .catch((err) => {
        console.log("getAccessToken 에러");
      });
    return (ret);
  }

  //42api로부터 유저 정보 받아오기
  async getUserData(code: string) {
    let loginAuthDto: LoginAuthDto;

    const accessToken = await this.getOauthToken(code);

    await this.httpService.axiosRef
      .get('https://api.intra.42.fr/v2/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'content-type': 'application/json',
        },
      })
      .then((res) => {
        const
          {
            login: intraId,
            image_url: imageURL,
          } = res.data;
        loginAuthDto =
        {
          intraId,
          password: "1234",
          imageURL,
        }
        console.log("getUserData 성공");
      })
      .catch((err) => {
        console.log("getUserData 에러");
      });
    return (loginAuthDto);
  }

  //JWT 액세스 토큰 발행
  createrAcessToken(loginAuthDto: LoginAuthDto)
  {
    let intraId: string = loginAuthDto.intraId;
    const payload = { intraId };
    const accessToken = this.jwtService.sign(payload)
    // console.log(intraId);
    // console.log(accessToken);
    return (accessToken);
  }

  async login(response:Response, loginAuthDto:LoginAuthDto) 
  {
    /* 
      디비에 아이디 정보 있는지 확인
      정보 있을시
        토큰 발행
      정보 없을시
        에러코드 반환 || 에러 반환
    */
    const user = new Auth();

    let userInfo = await this.usersRepository.findOneBy({ intraId: loginAuthDto.intraId });
    if (userInfo) {
      //로그인
      //토큰 발행
      const isMatch = await bcrypt.compare(loginAuthDto.password, userInfo.password);

      if ((userInfo.intraId == loginAuthDto.intraId) && isMatch)
      {
        console.log("유저 확인 : " + userInfo.intraId);
        return(this.createrAcessToken(loginAuthDto));
      }
      // return (accessToken);
      // response.cookie("accessToken", accessToken);
    }
    else
      throw new HttpException('Invalid User', HttpStatus.BAD_REQUEST);
  }

  //회원가입1 oauth인증
  async firstJoin(code: string) {
    let loginAuthDto: LoginAuthDto = await this.getUserData(code);
    let isjoin = await this.usersRepository.findOneBy({ intraId: loginAuthDto.intraId })

    if (isjoin !== null)
      throw new HttpException('Invalid User', HttpStatus.FORBIDDEN);
    return (loginAuthDto);
  }

  //회원가입2 유저가 기입한 정보로 회원가입
  async secondJoin(createAuthDto: CreateAuthDto) {
    const user = new Auth();
    const saltOrRounds = 10;
    
    let isjoin = await this.usersRepository.findOneBy(
      {
        intraId: createAuthDto.intraId
      })
      if (isjoin === null) {
        //회원가입
        console.log("회원가입");
        user.intraId = createAuthDto.intraId;
        //해시 처리해야함
        user.password = await bcrypt.hash(createAuthDto.password, saltOrRounds);
        // user.password = createAuthDto.password;
        user.imageURL = "imageURL";
        await this.usersRepository.save(user);
      return createAuthDto.intraId;
    }
    else {
      console.log("이미 존재하는 회원");
      throw new HttpException('Invalid User', HttpStatus.FORBIDDEN);
    }
  }
}
