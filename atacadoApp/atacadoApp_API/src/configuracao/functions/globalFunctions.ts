import { Repository, getRepository, Not, OneToMany, In, SimpleConsoleLogger } from 'typeorm';
import { Request, Response, NextFunction } from 'express';
import { Configuracoes } from '../../entity/Configuracoes';
import { Produtos } from '../../entity/Produtos';
import { ProdutosEmpresas } from '../../entity/ProdutosEmpresas';
import { Empresas } from '../../entity/Empresas';
import { ImagensProduto } from '../../entity/imagesProduto';
import { isArray } from 'util';
import config from "../config";
import { setInterval } from 'timers';
import { Grupos } from '../../entity/Grupos';


//var https = require("https");
require('events').EventEmitter.defaultMaxListeners = Infinity;
var cron = require("node-schedule");

var https = require("follow-redirects").https;
https.globalAgent.maxSockets = Infinity;
const agent = new https.Agent({ keepAlive: true, maxSockets: Infinity, maxListeners: Infinity });
var fs = require("fs");
var progressBar = require("progress")
//export default class functions {


export function sleep(ms) {
    return new Promise(resolve => setInterval(resolve, ms));
}

export class apiRequest {

    constructor(private options, private write = null, private ms = 6000) {

    }

    httpRequest() {
        return new Promise<string>((resolve, reject) => {
            let interval = setTimeout(() => {
                const request = https.request(this.options, (res) => {
                    let chuncks = [];
                    if (res.statusCode == 200 || res.statusCode == 400) {
                        res.on("data", (chunk) => {
                            chuncks.push(chunk);
                        });
                        res.on("end", () => {
                            let body = Buffer.concat(chuncks);
                            clearTimeout(interval);
                            resolve(body.toString());
                        });
                    }
                    res.on("error", async (error) => {
                        if (error.code === "ECONNRESET") {
                            let req = new apiRequest(this.options, this.write, this.ms);
                            let body;
                            await req.httpRequest().then((response) => {
                                body = response
                            }).catch((error) => {
                                clearTimeout(interval);
                                throw new Error(`Erro ao acessar host: ${error}`)
                            });
                            clearTimeout(interval);
                            resolve(body);
                        }
                        else {
                            clearTimeout(interval);
                            res.abort();

                        }
                    });
                    res.on("timeout", () => {
                        clearTimeout(interval);
                        res.emit("close");
                    })
                });
                request.on("socket", (socket) => {
                    socket.setTimeout(this.ms, () => {
                        request.abort();
                        var connReset = new Error('Timout');
                        connReset.stack = 'ECONNRESET';
                        socket.emit('clientError', connReset, socket);
                        clearTimeout(interval);

                    });

                });
                request.on("error", async (error) => {
                    if (error.code == "ECONNRESET") {

                        //request.abort()
                        let req = new apiRequest(this.options, this.write, this.ms);
                        let body;
                        await req.httpRequest().then((response) => {
                            body = response
                        }).catch((error) => {
                            clearTimeout(interval);
                            throw new Error(`Erro ao acessar host: ${error}`)
                        });
                        clearTimeout(interval);
                        resolve(body);
                    } else {
                        clearTimeout(interval);
                        reject(new Error(`Erro ao acessar host: ${error}`))
                    }
                });
                if (this.write != null) request.write(JSON.stringify(this.write));
                request.reusedSockets = true;
                request.setTimeout(this.ms);
                request.end();
            }, this.ms);

        });
    }

}
export async function getParametros() {
    let _repParametros: Repository<Configuracoes> = getRepository(Configuracoes);

    let parametros = await _repParametros.find();
    const [params] = await Promise.all([parametros])
    return params;


}
export async function setParametros(value) {
    let _repParametros: Repository<Configuracoes> = getRepository(Configuracoes);
    await _repParametros.save(value)

}
export class geraToken {

    constructor() { }

