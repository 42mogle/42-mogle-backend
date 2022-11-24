import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { MonthInfo } from "./month_info.entity";
import { UserInfo } from "./user_info.entity";

@Entity()
@Unique(['monthInfo', 'userInfo'])
export class MonthlyUsers {
	@PrimaryGeneratedColumn({ name: "id" })
	id: number;

	@Column({ name: "AttendanceCount" })
	attendanceCount: number;

	@Column({ name: "isPerfect" })
	isPerfect: boolean;

	@Column({ name: "totalPerfectCount" })
	totalPerfectCount: number;

	@ManyToOne(
		() => MonthInfo, 
		(monthInfo) => monthInfo.monthlyUsers
	)
	@JoinColumn({ 
		name: "monthInfoId", 
		referencedColumnName: "id" 
	})
	monthInfo: MonthInfo;

	@ManyToOne(
		() => UserInfo,
		(user_info) => user_info.monthlyUsers
	)
	@JoinColumn({ 
		name: "userInfoId", 
		referencedColumnName: "id" 
	})
	userInfo: UserInfo;
}
