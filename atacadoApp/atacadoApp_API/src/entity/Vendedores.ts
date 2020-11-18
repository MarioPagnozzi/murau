import { Pedidos } from './Pedidos';
import { Clientes } from './Clientes';
import { ContatosVendedores } from './ContatosVendedores';
import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { VendedoresEmpresas } from './VendedoresEmpresas';

@Entity({ name: "vendedores"})
export class Vendedores extends BaseEntity {

    @Column({type: "int"})
    codigo: number

    @Column({type: "varchar"})
    nome: string
    
    @Column({type: "varchar", length: 200})
    endereco: string

    @Column({type: "varchar", length: 10})
    numero: string

    @Column({type: "varchar", length: 200})
    bairro: string

    @Column({type: "varchar", length: 100})
    cidade: string

    @Column({type: "varchar", length: 2})
    uf: string

    @OneToMany(type => ContatosVendedores, vendedor => Vendedores, {nullable: true, eager: true})
    contatos: ContatosVendedores[]

    @OneToMany(type => Clientes, vendedor => Vendedores, {nullable: true})
    clientes: Clientes[]

    @OneToMany(type => Pedidos, vendedor => Vendedores, {nullable: true})
    pedidos: Pedidos[]

    @OneToMany(type => VendedoresEmpresas, vendedoresempresas => vendedoresempresas.vendedor)
    vendedoresempresas: VendedoresEmpresas[]
}