import { HttpException, HttpStatus, Injectable, Res } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { HttpService } from '@nestjs/axios'
import { User } from 'src/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { LoginAuthDto } from './dto/login-auth.dto';


@Injectable()
export class AuthService {
  constructor(
    private readonly httpService: HttpService,
    private jwtService: JwtService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }



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
        // console.log(err);
        console.log("getAccessToken 에러");
      });
    return (ret);
  }

  async getUserData(code: string) {
    let createAuthDto: CreateAuthDto;

    const accessToken = await this.getOauthToken(code);

    console.log("check00");
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
          // console.log(res.data);
        createAuthDto =
        {
          intraId,
          imageURL,
          password: '1234'
        }
        console.log("getUserData 성공");
      })
      .catch((err) => {
        console.log("getUserData 에러");
      });
    return (createAuthDto);
  }

  createrAcessToken(loginAuthDto: LoginAuthDto) {
    let intraId: string = loginAuthDto.intraId;
    const payload = { intraId };
    const accessToken = this.jwtService.sign(payload,
      {
        secret: "42mogle"
      });
    return (accessToken);
  }

  async login(response: Response, loginAuthDto: LoginAuthDto) {
    /* 
      디비에 아이디 정보 있는지 확인
      정보 있을시
        토큰 발행
      정보 없을시
        에러코드 반환 || 에러 반환
    */


    // if (!createAuthDto) {
    // throw new HttpException('Invalid User', HttpStatus.BAD_REQUEST);
    // }

    const user = new User();

    let tmp = await this.usersRepository.findOneBy(
      {
        intraId: loginAuthDto.intraId
      })
    if (tmp) {
      //로그인
      //토큰 발행
      const accessToken = this.createrAcessToken(loginAuthDto);
      response.cookie('accessToken', accessToken);
    }
    else {
      throw new HttpException('Invalid User', HttpStatus.BAD_REQUEST);
    }

    // jwt토큰 발행
    // return accessToken;
  }


  async firstJoin(code: string) {
    return (await this.getUserData(code));
  }

  async secondJoin(createAuthDto: CreateAuthDto) {
    const user = new User();
    let tmp = await this.usersRepository.findOneBy(
      {
        intraId: createAuthDto.intraId
      })
    if (!tmp) {
      //회원가입
      console.log("회원가입");
      user.intraId = createAuthDto.intraId;
      //해시 처리해야함
      user.password = createAuthDto.password;
      user.imageURL = createAuthDto.imageURL;
      await this.usersRepository.save(user);
    }
    else {
      console.log("이미 존재하는 회원");
    }
  }
}
