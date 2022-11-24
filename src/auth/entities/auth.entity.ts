import { Column, Entity, PrimaryColumn, Unique } from "typeorm";

@Entity('Auth')
export class Auth {
    @PrimaryColumn()
    intraId: string;
    
    @Column({ length: 30 })
    password: string;
  
    @Column()
    imageURL: string;
}
