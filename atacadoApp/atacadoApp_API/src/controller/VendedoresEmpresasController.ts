import { Request } from 'express';
import { VendedoresEmpresas } from "../entity/VendedoresEmpresas";
import { BaseController } from "./BaseController";

export class VendedoresEmpresasController extends BaseController<VendedoresEmpresas> {
    constructor() {
    super(VendedoresEmpresas);
    }

    async save(request: Request) {
        let {empresa, vendedor} = request.body;

        super.isRequired(empresa,"Deve ser informado uma ou mais 'Empresas'");
        super.isRequired(vendedor,"Deve ser informado um ou mais 'Vendedores'");

       /* let _vendedoresEmpresas: VendedoresEmpresas = new VendedoresEmpresas();
        _vendedoresEmpresas.vendedor = vendedor;
        _vendedoresEmpresas.empresa = empresa;

        super.save(_vendedoresEmpresas);
    */}
} 