import { Test, TestingModule } from '@nestjs/testing';
import { OperatorService } from '../operator/operator.service';
import { DbmanagerService } from '../dbmanager/dbmanager.service';
import { AttendanceService } from './attendance.service';

describe('AttendanceService', () => {
  let attendanceService: AttendanceService;

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

    attendanceService = module.get<AttendanceService>(AttendanceService);
  });

  it('should be defined', () => {
    expect(attendanceService).toBeDefined();
  });
  
  describe('isWeekday', () => {
    it('should return true in a weekday', () => {
      let date: Date = new Date(2023, 5, 22);
      const result: Boolean = true;
      expect(attendanceService.isWeekday(date)).toBe(result);
    });
    it('should return false in a weekend', () => {
      let date: Date = new Date(2023, 5, 24);
      const result: Boolean = false;
      expect(attendanceService.isWeekday(date)).toBe(result);
    });
  });

  describe('isWeekend', () => {
    it('should return true in a weekend', () => {
      let date: Date = new Date(2023, 5, 24);
      const result: Boolean = true;
      expect(attendanceService.isWeekend(date)).toBe(result);
    });
    it('should return false in a weekday', () => {
      let date: Date = new Date(2023, 5, 22);
      const result: Boolean = false;
      expect(attendanceService.isWeekend(date)).toBe(result);
    });
  });

  // Add more tests here
});
