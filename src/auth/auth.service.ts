import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import {HttpService} from '@nestjs/axios'

@Injectable()
export class AuthService {
  constructor(private readonly httpService: HttpService) {}


  async getAccessToken(code: string)
  {
    const payload = {
      grant_type: 'authorization_code',
      client_id: 'u-s4t2ud-fe0450158bd57a0967d25286f60a880e9dfeaf974652aa249d4b9700a2251a1b',
      client_secret: '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',
      redirect_uri: 'http://localhost:3000/auth/login',
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
    })
    .catch((err) => {
      // console.log(err);
    });
    return (ret);
  }

  async getUserData(accessToken : string)
  {
    let ret: string;
    await this.httpService.axiosRef
      .get('https://api.intra.42.fr/v2/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
      },
    })
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      // console.log(err);
    });
    return (ret);
  }

  async login(code: string)
  {
 
    const accessTaken = await this.getAccessToken(code);
    this.getUserData(accessTaken);

    return ;
  }

  create(createAuthDto: CreateAuthDto) {
    return 'This action adds a new auth';
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
