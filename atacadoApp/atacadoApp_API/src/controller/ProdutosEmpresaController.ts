import { Request } from 'express';
import { getRepository, Like, Repository } from 'typeorm';
import { ItemPedido } from '../entity/ItemPedido';
import { Pedidos } from '../entity/Pedidos';
import { ProdutosEmpresas } from '../entity/ProdutosEmpresas';
import { BaseController } from "./BaseController";

export class ProdutosEmpresaController extends BaseController<ProdutosEmpresas> {
    private _repItemPedido: Repository<ItemPedido> = getRepository(ItemPedido);
    private _repPedido: Repository<Pedidos> = getRepository(Pedidos);
    constructor() {
        super(ProdutosEmpresas);
    }
    async save(request: Request) {
        let _pedido = <Pedidos>request.body;

        if (!this._func.Permissao(request, "Pedidos", _pedido.uid ? "A" : "I")) {
            return {status: 400, errors: ["Você não tem permissão para alterar ou inserir registro"]}
        }

        super.isRequired(_pedido.empresa, "O pedido precisa estar vinculado a uma empresa");
        super.isRequired(_pedido.vendedor, "O pedido precisa estar vinculado a um vendedor");
        super.isRequired(_pedido.cliente, "O pedido tem que estar vinculado a um cliente");
        super.isRequired(_pedido.valor_pedido, "Informe um valor para o pedido");
        
        super.isRequired(_pedido.itens, "Informe 1 ou mais itens para este pedido");

        let itens = _pedido.itens;
        let dataAtual: Date = new Date();
        let numPedido = ("00" + dataAtual.getDate()).toString().slice(-2) + 
                        ("00" + dataAtual.getMonth()).toString().slice(-2) + 
                        ("00" + dataAtual.getHours()).toString().slice(-2) +
                        ("00" + dataAtual.getMinutes()).toString().slice(-2) +
                        ("00" + dataAtual.getSeconds()).toString().slice(-2) + "/" +
                        dataAtual.getFullYear().toString();

        _pedido.num_pedido = numPedido;

        _pedido.itens.forEach((item) => {
            _pedido.valor_pedido = +_pedido.valor_pedido + +item.valor_total;
        });

        return super.save(_pedido).then(async (pedido) => {
            let itemPedido: ItemPedido;
            itens.forEach(async (item) => {
                itemPedido = new ItemPedido();
                itemPedido.pedido = pedido;
                itemPedido.produto = item.produto;
                itemPedido.qtd_produto = item.qtd_produto;
                itemPedido.valor_unitario = item.valor_unitario;
                itemPedido.valor_total = item.valor_total;

                this._repItemPedido.save(itemPedido);
            } )
        })

    }
    async filtro(request: Request) {
        if (!this._func.Permissao(request, "Pedidos", "V")) {
            return { status: 400, errors: ["Você não tem permissão para acessar os registros"]}
        }
        let filtro = request.params.filtro;
        let valor = request.params.valor;

        if (filtro == "cliente") {
            return this._repPedido.find({where: {cliente: [{razao_social: Like("%" + valor + "%")}, 
                                                           {cnpj: Like("%" + valor + "%")}, 
                                                           {nome_facebook: Like("%" + valor + "%")}, 
                                                           {email: Like("%" + valor + "%")}]}});
        }
        else if (filtro == "empresa") {
            return this._repPedido.find({where: {empresa: [{razao_social: Like("%" + valor + "%")},
                                                            {codigo: valor}]}});
        }
        else if (filtro == "vendedor") {
            return this._repPedido.find({where: {vendedor: [{nome: Like("%" + valor + "%")},
                                                            {codigo: valor}]}});
        }
        else if (filtro == "itens") {
            return this._repPedido.createQueryBuilder("pedidos")
                                    .addSelect("pedidos.*")
                                    .innerJoin("pedidos.itens ", "item")
                                    .addSelect(["item.qtd_produto", "item.valor_unitario","item.valor_total"])
                                    .innerJoin("item.produto", "produto")
                                    .addSelect(["produto.codigo, produto.nome"])
                                    .where("produto.codigo = :codigo", {codigo: valor})
                                    .orWhere("produtgo.nome like (:nome)", {nome: "%" +  valor + "%"})
                                    .getMany();
        }
        else {
            let arrayData = valor.split("/");
            let data = arrayData[0].substring(0,1)
            return this._repPedido.find({where: [{num_pedido: valor},
                                                {data_inclusao: valor},
                                                {}]})
        }
    }
}