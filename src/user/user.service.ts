import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { DbmanagerService } from 'src/dbmanager/dbmanager.service';
import { UserInfo } from 'src/dbmanager/entities/user_info.entity';
import { PasswordDto } from './dto/password.dto';
import * as bcrypt from 'bcrypt';
import { UserOperatorInfo } from './dto/userOperatorInfo.dto';

@Injectable()
export class UserService {
	@Inject(DbmanagerService)
	private readonly dbmanagerService: DbmanagerService;

	// todo: replace same function in AuthService to remove duplicated
	checkPasswordValid(pwd: string): boolean {
		const ruleRegex = 
		  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^\d\sa-zA-Z])[\S]{8,20}$/;
		// Explain : 비밀번호 길이는 8자 ~ 20자 사이
		if (pwd.length < 8 && 20 < pwd.length) {
		  return false;
		}
		// Explain : 특수문자, 대문자, 소문자, 길이 모두 확인하는 정규식
		else if (ruleRegex.test(pwd) === false) {
		  return false;
		} else {
		  return true;
		}
	  }

	async modifyUserPassword(userInfo: UserInfo, passwordDto: PasswordDto) {
		const saltOrRounds = 10;
		if (this.checkPasswordValid(passwordDto.password) === false) {
			throw new UnauthorizedException("비밀번호 규칙 오류");
		}
		userInfo.password = await bcrypt.hash(passwordDto.password, saltOrRounds);
		await this.dbmanagerService.updateUserInfoPassword(userInfo, userInfo.password);
		return ;
	}

	async getAllUsersOperatorInfo() {
		const usersInfo: UserInfo[] = await this.dbmanagerService.getAllUsersInfo();
		let usersOperatorInfo: UserOperatorInfo[] = [];
		for (const userInfo of usersInfo) {
			const userOperatorInfo: UserOperatorInfo = {
				intraId: userInfo.intraId,
				isOperator: userInfo.isOperator
			}
			usersOperatorInfo.push(userOperatorInfo);
		}
		return usersOperatorInfo;
	}
}
