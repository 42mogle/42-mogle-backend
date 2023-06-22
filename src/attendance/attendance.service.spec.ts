import { Test, TestingModule } from '@nestjs/testing';
import { OperatorService } from '../operator/operator.service';
import { DbmanagerService } from '../dbmanager/dbmanager.service';
import { AttendanceService } from './attendance.service';

describe('AttendanceService', () => {
  let service: AttendanceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        {
          provide: DbmanagerService,
          useValue: {}
        },
        {
          provide: OperatorService,
          useValue: {}
        },
      ],
    }).compile();

    service = module.get<AttendanceService>(AttendanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Add more tests here
});
