import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserInfo } from '../dbmanager/entities/user_info.entity';

export const GetUserInfo = createParamDecorator((data, ctx: ExecutionContext): UserInfo => {
	const req = ctx.switchToHttp().getRequest();
	const retUserInfo = req.userInfo;
	console.log(`[ In GetUserInfo ]`);
	console.log(`retUserInfo:`);
	console.log(retUserInfo);
	return req.userInfo;
})
