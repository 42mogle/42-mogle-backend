import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateDbmanagerDto } from './dto/create-dbmanager.dto';
import { UpdateDbmanagerDto } from './dto/update-dbmanager.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/dbmanager/entities/user.entity';
import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { Cron, Interval } from '@nestjs/schedule';
import { MonthInfo } from './entities/month.info.entity';
import { NotFoundError } from 'rxjs';

@Injectable()
export class DbmanagerService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
	@InjectRepository(MonthInfo) private monthRepository: Repository<MonthInfo>
  ) {}

  async findUser(intraId: string) {
    const found = await this.usersRepository.findOne({where: { intraId }});

    return found;
  }

  createUser(createUserDto: CreateUserDto) {
    console.log(createUserDto);
    const user = new User();
    user.intraId = createUserDto.intraId;
    user.password = createUserDto.password;
    user.isAdmin = false;
    user.photoURL = "abc";
    this.usersRepository.create(user);
    return this.usersRepository.save(user);
  }

  create(createDbmanagerDto: CreateDbmanagerDto) {
    return 'This action adds a new dbmanager';
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} dbmanager`;
  }

  update(id: number, updateDbmanagerDto: UpdateDbmanagerDto) {
    return `This action updates a #${id} dbmanager`;
  }

  remove(id: number) {
    return `This action removes a #${id} dbmanager`;
  }


  

async setMonthInfo(): Promise<any> {
	var now = new Date();
	const Year = now.getFullYear();
	const month = now.getMonth() + 4;
	const found = await this.monthRepository.findOne({where: {Year, month}});
	if (found)
		throw new NotFoundException("이미 있슴;;");
	const monthinfo = new MonthInfo();
	monthinfo.Year = Year
	monthinfo.month = month;
	monthinfo.failUserCount = 0;
	monthinfo.totalAttendance = 0;
	monthinfo.perfcetUserCount = 0;
	this.monthRepository.create(monthinfo);
	return this.monthRepository.save(monthinfo);
  }

}
