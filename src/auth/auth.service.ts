import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios'
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { AuthDto } from './dto/auth.dto';
import { UserInfo } from 'src/dbmanager/entities/user_info.entity';
import { IntraIdDto } from './dto/intraId.dto';
import { validateHeaderValue } from 'http';


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
  async getOauthToken(code: string): Promise<string> {
    let retOauthAccessToken: string;
    const payload = {
      grant_type: 'authorization_code',
      client_id: process.env.PAYLOAD_CLIENT_ID,
      client_secret: process.env.PAYLOAD_CLIENT_SECRET,
      redirect_uri: 'https://42mogle.com/auth',
      code
    };

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
        throw new HttpException('42OAuth 인증 코드를 얻는데 실패하였습니다', HttpStatus.UNAUTHORIZED);
      });
    return (retOauthAccessToken);
  }

  //42api로부터 유저 정보 받아오기
  async get42IntraIdAndPhotoUrl(code: string) {
    let retIntraIdAndPhtoUrl: any;
    const oauthAccessToken = await this.getOauthToken(code);

    await this.httpService.axiosRef
      .get('https://api.intra.42.fr/v2/me', {
        headers: {
          Authorization: `Bearer ${oauthAccessToken}`,
          'content-type': 'application/json',
        },
      })
      .then((res) => {
        retIntraIdAndPhtoUrl = {
          intraId: res.data.login,
          photoUrl: res.data.image.link,
        }
        console.log("api.intra.42.fr/v2/me 요청 실패");
      })
      .catch((err) => {
        console.log("api.intra.42.fr/v2/me 요청 실패");
        throw new HttpException({
          errorMessage: "api.intra.42.fr/v2/me 요청 실패"
        }, HttpStatus.NOT_FOUND);
      });
    return (retIntraIdAndPhtoUrl);
  }

  //회원가입1 oauth인증
  async firstJoin(code: string): Promise<IntraIdDto> {
    const intraIdAndPhotoUrl = await this.get42IntraIdAndPhotoUrl(code);
    const retIntraIdDto = { intraId: intraIdAndPhotoUrl.IntraId };
    const userInfo = await this.usersRepository.findOneBy({
      intraId: retIntraIdDto.intraId
    }); // todo: Request to dbManager
    const defaultImage: string =
        "https://i.ytimg.com/vi/AwrFPJk_BGU/maxresdefault.jpg";

    if (userInfo !== null && (userInfo.isSignedUp === true)) {
      console.log("이미 회원가입한 사용자");
      throw new HttpException({
        errorMessage: "이미 회원가입한 사용자",
        intraId: userInfo.intraId
      }, HttpStatus.FORBIDDEN);
    } else if (userInfo !== null) {
      console.log("이전에 회원가입 시도(firstJoin)한 사용자");
    } else {
      console.log("DB user_info table에 사용자 정보 저장");
      const newUserInfo: UserInfo = this.usersRepository.create({
        intraId: intraIdAndPhotoUrl.intraId,
        password: null,
        isOperator: false,
        photoUrl: (intraIdAndPhotoUrl.photoUrl === null ? 
          defaultImage : intraIdAndPhotoUrl.photoUrl),
        isSignedUp: false,
      });
      await this.usersRepository.save(newUserInfo);
    }
    return (retIntraIdDto);
  }

  checkPasswordValid(pwd: string): boolean {
    const ruleRegex = 
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^*+=-])[\da-zA-Z!@#$%^*+=-]{8,}$/;
    // Explain : 비밀번호 길이는 8자 ~ 20자 사이
    if (pwd.length < 8 && 20 < pwd.length) {
      return false;
    }
    // Explain : 특수문자, 대문자, 소문자, 길이 모두 확인하는 정규식
    else if (ruleRegex.test(pwd) === false) {
      return false;
    } else {
      return true;
    }
  }

  //회원가입2 유저가 기입한 정보로 회원가입
  async secondJoin(authDto: AuthDto) {
    let userInfo = await this.usersRepository.findOneBy({
      intraId: authDto.intraId
    }) // todo: Request to dbManager

    if (userInfo === null) {
      console.log("유효하지 않은 인트라 아이디");
      throw new HttpException({
        errorMessage: "유효하지 않은 인트라 아이디",
      }, HttpStatus.FORBIDDEN);
    } else if (userInfo.isSignedUp === true) {
      console.log("이미 회원가입한 사용자");
      throw new HttpException({
        errorMessage: "이미 회원가입한 사용자",
      }, HttpStatus.FORBIDDEN);
    } else {
      const saltOrRounds = 10;
      // validation password
      if (this.checkPasswordValid(authDto.password) === false) {
        throw new HttpException({
          errorMessage: "비밀번호 규칙 오류",
        }, HttpStatus.UNAUTHORIZED);
      }
      userInfo.password = await bcrypt.hash(authDto.password, saltOrRounds);
      userInfo.isSignedUp = true;
      this.usersRepository.save(userInfo);
    }
    return ; // todo: send success message ?
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

  async deleteUser(intraId:string) {
    // todo: Request to dbManager
    return (await this.usersRepository.delete({ intraId: intraId }));
  }
}
