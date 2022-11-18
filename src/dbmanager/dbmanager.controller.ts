import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DbmanagerService } from './dbmanager.service';
import { CreateDbmanagerDto } from './dto/create-dbmanager.dto';
import { UpdateDbmanagerDto } from './dto/update-dbmanager.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('dbmanager')
export class DbmanagerController {
  constructor(private readonly dbmanagerService: DbmanagerService) {}

  @Post('/user')
  createUser(@Body() createUserDto: CreateUserDto) {
    console.log(createUserDto);
    return this.dbmanagerService.createUser(createUserDto);
  }

  @Post()
  create(@Body() createDbmanagerDto: CreateDbmanagerDto) {
    return this.dbmanagerService.create(createDbmanagerDto);
  }

  @Get()
  findAll() {
    return this.dbmanagerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dbmanagerService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDbmanagerDto: UpdateDbmanagerDto) {
    return this.dbmanagerService.update(+id, updateDbmanagerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dbmanagerService.remove(+id);
  }
}
