import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Auth } from './entities/auth.entity';
import { PassportModule } from '@nestjs/passport';
import { jwtConstants } from './strategy/jwtConstants';
import { JwtStrategy } from './strategy/jwt.strategy';


@Module({
  imports: [

    HttpModule,
    PassportModule,
    TypeOrmModule.forFeature([Auth]),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions:{
        expiresIn: 60 * 60 * 10
      }
    })
  ],

  controllers: [AuthController],
  providers: [AuthService, JwtStrategy]
})
export class AuthModule {}
