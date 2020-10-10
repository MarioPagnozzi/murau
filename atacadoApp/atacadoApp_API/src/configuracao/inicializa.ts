import { Configuracoes } from './../entity/Configuracoes';
import { User } from './../entity/User';
import { Produtos } from './../entity/Produtos';
import { Vendedores } from './../entity/Vendedores';
import { Empresas } from './../entity/Empresas';
import { getRepository, Repository } from 'typeorm';
import * as fs from "fs";
import { Grupos } from '../entity/Grupos';
import { Permissao } from '../entity/Permissao';
import { Tabelas } from '../entity/Tabelas';
import * as md5 from "md5";
import config from "./config";
import { ProdutosEmpresas } from '../entity/ProdutosEmpresas';




export class Setup {    
   
    constructor () {
        
    }
            
    
    async inicializar() {

        let _repEmpresa: Repository<Empresas> =  getRepository(Empresas);
        let _repVendedor: Repository<Vendedores> = getRepository(Vendedores);
        let _emp: any;
        let _vend: any;
        let EntityEmp: Empresas;
        let EntityVendedor: Vendedores; 
        
        let _Empresas = await _repEmpresa.findOne();

        if (!_Empresas) {
            
            let emp = fs.readFileSync(__dirname + "/arquivos/empresas.csv", "utf8");           
            let emps = emp.split(/\n/);
                    

            let vend = fs.readFileSync(__dirname + "/arquivos/vendedores.csv", "utf8");
            let vendedores = vend.split(/\n/);
           

            emps.forEach(async function (dados) {                
                _emp = dados.split(";");

               
                    EntityEmp = new Empresas();
                    EntityEmp.codigo = parseFloat( _emp[0]);
                    EntityEmp.nome_fantasia = _emp[1];
    
                    EntityEmp.ativo = true;
                    EntityEmp.bairro = "Cadastro Automático";
                    EntityEmp.cep = "00000-00";
                    EntityEmp.cidade = "Cadastro Automático";
                    EntityEmp.cnpj = "00.000.000/0000-00";
                    EntityEmp.endereco = "Cadastro Automático";
    
                    EntityEmp.excluido = false;
                    EntityEmp.numero = "0000";
                    EntityEmp.razao_social = "Cadastro Automático";
                    EntityEmp.uf = "UF";
                        
                    await _repEmpresa.save(EntityEmp);  
                    console.log(EntityEmp.nome_fantasia);
            });

            let vendcadastrado: any;
            vendedores.forEach(async function(dadosvend) {
                console.clear();
                _vend = dadosvend.split(";");          
                 

                    EntityVendedor = new Vendedores();
                    EntityVendedor.ativo = true;
                    
                    EntityVendedor.bairro = "Cadastro Automático";
                    EntityVendedor.cidade = "Cadastro Automático";
                    EntityVendedor.codigo = parseFloat(_vend[0]);
                    EntityVendedor.numero = "000";
                    EntityVendedor.uf = "UF";
    
                    EntityVendedor.endereco = "Cadastro Automático";
                    EntityVendedor.nome = _vend[1]
                     
                    vendcadastrado = await _repVendedor.save(EntityVendedor,{chunk: 100});                   
                   
                   if (vendcadastrado) {
                    console.log("Vendedor: " + EntityVendedor.nome + " cadastrado");
                   }
           });

           
           
       }

       let _repTabelas: Repository<Tabelas> = getRepository(Tabelas);
       let tabelas: Tabelas;

       config.tabelas.forEach(async (tab) => {
           let _tabela = await _repTabelas.findOne({tabela: tab});

           if (!_tabela) {
               tabelas = new Tabelas();
               tabelas.tabela = tab;

               await _repTabelas.save(tabelas);
           }
       });

       let _repConfig: Repository<Configuracoes> = getRepository(Configuracoes);
       let configuracoes: Configuracoes;

       let _parametro = await _repConfig.findOne({nome_parametro: "cod_prod_busca"});

       if (!_parametro) {
           configuracoes = new Configuracoes();
           configuracoes.nome_parametro = "cod_prod_busca";
           configuracoes.valor = "0";
           await _repConfig.save(configuracoes);
       }

       _parametro = await _repConfig.findOne({nome_parametro: "host_api_totvs"});

       if (!_parametro) {
           
            configuracoes = new Configuracoes();
            configuracoes.nome_parametro = "host_api_totvs";
            configuracoes.valor = "www30.bhan.com.br";

            await _repConfig.save(configuracoes);

            configuracoes = new Configuracoes();
            configuracoes.nome_parametro = "porta_api_totvs";
            configuracoes.valor = "9443";

            await _repConfig.save(configuracoes);

           configuracoes = new Configuracoes();
           configuracoes.nome_parametro = "autorizacao_api_totvs_token";
           configuracoes.valor = "/api/v1/autorizacao/token";

           await _repConfig.save(configuracoes);

           configuracoes = new Configuracoes();
           configuracoes.nome_parametro = "usuario_api_totvs_token";
           configuracoes.valor = "planteamorws";
           
           await _repConfig.save(configuracoes);

           configuracoes = new Configuracoes();
           configuracoes.nome_parametro = "senha_api_totvs_token";
           configuracoes.valor = "896314";

           await _repConfig.save(configuracoes);

           configuracoes = new Configuracoes();
           configuracoes.nome_parametro = "rest_api_totvs";
           configuracoes.valor = "/api/v1";

           await _repConfig.save(configuracoes);
       }

        console.log("Processo finalizado");
    }
   
