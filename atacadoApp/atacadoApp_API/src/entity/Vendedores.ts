import { VendedoresEmpresas } from './VendedoresEmpresas';
import { Pedidos } from './Pedidos';
import { Clientes } from './Clientes';
import { ContatosVendedores } from './ContatosVendedores';
import { Column, Entity, JoinTable, ManyToMany, OneToMany, OneToOne } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { Empresas } from './Empresas';
import { User } from './User';
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

    @Column({type: "varchar", length: 250, nullable: true})
    email: string

    @Column({type: "varchar", length: 100})
    cidade: string

    @Column({type: "varchar", length: 100,  nullable: true})
    complemento: string

    @Column({type: "varchar", length: 2})
    uf: string

    @Column({type: "varchar", length: 9, nullable: true})
    cep: string

    @OneToMany(type => ContatosVendedores, contatos => contatos.vendedor, {nullable: true, eager: true})
    contatos: Promise<ContatosVendedores[]>

    @OneToMany(type => Clientes, clientes => clientes.vendedor, {nullable: true})
    clientes: Promise<Clientes[]>

    @OneToMany(type => Pedidos, pedidos => pedidos.vendedor, {nullable: true})
    pedidos: Promise<Pedidos[]>

    /*@OneToMany(type => VendedoresEmpresas, vendedoresEmpresas => vendedoresEmpresas.vendedor,{eager: true})
    empresas: VendedoresEmpresas[]*/
    @ManyToMany(type => Empresas, empresas => empresas.vendedores)
    @JoinTable({name: "vendedores_empresas"})
    empresas: Promise<Empresas[]>

    @OneToOne(type => User, usuario => usuario.vendedor)
    usuario: Promise<User>
}