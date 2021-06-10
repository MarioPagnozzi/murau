import { getRepository, Like, Repository } from 'typeorm';
import {NextFunction, Request, Response} from "express";
import { User } from "../entity/User";
import { BaseController } from "./BaseController";
import * as md5 from "md5";
import { sign } from "jsonwebtoken";
import config from "../configuracao/config";
import * as _fun from "../configuracao/functions/globalFunctions";
import { FileHelper } from '../helpers/FileHelpers';
export class UserController extends BaseController<User> {

    private _repositories: Repository<User> = getRepository(User);
   
    constructor() {
       super(User);
   }

   async auth(request: Request) {
       let {email, senha} = request.body;
       if (!email || !senha) 
           return {status: 400, erros: ["informe um e-mail e uma senha para logar"]};
        let user = await this.repositorio.findOne({email: email, senha: md5(senha), status_usuario: 2, ativo: true});
        if(user) {
            let _payload = {
                uid: user.uid,
                nome: user.nome,
                email: user.email,
                foto: user.foto
            }
            return {
                status: 200,
                message: {
                    user: _payload,
                    token: sign({
                        ..._payload,
                        tm: new Date().getTime()
                    }, config.secretkey)
                }
            }
        
       } else 
            return { status: 404, errors: ["e-mail ou senha inválidos"]}
   }

   async createUser(request: Request) {
    let {nome, foto, email, senha, isRoot, confirmaSenha, status_usuario, grupos} = request.body;

    super.isRequired(nome, "O nome do usuário é obrigatório");
    super.isRequired(email, "O e-mail do usuário é obrigatório");
    super.isRequired(senha, "A senha do usuário é obrigatório");
    super.isEmail(email, "E-mail é inválido");
    super.isRequired(confirmaSenha, "Confirme a senha");

    let user = new User();

    user.nome = nome;
    user.email = email;
    user.foto = foto;
    user.status_usuario = status_usuario;
    user.grupos = grupos;

    if (senha != confirmaSenha )
        return {status: 400, errors: [{message: 'A senha e a confirmação são diferentes!'}]};

    if (senha)
        user.senha = md5(senha);
    user.isRoot = isRoot;

    if (user.foto) {
        let criarFotoResult = await FileHelper.writePicture(user.foto);
        if (criarFotoResult) {
            user.foto = criarFotoResult;
        }
    }

    return super.save(user);
   }
   async save(request: Request) {
        
        let _user = <User>request.body;
        let {confirmaSenha} = request.body;
        if (!_fun.Permissao(request, "Usuarios", _user.uid ? "A" : "I")) {
            return {status: 400, errors:["Usuário não tem permissão para alterar ou inserir registros"]}
        }
        super.isRequired(_user.nome, "O nome do usuário é obrigatório");
        super.isRequired(_user.email, "O e-mail do usuário é obrigatório");
        
        super.isEmail(_user.email, "E-mail é inválido");
        super.isRequired(_user.grupos, "É preciso atribuir ao menos 1 (um) grupo para o usuário");

        if (!_user.uid) {
            super.isRequired(_user.senha, "A senha do usuário é obrigatório");
            super.isRequired(confirmaSenha, "Confirme a senha");

            if (_user.senha != confirmaSenha )
            return {status: 400, errors: [{message: 'A senha e a confirmação são diferentes!'}]};

            if (_user.senha)
                _user.senha = md5(_user.senha);
        } else {
            delete _user.senha;
        }
        

        if (_user.foto) {
            let criarFotoResult = await FileHelper.writePicture(_user.foto);
            if (criarFotoResult) {
                _user.foto = criarFotoResult;
            }
        }

        return super.save(_user);
   }
   async nome_like(request: Request) {
       if (!_fun.Permissao(request, "Usuarios", "V")) {
           return {status: 400, errors: ["Usuário não tem permissão para acessar este cadastro"]}
       }
       return this._repositories.find({nome: Like("%" + request.params.nome + "%")});
   }
   async porGrupo(request: Request){
        if (!_fun.Permissao(request, "Usuarios", "V")) {
            return {status: 400, errors: ["Usuário não tem permissão para acessar este cadastro"]}
        }
        return this._repositories.find({grupos: [{nome_grupo: request.params.nome_grupo}]});
   }
   async filtro(request: Request) {
       const filtro = request.params.filtro;
       const valor = request.params.valor;
       if (filtro === "vendedor") {
           return this._repositories.findOne({vendedor: {uid: valor}})
       }
       else if (filtro === "cliente") {
            return this._repositories.findOne({cliente: {uid: valor}});
       } else {
           return;
       }
   }
}