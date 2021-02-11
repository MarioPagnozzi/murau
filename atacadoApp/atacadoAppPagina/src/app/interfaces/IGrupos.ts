import { IInterface } from "./IInterface";
import { IPermissao } from "./IPermissao";
import { IUsuarios } from "./IUsuarios";

export interface IGrupos extends IInterface {

    nome_grupo?: string
    permissoes?: IPermissao[]
    usuarios?: IUsuarios[]
}