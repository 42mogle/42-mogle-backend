import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserInfo } from '../dbmanager/entities/user_info.entity';

export const GetUserInfo = createParamDecorator((data, ctx: ExecutionContext): UserInfo => {
	const req = ctx.switchToHttp().getRequest();
	const retUserInfo = req.userInfo;
	console.log(`[ In GetUserInfo ]`);
	//console.log(`request:`);
	//console.log(req);
	console.log(`request.user:`);
	console.log(req.user);
	console.log(`request.user.UserInfo:`);
	console.log(req.user.UserInfo);
	console.log(`retUserInfo:`);
	console.log(retUserInfo);
	return req.userInfo;
})
