import { Test, TestingModule } from '@nestjs/testing';
import { DbmanagerService } from './dbmanager.service';

describe('DbmanagerService', () => {
  let service: DbmanagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DbmanagerService],
    }).compile();

    service = module.get<DbmanagerService>(DbmanagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
