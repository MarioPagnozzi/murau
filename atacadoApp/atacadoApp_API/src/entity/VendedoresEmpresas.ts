import { Vendedores } from './Vendedores';
import { Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { Empresas } from './Empresas';

@Entity({name: "vendedores_empresas"})
export class VendedoresEmpresas extends BaseEntity {
   /* @ManyToOne(type => Vendedores, vendedores => vendedores.empresas, {eager: false})
    @JoinColumn({name: "vendedorUid"})
    vendedor: Vendedores

    @ManyToOne(type => Empresas, empresas => empresas.vendedores, {eager: false})
    @JoinColumn({name: "empresaUid"})
    empresa: Empresas*/
}