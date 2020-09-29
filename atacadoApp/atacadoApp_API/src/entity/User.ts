import { BaseStatus } from './enum/status';
import { Grupos } from './Grupos';
import {Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinColumn, JoinTable} from "typeorm";
import { BaseEntity } from "./BaseEntity";

@Entity({name: "usuarios"})
export class User extends BaseEntity {

   
    @Column({type: "varchar", length: 100})
    nome: string;

    @Column({type: "varchar", length: 250, unique: true})
    email: string;

    @Column({type: "varchar", length: 200})
    senha: string;

    @Column({type: "varchar", length: 200, nullable: true})
    foto: string;

    @Column({default: false})
    isRoot: boolean;

    @Column()
    status_usuario: BaseStatus

    @ManyToMany(type => Grupos, grupo => grupo.usuarios, {eager: true})
    @JoinTable()
    grupos: Grupos[]
}