    token(): Promise<any> {
        return new Promise<any>(async (resolve) => {
            await getParametros().then(async (parametros) => {
                let _hostname_totvs = parametros.filter(val => val.nome_parametro == "host_api_totvs")[0];
                let _porta_totvs = parametros.filter(val => val.nome_parametro == "porta_api_totvs")[0];
                let _dttoken = parametros.filter(val => val.nome_parametro == "dtExpiracao")[0];
                let _url;
                let dtExpiracao = _dttoken ? _dttoken.valor : undefined;
                let dataAtual: Date = new Date();

                let dia = dtExpiracao ? +dtExpiracao.substring(0, 2) : dataAtual.getDate();
                let mes = dtExpiracao ? +dtExpiracao.substring(3, 5) - 1 : dataAtual.getMonth();
                let ano = dtExpiracao ? +dtExpiracao.substring(6, 10) : dataAtual.getFullYear();
                let hora = dtExpiracao ? +dtExpiracao.substring(11, 13) : dataAtual.getHours();
                let min = dtExpiracao ? +dtExpiracao.substring(14, 16) : dataAtual.getMinutes();
                let seg = dtExpiracao ? +dtExpiracao.substring(17, 19) : dataAtual.getSeconds();
                let options: any;
                let dataExpiracaoToken: Date = new Date(Date.UTC(ano, mes, dia, hora, min, seg));

                //Gera chave de autorização para api Totvs caso a atual não esteja válida ou não exista. - Inicio
                if (!dtExpiracao || dataAtual >= dataExpiracaoToken) {

                    let _autorizacao_totvs = parametros.filter(val => val.nome_parametro == "autorizacao_api_totvs_token")[0];
                    let _usuario_totvs = parametros.filter(val => val.nome_parametro == "usuario_api_totvs_token")[0];
                    let _senha_totvs = parametros.filter(val => val.nome_parametro == "senha_api_totvs_token")[0];
                    _url = _autorizacao_totvs.valor;

                    options = {
                        "method": "POST",
                        "hostname": _hostname_totvs.valor,
                        "port": _porta_totvs.valor,
                        "path": _autorizacao_totvs.valor,
                        "headers": {
                            "usuario": _usuario_totvs.valor,
                            "senha": _senha_totvs.valor
                        },
                        "maxRedirects": 100,
                        "agent": agent,
                        "pool": {
                            "maxSockets": 1000
                        }
                    }
                    const api = async () => {
                        let request = new apiRequest(options);
                        let req = await request.httpRequest();
                        const [body] = await Promise.all([req]);
                        return body;
                    }

                    let body = await api();

                    if (body) {
                        let { cdToken, dtExpiracao } = JSON.parse(body);
                        let config = parametros.filter(val => val.nome_parametro == "cdToken")[0];
                        //console.log(cdToken)
                        if (config) {

                            config.valor = cdToken;
                            setParametros(config);

                            config = parametros.filter(val => val.nome_parametro == "dtExpiracao")[0];
                            if (config) {
                                config.valor = dtExpiracao;
                            } else {
                                config = new Configuracoes();
                                config.nome_parametro = "dtExpiracao";
                                config.valor = dtExpiracao;
                            }
                            setParametros(config);
                            console.log("Token Criado!")
                        } else {
                            config = new Configuracoes();
                            config.nome_parametro = "cdToken";
                            config.valor = cdToken;
                            setParametros(config);


                            config = new Configuracoes();
                            config.nome_parametro = "dtExpiracao";
                            config.valor = dtExpiracao;
                            setParametros(config);

                            console.log("Token Criado!")
                        }

                        resolve(cdToken);
                    }

                } else {
                    const token = parametros.filter(val => val.nome_parametro == "cdToken")[0];
                    resolve(token.valor);
                }


            })
        })

    }

}
export function getProdutos(obj?) {
    let _repProdutos: Repository<Produtos> = getRepository(Produtos);
    let _produtos;
    try {
        const produtos = async () => {
            let produtos = await _repProdutos.find(obj);
            const [prods] = await Promise.all([produtos]);
            return prods
        }
        _produtos = produtos();
    } catch (error) {
        throw new Error(`Erro ao buscar produtos: ${error}`);
    } finally {
        return _produtos;
    }
}

export function getEmpresas() {
    let _repEmpresas: Repository<Empresas> = getRepository(Empresas);
    const empresas = async () => {
        let empresas = await _repEmpresas.find();
        const [emps] = await Promise.all([empresas])
        return emps;
    }
    return empresas();

}

export function setProdutos(values, mensagem = undefined) {
    let _repProdutos: Repository<Produtos> = getRepository(Produtos);
    _repProdutos.save(values).then((prod) => {
        if (mensagem) console.log(mensagem)
    })
}
export class insereNovoProduto {

    constructor(private cd_Prod, private cdToken) {

    }

