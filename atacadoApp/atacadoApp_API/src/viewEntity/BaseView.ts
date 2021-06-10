import { ViewColumn } from "typeorm";

export abstract class BaseView {
    @ViewColumn()
    uid: string;

    @ViewColumn()
    ativo: boolean;

    @ViewColumn()
    excluido: boolean;   

    @ViewColumn()
    data_inclusao: Date;

    @ViewColumn()
    data_alteracao: Date;

}