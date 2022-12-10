import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserInfo } from 'src/dbmanager/entities/user_info.entity';
import * as config from 'config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(UserInfo)
    private usersRepository: Repository<UserInfo>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || config.get('jwt.secret'),
    });
  }

  async validate(payload: any): Promise<UserInfo> {
    const userInfo = await this.usersRepository.findOneBy({
      intraId: payload.intraId
    });
    if (userInfo === null) {
      throw new HttpException('Invalid User', HttpStatus.FORBIDDEN);
    }
    return (userInfo);
  }
}
