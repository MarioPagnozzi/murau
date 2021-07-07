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
import * as fun from "./functions/globalFunctions";



import process = require("process");
import { clear } from 'console';
var progressBar = require("progress");



        export async function start(_repEmpresa: Repository<Empresas> = getRepository(Empresas)) {
            return new Promise<any>(async (resolve, reject) => {
                console.log("Iniciando Servidor ...");
                let _Empresa = await _repEmpresa.findOne();
                let i = 0;
                if (!_Empresa) {

                        let emp = fs.readFileSync(__dirname + "/arquivos/empresas.csv", "utf8");
                        let emps = emp.split(/\n/);
                        let _emp: any;
                        let EntityEmp: Empresas;
                        const bar = new progressBar("[:bar] :current/:total empresas cadastradas", {
                            total: emps.length,
                            complete: "=",
                            incomplete: " ",
                            width: 30
                        });

                        let time = setInterval(() => {
                            
                            emps.forEach(async (dados) => {
                                bar.tick();
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
        
                                await _repEmpresa.save(EntityEmp);
                                
                            if (bar.complete) {
                                    clearInterval(time);                                
                            } else if (bar.curr == (bar.total / 2)) {
                                bar.interrupt(`${bar.curr}/${bar.total} de empresas cadastradas: [chegamos à metade de empresas cadastradas]`);
                            }
                            });
                            resolve("Cadastro de Empresas completo");
                        }, 5000)
                }
                else {
                    reject("Empresas já cadastradas")
                }
            })
            
            
        }

        export async function cadastraTabelas(_repTabelas: Repository<Tabelas> = getRepository(Tabelas)) {
            return new Promise<any>(async (resolve) => {
                let tabelas: Tabelas;
                let bar = new progressBar("[:bar] :current/:total de tabelas cadastradas", {
                    total: config.tabelas.length,
                    complete: "=",
                    incomplete: " ",
                    width: 30
                })
                let timer = setInterval(() => {
                    config.tabelas.forEach(async (tab) => {
                        let _tabela = await _repTabelas.findOne({ tabela: tab });
                        bar.tick();
                        if (!_tabela) {
                            
                            tabelas = new Tabelas();
                            tabelas.tabela = tab;
        
                            await _repTabelas.save(tabelas);
                            
                        }
                        if (bar.complete) {
                            clearInterval(timer);
                        } else if (bar.curr == (bar.total / 2)) {
                            bar.interrupt(`${bar.curr}/${bar.total} de empresas cadastradas: [chegamos à metade de tabelas cadastradas]`)
                        }
                        
                    });
                    resolve("Cadastro de Tabelas completo")
                }, 5000)
                
            })
        }

        export async function cadastraConfig (_repConfig: Repository<Configuracoes> = getRepository(Configuracoes)) {

            let _parametro = await _repConfig.findOne({ nome_parametro: "cod_prod_busca" });
            let configuracoes: Configuracoes;
            if (!_parametro) {
                configuracoes = new Configuracoes();
                configuracoes.nome_parametro = "cod_prod_busca";
                configuracoes.valor = "0";
                await _repConfig.save(configuracoes);
            }

            _parametro = await _repConfig.findOne({ nome_parametro: "host_api_totvs" });

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

                await  _repConfig.save(configuracoes);

                configuracoes = new Configuracoes();
                configuracoes.nome_parametro = "senha_api_totvs_token";
                configuracoes.valor = "896314";

                 await _repConfig.save(configuracoes);

                configuracoes = new Configuracoes();
                configuracoes.nome_parametro = "rest_api_totvs";
                configuracoes.valor = "/api/v1";

                 await _repConfig.save(configuracoes);
            }

            _parametro = await _repConfig.findOne({ nome_parametro: "set_Hora_inicio_atualiza" });

            if (!_parametro) {
                configuracoes = new Configuracoes();
                configuracoes.nome_parametro = "set_Hora_inicio_atualiza";
                configuracoes.valor = "7,0,0";

                 await _repConfig.save(configuracoes);
            }

            _parametro = await _repConfig.findOne({ nome_parametro: "set_Hora_fim_atualiza" });

            if (!_parametro) {
                configuracoes = new Configuracoes();
                configuracoes.nome_parametro = "set_Hora_fim_atualiza";
                configuracoes.valor = "23,59,0";

                 await _repConfig.save(configuracoes);
            }

            _parametro = await _repConfig.findOne({ nome_parametro: "rule_atualiza_horas" });

            if (!_parametro) {
                configuracoes = new Configuracoes();
                configuracoes.nome_parametro = "rule_atualiza_horas";
                configuracoes.valor = "";

                 await _repConfig.save(configuracoes);
            }

            _parametro = await _repConfig.findOne({ nome_parametro: "rule_atualiza_minutos" });

            if (!_parametro) {
                configuracoes = new Configuracoes();
                configuracoes.nome_parametro = "rule_atualiza_minutos";
                configuracoes.valor = "";

                await _repConfig.save(configuracoes);
            }

            _parametro = await _repConfig.findOne({ nome_parametro: "rule_atualiza_segundos" });

            if (!_parametro) {
                configuracoes = new Configuracoes();
                configuracoes.nome_parametro = "rule_atualiza_segundos";
                configuracoes.valor = "0,30";

                 await _repConfig.save(configuracoes);
            }

            _parametro = await _repConfig.findOne({ nome_parametro: "rule_atualiza_diasSemanas" });

            if (!_parametro) {
                configuracoes = new Configuracoes();
                configuracoes.nome_parametro = "rule_atualiza_diasSemanas";
                configuracoes.valor = "0,1,2,3,4,5,6";

                 await _repConfig.save(configuracoes);
            }

            _parametro = await _repConfig.findOne({ nome_parametro: "set_Hora_inicio_insere" });

            if (!_parametro) {
                configuracoes = new Configuracoes();
                configuracoes.nome_parametro = "set_Hora_inicio_insere";
                configuracoes.valor = "7,0,0";

                 await _repConfig.save(configuracoes);
            }

            _parametro = await _repConfig.findOne({ nome_parametro: "set_Hora_fim_insere" });

            if (!_parametro) {
                configuracoes = new Configuracoes();
                configuracoes.nome_parametro = "set_Hora_fim_insere";
                configuracoes.valor = "23,59,0";

                await _repConfig.save(configuracoes);
            }

            _parametro = await _repConfig.findOne({ nome_parametro: "rule_insere_horas" });

            if (!_parametro) {
                configuracoes = new Configuracoes();
                configuracoes.nome_parametro = "rule_insere_horas";
                configuracoes.valor = "";

                await _repConfig.save(configuracoes);
            }

            _parametro = await _repConfig.findOne({ nome_parametro: "rule_insere_minutos" });

            if (!_parametro) {
                configuracoes = new Configuracoes();
                configuracoes.nome_parametro = "rule_insere_minutos";
                configuracoes.valor = "";

                 await _repConfig.save(configuracoes);
            }

            _parametro = await _repConfig.findOne({ nome_parametro: "rule_insere_segundos" });

            if (!_parametro) {
                configuracoes = new Configuracoes();
                configuracoes.nome_parametro = "rule_insere_segundos";
                configuracoes.valor = "0,10,20,30,40,50";

                 await _repConfig.save(configuracoes);
            }

            _parametro = await _repConfig.findOne({ nome_parametro: "rule_insere_diasSemanas" });

            if (!_parametro) {
                configuracoes = new Configuracoes();
                configuracoes.nome_parametro = "rule_insere_diasSemanas";
                configuracoes.valor = "0,1,2,3,4,5,6";

                await _repConfig.save(configuracoes);
            }

            _parametro = await _repConfig.findOne({ nome_parametro: "qtd_lote_pesquisa" });

            if (!_parametro) {
                configuracoes = new Configuracoes();
                configuracoes.nome_parametro = "qtd_lote_pesquisa";
                configuracoes.valor = "1";

                 await _repConfig.save(configuracoes);
            }

            _parametro = await _repConfig.findOne({ nome_parametro: "skip_qtd_busca_produto" });

            if (!_parametro) {
                configuracoes = new Configuracoes();
                configuracoes.nome_parametro = "skip_qtd_busca_produto";
                configuracoes.valor = "0";

                await _repConfig.save(configuracoes);
            }

            _parametro = await _repConfig.findOne({ nome_parametro: "take_qtd_busca_produto" });

            if (!_parametro) {
                configuracoes = new Configuracoes();
                configuracoes.nome_parametro = "take_qtd_busca_produto";
                configuracoes.valor = "1000";

                await _repConfig.save(configuracoes);
            }


            await new fun.geraToken().token()

        }
        export async function cadastraVendedores(empresas, _repVendedor: Repository<Vendedores> = getRepository(Vendedores)) {
            return new Promise<any>(async (resolve, reject) => {
                let _vend: any;
                let EntityVendedor: Vendedores;


                let _temVendedor = await _repVendedor.findOne();
                let i = 0;
                
                if (!_temVendedor) {
                    let vend = fs.readFileSync(__dirname + "/arquivos/vendedores.csv", "utf8");
                    let vendedores = vend.split(/\n/);
                    let bar = new progressBar("[:bar] :current/:total de vendedores cadastrados", {
                        total: vendedores.length,
                        complete: "=",
                        incomplete: " ",
                        width: 30

                    });
                    let timer = setInterval(() => {
                        vendedores.forEach(async function (dadosvend) {
                            bar.tick();
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
                            EntityVendedor.empresas = Promise.resolve(empresas);
                        await _repVendedor.save(EntityVendedor);                   
                        i++
                        if (bar.complete) {
                            clearInterval(timer);
                        } else if (bar.curr == (bar.total / 2)) {
                            bar.interrupt(`${bar.curr}/${bar.total} de vendedores cadastrados: [chegamos à metade de vendedores cadastrados]`);
                        }
                        
                        });
                        resolve("Cadastro de Vendedores completo")
                    }, 5000)
                    
                }
                else {
                    reject("Vendedores já foram cadastrados")
                }
            })
        }
        
        export async function cadastraProdutos(empresas, _repProduto: Repository<Produtos> = getRepository(Produtos)) {
            return new Promise(async (resolve, reject) => {
                let produto = await _repProduto.findOne();
                let i = 0;
            
                if (!produto) {
                    let prod = fs.readFileSync(__dirname + "/arquivos/produtos.csv", "utf8");
                    let produtos = prod.split(/\n/);
                    
                    let _prod: any;
                    let EntityProduto: Produtos;
                    let bar = new progressBar("[:bar] :current/:total de produtos cadastrados", {
                        total: produtos.length,
                        complete: "=",
                        incomplete: " ",
                        width: 30
                    })
                    let timer = setInterval(() => {
                        produtos.forEach(async function (dadosprod) {
                        bar.tick();
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
                            EntityProduto.empresas = Promise.resolve(empresas);
                            if (EntityProduto.nome) {
                                await _repProduto.save(EntityProduto);
                                i++
                            }
                            if (bar.complete) {
                                clearInterval(timer);
                            } else if (bar.curr == (bar.total/2)) {
                                bar.interrupt(`${bar.curr}/${bar.total} de produtos cadastrados: [chegamos à metade de produtos cadastrados]`)
                            }
                        });
                        resolve("Cadastros de Produtos completo")
                    }, 5000)
                    
                }
                else {
                    reject("Produtos já foram cadastrados")
                }
            })
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
                    await _repGrupo.save(grupo);
                   
                });

            }
            return;
        }
        export async function cadastroPermissao(grupo: Grupos, tabela: Tabelas,
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

                            await _repPermissao.save(EntityPermissao);
                         

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

                            await _repPermissao.save(EntityPermissao);

                         

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

                            await _repPermissao.save(EntityPermissao);

                        

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

                    await _repUsuario.save(usuario);

          
                }

            }
            return;
        }


        export async function cadastraPermissao() {

            const _repTabelas: Repository<Tabelas> = getRepository(Tabelas)
            const _repGrupos: Repository<Grupos> = getRepository(Grupos)
            const _repPermissao: Repository<Permissao> = getRepository(Permissao)

            const tabelas = await _repTabelas.find();
            const grupos = await _repGrupos.find();

            grupos.forEach(async (grupo) => {
                tabelas.forEach(async (tabela) => {
                    let permissao = await _repPermissao.findOne({relations: ["grupo"],
                                                                     where: {tabela: tabela.tabela, grupo: [{uid: grupo.uid}]}});
                        
                        if (!permissao) {
                            await cadastroPermissao(grupo, tabela);
                        }
                })
            })
               
        }
        export async function cadastroVendedores() {
            let _repEmpresas: Repository<Empresas> = getRepository(Empresas);
            let empresas = await _repEmpresas.find();
            return cadastraVendedores(empresas);
        }
        
        export async function cadastroUsuarios() {
            let _repGrupos: Repository<Grupos> = getRepository(Grupos);
            let grupos = await _repGrupos.find();
            await cadastroUsuario(grupos);
        }

        export async function cadastroProduto() {
            let _repEmpresas: Repository<Empresas> = getRepository(Empresas);
            let empresas = await _repEmpresas.find();
            return cadastraProdutos(empresas);
        }

 