    async insetNew() {

        let parametros = await getParametros()
        let empresas = await getEmpresas();

        let _hostname_totvs = parametros.filter(val => val.nome_parametro == "host_api_totvs")[0];
        let _porta_totvs = parametros.filter(val => val.nome_parametro == "porta_api_totvs")[0];
        let _restapi_totvs = parametros.filter(val => val.nome_parametro == "rest_api_totvs")[0];
        let _url = _restapi_totvs.valor + "/produto/classificacaoproduto";


        let options = {
            "method": "POST",
            "hostname": _hostname_totvs.valor,
            "path": _url,
            "port": _porta_totvs.valor,
            "headers": {
                "Authorization": "Bearer " + this.cdToken,
                "Content-Type": "application/json"
            },
            "maxRedirects": 1000,
            "agent": agent,
            "pool": {
                "maxSockets": 1000,
            },
            "maxContentLength": Infinity,
            "maxBodyLength": Infinity,
            "maxBodyBufferSize": Infinity
        }

        let obj = {
            "cdProduto": this.cd_Prod
        }
        let request = new apiRequest(options, obj);
        let body = await request.httpRequest();

        if (body) {
            let classificacoes = JSON.parse(body);
            for (let el in classificacoes) {
                let { cdTpClassificacao, cdClassificacao, dsGrupo, cdBarra, cdProduto, dsProduto, dsCor, dsTamanho, cdNivel, dsErro } = classificacoes[el];

                if (dsErro) {
                    return false;
                }
                if (cdTpClassificacao === 4 && cdClassificacao === "003") {

                    let _produto: Produtos = new Produtos();
                    _produto.codigo = cdProduto;
                    _produto.cor = dsCor;
                    _produto.tamanho = dsTamanho;

                    _produto.nome = dsGrupo;

                    _produto.descricao = dsProduto;

                    _produto.estoque = 0;
                    _produto.preco = 0;
                    _produto.referencia = cdNivel;
                    _produto.empresas = Promise.resolve(empresas);

                    setProdutos(_produto, ` Produto ${_produto.codigo} Inserido com sucesso! [novo]`);
                }
            }
        }
        await Promise.all([parametros, empresas, body]);
    }

}
export function getProdutoEmpresa(_where) {

    let _repProdutosEmpresas: Repository<ProdutosEmpresas> = getRepository(ProdutosEmpresas);
    const produtoEmpresa = async () => {
        let produtoEmpresa = await _repProdutosEmpresas.findOne(_where);
        const [prodEmp] = await Promise.all([produtoEmpresa]);
        return prodEmp;
    }
    return produtoEmpresa();

}

export function getEmpresa(_where) {
    let _repEmpresas: Repository<Empresas> = getRepository(Empresas);
    const empresa = async () => {
        let empresa = await _repEmpresas.findOne(_where);
        const [emp] = await Promise.all([empresa]);
        return emp;
    }
    return empresa();
}

export function setProdutoEmpresa(value, mensagem = undefined) {
    let _repProdutosEmpresas: Repository<ProdutosEmpresas> = getRepository(ProdutosEmpresas);
    _repProdutosEmpresas.save(value).then((prodEmp) => {
        if (mensagem) console.log(mensagem);
    })
}
export class atualizaProduto {

    constructor(private cd_Barra, private token) {

    }