     async cadastraProduto() {

        let _repEmpresa: Repository<Empresas> =  getRepository(Empresas); 
        let _empresasCount = await _repEmpresa.find();

        let _repProduto: Repository<Produtos> = getRepository(Produtos);        
        let EntityProduto: Produtos;

        let prod = fs.readFileSync(__dirname + "/arquivos/produtos.csv", "utf8");
        let produtos = prod.split(/\n/);
        let _prod: any;

        let temProduto = await _repProduto.findOne();
        let prodcadastrado: any = false;
        if (!temProduto) { 
            if (_empresasCount.length != 0) {
                console.clear();
                 produtos.forEach(async function(dadosprod) {
                    let i = 0; 
                     _prod = dadosprod.split(";");
                             console.clear();                            
                             EntityProduto = new Produtos();
                             EntityProduto.ativo = true;
                             let codigo: string = _prod[1];
                             EntityProduto.codigo = _prod[1];
                             EntityProduto.cor = _prod[4];
                             
                             EntityProduto.descricao = "nada consta";
                             EntityProduto.estoque = 0;
                             EntityProduto.nome = _prod[2];
         
                             EntityProduto.preco = 0;
                             EntityProduto.referencia = _prod[0];
                             EntityProduto.tamanho = _prod[3];  

                             /*_empresasCount.forEach(function (emp) {
                                EntityProduto.empresas[i] = emp;
                                i += 1;
                             })*/
                              
                            
                             if (EntityProduto.nome != "") {
                                 prodcadastrado = true; 
                                 _repProduto.save(EntityProduto).then(async (produto) => {
                                    let _repProdutosEmpresas: Repository<ProdutosEmpresas> = getRepository(ProdutosEmpresas);
                                    let produtosEmpresas: ProdutosEmpresas;
                                    _empresasCount = await _repEmpresa.find();
                                    _empresasCount.forEach(async (empresa) => {
                                            produtosEmpresas = new ProdutosEmpresas();
                                            produtosEmpresas.produto = produto,
                                            produtosEmpresas.empresa = empresa;
                                            _repProdutosEmpresas.save(produtosEmpresas);
                                       }); 
                                   
                                 });
                                 
                             }
                                                                 
         
                             if (prodcadastrado) {
                                 console.log("Produto: " + EntityProduto.nome + " cadastrado na empresa: "); 
                                 prodcadastrado = false;
                             }                                
                             
                });    
            }
                
             

        }
     }
     async cadastroGrupoPermissao () {
         let _repGrupo: Repository<Grupos> = getRepository(Grupos);
         let _rePermissao: Repository<Permissao> = getRepository(Permissao);
         let _repUsuario: Repository<User> = getRepository(User);
         
        
         let grupo: Grupos;
         
         let permissaoCliente: Permissao;
         let permissaoEmpresa: Permissao;
         let permissaoGrupo: Permissao;
         let permissaoPedidos: Permissao;      
         let permissaoProdutos: Permissao;
         let permissaoUser: Permissao;
         let permissaoVendedores: Permissao; 

         let temUsuario = await _repUsuario.findOne();
         let temgrupo = await _repGrupo.findOne();

         if (!temUsuario && !temgrupo) {

            grupo = new Grupos();

            grupo.ativo = true;
            grupo.nome_grupo = "Super Usuário";

            _repGrupo.save(grupo);

            permissaoCliente = new Permissao();

                permissaoCliente.alterar = true;
                permissaoCliente.ativo = true;
                permissaoCliente.excluir = true;
                permissaoCliente.inserir = true;
                permissaoCliente.tabela = "Clientes";

                permissaoCliente.grupo = grupo;

            permissaoEmpresa = new Permissao();
            
                permissaoEmpresa.alterar = true;
                permissaoEmpresa.ativo = true;
                permissaoEmpresa.excluido = true;
                permissaoEmpresa.inserir = true;
                permissaoEmpresa.tabela = "Empresas";

                permissaoEmpresa.grupo = grupo;

            permissaoGrupo = new Permissao();

                permissaoGrupo.alterar = true;
                permissaoGrupo.ativo = true;
                permissaoGrupo.excluir = true;
                permissaoGrupo.inserir = true;
                permissaoGrupo.tabela = "Grupo";

                permissaoGrupo.grupo = grupo;

            permissaoPedidos = new Permissao();

                permissaoPedidos.alterar = true;
                permissaoPedidos.ativo = true;
                permissaoPedidos.excluir = true;
                permissaoPedidos.inserir = true;
                permissaoPedidos.tabela = "Pedidos";

                permissaoPedidos.grupo = grupo;
                
            permissaoProdutos = new Permissao();
            
                permissaoProdutos.alterar = true;
                permissaoProdutos.ativo = true;
                permissaoProdutos.excluir = true;
                permissaoProdutos.inserir = true;
                permissaoProdutos.tabela = "Produtos";

                permissaoProdutos.grupo = grupo;

            permissaoUser = new Permissao()

                permissaoUser.alterar = true;
                permissaoUser.ativo = true;
                permissaoUser.excluir = true;
                permissaoUser.inserir = true;
                permissaoUser.tabela = "Usuarios";

                permissaoUser.grupo = grupo;

            permissaoVendedores = new Permissao();

                permissaoVendedores.alterar = true;
                permissaoVendedores.ativo = true;
                permissaoVendedores.excluir = true;
                permissaoVendedores.inserir = true;
                permissaoVendedores.tabela = "Vendedores";

                permissaoVendedores.grupo = grupo;

            _rePermissao.save(permissaoCliente);
            _rePermissao.save(permissaoEmpresa);
            _rePermissao.save(permissaoGrupo);
            _rePermissao.save(permissaoPedidos);
            _rePermissao.save(permissaoProdutos);
            _rePermissao.save(permissaoUser);
            _rePermissao.save(permissaoVendedores); 
        }
    }
     async cadastroUsuario () {
         let _repUsuario: Repository<User> = getRepository(User); 
         let usuario: User;

         let _repGrupo: Repository<Grupos> = getRepository(Grupos);

         let grupos = await _repGrupo.find();
         let temUuario = await _repUsuario.findOne();

         if (!temUuario) {
            grupos = await _repGrupo.find();
            if (grupos.length != 0) {               
                usuario = new User();
                    
                    usuario.email = "admin@admin";
                    usuario.ativo = true;
                    usuario.isRoot = true;
                    usuario.nome = "Super Admin";
                    usuario.senha = md5("admin");
                    usuario.status_usuario = 1;
                    usuario.grupos = grupos; 

                _repUsuario.save(usuario);
            }
            
         }         

     }
}
function delay(ms:number) {
    return new Promise(resolve => setTimeout(resolve => {
        
    }, ms)); 
}