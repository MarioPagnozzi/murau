import { ContatosClientes } from './../entity/ContatosClientes';
import { Request } from 'express';
import { getRepository, Like, Repository } from 'typeorm';
import { Clientes } from './../entity/Clientes';
import { BaseController } from "./BaseController";
import { Produtos } from '../entity/Produtos';
import { ImagensProduto } from '../entity/imagesProduto';
export class ClientesController extends BaseController<Clientes> {
    private _repClientes: Repository<Clientes> = getRepository(Clientes);  
    constructor(){
        super(Clientes);
    }
    async createCliente(request: Request) {
        let {razao_social, nome_fantasia, cnpj, cep, endereco, 
            numero, bairro, cidade, uf, email, contatos  } = request.body;
        
        super.isRequired(razao_social, "A 'Razão Social' deve ser informada");
        super.isRequired(nome_fantasia, "O 'Nome Fantasia' dever ser informado");        
        super.isRequired(cep, "O 'CEP' deve ser informado");
        super.isRequired(endereco, "O 'Endereço' deve ser informado");
        super.isRequired(numero,"O 'Número' deve ser informado ");
        super.isRequired(bairro,"O 'Bairro' deve ser informado");
        super.isRequired(cidade, "A 'Cidade' deve ser informada");
        super.isRequired(uf, "A 'UF' deve ser informada");
        super.isRequired(email, "O 'E-mail' deve ser informada");
        super.isEmail(email, "Informe um 'E-mail' válido");
        super.isRequired(contatos, "Deve ser informado um ou mais 'Contatos'");
        super.isCPFCNPJ(cnpj, "'CNPJ' informado não é válido");

        let _cliente: Clientes = new Clientes();

        _cliente.razao_social = razao_social;
        _cliente.nome_fantasia = nome_fantasia;
        _cliente.cnpj = cnpj;
        _cliente.cep = cep;
        _cliente.endereco = endereco;
        _cliente.numero = numero;
        _cliente.bairro = bairro;
        _cliente.cidade = cidade;
        _cliente.uf = uf;
        _cliente.email = email;       
        _cliente.ativo = false;
        _cliente.statusCliente = 1;

        let codigo = await this._repClientes.createQueryBuilder("clientes")
                         .select("IFNULL(max(cast(cli.codigo as unsigned INTEGER)),0)","maxCodigo")
                         .from(Clientes, "cli")
                         .getRawOne();

        _cliente.codigo =  +codigo["maxCodigo"] + 1;

        super.save(_cliente);

        
        
        contatos.forEach(async (contato) => {
            let _contato: ContatosClientes = new ContatosClientes();
            _contato.ddd = contato.ddd;
            _contato.numero = contato.numero;
            _contato.operadoras = contato.operadoras;
            _contato.cliente = _cliente;

            let _repContatoClientes: Repository<ContatosClientes> = getRepository(ContatosClientes);
            _repContatoClientes.save(_contato);
        });
        let fs = require("fs");
        let path = require("path");
        const arqHtml = path.join(path.dirname(__dirname),"templates") + "/email_cadastro.html";
        const imgFb = path.join(path.dirname(__dirname), "templates" ) + "/images/005-facebook.png";
        let html = fs.readFileSync(arqHtml);
        html = html.toString().replace("NomeCliente", _cliente.razao_social);

        let _repProdutos: Repository<Produtos> = getRepository(Produtos);
        
        let produtos = await _repProdutos.find({order: {data_inclusao: "DESC"}, take: 6});
        let _repImagensProduto: Repository<ImagensProduto> = getRepository(ImagensProduto);
        let i = 1;
        for (let prod in produtos) {
            
            html = html.toString().replace("nomeProduto" + i.toString(), produtos[prod].nome);
            html = html.toString().replace("DescricaoProduto" + i.toString(), produtos[prod].descricao);

            let imagem = await _repImagensProduto.find({where: {produto: produtos[prod]}, take: 1});
            if (imagem.length > 0) {
                html = html.toString().replace("Linkimage" + i.toString(), imagem[0].caminho);
            }
            else {
                html = html.toString().replace("LinkImage" + i.toString(), "https://i.ibb.co/qs4w265/sem-foto.jpg")
            }
            i = +i + 1;
        }
        const mensagem = {
            from: "atendimento@murau.com",
            to: _cliente.email,
            subject: "Confirmação de Cadastro",
            html: html
        }       
        let sendMail = this._func.Email(mensagem);
        let retornoEmail = await sendMail;
        console.log(retornoEmail)
        return _cliente;

    } 
    async filtro(request: Request) {

        if (!this._func.Permissao(request, "Clientes", "V")) {
            return {status: 400, errors: ["Você não tem permissão para acessar os registros"]}
        }

        let filtro = request.params.filtro;
        let valor = request.params.valor;

        if (filtro == "nome") {
            return this._repClientes.find({where: {razao_social: Like("%" + valor + "%")}});
        }

        if (filtro == "empresa") {
            return this._repClientes.find({where: {empresa: {codigo: +valor}}});
        }

        if (filtro == "contato") {
            return this._repClientes.createQueryBuilder("clientes")
                                    .innerJoinAndSelect("clientes.contatos", "contatos")
                                    .leftJoinAndSelect("clientes.contatos","cont")
                                    .where("contatos.numero = :numero", {numero: valor})
                                    .getMany();
        }

        if (filtro == "cidade") {
            return this._repClientes.find({where: {cidade: Like("%" + valor + "%")}});
        }

        if (filtro == "vendedor") {
            return this._repClientes.find({where: {vendedor: Like("%" + valor + "%")}});
        }

        if (filtro == "cnpj") {
            return this._repClientes.find({where: {cnpj: Like("%" + valor + "%")}});
        }

        if (filtro == "email") {
            return this._repClientes.find({where: {email: Like("%" + valor + "%")}});
        }

        if (filtro == "pedidos") {
            return this._repClientes.createQueryBuilder("clientes")
                                    .innerJoinAndSelect("clientes.pedidos", "pedidos")
                                    .where("pedidos.num_pedido = :num_pedido", {num_pedido: valor})
                                    .getMany();
        }

        if (filtro == "novos") {
            return this._repClientes.find({where: {data_inclusao: new Date()}})
        }
    }
    async save(request: Request) {
        let _cliente = <Clientes>request.body;

        if (!this._func.Permissao(request, "Clientes", _cliente.uid ? "A" : "I")) {
            return {status: 400, errors: ["Você não tem permissão para alterar ou inserir registros"]}
        }

        super.isRequired(_cliente.razao_social, "A 'Razão Social' deve ser informada");
        super.isRequired(_cliente.nome_fantasia, "O 'Nome Fantasia' dever ser informado");        
        super.isRequired(_cliente.cep, "O 'CEP' deve ser informado");
        super.isRequired(_cliente.endereco, "O 'Endereço' deve ser informado");
        super.isRequired(_cliente.numero,"O 'Número' deve ser informado ");
        super.isRequired(_cliente.bairro,"O 'Bairro' deve ser informado");
        super.isRequired(_cliente.cidade, "A 'Cidade' deve ser informada");
        super.isRequired(_cliente.uf, "A 'UF' deve ser informada");
        super.isRequired(_cliente.email, "O 'E-mail' deve ser informada");
        super.isEmail(_cliente.email, "Informe um 'E-mail' válido");
        super.isRequired(_cliente.contatos, "Deve ser informado um ou mais 'Contatos'");
        super.isCPFCNPJ(_cliente.cnpj, "'CNPJ' informado não é válido");

        let codigo = await this._repClientes.findOne({where:{codigo: _cliente.codigo}});
        if (codigo) {
            let maxCodigo = await this._repClientes.createQueryBuilder("clientes")
                         .select("IFNULL(max(cast(cli.codigo as unsigned INTEGER)),0)","maxCodigo")
                         .from(Clientes, "cli")
                         .getRawOne();
            let sugestao = +maxCodigo["maxCodigo"] + 1;
            return {status: 400, errors: ["Este código já está sendo usado por outro cliente. Sugestão: " + sugestao]};
        }
        super.save(_cliente).then((cliente) => {
            _cliente.contatos.forEach(async (contato) => {
                let _contato: ContatosClientes = new ContatosClientes();
                _contato.ddd = contato.ddd;
                _contato.numero = contato.numero;
                _contato.operadoras = contato.operadoras;
                _contato.cliente = cliente;
    
                let _repContatoClientes: Repository<ContatosClientes> = getRepository(ContatosClientes);
                _repContatoClientes.save(_contato);
            });
        });
        return _cliente;
    }
}