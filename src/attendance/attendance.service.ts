import { Inject, Injectable } from '@nestjs/common';
import { userInfo } from 'os';
import { endWith, NotFoundError } from 'rxjs';
import { DbmanagerService } from 'src/dbmanager/dbmanager.service';

@Injectable()
export class AttendanceService {
	@Inject(DbmanagerService) private readonly dbmanagerService: DbmanagerService;


	getUserButtonStatus(intraId: string): number {
		var status: number = 0;
		if (!this.isCurrentTime()) {
			return 1;
		}
		/*if (!this.isAttendance(intraId)) {

		}*/

		return status;
	}

	/*
		버튼 상태
		0: 출석체크 가능
		1: 이미 출석체크 함
		2: 출석체크 시간이 아님
		3: 서버 오류
	*/



	// getUserButtonStatus(argIntraId: string): any {
	// 	let retButtonStatus = 3;
	// 	console.log("In AttendanceService.getUserButtonStatus()")

	// 	console.log("argIntraId:", argIntraId);
		
	// 	// 출석 체크 시간 체크
	// 	const datetimeOne = new Date();
	// 	datetimeOne.setHours(8, 30, 0);
	// 	console.log("datetimeOne", datetimeOne);
	// 	console.log("datetimeOne(KST)", datetimeOne.toLocaleString());

	// 	const datetimeTwo = new Date();
	// 	datetimeTwo.setHours(9, 0, 0);
	// 	console.log("datetimeTwo", datetimeTwo);
	// 	console.log("datetimeTwo(KST)", datetimeTwo.toLocaleString());
	// 	console.log();

	// 	// to get current time
	// 	const datetimeCurr = new Date();
	// 	console.log("datetimeCurr", datetimeCurr);
	// 	console.log("datetimeCurr(KST)", datetimeCurr.toLocaleString());
		
	// 	if ((datetimeOne < datetimeCurr) && (datetimeCurr < datetimeTwo)) {
	// 		// 출석체크 유무 검증
	// 		//  -> DB Attendance table에 오늘 유저의 출석 데이터가 있는지 확인
	// 		this.dbmanagerService.findUser(argIntraId);
	// 	} else {
	// 		retButtonStatus = 2;
	// 		if ((datetimeCurr < datetimeOne)) {
	// 			console.log("Refuse: The current time is too early!");
	// 		} else if (datetimeCurr > datetimeTwo) {
	// 			console.log("Refuse: The current time is too late!")
	// 		}
	// 	}
	// 	return { retButtonStatus };
	// }

	/***********************************
     * 			util function list     *
     ********************************* */
	
	isCurrentTime() {
		const now = new Date();
		const start = new Date();
		const end = new Date();
		start.setHours(8, 0, 0);
		end.setHours(8, 30, 0);
		if (now < start || now > end)
			return (0);		
		else
			return (1);
	}

	async isAttendance(intra_id: string): Promise<boolean> {
		const dayId = await this.dbmanagerService.getDayId();
		const userId = await this.dbmanagerService.getUserId(intra_id)
		const found = await this.dbmanagerService.getAttendanceUserInfo(userId, dayId);
		return true
	}

	
}
