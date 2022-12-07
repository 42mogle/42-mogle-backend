import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserInfo } from '../dbmanager/entities/user_info.entity';

export const GetUserInfo = createParamDecorator((data, ctx: ExecutionContext): UserInfo => {
	const req = ctx.switchToHttp().getRequest();
	return req.user;
})
