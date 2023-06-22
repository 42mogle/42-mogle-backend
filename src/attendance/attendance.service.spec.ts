import { Test, TestingModule } from '@nestjs/testing';
import { OperatorService } from '../operator/operator.service';
import { DbmanagerService } from '../dbmanager/dbmanager.service';
import { AttendanceService } from './attendance.service';
import { UserInfo } from '../dbmanager/entities/user_info.entity';
import { Attendance } from '../dbmanager/entities/attendance.entity';
import { DayInfo } from '../dbmanager/entities/day_info.entity';
import { MonthInfo } from '../dbmanager/entities/month_info.entity';
import { MonthlyUsers } from '../dbmanager/entities/monthly_users.entity';

describe('AttendanceService', () => {
  let attendanceService: AttendanceService;
  let dbmanagerService: DbmanagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        {
          provide: DbmanagerService,
          useValue: {
            getTodayInfo: jest.fn().mockResolvedValue(null),
            getAttendance: jest.fn().mockResolvedValue(null),
          }
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
      fixedDate.setHours(9, 42, 1)
      expect(attendanceService.isAvailableTime(fixedDate)).toBe(result);
      fixedDate.setHours(10, 11, 59)
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

  describe('hasAttendedToday', () => {
    let userInfo: UserInfo;
    let todayInfo: DayInfo;
    let todayAttendanceInfo: Attendance;
    
    beforeEach(() => {
      userInfo = {
        id: 1,
        intraId: 'testIntraId',
        password: 'testPassword',
        isOperator: false,
        photoUrl: null,
        isSignedUp: true,
        attendances: [],
        monthlyUsers: []
      };
  
      todayInfo = {
        id: 1,
        day: 22,
        type: 0,
        attendUserCount: 0,
        perfectUserCount: 0,
        todayWord: 'testWord',
        monthInfo: null,
        attendances: []
      };
  
      todayAttendanceInfo = {
        id: 1,
        timelog: new Date(),
        userInfo,
        dayInfo: todayInfo
      };
    });
  
    it('should return true if user has attended today', async () => {
      jest.spyOn(attendanceService['dbmanagerService'], 'getTodayInfo')
        .mockResolvedValue(todayInfo);
      jest.spyOn(attendanceService['dbmanagerService'], 'getAttendance')
        .mockResolvedValue(todayAttendanceInfo);
  
      expect(await attendanceService.hasAttendedToday(userInfo)).toBe(true);
    });
  
    it('should return false if user has not attended today', async () => {
      jest.spyOn(attendanceService['dbmanagerService'], 'getTodayInfo')
        .mockResolvedValue(todayInfo);
      jest.spyOn(attendanceService['dbmanagerService'], 'getAttendance')
        .mockResolvedValue(null);
  
      expect(await attendanceService.hasAttendedToday(userInfo)).toBe(false);
    });
  });
  
});
