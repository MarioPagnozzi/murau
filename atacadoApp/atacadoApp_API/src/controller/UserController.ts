import { Repository, getRepository } from 'typeorm';
import { Grupos } from './../entity/Grupos';
import {NextFunction, Request, Response} from "express";
import { User } from "../entity/User";
import { BaseController } from "./BaseController";
import * as md5 from "md5";
import { sign } from "jsonwebtoken";
import config from "../configuracao/config";

export class UserController extends BaseController<User> {

   constructor() {
       super(User);
   }

   async auth(request: Request) {
       let {email, senha} = request.body;
       if (!email || !senha) 
           return {status: 400, message: "informe um e-mail e uma senha para logar"};
        let user = await this.repositorio.findOne({email: email, senha: md5(senha)});
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
            return { status: 404, message: "e-mail ou senha inválidos"}
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
        return {status: 400, errors: ['A senha e a confirmação são diferentes!']};

    if (senha)
        user.senha = md5(senha);
    user.isRoot = isRoot;

    return super.save(user);
   }
   async save(request: Request) {
        let _user = <User>request.body;
        super.isRequired(_user.nome, "O nome do usuário é obrigatório");
        super.isRequired(_user.email, "O e-mail do usuário é obrigatório");
        super.isRequired(_user.senha, "A senha do usuário é obrigatório");
        super.isEmail(_user.email, "E-mail é inválido");
        super.isRequired(_user.grupos, "É preciso atribuir ao menos 1 (um) grupo para o usuário");
        return super.save(_user);
   }
}