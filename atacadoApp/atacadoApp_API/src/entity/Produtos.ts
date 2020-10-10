import { ProdutosEmpresas } from './ProdutosEmpresas';
import { ImagensProduto } from './imagesProduto';
import { JoinTable, OneToMany } from 'typeorm';
import { Empresas } from './Empresas';
import { ManyToMany } from 'typeorm';
import { Column } from 'typeorm';
import { Entity } from 'typeorm';
import { BaseEntity } from './BaseEntity';
@Entity({name: "produtos"})
export class Produtos extends BaseEntity {

    @Column({type: "varchar", length: 200})
    nome: string

    @Column({type: "text"})
    descricao: string
    
    @Column({type: "varchar", length: 100})
    referencia: string

    @Column({type: "varchar", length: 100})
    codigo: string    
    
    @Column({type: "varchar", length: 10})
    tamanho: string

    @Column({type: "varchar", length: 100})
    cor: string

    @Column({type: "double"})
    estoque: number

    @Column({type: "float"})
    preco: number

   /* @ManyToMany(type => Empresas, empresas => empresas.produtos, {eager: true})
    @JoinTable()
    empresas: Empresas[]*/

    @OneToMany(type => ProdutosEmpresas, produtosempresas => produtosempresas.produto)
    produtosEmpresas: ProdutosEmpresas[]

    @OneToMany (type => ImagensProduto, imagem => imagem.produto, {eager: true})
    imagens: ImagensProduto[]

}