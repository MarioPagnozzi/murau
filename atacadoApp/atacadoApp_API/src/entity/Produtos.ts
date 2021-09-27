import { ProdutosEmpresas } from './ProdutosEmpresas';
import { ImagensProduto } from './imagesProduto';
import { AfterInsert, Index, JoinTable, ManyToMany, OneToMany } from 'typeorm';

import { Column } from 'typeorm';
import { Entity } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { ItemPedido } from './ItemPedido';
import { Empresas } from './Empresas';
import { atualizaProduto, geraToken } from '../configuracao/functions/globalFunctions';
import { clearImmediate } from 'timers';

@Entity({name: "produtos"})
export class Produtos extends BaseEntity {

    @Index({fulltext: true})
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

    @OneToMany(type => ProdutosEmpresas, produtosempresas => produtosempresas.produto, {nullable: true})
    produtosEmpresas: Promise<ProdutosEmpresas[]>
    
    @ManyToMany(type => Empresas, empresas => empresas.produtos)
    @JoinTable({name: "produtos_empresas"})
    empresas: Promise<Empresas[]>

    @OneToMany (type => ImagensProduto, imagem => imagem.produto, {nullable: true})   
    imagens: Promise<ImagensProduto[]>

    @OneToMany (type => ItemPedido,  itemPedido => itemPedido.produto, {nullable: true, eager: false})
    pedidos: ItemPedido[]
   
}