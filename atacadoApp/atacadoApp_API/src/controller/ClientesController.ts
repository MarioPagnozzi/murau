import { ContatosClientes } from './../entity/ContatosClientes';
import { Request } from 'express';
import { Equal, getRepository, Like, Repository } from 'typeorm';
import { Clientes } from './../entity/Clientes';
import { BaseController } from "./BaseController";
import { Produtos } from '../entity/Produtos';
import { ImagensProduto } from '../entity/imagesProduto';
import { REPLCommandAction } from 'repl';
import { User } from '../entity/User';
import { Vendedores } from '../entity/Vendedores';
import { Empresas } from '../entity/Empresas';
import { FileHelper } from '../helpers/FileHelpers';
import { Grupos } from '../entity/Grupos';

var md5 = require("md5");
export class ClientesController extends BaseController<Clientes> {
    private _repClientes: Repository<Clientes> = getRepository(Clientes);  
    constructor(){
        super(Clientes);
    }
    async createCliente(request: Request) {
        let {razao_social, nome_fantasia, cnpj, cep, endereco, 
            numero, bairro, cidade, uf, email, contatos, complemento} = request.body;
        
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
        _cliente.complemento = complemento;
        _cliente.ativo = false;
        _cliente.statusCliente = 1;
        _cliente.contatos = contatos;
       

        let codigo = await this._repClientes.createQueryBuilder("clientes")
                         .select("IFNULL(max(cast(cli.codigo as unsigned INTEGER)),0)","maxCodigo")
                         .from(Clientes, "cli")
                         .getRawOne();

        _cliente.codigo =  +codigo["maxCodigo"] + 1;

       return super.save(_cliente).then(async (cliente) => {
        if (cliente.errors) return cliente;

        for (let i = 0; i < contatos.length; i++) {
            let _repContatoClientes: Repository<ContatosClientes> = getRepository(ContatosClientes);
            
            let cont = new ContatosClientes();
            cont = {...contatos[i]};
            cont.cliente = cliente;

            _repContatoClientes.save(cont);
        }
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

            let imagem = await _repImagensProduto.find({
                                                relations: ["produto"],
                                                where: {produto: [{uid: produtos[prod].uid}]}, take: 1});
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
        let sendMail = this.func.Email(mensagem);
        let retornoEmail = await sendMail;
        console.log(retornoEmail);
        return cliente;
       });

    }
    async clientesDia(request: Request) {
        if (!this.func.Permissao(request, "Clientes", "V")) {
            return {status: 400, errors: ["Você não tem permissão para acessar os registros"]}
        }
        const dataAtual = new Date();
        console.log("passou dia")
        return this._repClientes.createQueryBuilder("clientes")
                                .where("date_format(clientes.data_inclusao, '%d/%m/%Y') = date_format(:data,'%d/%m/%Y')",{data: dataAtual.toISOString()})
                                .getMany();
    }
    async filtro(request: Request) {

        if (!this.func.Permissao(request, "Clientes", "V")) {
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
            return this._repClientes.find({
                relations: ["vendedor"],
                where: {vendedor: [{nome: Equal(valor)},{codigo: valor}]}});
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
                                    .where("replace(pedidos.num_pedido, '/','-') = :num_pedido", {num_pedido: valor})
                                    .getOne();
        }

        if (filtro == "pendentes") {
            return this._repClientes.find({where: {ativo: valor, statusCliente: 1}});
        }
    }
    async removeContato(request: Request) {
        if (!this.func.Permissao(request, "Clientes", "A")) {
            return {status: 400, errors: ["Você não tem permissão para alterar ou inserir registros"]}
        }
        let _repContatoClientes: Repository<ContatosClientes> = getRepository(ContatosClientes);
        let _contato = await _repContatoClientes.findOne(request.params.id);
        let _cliente = await this._repClientes.findOne({where: {uid: request.params.cli}});
        _repContatoClientes.remove(_contato);
        return _repContatoClientes.find({where: {cliente: [{uid: _cliente.uid}]}});
    }
    async save(request: Request) {

        let {contatos, usuario} = request.body;
        let _cliente = <Clientes>request.body;


        if (!this.func.Permissao(request, "Clientes", _cliente.uid ? "A" : "I")) {
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


        if (!_cliente.codigo) {
            let maxCodigo = await this._repClientes.createQueryBuilder("clientes")
            .select("IFNULL(max(cast(cli.codigo as unsigned INTEGER)),0)","maxCodigo")
            .from(Clientes, "cli")
            .getRawOne();
            _cliente.codigo = +maxCodigo["maxCodigo"] + 1;
        }
        let cod = await this._repClientes.findOne({where:{codigo: _cliente.codigo}});
        if (cod && !_cliente.uid) {
            let maxCodigo = await this._repClientes.createQueryBuilder("clientes")
                         .select("IFNULL(max(cast(cli.codigo as unsigned INTEGER)),0)","maxCodigo")
                         .from(Clientes, "cli")
                         .getRawOne();
            let sugestao = +maxCodigo["maxCodigo"] + 1;
            _cliente.codigo = sugestao;
            return {status: 400, errors: [{message: "Este código já está sendo usado por outro cliente. Sugestão: " + sugestao}]};
        }

        
   
        return super.save(_cliente).then(async (cliente) => {

            if (cliente.errors) return cliente;
            let _repUsuario: Repository<User> = getRepository(User);
            let _repGrupos: Repository<Grupos> = getRepository(Grupos);
            let grupos: Grupos[] = [];
            if (usuario) {
                
                if (usuario.uid) {
                    let _usuario = await _repUsuario.findOne(usuario.uid);
                    let grupos_usuario = await _usuario.grupos;
                    if (grupos_usuario.length > 0) {
                        grupos = grupos_usuario;
                    } else {
                        let grupo = await _repGrupos.findOne({where: {nome_grupo: 'Clientes'}});
                        grupos.push(grupo);
                    }
                }
                else {
                    let grupo = await _repGrupos.findOne({where: {nome_grupo: 'Clientes'}});
                    grupos.push(grupo);
                }
                let user = new User();
                user.foto = usuario.foto;
                if (user.foto) {
                    let criarFotoResult = await FileHelper.writePicture(user.foto);
                    if (criarFotoResult) {
                        user.foto = criarFotoResult;
                    }
                }
                user.nome = usuario.nome;
                user.uid = usuario.uid;
                user.email = usuario.email;
                user.isRoot = usuario.isRoot;
                user.cliente = cliente;
                console.log(grupos)
                user.grupos = Promise.resolve(grupos);
                user.ativo = cliente.ativo;
                user.excluido = cliente.excluido;
                if (md5(usuario.senha) != usuario.senha) user.senha = md5(usuario.senha);
                user.status_usuario = cliente.statusCliente;
                _repUsuario.save(user);
            } else {
                usuario = await _repUsuario.findOne({where: [{cliente: {uid: cliente.uid}}]});
                grupos = await usuario.grupos;
                if (usuario) {
                    if (grupos.length <= 0) {
                        let grupo = await _repGrupos.findOne({where: {nome_grupo: 'Clientes'}});
                        grupos.push(grupo);
                    }
                    let user = new User();
                    user = {...usuario};
                    user.cliente = cliente;
                    user.grupos = Promise.resolve(grupos);
                    user.ativo = cliente.ativo;
                    user.excluido = cliente.excluido;
                    user.status_usuario = !cliente.excluido || !cliente.ativo ? cliente.statusCliente : usuario.status_usuario;
                    if (user.foto) {
                        let criarFotoResult = await FileHelper.writePicture(user.foto);
                        if (criarFotoResult) {
                            user.foto = criarFotoResult;
                        }
                    }
                    _repUsuario.save(user);
                }
            }
            

            for (let i = 0; i < contatos.length; i++) {
                let _repContatoClientes: Repository<ContatosClientes> = getRepository(ContatosClientes);
                
                let cont = new ContatosClientes();
                cont = {...contatos[i]};
                cont.cliente = cliente;
    
                _repContatoClientes.save(cont);
            }
            return cliente;
        });
    }

    async one(request: Request) {
        let cliente = await this._repClientes.findOne(request.params.id);
        let _cliente: any = {...cliente};
        _cliente.pedidos = await cliente.pedidos;
        return _cliente;
    }
}