
import { ProdutosEmpresas } from '../entity/ProdutosEmpresas';
import { BaseController } from "./BaseController";
import {NextFunction, Request, Response} from "express";
import { getRepository, Repository } from 'typeorm';

export class ProdutosEmpresaController extends BaseController<ProdutosEmpresas> {
    
    private _repProdutosEmpresa: Repository<ProdutosEmpresas>  = getRepository(ProdutosEmpresas);
    constructor() {
        super(ProdutosEmpresas);
    }
    
    async one(request: Request, restrito = true) {
        
        const produtoEmpresa = await this._repProdutosEmpresa.findOne(request.params.id);
        const _produtoEmpresa: any = {...produtoEmpresa};
        _produtoEmpresa.empresa = await produtoEmpresa.empresa;
        _produtoEmpresa.produto = await produtoEmpresa.produto;
        return _produtoEmpresa;
    }
}