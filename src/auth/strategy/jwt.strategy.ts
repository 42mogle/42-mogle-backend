import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { jwtConstants } from './jwtConstants';
import { LoginAuthDto } from '../dto/login-auth.dto';
import { Token } from '../auth.decorator';
import { CreateAuthDto } from '../dto/create-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from '../entities/auth.entity';
import { Repository } from 'typeorm';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectRepository(Auth)
    private usersRepository: Repository<Auth>,

  ) {
    // console.log("확인");
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload:any) {
    //유저 확인
    let isjoin = await this.usersRepository.findOneBy(
      {
        intraId: payload.intraId
      })
    if (isjoin === null)
    {
      console.log("존재하지 않는 회원");
      throw new HttpException('Invalid User', HttpStatus.FORBIDDEN);
    }
    return null;
  }
}
