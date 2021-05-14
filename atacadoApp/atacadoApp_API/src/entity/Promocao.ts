import { Column, Entity, ManyToMany, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';

@Entity({name: "promocao"})
export class Promocao extends BaseEntity {
    
    @Column({type: "varchar", length:"50"})
    codigo_promocao: string

    @Column({type: "varchar", length:"100"})
    desc_promocao: string

    @Column({type: "varchar", length:"50"})
    desc_referencia: string

    @Column({type: "varchar", length:"50"})
    cod_produto: string

    @Column({type: "datetime"})
    data_inicio: Date

    @Column({type: "datetime"})
    data_final: Date

    @Column({type: "float"})
    vlr_anterior: number

    @Column({type: "float"})
    vlr_promocao: number
}