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
  //   const ret = await this.dbm_serv.setDayInfo();
  //   console.log(ret);
  //   return "Executed test";
  // }
}
