import { Body, Controller, Get, Post } from '@nestjs/common';
import { get } from 'http';
import { AppService } from './app.service';
import { DbmanagerService } from './dbmanager/dbmanager.service';

@Controller()
export class AppController {
  constructor(
    	private readonly appService: AppService, 
    	private dbm_serv: DbmanagerService
    ) {}

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
