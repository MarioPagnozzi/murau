import { Pedidos } from './Pedidos';
import { Empresas } from './Empresas';
import { Vendedores } from './Vendedores';
import { ContatosClientes } from './ContatosClientes';
import { OneToMany, ManyToOne, Column, Entity, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { BaseStatus } from './enum/status';
import { User } from './User';
@Entity({name: "clientes"})
export class Clientes extends BaseEntity {

    @Column({type: "int"})
    codigo: number

    @Column({type: "varchar", length: 200 })
    razao_social: string

    @Column({type: "varchar", length: 200})
    nome_fantasia: string

    @Column({type: "varchar", length: 18})
    cnpj: string

    @Column({type: "varchar", length: 9})
    cep: string

    @Column({type: "varchar", length: 200})
    endereco: string

    @Column({type: "varchar", length: 100,  nullable: true})
    complemento: string

    @Column({type: "varchar", length: 10})
    numero: string

    @Column({type: "varchar", length: 200})
    bairro: string

    @Column({type: "varchar", length: 100})
    cidade: string

    @Column({type: "varchar", length: 2})
    uf: string
    
    @Column({type: "varchar", length: 200, nullable: true})
    email: string

    @Column({type: "int", default: 1})
    statusCliente: BaseStatus;

    @OneToMany(type => ContatosClientes, contatos => contatos.cliente, {eager: true})
    contatos: ContatosClientes[]
    
    @ManyToOne(type => Vendedores, vendedores => vendedores.clientes, {eager: true, nullable: true})
    vendedor: Vendedores

    @ManyToOne(type => Empresas, empresa => empresa.clientes, {eager: true, nullable: true})
    empresa: Empresas

    @OneToMany(type => Pedidos, pedidos => pedidos.cliente)
    pedidos: Promise<Pedidos[]>

    @OneToOne(type => User, usuarios => usuarios.cliente, {nullable: true})
    usuario: User
}