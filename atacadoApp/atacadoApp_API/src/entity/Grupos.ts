import { User } from './User';
import { Column, Entity, ManyToMany, OneToMany, OneToOne } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { Permissao } from "./Permissao";

@Entity({ name: "grupos"})
export class Grupos extends BaseEntity {

    @Column({type: "varchar", length: 50, unique: true })
    nome_grupo: string

    @OneToMany(type => Permissao, permissao => permissao.grupo)
    permissoes: Promise<Permissao[]>

    @ManyToMany(type => User, usuarios => usuarios.grupos)
    usuarios: Promise<User[]>
}