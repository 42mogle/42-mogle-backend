import { PartialType } from '@nestjs/mapped-types';
import { CreateDbmanagerDto } from './create-dbmanager.dto';

export class UpdateDbmanagerDto extends PartialType(CreateDbmanagerDto) {}
