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
  async getOauthToken(code: string) {
    const payload = {
      grant_type: 'authorization_code',
      client_id: 'u-s4t2ud-ffa1eb7dfe8ca1260f9d27ba33051536d23c76cd1ab09f489cb233c7e8e5e065',
      client_secret: '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',
      redirect_uri: 'https://42mogle.com//auth',
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
        throw new HttpException('oauth인증 코드를 얻는데 실패하였습니다', HttpStatus.FORBIDDEN);
      });
    return (ret);
  }

  //42api로부터 유저 정보 받아오기
  async getUserData(code: string) {
    let authDto: AuthDto;

    const accessToken = await this.getOauthToken(code);

    await this.httpService.axiosRef
      .get('https://api.intra.42.fr/v2/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'content-type': 'application/json',
        },
      })
      .then((res) => {
        authDto =
        {
          intraId : res.data.login,
          password: "",
          photoUrl : res.data.image.link,
          isOperator: false
        }
        console.log("getUserData 성공");
      })
      .catch((err) => {
        console.log("getUserData 에러");
        throw new HttpException('42회원 정보가 존재하지 않습니다.', HttpStatus.FORBIDDEN);
      });
    return (authDto);
  }

  //JWT 액세스 토큰 발행
  createrAcessToken(authDto: AuthDto)
  {
    let intraId: string = authDto.intraId;
    const payload = { intraId };
    const accessToken = this.jwtService.sign(payload)
    return (accessToken);
  }

  async login(response:Response, authDto:AuthDto) 
  {
    /* 
      디비에 아이디 정보 있는지 확인
      정보 있을시
        토큰 발행
      정보 없을시
        에러코드 반환 || 에러 반환
    */
    const user = new UserInfo();

    let userInfo = await this.usersRepository.findOneBy({ intraId: authDto.intraId });
    if (userInfo !== null) {

      const isMatch = await bcrypt.compare(authDto.password, userInfo.password);

      if ((userInfo.intraId == authDto.intraId) && isMatch)
      {
        console.log("유저 확인 : " + userInfo.intraId);
        return(this.createrAcessToken(authDto));
      }
      // return (accessToken);
      // response.cookie("accessToken", accessToken);
    }
    else
      throw new HttpException('회원정보가 존재하지 않습니다.', HttpStatus.FORBIDDEN);
  }

  //회원가입1 oauth인증
  async firstJoin(code: string) {
    let authDto: AuthDto = await this.getUserData(code);
    let userInfo = await this.usersRepository.findOneBy({ intraId: authDto.intraId })

    if (userInfo !== null)
    {
      console.log("이미 존재하는 회원");
      throw new HttpException({errorMessage: "이미 존재하는 회원입니다.",intraId: userInfo.intraId}, HttpStatus.FORBIDDEN);
    }
    return (authDto);
  }

  //회원가입2 유저가 기입한 정보로 회원가입
  async secondJoin(authDto: AuthDto) {
    const user = new UserInfo();
    const saltOrRounds = 10;
    
    let userInfo = await this.usersRepository.findOneBy(
      {
        intraId: authDto.intraId
      })
      if (userInfo === null) {
        //회원가입
        console.log("회원가입");
        user.intraId = authDto.intraId;
        user.password = await bcrypt.hash(authDto.password, saltOrRounds);
        // user.password = authDto.password;
        user.photoUrl = authDto.photoUrl;
        user.isOperator = authDto.isOperator;
        console.log(user)
        await this.usersRepository.save(user);
      return authDto.intraId;
    }
    else {
      console.log("이미 존재하는 회원");
      throw new HttpException('이미 존재하는 회원입니다.', HttpStatus.FORBIDDEN);
    }
  }

  async DeleteUser(intraId:string)
  {
    return (await this.usersRepository.delete({ intraId: intraId }));
  }
}
