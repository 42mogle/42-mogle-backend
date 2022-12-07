import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { jwtConstants } from './jwtConstants';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserInfo } from 'src/dbmanager/entities/user_info.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(UserInfo)
    private usersRepository: Repository<UserInfo>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret
    });
  }

  async validate(payload: any): Promise<UserInfo> {
    //유저 확인
    console.log(`[ In validate ]`);
    console.log(`payload:`);
    console.log(payload);
    console.log(`payload.intraId:`);
    console.log(payload.intraId);
    const userInfo = await this.usersRepository.findOneBy(
      { intraId: payload.intraId })
    console.log(`userInfo:`);
    console.log(userInfo);
    if (userInfo === null)
      throw new HttpException('Invalid User', HttpStatus.FORBIDDEN);
    else
      return (userInfo);
  }
}
