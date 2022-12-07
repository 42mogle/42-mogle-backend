import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios'
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { AuthDto } from './dto/auth.dto';
import { UserInfo } from 'src/dbmanager/entities/user_info.entity';


@Injectable()
export class AuthService {
  constructor(
    private readonly httpService: HttpService,
    private jwtService: JwtService,
    @InjectRepository(UserInfo)
    private usersRepository: Repository<UserInfo>,
  ) {}

  //42oauth 엑세스 토큰 받아오기
  /**
   *
   * @param code 42OAuthCode
   * @returns 42OAuthAccessToken
   */
  async getOauthToken(code: string) {
    const payload = {
      grant_type: 'authorization_code',
      client_id: process.env.PAYLOAD_CLIENT_ID,
      client_secret: process.env.PAYLOAD_CLIENT_SECRET,
      redirect_uri: 'https://42mogle.com/auth',
      code
    };
    console.log(`payload:`);
    console.log(payload);
    let retOauthAccessToken: string;
    await this.httpService.axiosRef
      .post('https://api.intra.42.fr/oauth/token', JSON.stringify(payload), {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then((res) => {
        retOauthAccessToken = res.data.access_token;
        console.log("get 42OAuth AccessToken 성공");
      })
      .catch((err) => {
        console.log("get 42OAuth AccessToken 실패");
        throw new HttpException('42OAuth 인증 코드를 얻는데 실패하였습니다', HttpStatus.FORBIDDEN); // todo: consider
      });
    return (retOauthAccessToken);
  }

  //42api로부터 유저 정보 받아오기
  async getUserData(code: string) {
    let retAuthDto: AuthDto;
    const oauthAccessToken = await this.getOauthToken(code);

    await this.httpService.axiosRef
      .get('https://api.intra.42.fr/v2/me', {
        headers: {
          Authorization: `Bearer ${oauthAccessToken}`,
          'content-type': 'application/json',
        },
      })
      .then((res) => {
        retAuthDto =
        {
          intraId : res.data.login,
          password: "",                   // todo: consider
          photoUrl : res.data.image.link, // todo: consider
          isOperator: false
        }
        console.log("getUserData from 42api 성공");
      })
      .catch((err) => {
        console.log("getUserData from 42api 실패");

        // todo: consider
        throw new HttpException('42회원 정보가 존재하지 않습니다.', HttpStatus.FORBIDDEN);
      });
    return (retAuthDto);
  }

  // todo: Rename to createJwtAccessToken()
  createrAcessToken(authDto: AuthDto) {
    const payload = { intraId: authDto.intraId };
    const accessToken = this.jwtService.sign(payload)
    return (accessToken);
  }

  async login(response:Response, authDto:AuthDto) {
    let userInfo = await this.usersRepository.findOneBy({ intraId: authDto.intraId });
    if (userInfo !== null) {
      const isMatch = await bcrypt.compare(authDto.password, userInfo.password);
      if ((userInfo.intraId == authDto.intraId) && isMatch) {
        return(this.createrAcessToken(authDto));
      }
      else {
        console.log("Wrong password -> 401 UNAUTHORIZED");
        throw new HttpException('비밀번호가 틀렸습니다.', HttpStatus.UNAUTHORIZED);
      }
    }
    else {
      console.log("No user -> 401 UNAUTHORIZED")
      throw new HttpException('회원정보가 존재하지 않습니다.', HttpStatus.UNAUTHORIZED);
    }
  }

  //회원가입1 oauth인증
  async firstJoin(code: string) {
    const authDto: AuthDto = await this.getUserData(code);

    // todo: Request to dbManager
    const userInfo = await this.usersRepository.findOneBy({ intraId: authDto.intraId })

    if (userInfo !== null) {
      console.log("이미 존재하는 회원");

      // todo: consider
      throw new HttpException({errorMessage: "이미 존재하는 회원입니다.",intraId: userInfo.intraId}, HttpStatus.FORBIDDEN);
    }
    return (authDto);
  }

  //회원가입2 유저가 기입한 정보로 회원가입
  async secondJoin(authDto: AuthDto) {
    const user = new UserInfo();
    const saltOrRounds = 10;

    // todo: Request to dbManager
    let userInfo = await this.usersRepository.findOneBy({
      intraId: authDto.intraId
    })
    if (userInfo === null) {
      // todo: using repository.create() ?
      user.intraId = authDto.intraId;
      user.password = await bcrypt.hash(authDto.password, saltOrRounds);
      user.photoUrl = authDto.photoUrl;
      user.isOperator = authDto.isOperator;
      console.log(user);
      await this.usersRepository.save(user); // todo: Request to dbManager
      return authDto.intraId;
    }
    else {
      console.log("이미 존재하는 회원");

      // todo: consider
      throw new HttpException('이미 존재하는 회원입니다.', HttpStatus.FORBIDDEN);
    }
  }

  async deleteUser(intraId:string) {
    // todo: Request to dbManager
    return (await this.usersRepository.delete({ intraId: intraId }));
  }

  testEnv() {
    const str_test = process.env.ENV_TEST;
    console.log(str_test);
    console.log(`in testEnv`);
    return str_test;
  }
}
