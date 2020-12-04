import { VendedoresEmpresas } from './VendedoresEmpresas';
import { Pedidos } from './Pedidos';
import { Clientes } from './Clientes';
import { ContatosVendedores } from './ContatosVendedores';
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { Empresas } from './Empresas';
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

    @OneToMany(type => ContatosVendedores, contatos => contatos.vendedor, {nullable: true, eager: true})
    contatos: ContatosVendedores[]

    @OneToMany(type => Clientes, clientes => clientes.vendedor, {nullable: true})
    clientes: Clientes[]

    @OneToMany(type => Pedidos, pedidos => pedidos.vendedor, {nullable: true})
    pedidos: Pedidos[]

    /*@OneToMany(type => VendedoresEmpresas, vendedoresEmpresas => vendedoresEmpresas.vendedor,{eager: true})
    empresas: VendedoresEmpresas[]*/
    @ManyToMany(type => Empresas, empresas => empresas.vendedores, {eager: true})
    @JoinTable({name: "vendedores_empresas"})
    empresas: Empresas[]
}