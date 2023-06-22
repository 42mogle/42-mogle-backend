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
      const result: Boolean = true;
      let date: Date = new Date(2023, 5, 22);
      expect(attendanceService.isWeekday(date)).toBe(result);
    });
    it('should return false in a weekend', () => {
      const result: Boolean = false;
      let date: Date = new Date(2023, 5, 24);
      expect(attendanceService.isWeekday(date)).toBe(result);
    });
  });

  describe('isWeekend', () => {
    it('should return true in a weekend', () => {
      const result: Boolean = true;
      let date: Date = new Date(2023, 5, 24);
      expect(attendanceService.isWeekend(date)).toBe(result);
    });
    it('should return false in a weekday', () => {
      const result: Boolean = false;
      let date: Date = new Date(2023, 5, 22);
      expect(attendanceService.isWeekend(date)).toBe(result);
    });
  });

  describe('isAvailableTime', () => {
    it('should return true when available time', () => {
      const result: Boolean = true;
      const fixedDate = new Date();
      fixedDate.setHours(10, 0, 0)
      expect(attendanceService.isAvailableTime(fixedDate)).toBe(result);
      fixedDate.setHours(9, 42, 0)
      expect(attendanceService.isAvailableTime(fixedDate)).toBe(result);
      fixedDate.setHours(10, 12, 0)
      expect(attendanceService.isAvailableTime(fixedDate)).toBe(result);
    });
    it('should return false when not available time', () => {
      const result: Boolean = false;
      const fixedDate = new Date();
      fixedDate.setHours(12, 0, 0)
      expect(attendanceService.isAvailableTime(fixedDate)).toBe(result);
      fixedDate.setHours(9, 41, 0)
      expect(attendanceService.isAvailableTime(fixedDate)).toBe(result);
      fixedDate.setHours(10, 13, 0)
      expect(attendanceService.isAvailableTime(fixedDate)).toBe(result);
    });
  });

  // Add more tests here
});
