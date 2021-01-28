import { BaseStatus } from "../enum/status";
import { IGrupos } from "./IGrupos";
import { IInterface } from "./IInterface";

export interface IUsuarios extends IInterface {

    nome?: string;
    email?: string;
    senha?: string;
    foto?: string;
    isRoot?: boolean;
    status_usuario?: BaseStatus
    grupos?: IGrupos[]
}