    async preco() {
        return new Promise<any>(async (resolve) => {


            const params = async () => {
                let parametros = await getParametros();
                let _empresas = await getEmpresas();
                const [parms, emps] = await Promise.all([parametros, _empresas]);
                return { parms, emps };
            }
            let paramEmps = await params();

            let parametros = paramEmps.parms;
            let _empresas = paramEmps.emps;

            let _hostname_totvs = parametros.filter(val => val.nome_parametro == "host_api_totvs")[0];
            let _porta_totvs = parametros.filter(val => val.nome_parametro == "porta_api_totvs")[0];
            let _restapi_totvs = parametros.filter(val => val.nome_parametro == "rest_api_totvs")[0];

            let _url;
            let options: any;

            let _obj = {
                "produtos": [],
                "cdPreco": 2,
                "inPromocao": 0,
                "empresas": []
            }

            _empresas.forEach(async (empresa) => {
                _obj.empresas.push({
                    "cdEmpresa": empresa.codigo
                });
            });
            if (isArray(this.cd_Barra)) {
                for (let codigo of this.cd_Barra) {
                    _obj.produtos.push({
                        "cdProduto": codigo
                    })
                }
            } else {
                _obj.produtos.push({
                    "cdProduto": this.cd_Barra
                })
            }

            _url = _restapi_totvs.valor + "/produto/precoproduto";
            options = {
                "method": "POST",
                "hostname": _hostname_totvs.valor,
                "path": _url,
                "port": _porta_totvs.valor,
                "headers": {
                    "Authorization": "Bearer " + this.token,
                    "Content-Type": "application/json"
                },
                "maxRedirects": 100,
                "agent": agent,
                "pool": {
                    "maxSockets": 100
                },
                "maxContentLength": Infinity,
                "maxBodyLength": Infinity,
                "maxBodyBufferSize": Infinity
            }

            let api = new apiRequest(options, _obj, 6000);
            let body = await api.httpRequest();

            const atualizaPrecos = async () => {

                if (body) {
                    let { precos } = JSON.parse(body);
                    let bar = new progressBar("[:bar] Atualizando preços dos produtos \n", {
                        complete: "=",
                        incomplete: " ",
                        width: 30,
                        total: precos.length
                    })

                    if (precos.length > 0) {
                        let timer = setInterval(async () => {
                            for (let preco of precos) {
                                let { cdEmpresa, vlPreco, cdSKU } = JSON.parse(JSON.stringify(preco));
                                bar.tick();

                                const getDados = async () => {
                                    let produtos = await getProdutos()
                                    let objWhere = { where: { produto: [{ codigo: cdSKU }], empresa: [{ codigo: cdEmpresa }], valor: Not(vlPreco) } };

                                    let produtoEmpresa = await getProdutoEmpresa(objWhere);

                                    let objWhereEmp = { where: { codigo: cdEmpresa } };
                                    let empresa = await getEmpresa(objWhereEmp);

                                    const [produ, prodEmp, emp] = await Promise.all([produtos, produtoEmpresa, empresa]);
                                    return {
                                        produ,
                                        prodEmp,
                                        emp
                                    }
                                }

                                let dados = await getDados();
                                let produtos = dados.produ;
                                let prod = produtos.filter(val => val.codigo == cdSKU)[0];

                                const _vlPreco = async () => {
                                    if (vlPreco) {

                                        let produtoEmpresa = dados.prodEmp;
                                        let empresa = dados.emp;

                                        if (produtoEmpresa) {
                                            try {
                                                produtoEmpresa.valor = vlPreco;
                                                setProdutoEmpresa(produtoEmpresa);

                                            } catch (err) {
                                                clearInterval(timer);
                                                throw new Error(`Erro ao gravar o Preço do Produto ${prod.codigo} para a empresa ${empresa.nome_fantasia}: ${err}`);
                                            }
                                        } else {
                                            if (prod && empresa) {
                                                try {
                                                    let entityProdutoEmpresa: ProdutosEmpresas = new ProdutosEmpresas();
                                                    entityProdutoEmpresa.empresa = Promise.resolve(empresa);
                                                    entityProdutoEmpresa.produto = Promise.resolve(prod);
                                                    entityProdutoEmpresa.valor = vlPreco;
                                                    setProdutoEmpresa(entityProdutoEmpresa);

                                                } catch (err) {
                                                    clearInterval(timer);
                                                    throw new Error(`Erro ao gravar o Preço do Produto ${prod.codigo} para a empresa ${empresa.nome_fantasia}: ${err}`);
                                                }
                                            }


                                        }

                                    }
                                    if (bar.complete) {
                                        resolve(bar.complete)
                                    }
                                }
                                let vlPrecos = await _vlPreco();
                                await Promise.all([dados, vlPrecos]).finally(() => {
                                    clearInterval(timer);
                                })
                            }
                        }, 5000)

                    }
                }
            }

            let atualiza = await atualizaPrecos();

            await Promise.all([paramEmps, body, atualiza])
        })
    }
    async estoque() {
        return new Promise<any>(async (resolve) => {
            const params = async () => {
                let parametros = await getParametros();
                let empresas = await getEmpresas();
                const [parms, emps] = await Promise.all([parametros, empresas]);
                return { parms, emps };
            }
            let paramEmps = await params();
            let parametros = paramEmps.parms;
            let _empresas = paramEmps.emps;

            let _hostname_totvs = parametros.filter(val => val.nome_parametro == "host_api_totvs")[0];
            let _porta_totvs = parametros.filter(val => val.nome_parametro == "porta_api_totvs")[0];
            let _restapi_totvs = parametros.filter(val => val.nome_parametro == "rest_api_totvs")[0];


            let _url;
            let options: any;

            let _obj = {
                "produtos": [],
                "cdSaldo": 1,
                "inEstoque": 1,
                "inPedidoVenda": 0,
                "empresas": []
            }
            _empresas.forEach(async (empresa) => {
                _obj.empresas.push({
                    "cdEmpresa": empresa.codigo
                });
            });
            if (isArray(this.cd_Barra)) {
                for (let codigo of this.cd_Barra) {
                    _obj.produtos.push({
                        "cdProduto": codigo
                    })
                }
            } else {
                _obj.produtos.push({
                    "cdProduto": this.cd_Barra
                })
            }

            _url = _restapi_totvs.valor + "/produto/saldoproduto";
            options = {
                "method": "POST",
                "hostname": _hostname_totvs.valor,
                "path": _url,
                "port": _porta_totvs.valor,
                "headers": {
                    "Authorization": "Bearer " + this.token,
                    "Content-Type": "application/json"
                },
                "maxRedirects": 100,
                "agent": agent,
                "pool": {
                    "maxSockets": 100
                },
                "maxContentLength": Infinity,
                "maxBodyLength": Infinity,
                "maxBodyBufferSize": Infinity
            }

            let api = new apiRequest(options, _obj);
            let body = await Promise.resolve(api.httpRequest());

            const atualiza_saldo = async () => {

                if (body) {

                    let { saldos } = JSON.parse(body);
                    let bar = new progressBar("[:bar] Atualizando saldo dos produtos \n", {
                        complete: "=",
                        incomplete: " ",
                        width: 30,
                        total: saldos.length
                    })
                    if (saldos.length > 0) {

                        let timer = setTimeout(async () => {

                            for (let saldo of saldos) {
                                let { cdEmpresa, qtEstoque, cdSKU } = JSON.parse(JSON.stringify(saldo));
                                bar.tick();
                                const getDados = async () => {
                                    let produtos = await getProdutos();
                                    let objWhere = { where: { produto: [{ codigo: cdSKU }], empresa: [{ codigo: cdEmpresa }], estoque: Not(qtEstoque) } };

                                    let produtoEmpresa = await getProdutoEmpresa(objWhere)

                                    let objWhereEmp = { where: { codigo: cdEmpresa } };
                                    let empresa = await getEmpresa(objWhereEmp)

                                    const [produ, prodEmp, emp] = await Promise.all([produtos, produtoEmpresa, empresa]);
                                    return {
                                        produ,
                                        prodEmp,
                                        emp
                                    }
                                }
                                let dados = await getDados();
                                let produtos = dados.produ;
                                let prod = produtos.filter(val => val.codigo == cdSKU)[0];
                                const _saldo = async () => {
                                    if (qtEstoque) {
                                        let produtoEmpresa = dados.prodEmp;
                                        let empresa = dados.emp;
                                        if (produtoEmpresa) {

                                            try {
                                                produtoEmpresa.estoque = qtEstoque;
                                                setProdutoEmpresa(produtoEmpresa);

                                            } catch (err) {
                                                clearInterval(timer);
                                                throw new Error(`Erro ao gravar o Estoque do Produto ${prod.codigo} para a empresa ${empresa.nome_fantasia}: ${err}`);
                                            }

                                        } else {
                                            if (prod && empresa) {
                                                try {
                                                    let entityProdutoEmpresa: ProdutosEmpresas = new ProdutosEmpresas();
                                                    entityProdutoEmpresa.empresa = Promise.resolve(empresa);
                                                    entityProdutoEmpresa.produto = Promise.resolve(prod);
                                                    entityProdutoEmpresa.estoque = qtEstoque;
                                                    setProdutoEmpresa(entityProdutoEmpresa)

                                                } catch (err) {
                                                    clearInterval(timer);
                                                    throw new Error(`Erro ao gravar o Estoque do Produto ${prod.codigo} para a empresa ${empresa.nome_fantasia}: ${err}`);
                                                }

                                            }
                                        }

                                    }
                                    if (bar.complete) {
                                        resolve(bar.complete)
                                    }
                                }
                                let nSaldo = await _saldo();
                                await Promise.all([dados, nSaldo]).finally(() => {
                                    clearInterval(timer);
                                })
                            }
                        }, 5000)

                    }

                }

            }
            let atualiza = await atualiza_saldo();
            await Promise.all([paramEmps, body, atualiza])
        })
    }
    async imagens() {
        return new Promise<any>(async (resolve) => {
            const obj = {
                where: {
                    ativo: true, excluido: false
                }
            }

            let produtos = await getProdutos(obj)
            let options: any;
            let strBusca: string = "";
            let cdProdSemEstoque: Array<any> = this.cd_Barra;
            if (this.cd_Barra.isArray) {

                for (let i = 0; i < this.cd_Barra.length; i++) {

                    if (strBusca === "") {
                        strBusca = `fq=skuId:${this.cd_Barra[i]}`;
                    } else {
                        strBusca = strBusca + `&fq=skuId:${this.cd_Barra[i]}`;

                    }
                }

                options = {
                    "method": "GET",
                    "hostname": "lojamurau.vtexcommercestable.com.br",
                    "path": encodeURI((config.apiVtexSearch + strBusca).trim()),
                    "headers": {
                        "Content-Type": "application/json",
                        "accept": "application/json",
                        "x-vtex-api-appkey": config.vtexAppKey,
                        "x-vtex-api-apptoken": config.vtexToken
                    },
                    "maxRedirects": 100,
                    "agent": agent,
                    "pool": {
                        "maxSockets": 100
                    }
                }
                let api = new apiRequest(options);
                let body = await Promise.resolve(api.httpRequest());

                const atualiza_imagens = async () => {
                    if (body) {

                        let retornoBody = JSON.parse(body);
                        let bar = new progressBar("[:bar] Atualizando dados dos produtos :percent", {
                            complete: "=",
                            incomplete: " ",
                            width: 30,
                            total: retornoBody.length
                        });
                        let timer = setInterval(async () => {
                            const atualiza_desc = async () => {
                                retornoBody.forEach(async (rbody) => {

                                    let { description, items } = rbody;
                                    if (items.length > 0 || items) {
                                        cdProdSemEstoque = cdProdSemEstoque.filter(item => !items.includes(item));

                                        for (let item of items) {

                                            let _produto = produtos.filter(val => val.codigo == item.itemId)[0];
                                            const itens_prod = async () => {
                                                if (_produto) {
                                                    if (description) {
                                                        if (_produto.descricao != description) {
                                                            _produto.descricao = description;
                                                            setProdutos(_produto, `Produto ${item.itemId} teve a descrição atualizada`);

                                                        }
                                                    }
                                                    if (item.images.length > 0 || item.images) {
                                                        let imagemProduto: ImagensProduto;


                                                        for (let img of item.images) {
                                                            let imagens = await getImagemProduto({ where: { produto: [{ uid: _produto.uid }] } });
                                                            bar.tick()
                                                            const atualiza_imagens = async () => {
                                                                if (imagens.length > 0) {
                                                                    if (img.imageUrl) {
                                                                        let imagem = await getImagemProduto({ where: { caminho: img.mageUrl } })

                                                                        if (!imagem) {
                                                                            imagemProduto = new ImagensProduto();
                                                                            imagemProduto.caminho = img.imageUrl;
                                                                            imagemProduto.produto = Promise.resolve(_produto);
                                                                            imagemProduto.referencia = _produto.referencia;
                                                                            setImagemProduto(imagemProduto)


                                                                        }
                                                                        await Promise.all([imagem]);
                                                                    }
                                                                } else {
                                                                    if (img.imageUrl) {
                                                                        imagemProduto = new ImagensProduto();
                                                                        imagemProduto.caminho = img.imageUrl;
                                                                        imagemProduto.produto = Promise.resolve(_produto);
                                                                        imagemProduto.referencia = _produto.referencia;
                                                                        setImagemProduto(imagemProduto)


                                                                    }
                                                                }

                                                            }
                                                            let exec_atualiza_imagem = await atualiza_imagens();
                                                            await Promise.all([imagens, exec_atualiza_imagem])
                                                        }
                                                    }
                                                }

                                            }
                                            let exec_itensProd = await itens_prod();
                                            await Promise.all([exec_itensProd])
                                        }
                                    }

                                });
                            }
                            let exec_desc = await atualiza_desc();
                            await Promise.all([exec_desc]).finally(() => {
                                clearInterval(timer);
                            })
                        }, 5000)


                    }
                }

                let exec_atualiza_imagem = await atualiza_imagens();
                await Promise.all([produtos, body, exec_atualiza_imagem]);
            }

            if (cdProdSemEstoque.length > 0) {
                let bar = new progressBar("[:bar] Atualizando imagens de produtos sem estoque", {
                    complete: "=",
                    incomplete: " ",
                    width: 30,
                    total: cdProdSemEstoque.length
                });
                let timerSemEstoque = setInterval(async () => {
                    for (let prod of cdProdSemEstoque) {
                        bar.tick();
                        options = {
                            "method": "GET",
                            "hostname": "lojamurau.vtexcommercestable.com.br",
                            "path": "/api/catalog_system/pvt/sku/stockkeepingunitbyid/" + prod,
                            "headers": {
                                "Content-Type": "application/json",
                                "accept": "application/json",
                                "x-vtex-api-appkey": "vtexappkey-lojamurau-WLQIMF",
                                "x-vtex-api-apptoken": "ZVWOWRDCPCPZQNECCDZMFYELGQHFIRXFUNRQIDNWIENXDWGBGGAOQTKARLHFKYUYEKECVNTYPCDBLGHKKFZBQJPADQZXVIMKKPTTREGSMBYNPJPKDXVEYSHUVDZFNWDG"
                            },
                            "maxRedirects": 1000,
                            "agent": agent,
                            "pool": {
                                "maxSockets": 1000
                            }
                        }

                        let api = new apiRequest(options);
                        let body = await Promise.resolve(api.httpRequest());

                        const atualiza_desc = async () => {
                            if (body) {
                                let { ProductDescription, ImageUrl, Images } = JSON.parse(body);
                                let _produto = produtos.filter(val => val.codigo == prod.codigo)[0];

                                if (_produto) {
                                    if (ProductDescription) {
                                        if (_produto.descricao != ProductDescription) {
                                            _produto.descricao = ProductDescription;
                                            setProdutos(_produto, 'Teve sua descrição atualizada');

                                        }
                                    }
                                    let imagemProduto: ImagensProduto;

                                    let imagens = await getImagemProduto({ where: { produto: [{ uid: _produto.uid }] } });;

                                    if (imagens.length > 0) {
                                        if (ImageUrl) {
                                            let imagem = await getImagemProduto({ where: { caminho: ImageUrl } })

                                            if (!imagem) {
                                                imagemProduto = new ImagensProduto();
                                                imagemProduto.caminho = ImageUrl;
                                                imagemProduto.produto = Promise.resolve(_produto);
                                                imagemProduto.referencia = _produto.referencia;
                                                setImagemProduto(imagemProduto);


                                            }
                                            await Promise.all([imagem]);

                                        }
                                        if (Images) {
                                            for (let img in Images) {
                                                let imagem = await getImagemProduto({ where: { caminho: Images[img].ImageUrl } })

                                                if (!imagem) {
                                                    imagemProduto = new ImagensProduto();
                                                    imagemProduto.caminho = Images[img].ImageUrl;
                                                    imagemProduto.produto = Promise.resolve(_produto);
                                                    imagemProduto.referencia = _produto.referencia;
                                                    setImagemProduto(imagemProduto);


                                                }
                                                await Promise.all([imagem]);
                                            }

                                        }
                                    } else {
                                        if (ImageUrl) {
                                            imagemProduto = new ImagensProduto();
                                            imagemProduto.caminho = ImageUrl;
                                            imagemProduto.produto = Promise.resolve(_produto);
                                            imagemProduto.referencia = _produto.referencia;
                                            setImagemProduto(imagemProduto)


                                        }
                                        if (Images) {
                                            for (let img in Images) {
                                                imagemProduto = new ImagensProduto();
                                                imagemProduto.caminho = Images[img].ImageUrl;
                                                imagemProduto.produto = Promise.resolve(_produto);
                                                imagemProduto.referencia = _produto.referencia;
                                                setImagemProduto(imagemProduto)


                                            }
                                        }
                                    }
                                    await Promise.all([imagens]);
                                }

                            }

                        }
                        let exec_atualiza = await atualiza_desc()
                        await Promise.all([body, exec_atualiza]).finally(() => {
                            clearInterval(timerSemEstoque);
                        })
                    }

                }, 5000)

            }
            resolve("ok");
        })
    }

}
export function getImagemProduto(_where) {

    let _repImagensProduto: Repository<ImagensProduto> = getRepository(ImagensProduto);
    const imagens = async () => {
        let imagens = await _repImagensProduto.find(_where);
        const [imgs] = await Promise.all([imagens]);
        return imgs;
    }
    return imagens();

}
export function setImagemProduto(value, mensagem = undefined) {
    let _repImagensProduto: Repository<ImagensProduto> = getRepository(ImagensProduto);
    _repImagensProduto.save(value).then(() => {
        if (mensagem) console.log(mensagem);
    })
}
export function formData(request: Request) {
    return new Promise<Array<string>>((resolve, reject) => {
        const util = require('util');
        const formidable = require("formidable");
        let form = new formidable.IncomingForm();

        form.parse(request, (err, fields, files) => {
            let obj = [];
            obj[0] = fields;
            obj[1] = files
            resolve(obj);

        });

        form.on("error", (err) => {
            reject(err.message);
        });
    })
}
export function Email(mensagem) {
    return new Promise((resolve, reject) => {
        const nodemailer = require('nodemailer');

        let transport = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: "vermell.software@gmail.com",
                pass: "M@r10@1979"
            }
        });

        transport.sendMail(mensagem, function (err, info) {
            if (err) {
                transport.close();
                return reject(err);
            }
            else {
                transport.close();
                return resolve(info);
            }
        });
    })

}
export async function Permissao(req: Request, tabela, acao) {
   
    if (!req.grupos || req.grupos.length <= 0) {
        return false;
    }

    const hasPermissao = async () => {
        let hasPermissao: boolean = false;
 
        req.grupos.forEach(async (grupo) => {
           
            const _repGrupos: Repository<Grupos> = getRepository(Grupos);
            const grp = await _repGrupos.findOne(grupo.uid)
            let permissoes = await grp.permissoes;
           
            if (!grupo.excluido && grupo.ativo) {
                for (let p = 0; p < (permissoes.length); p++) {

                  
                    if (permissoes[p].tabela.toLowerCase() === tabela.toLowerCase()) {
                        
                        if (acao === "V") {
                            if (permissoes[p].visualizar)
                                hasPermissao = true;
                        }
                        if (acao === "I") {
                            if (permissoes[p].inserir)
                                hasPermissao = true;
                        }
                        if (acao === "A") {
                            if (permissoes[p].alterar)
                                hasPermissao = true;
                        }
                        if (acao === "E") {
                            if (permissoes[p].excluir)
                                hasPermissao = true;
                        }
                    }
                }
            }
    
        });
        return hasPermissao;
    }
    const permissao = await hasPermissao();
    return permissao;
}
export function Tabela(request: Request) {
    let url = request.url.split("/");
    let rota = url[1];
    if (rota.indexOf("?")) {
        rota = rota.split("?")[0]
    }
    console.log(url)
    console.log(request.url)
    switch (rota) {
        case "users": return "Usuarios";
        case "produtos": return "Produtos";
        case "vendedores": return "Vendedores";
        case "empresas": return "Empresas";
        case "clientes": return "Clientes";
        case "pedidos": return "Pedidos";
        case "grupos": return "Grupo";
        case "permissoes": return "Permissoes";
        case "tabelas": return "Tabelas";
    }
}
export function ValidaDat(valor) {
    let date = valor;
    let ardt = new Array;
    let ExpReg = new RegExp("(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[012])/[12][0-9]{3}");
    ardt = date.split("/");
    let erro = false;
    if (date.search(ExpReg) == -1) {
        erro = true;
    }
    else if (((ardt[1] == 4) || (ardt[1] == 6) || (ardt[1] == 9) || (ardt[1] == 11)) && (ardt[0] > 30))
        erro = true;
    else if (ardt[1] == 2) {
        if ((ardt[0] > 28) && ((ardt[2] % 4) != 0))
            erro = true;
        if ((ardt[0] > 29) && ((ardt[2] % 4) == 0))
            erro = true;
    }
    if (erro) {
        return erro;
    }
    return erro;
}
export async function getMaxCodigo() {
    let _repProdutos: Repository<Produtos> = getRepository(Produtos);
    const maxCodigo = async () => {

        let maxCod = await _repProdutos.createQueryBuilder("produtos")
            .select("max(cast(produtos.codigo as unsigned integer))", "maxCodigo")
            .getRawOne();

        const [max] = await Promise.all([maxCod]);
        return max

    }
    return maxCodigo();
}

//}