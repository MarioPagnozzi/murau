import { Vendedores } from './Vendedores';
import { Column, ManyToOne } from 'typeorm';
import { Entity } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Operadoras } from './enum/operadoras';

@Entity({name: "contatosvendedores"})
export class ContatosVendedores extends BaseEntity {

    @Column({type: "varchar", length: 2})
    ddd: string

    @Column({type: "varchar", length: 10})
    numero: string

    @Column()
    operadoras: Operadoras

    @ManyToOne(type => Vendedores, vendedores => vendedores.contatos)
    vendedor: Promise<Vendedores>
}