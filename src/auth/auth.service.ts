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
  async getUserData(code: string): Promise<IntraIdDto> {
    let retIntraIdDto: IntraIdDto;
    const oauthAccessToken = await this.getOauthToken(code);

    await this.httpService.axiosRef
      .get('https://api.intra.42.fr/v2/me', {
        headers: {
          Authorization: `Bearer ${oauthAccessToken}`,
          'content-type': 'application/json',
        },
      })
      .then((res) => {
        retIntraIdDto = {
          intraId : res.data.login,
        }
        console.log("api.intra.42.fr/v2/me 요청 실패");
      })
      .catch((err) => {
        console.log("api.intra.42.fr/v2/me 요청 실패");
        throw new HttpException({
          errorMessage: "api.intra.42.fr/v2/me 요청 실패"
        }, HttpStatus.NOT_FOUND);
      });
    return (retIntraIdDto);
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
  async firstJoin(code: string): Promise<IntraIdDto> {
    const retIntraIdDto: IntraIdDto = await this.getUserData(code);
    // todo: Request to dbManager
    const userInfo = await this.usersRepository.findOneBy({
      intraId: retIntraIdDto.intraId
    });

    if (userInfo !== null && (userInfo.isSignedUp === true)) {
      console.log("이미 회원가입 한 사용자");
      // todo: consider
      throw new HttpException({
        errorMessage: "이미 회원가입 한 회원입니다.",
        intraId: userInfo.intraId
      }, HttpStatus.FORBIDDEN);
    } else if (userInfo !== null) {
      console.log("이전에 회원가입 시도(firstJoin) 한 사용자");
    } else {
      console.log("DB user_info table에 사용자 정보 저장");
      const newUserInfo: UserInfo = this.usersRepository.create({
        intraId: retIntraIdDto.intraId,
        password: null,
        isOperator: false,
        photoUrl: null,
        isSignedUp: false,
      });
      await this.usersRepository.save(newUserInfo);
    }
    return (retIntraIdDto);
  }

  //회원가입2 유저가 기입한 정보로 회원가입
  async secondJoin(authDto: AuthDto) {
    let userInfo = await this.usersRepository.findOneBy({
      intraId: authDto.intraId
    }) // todo: Request to dbManager

    if (userInfo === null) {
      console.log("유효하지 않은 인트라 아이디");
      // todo: consider
      throw new HttpException({
        errorMessage: "유효하지 않은 인트라 아이디",
      }, HttpStatus.FORBIDDEN);
    } else if (userInfo.isSignedUp === false) {
      const saltOrRounds = 10;
      userInfo.password = await bcrypt.hash(authDto.password, saltOrRounds);
      userInfo.isSignedUp = true;
      this.usersRepository.save(userInfo);
    } else {
      console.log("이미 회원가입한 사용자");
      // todo: send error message
      throw new HttpException({
        errorMessage: "이미 회원가입한 사용자",
      }, HttpStatus.FORBIDDEN);
    }
    return ; // todo: send success message ?
  }

  async deleteUser(intraId:string) {
    // todo: Request to dbManager
    return (await this.usersRepository.delete({ intraId: intraId }));
  }
}
