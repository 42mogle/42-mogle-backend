import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DbmanagerService } from './dbmanager.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('dbmanager')
export class DbmanagerController {
  constructor(private readonly dbmanagerService: DbmanagerService) {}

  @Post('/user')
  createUser(@Body() createUserDto: CreateUserDto) {
    console.log("in DbmanagerController.createUser()");
    console.log(createUserDto);
    return this.dbmanagerService.createUser(createUserDto);
  }

  @Get()
  findAll() {
    console.log("in DbmanagerController.findAll()");
    return this.dbmanagerService.findAll();
  }

  @Post('/test/month') 
  testMonthSet() {
    return this.dbmanagerService.setMonthInfo();
  }

  @Post('/test/day')
  testDaySet() {
	return this.dbmanagerService.setDayInfo();
  }
  
}
