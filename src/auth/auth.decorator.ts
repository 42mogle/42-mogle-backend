import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const Token = createParamDecorator(
	(data: unknown, ctx: ExecutionContext) => {
		const header = ctx.switchToHttp().getRequest().headers;
		console.log(`request.hearder: `);
		console.log(header);
		return (header.authorization.split('Bearer ')[1]);
	}
)
