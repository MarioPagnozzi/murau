import { IGrupos } from "./IGrupos";
import { IInterface } from "./IInterface";

export interface IPermissao extends IInterface {

    tabela?: string
    visualizar?: boolean
    excluir?: boolean
    alterar?: boolean
    inserir?: boolean
    grupo?: IGrupos
}