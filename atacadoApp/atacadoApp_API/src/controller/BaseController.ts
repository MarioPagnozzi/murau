import {getRepository, Repository} from "typeorm";
import {NextFunction, Request, Response} from "express";
import { BaseNotificacao } from "../entity/BaseNotificacao";

export abstract class BaseController<T> extends BaseNotificacao {

    private _repositorio: Repository<T>;

    constructor(entity: any) {
        super();
        this._repositorio = getRepository<T>(entity);
    }

    async all() {
        return this._repositorio.find({
            where: {
                excluido: false
            }
        });
    }

    async one(request: Request) {
        return this._repositorio.findOne(request.params.id);
    }

    async save(model: any) {

        if (model.uid) {

            delete model['excluido'];          
            delete model['data_inclusao'];
            delete model['data_alteracao'];

            let _modelInDB = await this._repositorio.findOne(model.uid);
            if (_modelInDB) {
                Object.assign(_modelInDB, model);
            }
        }
        if (this.valid())
            return this._repositorio.save(model);
        else
            return {
                status: 400,
                errors: this.allNotifications
            }
    }

    async remove(request: Request) {
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
                    'Registro não encontrado!'
                ]
            }
        }
       
    }
    get repositorio(): Repository<T> {
        return this._repositorio;
    }
}