import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity()
@Unique(['intraId'])
export class User extends BaseEntity {
	@PrimaryGeneratedColumn()
	userId: number;

	@Column()
	intraId: string;

	@Column()
	password: string;

	@Column()
	isAdmin: boolean;

	@Column()
	photoURL: string;
}
