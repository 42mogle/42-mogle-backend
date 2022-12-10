import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategy/jwt.strategy';
import { UserInfo } from 'src/dbmanager/entities/user_info.entity';
import * as config from 'config';

const jwtConfig = config.get('jwt');

@Module({
  imports: [
    HttpModule,
    PassportModule,
    TypeOrmModule.forFeature([UserInfo]),
    JwtModule.register({
      secret: jwtConfig.secret,
      signOptions:{
        expiresIn: jwtConfig.expiresIn
      }
    })
  ],

  controllers: [AuthController],
  providers: [AuthService, JwtStrategy]
})
export class AuthModule {}
