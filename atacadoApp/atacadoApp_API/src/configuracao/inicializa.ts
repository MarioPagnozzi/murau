import { Configuracoes } from './../entity/Configuracoes';
import { User } from './../entity/User';
import { Produtos } from './../entity/Produtos';
import { Vendedores } from './../entity/Vendedores';
import { Empresas } from './../entity/Empresas';
import { entity, Entity, getRepository, Repository } from 'typeorm';
import * as fs from "fs";
import { Grupos } from '../entity/Grupos';
import { Permissao } from '../entity/Permissao';
import { Tabelas } from '../entity/Tabelas';
import * as md5 from "md5";
import config from "./config";
import { nextTick } from 'process';








        export async function start(_repEmpresa: Repository<Empresas> = getRepository(Empresas)) {
            console.log("Iniciando Servidor ...");
            let _Empresa = await _repEmpresa.findOne();
            let i = 0;
            if (!_Empresa) {

                    let emp = fs.readFileSync(__dirname + "/arquivos/empresas.csv", "utf8");
                    let emps = emp.split(/\n/);
                    let _emp: any;
                    let EntityEmp: Empresas;
                    emps.forEach((dados) => {
                        _emp = dados.split(";");


                        EntityEmp = new Empresas();
                        EntityEmp.codigo = parseFloat(_emp[0]);
                        EntityEmp.nome_fantasia = _emp[1];

                        EntityEmp.ativo = true;
                        EntityEmp.bairro = _emp[6];
                        EntityEmp.cep = _emp[9];
                        EntityEmp.cidade = _emp[7];
                        EntityEmp.cnpj = _emp[2];
                        EntityEmp.endereco = _emp[4];

                        EntityEmp.excluido = false;
                        EntityEmp.numero = _emp[5];
                        EntityEmp.razao_social = _emp[1];
                        EntityEmp.uf = _emp[8];
                        EntityEmp.ie = _emp[3];
                        EntityEmp.telefone = _emp[10];

                        _repEmpresa.save(EntityEmp);
                        
                        i++
                    });
                    
                    setTimeout(() => {
                        console.log(i + "/" + emps.length + " empresas cadastradas");
                       
                    }, 10000)
                    
                }
            
        }

        export async function cadastraTabelas(_repTabelas: Repository<Tabelas> = getRepository(Tabelas)) {
            
            let tabelas: Tabelas;
            config.tabelas.forEach(async (tab) => {
                let _tabela = await _repTabelas.findOne({ tabela: tab });

                if (!_tabela) {
                    tabelas = new Tabelas();
                    tabelas.tabela = tab;

                    _repTabelas.save(tabelas);
                    
                }
               
            });
           
        }

        export async function cadastraConfig (_repConfig: Repository<Configuracoes> = getRepository(Configuracoes)) {

            let _parametro = await _repConfig.findOne({ nome_parametro: "cod_prod_busca" });
            let configuracoes: Configuracoes;
            if (!_parametro) {
                configuracoes = new Configuracoes();
                configuracoes.nome_parametro = "cod_prod_busca";
                configuracoes.valor = "0";
                _repConfig.save(configuracoes);
            }

            _parametro = await _repConfig.findOne({ nome_parametro: "host_api_totvs" });

            if (!_parametro) {

                configuracoes = new Configuracoes();
                configuracoes.nome_parametro = "host_api_totvs";
                configuracoes.valor = "www30.bhan.com.br";

                 _repConfig.save(configuracoes);

                configuracoes = new Configuracoes();
                configuracoes.nome_parametro = "porta_api_totvs";
                configuracoes.valor = "9443";

                 _repConfig.save(configuracoes);

                configuracoes = new Configuracoes();
                configuracoes.nome_parametro = "autorizacao_api_totvs_token";
                configuracoes.valor = "/api/v1/autorizacao/token";

                 _repConfig.save(configuracoes);

                configuracoes = new Configuracoes();
                configuracoes.nome_parametro = "usuario_api_totvs_token";
                configuracoes.valor = "planteamorws";

                _repConfig.save(configuracoes);

                configuracoes = new Configuracoes();
                configuracoes.nome_parametro = "senha_api_totvs_token";
                configuracoes.valor = "896314";

                 _repConfig.save(configuracoes);

                configuracoes = new Configuracoes();
                configuracoes.nome_parametro = "rest_api_totvs";
                configuracoes.valor = "/api/v1";

                 _repConfig.save(configuracoes);
            }

            _parametro = await _repConfig.findOne({ nome_parametro: "set_Hora_inicio_atualiza" });

            if (!_parametro) {
                configuracoes = new Configuracoes();
                configuracoes.nome_parametro = "set_Hora_inicio_atualiza";
                configuracoes.valor = "7,0,0";

                 _repConfig.save(configuracoes);
            }

            _parametro = await _repConfig.findOne({ nome_parametro: "set_Hora_fim_atualiza" });

            if (!_parametro) {
                configuracoes = new Configuracoes();
                configuracoes.nome_parametro = "set_Hora_fim_atualiza";
                configuracoes.valor = "23,59,0";

                 _repConfig.save(configuracoes);
            }

            _parametro = await _repConfig.findOne({ nome_parametro: "rule_atualiza_horas" });

            if (!_parametro) {
                configuracoes = new Configuracoes();
                configuracoes.nome_parametro = "rule_atualiza_horas";
                configuracoes.valor = "";

                 _repConfig.save(configuracoes);
            }

            _parametro = await _repConfig.findOne({ nome_parametro: "rule_atualiza_minutos" });

            if (!_parametro) {
                configuracoes = new Configuracoes();
                configuracoes.nome_parametro = "rule_atualiza_minutos";
                configuracoes.valor = "";

                 _repConfig.save(configuracoes);
            }

            _parametro = await _repConfig.findOne({ nome_parametro: "rule_atualiza_segundos" });

            if (!_parametro) {
                configuracoes = new Configuracoes();
                configuracoes.nome_parametro = "rule_atualiza_segundos";
                configuracoes.valor = "0,30";

                 _repConfig.save(configuracoes);
            }

            _parametro = await _repConfig.findOne({ nome_parametro: "rule_atualiza_diasSemanas" });

            if (!_parametro) {
                configuracoes = new Configuracoes();
                configuracoes.nome_parametro = "rule_atualiza_diasSemanas";
                configuracoes.valor = "0,1,2,3,4,5,6";

                 _repConfig.save(configuracoes);
            }

            _parametro = await _repConfig.findOne({ nome_parametro: "set_Hora_inicio_insere" });

            if (!_parametro) {
                configuracoes = new Configuracoes();
                configuracoes.nome_parametro = "set_Hora_inicio_insere";
                configuracoes.valor = "7,0,0";

                 _repConfig.save(configuracoes);
            }

            _parametro = await _repConfig.findOne({ nome_parametro: "set_Hora_fim_insere" });

            if (!_parametro) {
                configuracoes = new Configuracoes();
                configuracoes.nome_parametro = "set_Hora_fim_insere";
                configuracoes.valor = "23,59,0";

                _repConfig.save(configuracoes);
            }

            _parametro = await _repConfig.findOne({ nome_parametro: "rule_insere_horas" });

            if (!_parametro) {
                configuracoes = new Configuracoes();
                configuracoes.nome_parametro = "rule_insere_horas";
                configuracoes.valor = "";

                 _repConfig.save(configuracoes);
            }

            _parametro = await _repConfig.findOne({ nome_parametro: "rule_insere_minutos" });

            if (!_parametro) {
                configuracoes = new Configuracoes();
                configuracoes.nome_parametro = "rule_insere_minutos";
                configuracoes.valor = "";

                 _repConfig.save(configuracoes);
            }

            _parametro = await _repConfig.findOne({ nome_parametro: "rule_insere_segundos" });

            if (!_parametro) {
                configuracoes = new Configuracoes();
                configuracoes.nome_parametro = "rule_insere_segundos";
                configuracoes.valor = "0,10,20,30,40,50";

                 _repConfig.save(configuracoes);
            }

            _parametro = await _repConfig.findOne({ nome_parametro: "rule_insere_diasSemanas" });

            if (!_parametro) {
                configuracoes = new Configuracoes();
                configuracoes.nome_parametro = "rule_insere_diasSemanas";
                configuracoes.valor = "0,1,2,3,4,5,6";

                _repConfig.save(configuracoes);
            }

            _parametro = await _repConfig.findOne({ nome_parametro: "qtd_lote_pesquisa" });

            if (!_parametro) {
                configuracoes = new Configuracoes();
                configuracoes.nome_parametro = "qtd_lote_pesquisa";
                configuracoes.valor = "1";

                 _repConfig.save(configuracoes);           
            }

            _parametro = undefined;
        }
        export async function cadastraVendedores(empresas, _repVendedor: Repository<Vendedores> = getRepository(Vendedores)) {

            let _vend: any;
            let EntityVendedor: Vendedores;


            let _temVendedor = await _repVendedor.findOne();
            let i = 0;
            if (!_temVendedor) {
                let vend = fs.readFileSync(__dirname + "/arquivos/vendedores.csv", "utf8");
                let vendedores = vend.split(/\n/);
                vendedores.forEach(async function (dadosvend) {
                    _vend = dadosvend.split(";");

                    EntityVendedor = new Vendedores();
                    EntityVendedor.ativo = true;

                    EntityVendedor.bairro = "Cadastro Automático";
                    EntityVendedor.cidade = "Cadastro Automático";
                    EntityVendedor.codigo = parseFloat(_vend[0]);
                    EntityVendedor.numero = "000";
                    EntityVendedor.uf = "UF";

                    EntityVendedor.endereco = "Cadastro Automático";
                    EntityVendedor.nome = _vend[1];
                    EntityVendedor.empresas = empresas
                   _repVendedor.save(EntityVendedor);                   
                   i++
                  
                });
                setTimeout(() => {
                    console.log(i + "/" + vendedores.length + " vendores cadastradas");
                }, 10000)
            }

        }
        
        export async function cadastraProdutos(empresas, _repProduto: Repository<Produtos> = getRepository(Produtos)) {
            let produto = await _repProduto.findOne();
            let i = 0;
          
            if (!produto) {
                let prod = fs.readFileSync(__dirname + "/arquivos/produtos.csv", "utf8");
                let produtos = prod.split(/\n/);
                
                let _prod: any;
                let EntityProduto: Produtos;
                produtos.forEach(async function (dadosprod) {
                    _prod = dadosprod.split(";");
                  
                    EntityProduto = new Produtos();
                    EntityProduto.ativo = true;
                    EntityProduto.codigo = _prod[1];
                    EntityProduto.cor = _prod[4];

                    EntityProduto.descricao = ".";
                    EntityProduto.estoque = 0;
                    EntityProduto.nome = _prod[2];

                    EntityProduto.preco = 0;
                    EntityProduto.referencia = _prod[0];
                    EntityProduto.tamanho = _prod[3];
                    EntityProduto.empresas = empresas;
                    if (EntityProduto.nome) {
                        _repProduto.save(EntityProduto);
                        i++
                    }
                });
                setTimeout(() => {
                    console.log(i + "/" + produtos.length +  " produtos cadastrados");
                }, 10000)
            }
         
        }

        export async function cadastroGrupo(nome_grupo: string[], _repGrupo: Repository<Grupos> = getRepository(Grupos),
            _repUsuario: Repository<User> = getRepository(User)) {
            let temUsuario = await _repUsuario.findOne();
            let temgrupo = await _repGrupo.findOne();

            if (!temUsuario && !temgrupo) {
                nome_grupo.forEach(async (nome_grupo) => {
                    let grupo: Grupos = new Grupos();
                    grupo.ativo = true;
                    grupo.nome_grupo = nome_grupo;
                    _repGrupo.save(grupo);
                   
                });

            }
        }
        export function cadastroPermissao(grupo: Grupos, tabela: Tabelas,
                                        _repPermissao: Repository<Permissao> = getRepository(Permissao),
                                        _repGrupo: Repository<Grupos> = getRepository(Grupos)) {
          
            if (grupo && tabela) {

                
                        if (grupo.nome_grupo == "Super Usuário") {

                            let EntityPermissao: Permissao = new Permissao();
                            EntityPermissao.visualizar = true;
                            EntityPermissao.inserir = true;
                            EntityPermissao.alterar = true;
                            EntityPermissao.excluir = true;
                            EntityPermissao.grupo = Promise.resolve(grupo);
                            EntityPermissao.tabela = tabela.tabela;

                            _repPermissao.save(EntityPermissao);
                         

                        } else if (grupo.nome_grupo == "Vendedores") {

                            let EntityPermissao: Permissao = new Permissao();
                            EntityPermissao.visualizar = tabela.tabela == "Vendedores" ? false : 
                                                tabela.tabela == "Clientes" ? true : 
                                                tabela.tabela == "Produtos" ? true :
                                                tabela.tabela == "Perdidos" ? true : 
                                                tabela.tabela == "Usuarios" ? false :
                                                tabela.tabela == "Empresas" ? true :
                                                tabela.tabela == "Grupos" ? false : 
                                                tabela.tabela == "Configuracao" ? false : false;
                            EntityPermissao.inserir = tabela.tabela == "Vendedores" ? false : 
                                            tabela.tabela == "Clientes" ? true : 
                                            tabela.tabela == "Produtos" ? false :
                                            tabela.tabela == "Perdidos" ? true : 
                                            tabela.tabela == "Usuarios" ? false :
                                            tabela.tabela == "Empresas" ? false :
                                            tabela.tabela == "Grupos" ? false : 
                                            tabela.tabela == "Configuracao" ? false : false;
                            EntityPermissao.excluir = false;
                            EntityPermissao.alterar = tabela.tabela == "Vendedores" ? false : 
                                            tabela.tabela == "Clientes" ? true : 
                                            tabela.tabela == "Produtos" ? false :
                                            tabela.tabela == "Perdidos" ? true : 
                                            tabela.tabela == "Usuarios" ? false :
                                            tabela.tabela == "Empresas" ? false :
                                            tabela.tabela == "Grupos" ? false : 
                                            tabela.tabela == "Configuracao" ? false : false;
                            EntityPermissao.grupo = Promise.resolve(grupo);
                            EntityPermissao.tabela = tabela.tabela;

                            _repPermissao.save(EntityPermissao);

                         

                        } else {

                            let EntityPermissao: Permissao = new Permissao();
                            EntityPermissao.visualizar = tabela.tabela == "Vendedores" ? false : 
                                                tabela.tabela == "Clientes" ? false : 
                                                tabela.tabela == "Produtos" ? true :
                                                tabela.tabela == "Perdidos" ? true : 
                                                tabela.tabela == "Usuarios" ? false :
                                                tabela.tabela == "Empresas" ? false :
                                                tabela.tabela == "Grupos" ? false : 
                                                tabela.tabela == "Configuracao" ? false : false;
                            EntityPermissao.inserir = tabela.tabela == "Vendedores" ? false : 
                                            tabela.tabela == "Clientes" ? false : 
                                            tabela.tabela == "Produtos" ? false :
                                            tabela.tabela == "Perdidos" ? true : 
                                            tabela.tabela == "Usuarios" ? false :
                                            tabela.tabela == "Empresas" ? false :
                                            tabela.tabela == "Grupos" ? false : 
                                            tabela.tabela == "Configuracao" ? false : false;
                            EntityPermissao.excluir = false;
                            EntityPermissao.alterar = tabela.tabela == "Vendedores" ? false : 
                                            tabela.tabela == "Clientes" ? false : 
                                            tabela.tabela == "Produtos" ? false :
                                            tabela.tabela == "Perdidos" ? true : 
                                            tabela.tabela == "Usuarios" ? false :
                                            tabela.tabela == "Empresas" ? false :
                                            tabela.tabela == "Grupos" ? false : 
                                            tabela.tabela == "Configuracao" ? false : false;
                            EntityPermissao.grupo = Promise.resolve(grupo);
                            EntityPermissao.tabela = tabela.tabela;

                            _repPermissao.save(EntityPermissao);

                        

                        }
            }
        }

        export async function cadastroUsuario(grupo: Grupos[], _repUsuario: Repository<User> = getRepository(User)) {

            let temUuario = await _repUsuario.findOne();

            if (!temUuario) {
                if (grupo) {
                    let usuario = new User();

                    usuario.email = "admin@admin";
                    usuario.ativo = true;
                    usuario.isRoot = true;
                    usuario.nome = "Super Admin";
                    usuario.senha = md5("admin");
                    usuario.status_usuario = 1;
                    usuario.grupos = Promise.resolve(grupo);

                    _repUsuario.save(usuario);

          
                }

            }
        }

        export async function cadastroFilhas() {
            console.log("cadastro tabela filhas")
            const _repTabelas: Repository<Tabelas> = getRepository(Tabelas)
            const _repGrupos: Repository<Grupos> = getRepository(Grupos)
            const _repEmpresas: Repository<Empresas> = getRepository(Empresas)
            const _repPermissao: Repository<Permissao> = getRepository(Permissao)
            const empresas = await _repEmpresas.find();

            await cadastraVendedores(empresas)
            await cadastraProdutos(empresas);

            const tabelas = await _repTabelas.find();
            const grupos = await _repGrupos.find();

            for (let i = 0; i < grupos.length; i++) {
                for (let j = 0; j < tabelas.length; j++) {
                    let permissao = await _repPermissao.findOne({relations: ["grupo"],
                                                                 where: {tabela: tabelas[j].tabela, grupo: [{uid: grupos[i].uid}]}});
                    if (!permissao) {
                        cadastroPermissao(grupos[i], tabelas[j]);
                    }
                
                }
            }
            await cadastroUsuario(grupos)
        }

 
