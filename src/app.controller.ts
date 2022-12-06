import { Controller, Get } from '@nestjs/common';
import { get } from 'http';
import { AppService } from './app.service';
import { DbmanagerService } from './dbmanager/dbmanager.service';

@Controller()
export class AppController {
  constructor(
    	private readonly appService: AppService, 
    	private dbm_serv: DbmanagerService
    ) {}

	@Get()
	test() {
		return (this.appService.getHello());
	}
}
