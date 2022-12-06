import { BaseEntity, Column, Entity, OneToMany, PrimaryColumn, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Attendance } from "./attendance.entity";
import { MonthlyUsers } from "./monthly_users.entity";

@Entity()
export class UserInfo {
	@PrimaryGeneratedColumn({name: "id"})
	id: number;

	@Column({name: "intra_id"})
	intraId: string;

	@Column({name: "password", nullable: true})
	password: string;

	@Column({name: "is_operator"})
	isOperator: boolean;

	@Column({name: "photo_url", nullable: true})
	photoUrl: string;

	@Column({name: "is_signed_up"})
	isSignedUp: boolean;

	@OneToMany(
		() => Attendance, 
		(attendance) => attendance.userInfo
	)
	attendances: Attendance[];

	@OneToMany(
		() => MonthlyUsers, 
		(monthlyUsers) => monthlyUsers.userInfo
	)
	monthlyUsers: MonthlyUsers[];
}
