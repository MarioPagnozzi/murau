import {getRepository, Repository} from "typeorm";
import {NextFunction, Request, Response} from "express";
import { BaseNotificacao } from "../entity/BaseNotificacao";
import { functions } from "../configuracao/functions/globalFunctions"
import { Produtos } from "../entity/Produtos";

var querystring = require("querystring");
export abstract class BaseController<T> extends BaseNotificacao {

    private _repositorio: Repository<T>;
    protected _func: functions;
    constructor(entity: any) {
        super();
        this._repositorio = getRepository<T>(entity);
        this._func = new functions();
    }

    async all(request: Request, restrito = true) {
        
        if (restrito) {
            let tabela = this._func.Tabela(request);
            if (!this._func.Permissao(request, tabela, "V")) 
                return {status: 400, errors: [{message: "Você não tem permissão para acessar os registros"}]}
        }
      
        return this._repositorio.find();
    }

    async one(request: Request, restrito = true) {
        if (restrito) {
            let tabela = this._func.Tabela(request);
            if (!this._func.Permissao(request, tabela, "V")) 
                return {status: 400, errors: [{message: "Você não tem permissão para acessar os registros"}]}
        }
        return this._repositorio.findOne(request.params.id);
    }
    
async save(model: any) {
        
        if (model.uid) {
           
            delete model['data_inclusao'];

            let _modelInDB = await this._repositorio.findOne(model.uid);
            if (_modelInDB) {
                Object.assign(_modelInDB, model);
            }
        }       
        if (this.valid()) {
            return this._repositorio.save(model);
        } else
            console.log(JSON.stringify(this.allNotifications));
            return {
                status: 400,
                errors: [this.allNotifications]
            }
    }

    async remove(request: Request, restrito = true) {
        if (restrito) {
            let tabela = this._func.Tabela(request);
            if (!this._func.Permissao(request, tabela, "E")) 
                return {status: 400, errors: [{message: "Você não tem permissão para excluir o registro"}]}
        }
        let uid = request.params.id;
        let model: any = await this._repositorio.findOne(uid);
        if (model) {
            model.excluido = true;
            model.ativo = false;
            return this._repositorio.save(model);
        } 
        else {
            return {
                status: 404,
                errors: [
                    {message: 'Registro não encontrado!'}
                ]
            }
        }
       
    }
    get repositorio(): Repository<T> {
        return this._repositorio;
    }
}