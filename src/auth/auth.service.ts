import { AuthDto } from './dto/auth.dto';
import { IntraIdDto } from './dto/intraId.dto';
import { UserInfo } from 'src/dbmanager/entities/user_info.entity';
import * as bcrypt from 'bcrypt';
import { HttpService } from '@nestjs/axios'
import { JwtService } from '@nestjs/jwt';
import { HttpException, HttpStatus, Injectable, Inject, NotFoundException } from '@nestjs/common';
import { UserBasicInfo } from './dto/userInfo.dto';
import { DbmanagerService } from '../dbmanager/dbmanager.service';

@Injectable()
export class AuthService {

  @Inject(DbmanagerService) private readonly dbmanagerService: DbmanagerService

  constructor(
    private readonly httpService: HttpService,
    private jwtService: JwtService,
    //@InjectRepository(UserInfo)
    //private usersRepository: Repository<UserInfo>,
  ) {}

  // 42oauth 엑세스 토큰 받아오기
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
      redirect_uri: process.env.REDIRECT_URI,
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
        console.log("api.intra.42.fr/v2/me 요청 성공");
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
    const retIntraIdDto: IntraIdDto = { intraId: intraIdAndPhotoUrl.intraId };
    const userInfo = await this.dbmanagerService.getUserInfo(retIntraIdDto.intraId);

    console.log(`In AuthService.firstJoin -> retIntraIdDto: `);
    console.log(retIntraIdDto);
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
      await this.dbmanagerService.createAndSaveUserInfo(intraIdAndPhotoUrl);
    }
    return (retIntraIdDto);
  }

  checkPasswordValid(pwd: string): boolean {
    const ruleRegex =
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^\d\sa-zA-Z])[\S]{8,20}$/;
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
    let userInfo = await this.dbmanagerService.getUserInfo(authDto.intraId);

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
      this.dbmanagerService.saveUserInfo(userInfo);
    }
    return ; // todo: send success message ?
  }

  createJwtAccessToken(intraId: string): string {
    const payload = { intraId };
    const accessToken: string = this.jwtService.sign(payload);
    return accessToken;
  }

  async login(authDto: AuthDto): Promise<string> {
    const userInfo = await this.dbmanagerService.getUserInfo(authDto.intraId);
    if (userInfo === null) {
      console.log("No user -> 401 UNAUTHORIZED")
      throw new HttpException('회원정보가 존재하지 않습니다.', HttpStatus.UNAUTHORIZED);
    }
    const isMatched = await bcrypt.compare(authDto.password, userInfo.password);
    if (isMatched === false) {
      console.log("Wrong password -> 401 UNAUTHORIZED");
      throw new HttpException('비밀번호가 틀렸습니다.', HttpStatus.UNAUTHORIZED);
    }
    return (this.createJwtAccessToken(authDto.intraId));
  }

  async getJwtBy42OAuthCode(code: string) {
    const userBasicInfo : UserBasicInfo = await this.getUserInfoByCode(code);
    const userInfo: UserInfo = await this.dbmanagerService.getUserInfo(userBasicInfo.intraId);
    if (!userInfo) {
      throw new NotFoundException("not found user");
    } else {
      const defaultImage: string =
        "https://i.ytimg.com/vi/AwrFPJk_BGU/maxresdefault.jpg";
      if (userBasicInfo.photoUrl === null) {
        this.dbmanagerService.updateUserPhotoUrl(userInfo, defaultImage);
      } else {
        this.dbmanagerService.updateUserPhotoUrl(userInfo, userBasicInfo.photoUrl);
      }
      return this.createJwtAccessToken(userBasicInfo.intraId);
    }
  }


  async getUserInfoByCode(code: string) {
    const oauthAccessToken = await this.getOauthToken(code);
    let userBasicInfo: UserBasicInfo;

    await this.httpService.axiosRef
      .get('https://api.intra.42.fr/v2/me', {
        headers: {
          Authorization: `Bearer ${oauthAccessToken}`,
          'content-type': 'application/json',
        },
      })
      .then((res) => {
        userBasicInfo = {
          intraId: res.data.login,
          photoUrl: res.data.image.link,
        }
        console.log("api.intra.42.fr/v2/me 요청 성공");
      })
      .catch((err) => {
        console.log("api.intra.42.fr/v2/me 요청 실패");
        throw new HttpException({
          errorMessage: "api.intra.42.fr/v2/me 요청 실패"
        }, HttpStatus.NOT_FOUND);
      });
      return (userBasicInfo);
  }

}
