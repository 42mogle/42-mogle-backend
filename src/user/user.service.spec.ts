import { Test, TestingModule } from '@nestjs/testing';
import { DbmanagerService } from '../dbmanager/dbmanager.service';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: DbmanagerService,
          useValue: {
            // Mock the methods of DbmanagerService that are used by UserService here.
            // For example, if UserService uses a method 'getUser', you could do:
            // getUser: jest.fn().mockImplementation(() => /* return value here */),
          }
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
