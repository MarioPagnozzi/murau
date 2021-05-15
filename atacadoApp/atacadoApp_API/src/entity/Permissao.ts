import { Grupos } from './Grupos';
import { Column, Entity, ManyToOne, OneToOne } from "typeorm";
import { BaseEntity } from "./BaseEntity";

@Entity({name: "permissao"})
export class Permissao extends BaseEntity {
    
    @Column({type: "varchar", length: 100})
    tabela: string

    @Column({default: false})
    visualizar: boolean

    @Column({default: false})
    excluir: boolean

    @Column({default: false})
    alterar: boolean

    @Column({default: false})
    inserir: boolean

    @ManyToOne(type => Grupos, grupo => grupo.permissoes)
    grupo: Grupos
}