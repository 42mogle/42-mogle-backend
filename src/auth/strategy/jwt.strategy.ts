import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { jwtConstants } from './jwtConstants';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from '../entities/auth.entity';
import { Repository } from 'typeorm';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(Auth)
    private usersRepository: Repository<Auth>,
  ) {
    // console.log("확인");
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret
    });
  }

  async validate(payload:any) {
    //유저 확인
    let isjoin = await this.usersRepository.findOneBy(
      { intraId: payload.intraId })
      
      console.log(isjoin);
    if (isjoin === null)
      throw new HttpException('Invalid User', HttpStatus.FORBIDDEN);
    else
      return (payload);
  }
}
