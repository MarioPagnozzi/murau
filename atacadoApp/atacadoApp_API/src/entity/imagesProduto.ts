import { Produtos } from './Produtos';
import { BaseStatus } from './enum/status';
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from './BaseEntity';

@Entity({ name: "imagensproduto"})
export class ImagensProduto extends BaseEntity {

    @Column({type: "varchar", length: 200})
    caminho: string

    @ManyToOne(type => Produtos, produto => produto.imagens, { eager: false })
    produto: Produtos
}