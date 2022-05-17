import { EmpresasController } from './controller/EmpresasController';
import { VendedoresController } from './controller/VendedoresController';
import { ProdutosController } from './controller/ProdutosController';
import { HomeController } from './controller/HomeController';
import {UserController} from "./controller/UserController";
import { ClientesController } from './controller/ClientesController';
import { PedidosController } from './controller/PedidosController';
import { GrupoController } from './controller/GrupoController';
import { StorageController } from './controller/StorageController';
import { PromocaoController } from './controller/PromocaoController';
import { TabelasController } from './controller/TabelasController';
import { ProdutosEmpresaController } from './controller/ProdutosEmpresaController';

export const Routes = [

    //roteamento liberado home
    {method: "get", route: "/home", controller: HomeController, action: "all"},
    
    {method: "get", route: "/home/:id", controller: HomeController, action: "one"},   
    {method: "get", route: "/home/:valor/:filtro/filtro", controller: HomeController, action: "filtro"},

    //roteamento liberado usuário
    {method: "post", route: "/users/create", controller: UserController, action: "createUser"}, 

    //roteamentos restritos usuários
    {method: "get", route: "/users", controller: UserController, action: "all"}, 
    {method: "get", route: "/users/:id", controller: UserController, action: "one"}, 
    {method: "post", route: "/users", controller: UserController, action: "save"},
    {method: "post", route: "/users/auth", controller: UserController, action: "auth"},
    {method: "delete",route: "/users/:id", controller: UserController, action: "remove"},
    {method: "get", route: "/users/:nome/nome", controller: UserController, action: "nome_like"},
    {method: "get", route: "/users/:nome_grupo/grupo",controller: UserController, action: "porGrupo"},
    {method: "get", route: "/users/:valor/:filtro/filtro", controller: UserController, action: "filtro"},

    //roteamentos restritos: Produtos
    {method: "get", route: "/produtos", controller: ProdutosController, action: "all"},
    {method: "get", route: "/produtos/:id", controller: ProdutosController, action: "one"}, 
    {method: "post", route: "/produtos", controller: ProdutosController, action: "save"},
    {method: "delete",route: "/produtos/:id", controller: ProdutosController, action: "remove"},
    {method: "get", route: "/produtos/:valor/:filtro/filtro", controller: ProdutosController, action: "filtro"},
    {method: "post", route: "/produtos/:codigo/novo", controller: ProdutosController,action: "insereNovo"},
    {method: "post", route: "/produtos/uploadfotos", controller: ProdutosController,action: "uploadFotos"},
    {method: "post", route: "/produtos/empresas", controller: ProdutosController,action: "vinculaEmpresas"},
    {method: "get", route: "/produtos/novos/proddia", controller: ProdutosController,action: "produtosDia"},
    {method: "get", route: "/produtos/produto_list/query_custom/qry/search", controller: ProdutosController, action: "search"},
    {method: "get", route: "/public/uploads/fotos/:codprod/:nome_foto", controller: ProdutosController, action: "getFile"},
    {method: "get", route: "/produtos/fotos/:uid", controller: ProdutosController, action: "getFile"},
    {method: "get", route: "/produtos/produtoempresa/:prod", controller: ProdutosController, action: "produtoEmpresas"},
    {method: "get", route: "/produtosempresas/:id", controller: ProdutosEmpresaController, action: "one"},
    {method: "get", route: "/produtos/estoque/:cdSaldo/:prod", controller: ProdutosController, action: "estoque"},
    //roteamentos restritos: Vendedores
    {method: "get", route: "/vendedores", controller: VendedoresController, action: "all", useQueryString: true}, 
    {method: "get", route: "/vendedores/:id", controller: VendedoresController, action: "one"}, 
    {method: "post", route: "/vendedores", controller: VendedoresController, action: "save"},
    {method: "delete",route: "/vendedores/:id", controller: VendedoresController, action: "remove"},
    {method: "get",route: "/vendedores/:nome/nome", controller: VendedoresController, action: "nome_like"},
    {method: "get", route: "/vendedores/:codigo/vendedor", controller: VendedoresController, action: "codigo"},
    {method: "get", route: "/vendedores/:codigo/empresas", controller: VendedoresController, action: "porEmpresa"},
    {method: "delete", route: "/vendedores/:vend/contato/:id", controller: VendedoresController, action: "removeContato"},
    {method: "delete", route: "/vendedores/:vend/empresa/:id", controller: VendedoresController, action: "removeEmpresa"},
    {method: "get", route: "/vendedores/:valor/:filtro/filtro", controller: VendedoresController, action: "filtro", useQueryString: true},

    //retoeamento restritos: Empresas
    {method: "get", route: "/empresas", controller: EmpresasController, action: "all"}, 
    {method: "get", route: "/empresas/:id", controller: EmpresasController, action: "one"},
    {method: "post", route: "/empresas", controller: EmpresasController, action: "save"},
    {method: "delete",route: "/empresas/:id", controller: EmpresasController, action: "remove"},
    {method: "get", route: "/empresas/:valor/:filtro/filtro", controller: EmpresasController, action: "filtro"},
    

    //Rota pública Clientes
    {method: "post", route: "/clientes/createCliente", controller: ClientesController, action: "createCliente"},

    //Rota privada Clientes
    {method: "get", route: "/clientes", controller: ClientesController, action: "all"},
    {method: "get", route: "/clientes/:id", controller: ClientesController, action: "one"},
    {method: "get", route: "/clientes/:valor/:filtro/filtro", controller: ClientesController, action: "filtro"},
    {method: "post", route: "/clientes",controller: ClientesController, action: "save"},
    {method: "delete", route: "/clientes/:id", controller: ClientesController, action: "remove"},
    {method: "get", route: "/clientes/clientesdia/hoje", controller: ClientesController, action: "clientesDia"},
    {method: "delete", route: "/clientes/:cli/contato/:id", controller: ClientesController, action: "removeContato"},

    //Rota privada Pedidos
    {method: "delete", route: "/pedidos/:id", controller: PedidosController, action: "remove"},
    {method: "post", route: "/pedidos", controller: PedidosController, action: "save"},
    {method: "get", route: "/pedidos/:valor/:filtro/filtro", controller: PedidosController, action: "filtro"},
    {method: "get", route: "/pedidos", controller: PedidosController, action: "all"},
    {method: "get", route: "/pedidos/novos/peddia", controller: PedidosController, action: "pedidosDia"},
    {method: "get", route: "/pedidos/:id", controller: PedidosController, action: "one"},

    //Rota de Grupos
    {method: "post", route: "/grupos", controller: GrupoController, action: "save"},
    {method: "get", route: "/grupos", controller: GrupoController, action: "all"},
    {method: "get", route: "/grupos/:id", controller: GrupoController, action: "one"},
    {method: "get", route: "/grupos/usuarios/:user", controller: GrupoController, action: "usuarios"},
    {method: "get", route: "/grupos/permissoes/:grupo", controller: GrupoController, action: "permissoes"},
    {method: "delete", route: "/grupos/:id", controller: GrupoController, action: "remove"},
    {method: "get", route: "/tabelas", controller: TabelasController, action: "all"},

    {method: "get", route: "/storage/:filename", controller: StorageController, action: "getFile" },
    {method: "post", route: "/promocao", controller: PromocaoController, action: "save"},
    {method: "post", route: "/promocao/upload", controller: PromocaoController, action: "uploadFiles"},
    {method: "get", route: "/promocao/files", controller: PromocaoController, action: "files"},
    {method: "get", route: "/imagesProduto", controller: HomeController, action: "imagens"}

];