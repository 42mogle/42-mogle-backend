import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: "JWT_DEFAULT_SECRET",
      signOptions:{
        expiresIn: 60 * 60 * 10
      }
    })
  ],

  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
