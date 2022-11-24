import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { DbmanagerService } from './dbmanager/dbmanager.service';

@Controller()
export class AppController {
  constructor(
    	private readonly appService: AppService, 
    	private dbm_serv: DbmanagerService
    ) {}

  // @Get()
  // async getHello(): Promise<any> {
  //   //await this.appService.testDBTables();
  //   return 'Complete: Test DB Tables';
  // }
}
