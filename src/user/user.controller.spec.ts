import { Test, TestingModule } from '@nestjs/testing';
import { DbmanagerService } from '../dbmanager/dbmanager.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [
        UserController
      ],
      providers: [
        UserService,
        {
          provide: DbmanagerService,
          useValue: {}
        },
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: {}
        }
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
