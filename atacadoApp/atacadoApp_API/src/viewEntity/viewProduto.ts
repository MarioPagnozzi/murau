import { Connection, ViewColumn, ViewEntity } from "typeorm";
import { Empresas } from "../entity/Empresas";
import { ImagensProduto } from "../entity/imagesProduto";
import { Produtos } from "../entity/Produtos";
import { ProdutosEmpresas } from "../entity/ProdutosEmpresas";
import { BaseView } from "./BaseView";

@ViewEntity({
    expression: (connection: Connection) => connection.createQueryBuilder()
                                            .select("prod.*")                                            
                                            .addSelect("img.caminho")
                                            .addSelect(["emp.codigo","emp.nome_fantasia"])
                                            .addSelect("prodEmp.valor","prodEmp.estoque")
                                            .from(Produtos,"prod")
                                            .innerJoin("prod.imagens","img")
                                            .innerJoin("prod.produtosEmpresas","prodEmp")
                                            .innerJoin("prodEmp.empresa","emp")
})
export class vProdutos extends BaseView {
    
    @ViewColumn()
    descricao: string

    @ViewColumn()
    nome: string

    @ViewColumn()
    referencia: string

    @ViewColumn()
    tamanho: string

    @ViewColumn()
    cor: string

    @ViewColumn()
    codigo: string
    
    //@ViewColumn()
    imagens: ImagensProduto[]
   // @ViewColumn()
    produtosEmpresas: ProdutosEmpresas[]
}