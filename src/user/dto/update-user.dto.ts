import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from '../../attendance/dto/create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
