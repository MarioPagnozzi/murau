import { EmpresasController } from './controller/EmpresasController';
import { VendedoresController } from './controller/VendedoresController';
import { ProdutosController } from './controller/ProdutosController';
import { HomeController } from './controller/HomeController';
import {UserController} from "./controller/UserController";
import { ClientesController } from './controller/ClientesController';

export const Routes = [

    //roteamento liberado home
    {method: "get", route: "/home", controller: HomeController, action: "all"}, 
    {method: "get", route: "/home/:id", controller: HomeController, action: "one"},
    {method: "get", route: "/home/:prodEmpresa/all", controller: HomeController, action: "all"},
    {method: "get", route: "/home/:empresa/:valor", controller: HomeController, action: "Pesquisa"},

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

    //roteamentos restritos: Produtos
    {method: "get", route: "/produtos", controller: ProdutosController, action: "all"},
    {method: "get", route: "/produtos/:id", controller: ProdutosController, action: "one"}, 
    {method: "post", route: "/produtos", controller: ProdutosController, action: "save"},
    {method: "delete",route: "/produtos/:id", controller: ProdutosController, action: "remove"},
    {method: "get", route: "/produtos/:valor/:filtro", controller: ProdutosController, action: "filtro"},
    {method: "post", route: "/produtos/:codigo/novo", controller: ProdutosController,action: "insereNovo"},
    {method: "post", route: "/produtos/uploadfotos", controller: ProdutosController,action: "uploadFotos"},
    {method: "post", route: "/produtos/empresas", controller: ProdutosController,action: "vinculaEmpresas"},

    //roteamentos restritos: Vendedores
    {method: "get", route: "/vendedores", controller: VendedoresController, action: "all"}, 
    {method: "get", route: "/vendedores/:id", controller: VendedoresController, action: "one"}, 
    {method: "post", route: "/vendedores", controller: VendedoresController, action: "save"},
    {method: "delete",route: "/vendedores/:id", controller: VendedoresController, action: "remove"},
    {method: "get",route: "/vendedores/:nome/nome", controller: VendedoresController, action: "nome_like"},
    {method: "get", route: "/vendedores/:codigo/vendedor", controller: VendedoresController, action: "codigo"},
    {method: "get", route: "/vendedores/:codigo/empresas", controller: VendedoresController, action: "porEmpresa"},

    //retoeamento restritos: Empresas
    {method: "get", route: "/empresas", controller: EmpresasController, action: "all"}, 
    {method: "get", route: "/empresas/:codigo", controller: EmpresasController, action: "one"}, 
    {method: "post", route: "/empresas", controller: EmpresasController, action: "save"},
    {method: "delete",route: "/empresas/:id", controller: EmpresasController, action: "remove"},
    {method: "get", route: "/empresas/:codigo/clientes", controller: EmpresasController, action: "oneClientes"},
    {method: "get", route: "/empresas/:codigo/vendedores", controller: EmpresasController, action: "oneVendedores"},
    {method: "get", route: "/empresas/:codigo/produtos", controller: EmpresasController, action: "oneProdutos"},

    //Rota pública Clientes
    {method: "post", route: "/clientes/createCliente", controller: ClientesController, action: "createCliente"},

    //Rota privada Clientes
    {method: "get", route: "/clientes", controller: ClientesController, action: "all"},
    {method: "get", route: "/clientes/:id", controller: ClientesController, action: "one"},
    {method: "get", route: "/clientes/:filtro/:valor/filtro", controller: ClientesController, action: "filtro"},
    {method: "post", route: "/clientes",controller: ClientesController, action: "save"},
    {method: "delete", route: "/clientes/:id", controller: ClientesController, action: "remove"}

];