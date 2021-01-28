import { IInterface } from "./IInterface";
import { IPermissao } from "./IPermissao";

export interface IGrupos extends IInterface {

    nome_grupo?: string
    permissoes?: IPermissao[]
    usuarios?: IUsuarios[]
}