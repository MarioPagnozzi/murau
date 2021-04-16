import { BaseStatus } from './enum/status';
import { Grupos } from './Grupos';
import {Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinColumn, JoinTable, OneToOne} from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { Clientes } from './Clientes';
import { Vendedores } from './Vendedores';

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

    @OneToOne(type => Clientes, cliente => cliente.usuario, {eager: true, nullable: true})
    @JoinColumn()
    cliente: Clientes

    @OneToOne(type => Vendedores, vendedor => vendedor.usuario, {eager: true, nullable: true})
    @JoinColumn()
    vendedor: Vendedores
}
