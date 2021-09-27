import { Clientes } from './Clientes';
import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Operadoras } from './enum/operadoras';

@Entity({name: "contatosclientes"})
export class ContatosClientes extends BaseEntity {
    
  
    @Column({type: "varchar", length: 2})
    ddd: string

    @Column({type: "varchar", length: 10})
    numero: string

    @Column()
    operadoras: Operadoras

    @ManyToOne(type => Clientes, cliente => cliente.contatos)
    cliente: Clientes
}