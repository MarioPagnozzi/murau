export abstract class BaseModel {
    
    uid?: string;
    ativo: boolean = false;
    excluido: boolean = false;   
    data_inclusao?: Date;
    data_alteracao?: Date;

}