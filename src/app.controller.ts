import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    	private readonly appService: AppService,
    ) {}

	@Get('/')
	getDefault(): string {
		return (this.appService.getDefault());
	}

	@Get('/server-status')
	@ApiOperation({
		summary: 'check if server is turned on.',
		description: '서버가 켜져있으면 200 반환'
	})
	@ApiResponse({
		status: 200,
		description: 'Success',
	})
	getServerStatus(): string {
		return (this.appService.getServerStatus());
	}

	@Get('/test')
	testGet() {
		console.log(`get test requested`);
		return (this.appService.getHello());
	}

	@Post('/test')
	testPost(@Body() body) {
		console.log(`post test requested!`);
		console.log(`body: `);
		console.log(body);
		return (this.appService.getHello());
	}
}
