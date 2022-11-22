import { Injectable } from '@nestjs/common';
import { CreateDbmanagerDto } from './dto/create-dbmanager.dto';
import { UpdateDbmanagerDto } from './dto/update-dbmanager.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/dbmanager/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DbmanagerService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
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
}
