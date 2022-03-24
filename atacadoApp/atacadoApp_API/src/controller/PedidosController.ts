import { HistoricoPedido } from './../entity/HistoricoPedido';
import { Request } from 'express';
import { Equal, getRepository, Like, Repository } from 'typeorm';
import { statusPedido } from '../entity/enum/statusPedido';

import { ItemPedido } from '../entity/ItemPedido';
import { Pedidos } from './../entity/Pedidos';
import { BaseController } from "./BaseController";
export class PedidosController extends BaseController<Pedidos> {
    private _repItemPedido: Repository<ItemPedido> = getRepository(ItemPedido);
    private _repPedido: Repository<Pedidos> = getRepository(Pedidos);
    private Intl = require("Intl");

    constructor () {
        super(Pedidos);
    }
    async one(request: Request, restrito = true) {
        if (restrito) {
            let tabela = this.func.Tabela(request);
            if (!this.func.Permissao(request, tabela, "V")) 
                return {status: 400, errors: [{message: "Você não tem permissão para acessar os registros"}]}
        }
        let pedido = await this.repositorio.findOne(request.params.id);
        let _pedido: any = {...pedido};
        _pedido.vendedor = await pedido.vendedor;
        _pedido.cliente = await pedido.cliente;
        _pedido.empresa = await pedido.empresa;
        return _pedido;
    }
    async save(request: Request) {
        let _pedido = <Pedidos>request.body;
        console.log(_pedido)
        let _repHistorico: Repository<HistoricoPedido> = getRepository(HistoricoPedido);

        
        if (!this.func.Permissao(request, "Pedidos", _pedido.uid ? "A" : "I")) {
            return {status: 400, errors: ["Você não tem permissão para alterar ou inserir registro"]}
        }

        const dia = 1000*60*60*24;

        super.isRequired(_pedido.empresa, "O pedido precisa estar vinculado a uma empresa");
        super.isRequired(_pedido.vendedor, "O pedido precisa estar vinculado a um vendedor");
        super.isRequired(_pedido.cliente, "O pedido tem que estar vinculado a um cliente");
        super.isRequired(_pedido.valor_pedido, "Informe um valor para o pedido");
        
        super.isRequired(_pedido.itens, "Informe 1 ou mais itens para este pedido");

        let itens = _pedido.itens;
        let dataAtual = new Date();
        let numPedido = ("00" + dataAtual.getDate()).toString().slice(-2) + 
                        ("00" + (dataAtual.getMonth() + 1)).toString().slice(-2) + 
                        ("00" + dataAtual.getHours()).toString().slice(-2) +
                        ("00" + dataAtual.getMinutes()).toString().slice(-2) +
                        ("00" + dataAtual.getSeconds()).toString().slice(-2) + "/" +
                        dataAtual.getFullYear().toString();

        _pedido.num_pedido = _pedido.status_pedido == 1 && !_pedido.num_pedido ? numPedido : _pedido.num_pedido;
        _pedido.valor_pedido = 0;
        
        itens.forEach((item) => {

            if (!item.excluido || item.ativo) {
                _pedido.valor_pedido = +_pedido.valor_pedido + (+item.valor_unitario * item.qtd_produto);
            }
           
        });
       
                let historicoPedido = new HistoricoPedido()
                    
                let empresa = await _pedido.empresa;
                let cliente = await _pedido.cliente;
                
                
             
                historicoPedido.cidade = empresa.cidade + "/" + empresa.uf;
                historicoPedido.data = new Date();
                historicoPedido.hora = ("00" + dataAtual.getHours()).toString().slice(-2) + ":" + ("00" + dataAtual.getMinutes()).toString().slice(-2) + ":" + ("00" + dataAtual.getSeconds()).toString().slice(-2);
                historicoPedido.situacao = statusPedido[_pedido.status_pedido];
               
                let pdidoNew: Pedidos = new Pedidos();
                pdidoNew.ativo = _pedido.ativo;
                pdidoNew.excluido = _pedido.excluido;
                pdidoNew.num_pedido = _pedido.num_pedido;
                pdidoNew.previsao_entrega = _pedido.previsao_entrega;
                pdidoNew.status_pedido = _pedido.status_pedido;
                pdidoNew.uid = _pedido.uid;
                pdidoNew.valor_pedido = _pedido.valor_pedido;
                pdidoNew.cliente = Promise.resolve(_pedido.cliente);
                pdidoNew.vendedor  = Promise.resolve(_pedido.vendedor);
                pdidoNew.empresa = Promise.resolve(_pedido.empresa)
                return super.save(pdidoNew).then(async (pedido) => {
                    if (pedido.errors) return pedido;

                    historicoPedido.pedido = pedido;
                    _repHistorico.save(historicoPedido)
                    for (let i = 0; i < itens.length; i++) {
                        let item: ItemPedido = new ItemPedido();
                        item.ativo = itens[i].ativo;
                        item.excluido = itens[i].excluido;
                        item.pedido = pedido;
                        item.qtd_produto = itens[i].qtd_produto;
                        item.produto = itens[i].produto;
                        item.uid = itens[i].uid;
                        item.valor_total = itens[i].valor_total;
                        item.valor_unitario = itens[i].valor_unitario;
                        this._repItemPedido.save(item);
                    }
                    let fs = require("fs");
                    let path = require("path");
                    let arqHtml: any;
                    let html: any;
                    let table = "";
                    let history: any = "";
                    if (pedido.status_pedido == 1) {
                        arqHtml = path.join(path.dirname(__dirname),"templates") + "/email_pedido.html";
                        html = fs.readFileSync(arqHtml);
                        itens.forEach(async (item) => {
                            let produto = item.produto;
                            if (!item.excluido) {
                                table =  table + "<tr>" +
                                        "<td width='50' style='font-family:Arial, sans-serif;font-size:14px;line-height:20px;'><b>" + produto.codigo + "</b></td>" + 
                                        "<td width='150' style='font-family:Arial, sans-serif;font-size:14px;line-height:20px;'><b>" + produto.nome + "</b></td>" + 
                                        "<td width='30' style='font-family:Arial, sans-serif;font-size:14px;line-height:20px;'><b>" + item.qtd_produto + "</b></td>" + 
                                        "<td width='100' style='font-family:Arial, sans-serif;font-size:14px;line-height:20px;'><b>" +new this.Intl.NumberFormat("pt-BR", {style: "currency", currency: "BRL"}).format(item.valor_unitario) + "</b></td>" + 
                                        "<td width='100' style='font-family:Arial, sans-serif;font-size:14px;line-height:20px;'><b>" + new this.Intl.NumberFormat("pt-BR", {style: "currency", currency: "BRL"}).format(item.valor_total) + "</b></td>" +
                                        "</tr>";
                            }
                            
                        });
                        html = html.toString().replace("*|ITENS|*", table);
                        
                    } else if (pedido.status_pedido == 2) {
                        arqHtml = path.join(path.dirname(__dirname),"templates") + "/email_pedido_aprovado.html";
                        html = fs.readFileSync(arqHtml);
                        itens.forEach(async (item) => {
                            let produto = item.produto;
                            if (!item.excluido) {
                                table =  table + "<tr>" +
                                        "<td width='50' style='font-family:Arial, sans-serif;font-size:14px;line-height:20px;'><b>" + produto.codigo + "</b></td>" + 
                                        "<td width='150' style='font-family:Arial, sans-serif;font-size:14px;line-height:20px;'><b>" + produto.nome + "</b></td>" + 
                                        "<td width='30' style='font-family:Arial, sans-serif;font-size:14px;line-height:20px;'><b>" + item.qtd_produto + "</b></td>" + 
                                        "<td width='100' style='font-family:Arial, sans-serif;font-size:14px;line-height:20px;'><b>" +new this.Intl.NumberFormat("pt-BR", {style: "currency", currency: "BRL"}).format(item.valor_unitario) + "</b></td>" + 
                                        "<td width='100' style='font-family:Arial, sans-serif;font-size:14px;line-height:20px;'><b>" + new this.Intl.NumberFormat("pt-BR", {style: "currency", currency: "BRL"}).format(item.valor_total) + "</b></td>" +
                                        "</tr>";
                            }
                        });
                        html = html.toString().replace("*|ITENS|*", table);
                        let estimativa = new Date();
                        estimativa.setDate(estimativa.getDate() + 15);
                        var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };               
                        html = html.toString().replace("*|ESTIMATED_DELIVERY_DATE|*", new this.Intl.DateTimeFormat('pt-BR', options).format(estimativa));
                        let hist = await _repHistorico.find({where: {pedido:[{uid: pedido.uid}]}});
                        hist.forEach(async (historico) => {
                            history = history + "<tr>" + 
                                        "<td>" + historico.cidade + "</td>" +
                                        "<td>" + ("00" + historico.data.getDate()).toString().slice(-2) + "/" +
                                        ("00" + (historico.data.getMonth() + 1)).toString().slice(-2) + "/" +
                                        historico.data.getFullYear() + "</td>" +
                                        "<td>" + historico.hora + "</td>" +
                                        "<td>" + historico.situacao + "</td>" + 
                                        "</tr>";
                        });
                        history = history + "<tr>" + 
                                        "<td>" + historicoPedido.cidade + "</td>" +
                                        "<td>" + ("00" + historicoPedido.data.getDate()).toString().slice(-2) + "/" +
                                        ("00" + (historicoPedido.data.getMonth() + 1)).toString().slice(-2) + "/" +
                                        historicoPedido.data.getFullYear()+ "</td>" +
                                        "<td>" + historicoPedido.hora + "</td>" +
                                        "<td>" + historicoPedido.situacao + "</td>" + 
                                        "</tr>";
                        html = html.toString().replace("*|HISTORY_HTML|*", history);
                        html = html.toString().replace("*|TOTAL|*", new this.Intl.NumberFormat("pt-BR", {style: "currency", currency: "BRL"}).format(_pedido.valor_pedido));
                    
                    } else if (pedido.status_pedido == 3) {
                        arqHtml = path.join(path.dirname(__dirname),"templates") + "/email_pedido_enviado.html";
                        html = fs.readFileSync(arqHtml);
                        itens.forEach(async (item) => {
                            let produto = item.produto;
                            if (!item.excluido) {
                                table =  table + "<tr>" +
                                        "<td width='50' style='font-family:Arial, sans-serif;font-size:14px;line-height:20px;'><b>" + produto.codigo + "</b></td>" + 
                                        "<td width='150' style='font-family:Arial, sans-serif;font-size:14px;line-height:20px;'><b>" + produto.nome + "</b></td>" + 
                                        "<td width='30' style='font-family:Arial, sans-serif;font-size:14px;line-height:20px;'><b>" + item.qtd_produto + "</b></td>" + 
                                        "<td width='100' style='font-family:Arial, sans-serif;font-size:14px;line-height:20px;'><b>" +new this.Intl.NumberFormat("pt-BR", {style: "currency", currency: "BRL"}).format(item.valor_unitario) + "</b></td>" + 
                                        "<td width='100' style='font-family:Arial, sans-serif;font-size:14px;line-height:20px;'><b>" + new this.Intl.NumberFormat("pt-BR", {style: "currency", currency: "BRL"}).format(item.valor_total) + "</b></td>" +
                                        "</tr>";
                            }
                        });
                        html = html.toString().replace("*|ITENS|*", table);
                        let dataEstimada = await _repHistorico.createQueryBuilder("historico")
                                                                .select(["data"])
                                                                .where("historico.pedidoUid = :uid", {uid: pedido.uid})
                                                                .andWhere("historico.situacao = :situacao", {situacao: "Aprovado"}).getRawMany();
                    
                        console.log(dataEstimada)
                        dataEstimada[0].data.setDate(dataEstimada[0].data.getDate() + 15);
                        var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                        html = html.toString().replace("*|ESTIMATED_DELIVERY_DATE|*", new this.Intl.DateTimeFormat('pt-BR', options).format(dataEstimada[0].data));
                        let hist = await _repHistorico.find({where: {pedido: [{uid: pedido.uid}]}});
                        hist.forEach(async (historico) => {
                            history = history + "<tr>" + 
                                        "<td>" + historico.cidade + "</td>" +
                                        "<td>" + ("00" + historico.data.getDate()).toString().slice(-2) + "/" +
                                        ("00" + (historico.data.getMonth() + 1)).toString().slice(-2) + "/" +
                                        historico.data.getFullYear() + "</td>" +
                                        "<td>" + historico.hora + "</td>" +
                                        "<td>" + historico.situacao + "</td>" + 
                                        "</tr>";
                        });
                        
                        history = history + "<tr>" + 
                                        "<td>" + historicoPedido.cidade + "</td>" +
                                        "<td>" + ("00" + historicoPedido.data.getDate()).toString().slice(-2) + "/" +
                                        ("00" + (historicoPedido.data.getMonth() + 1)).toString().slice(-2) + "/" +
                                        historicoPedido.data.getFullYear()+ "</td>" +
                                        "<td>" + historicoPedido.hora + "</td>" +
                                        "<td>" + historicoPedido.situacao + "</td>" + 
                                        "</tr>";
                        html = html.toString().replace("*|HISTORY_HTML|*", history);
                        html = html.toString().replace("*|TOTAL|*", new this.Intl.NumberFormat("pt-BR", {style: "currency", currency: "BRL"}).format(_pedido.valor_pedido));
                    
                    } else if (pedido.status_pedido == 4) {
                        arqHtml = path.join(path.dirname(__dirname),"templates") + "/email_pedido_transito.html";
                        html = fs.readFileSync(arqHtml);
                        itens.forEach(async (item) => {
                            let produto = item.produto;
                            if (!item.excluido) {
                                table =  table + "<tr>" +
                                        "<td width='50' style='font-family:Arial, sans-serif;font-size:14px;line-height:20px;'><b>" + produto.codigo + "</b></td>" + 
                                        "<td width='150' style='font-family:Arial, sans-serif;font-size:14px;line-height:20px;'><b>" + produto.nome + "</b></td>" + 
                                        "<td width='30' style='font-family:Arial, sans-serif;font-size:14px;line-height:20px;'><b>" + item.qtd_produto + "</b></td>" + 
                                        "<td width='100' style='font-family:Arial, sans-serif;font-size:14px;line-height:20px;'><b>" +new this.Intl.NumberFormat("pt-BR", {style: "currency", currency: "BRL"}).format(item.valor_unitario) + "</b></td>" + 
                                        "<td width='100' style='font-family:Arial, sans-serif;font-size:14px;line-height:20px;'><b>" + new this.Intl.NumberFormat("pt-BR", {style: "currency", currency: "BRL"}).format(item.valor_total) + "</b></td>" +
                                        "</tr>";
                            }
                        });
                        html = html.toString().replace("*|ITENS|*", table);
                        let dataEstimada = await _repHistorico.createQueryBuilder("historico")
                                                                .select(["data"])
                                                                .where("historico.pedidoUid = :uid", {uid: _pedido.uid})
                                                                .andWhere("historico.situacao = :situacao", {situacao: "Aprovado"}).getRawMany();
                    
                        dataEstimada[0].data.setDate(dataEstimada[0].data.getDate() + 15);                
                        var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                        html = html.toString().replace("*|ESTIMATED_DELIVERY_DATE|*", new this.Intl.DateTimeFormat('pt-BR', options).format(dataEstimada[0].data));
                        let hist = await _repHistorico.find({where: {pedido: [{uid: pedido.uid}]}});
                        hist.forEach(async (historico) => {
                            history = history + "<tr>" + 
                                        "<td>" + historico.cidade + "</td>" +
                                        "<td>" + ("00" + historico.data.getDate()).toString().slice(-2) + "/" +
                                        ("00" + (historico.data.getMonth() + 1)).toString().slice(-2) + "/" +
                                        historico.data.getFullYear() + "</td>" +
                                        "<td>" + historico.hora + "</td>" +
                                        "<td>" + historico.situacao + "</td>" + 
                                        "</tr>";
                        });
                        
                        history = history + "<tr>" + 
                                        "<td>" + historicoPedido.cidade + "</td>" +
                                        "<td>" + ("00" + historicoPedido.data.getDate()).toString().slice(-2) + "/" +
                                        ("00" + (historicoPedido.data.getMonth() + 1)).toString().slice(-2) + "/" +
                                        historicoPedido.data.getFullYear()+ "</td>" +
                                        "<td>" + historicoPedido.hora + "</td>" +
                                        "<td>" + historicoPedido.situacao + "</td>" + 
                                        "</tr>";
                        html = html.toString().replace("*|HISTORY_HTML|*", history);
                        html = html.toString().replace("*|TOTAL|*", new this.Intl.NumberFormat("pt-BR", {style: "currency", currency: "BRL"}).format(_pedido.valor_pedido));
                    } else {
                        arqHtml = path.join(path.dirname(__dirname),"templates") + "/email_pedido_entregue.html";
                        html = fs.readFileSync(arqHtml);
                        itens.forEach(async (item) => {
                            let produto = await item.produto;
                            if (!item.excluido) {
                                table =  table + "<tr>" +
                                        "<td width='50' style='font-family:Arial, sans-serif;font-size:14px;line-height:20px;'><b>" + produto.codigo + "</b></td>" + 
                                        "<td width='150' style='font-family:Arial, sans-serif;font-size:14px;line-height:20px;'><b>" + produto.nome + "</b></td>" + 
                                        "<td width='30' style='font-family:Arial, sans-serif;font-size:14px;line-height:20px;'><b>" + item.qtd_produto + "</b></td>" + 
                                        "<td width='100' style='font-family:Arial, sans-serif;font-size:14px;line-height:20px;'><b>" +new this.Intl.NumberFormat("pt-BR", {style: "currency", currency: "BRL"}).format(item.valor_unitario) + "</b></td>" + 
                                        "<td width='100' style='font-family:Arial, sans-serif;font-size:14px;line-height:20px;'><b>" + new this.Intl.NumberFormat("pt-BR", {style: "currency", currency: "BRL"}).format(item.valor_total) + "</b></td>" +
                                        "</tr>";
                            }
                        });
                        html = html.toString().replace("*|ITENS|*", table);
                        let dataEstimada = await _repHistorico.createQueryBuilder("historico")
                                                                .select(["data"])
                                                                .where("historico.pedidoUid = :uid", {uid: _pedido.uid})
                                                                .andWhere("historico.situacao = :situacao", {situacao: "Aprovado"}).getRawMany();
                    
                        dataEstimada[0].data.setDate(dataEstimada[0].data.getDate() + (pedido.previsao_entrega ? _pedido.previsao_entrega : 15));
                        let dataEntrega: any = new Date();
                        let diffData = (dataEstimada[0].data.getTime() - dataEntrega.getTime()) / dia
                        let totalDias = parseInt(diffData.toString());
                        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                        let txtEntrega = "<br /> Seu pedido estava previsto para ser entregue no dia: " + new this.Intl.DateTimeFormat('pt-BR').format(dataEstimada[0].data);
                        txtEntrega = txtEntrega + "<br /> Seu pedido foi entregue no dia: " + new this.Intl.DateTimeFormat('pt-BR').format(dataEntrega);
                        
                        if (dataEstimada[0].data > dataEntrega) {
                            txtEntrega = txtEntrega + "<br /> O pedido foi entregue com " + (totalDias) + " dias de antecedência.";
                        }
                        else {
                            txtEntrega = txtEntrega + "<br /> Lamentamos profundamente o ocorrido, não é o padrão de nossa empresa o atraso nas entregas, mas tivemos alguns " +
                            "imprevistos durante o percurso e a separação do pedido, devido a isso seu pedido foi entregue com " + (totalDias * -1) + " dias de atraso. " +
                            "<br /> ESPERAMOS QUE POSSAM NOS DESCULPAR PELO TRANSTORNO E CONTAMOS COM SUA COMPREENÇÃO! " +
                            "<br /> Att., Equipe de relacionamento MURAU";
                        }
                        html = html.toString().replace("*|ESTIMATED_DELIVERY_DATE|*", new this.Intl.DateTimeFormat('pt-BR', options).format(dataEntrega) + txtEntrega);
        
                        let hist = await _repHistorico.find({where: {pedido: [{uid: pedido.uid}]}});
                        hist.forEach(async (historico) => {
                            history = history + "<tr>" + 
                                        "<td>" + historico.cidade + "</td>" +
                                        "<td>" + ("00" + historico.data.getDate()).toString().slice(-2) + "/" +
                                        ("00" + (historico.data.getMonth() + 1)).toString().slice(-2) + "/" +
                                        historico.data.getFullYear() + "</td>" +
                                        "<td>" + historico.hora + "</td>" +
                                        "<td>" + historico.situacao + "</td>" + 
                                        "</tr>";
                        });
                        
                        history = history + "<tr>" + 
                                        "<td>" + historicoPedido.cidade + "</td>" +
                                        "<td>" + ("00" + historicoPedido.data.getDate()).toString().slice(-2) + "/" +
                                        ("00" + (historicoPedido.data.getMonth() + 1)).toString().slice(-2) + "/" +
                                        historicoPedido.data.getFullYear()+ "</td>" +
                                        "<td>" + historicoPedido.hora + "</td>" +
                                        "<td>" + historicoPedido.situacao + "</td>" + 
                                        "</tr>";
                        html = html.toString().replace("*|HISTORY_HTML|*", history);
                        html = html.toString().replace("*|TOTAL|*", new this.Intl.NumberFormat("pt-BR", {style: "currency", currency: "BRL"}).format(_pedido.valor_pedido));
                    }
                    html = html.toString().replace("*|ORDER_NUMBER|*",pedido.num_pedido);
                    const mensagem = {
                        from: "vendas@murau.com.br",
                        to: cliente.email,
                        subject: "Seu pedido " + pedido.num_pedido,
                        html: html
                    }       
                    let sendMail = this.func.Email(mensagem);
                    let retornoEmail = await sendMail;
                    console.log(retornoEmail);
                    return pedido;

                });

    }
    async pedidosDia(request: Request) {
        if (!this.func.Permissao(request, "Pedidos", "V")) {
            return { status: 400, errors: ["Você não tem permissão para acessar os registros"]}
        }
        const dataAtual = new Date();
        //dataAtual.setDate(dataAtual.getDate() - 1);
        return this._repPedido.createQueryBuilder("pedidos")
                                .where("date_format(pedidos.data_inclusao,'%d/%m/%Y') = date_format(:data,'%d/%m/%Y')", {data: dataAtual.toISOString()})
                                .getMany();
    }
    async filtro(request: Request) {
        if (!this.func.Permissao(request, "Pedidos", "V")) {
            return { status: 400, errors: ["Você não tem permissão para acessar os registros"]}
        }
        let filtro = request.params.filtro;
        let valor = request.params.valor;

        if (filtro == "cliente") {
            return this._repPedido.find({where: [{cliente: {uid: valor} }]});
        }
        else if (filtro == "empresa") {
            return this._repPedido.find({where: [{empresa: {uid: valor}}]});
        }
        else if (filtro == "vendedor") {
            return this._repPedido.find({where: [{vendedor: {uid: valor}}]});
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
            let data: string;
            if (!this.func.ValidaDat(valor)) {
                let arrayData = valor.split("/");
                data = arrayData[1].toString() +  "-" + 
                       arrayData[0].substring(1,4) + "-" +
                       arrayData[0].substring(0,2);
            }

            return this._repPedido.find({where: [{num_pedido: valor},
                                                {data_inclusao: data},
                                                {data_inclusao: data}]})
        }
    }
}