import { Test, TestingModule } from '@nestjs/testing';
import { DbmanagerController } from './dbmanager.controller';
import { DbmanagerService } from './dbmanager.service';

describe('DbmanagerController', () => {
  let controller: DbmanagerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DbmanagerController],
      providers: [DbmanagerService],
    }).compile();

    controller = module.get<DbmanagerController>(DbmanagerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
