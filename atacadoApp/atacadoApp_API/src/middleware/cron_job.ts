import { Repository, getRepository, Not, OneToMany, In, Unique } from 'typeorm';
import { Configuracoes } from '../entity/Configuracoes';
import * as fun from '../configuracao/functions/globalFunctions';


require('events').EventEmitter.defaultMaxListeners = Infinity;
var cron_atualiza = require("node-schedule");
var cron_insere = require("node-schedule");

export async function job() {

   let _repParametros: Repository<Configuracoes> = getRepository(Configuracoes);
   let set_Hora_inicio_atualiza = await _repParametros.findOne({where: {nome_parametro: 'set_Hora_inicio_atualiza'}});
   let startTime: any = null;
   let endTime: any = null;
 

   if (set_Hora_inicio_atualiza && set_Hora_inicio_atualiza.valor !== "") {
       let hora = set_Hora_inicio_atualiza.valor.split(',')[0];
       let minuto = set_Hora_inicio_atualiza.valor.split(',')[1];
       let segundo = set_Hora_inicio_atualiza.valor.split(',')[2];
       startTime = new Date().setUTCHours(+hora,+minuto,+segundo);
   
   }
   let set_Hora_fim_atualiza = await _repParametros.findOne({where: {nome_parametro: 'set_Hora_fim_atualiza'}});

   if (set_Hora_fim_atualiza && set_Hora_fim_atualiza.valor !== "") {
    let hora = set_Hora_fim_atualiza.valor.split(',')[0];
    let minuto = set_Hora_fim_atualiza.valor.split(',')[1];
    let segundo = set_Hora_fim_atualiza.valor.split(',')[2];
    endTime = new Date().setUTCHours(+hora,+minuto,+segundo);
   }


   let rule_atualiza_horas = await _repParametros.findOne({where: {nome_parametro: 'rule_atualiza_horas'}});
   let rule_atualiza_minutos = await _repParametros.findOne({where: {nome_parametro: 'rule_atualiza_minutos'}});
   let rule_atualiza_segundos = await _repParametros.findOne({where: {nome_parametro: 'rule_atualiza_segundos'}});
   let rule_atualiza_diasSemanas = await _repParametros.findOne({where: {nome_parametro: 'rule_atualiza_diasSemanas'}});
   var rule_atualiza = new cron_atualiza.RecurrenceRule();

   if (rule_atualiza_horas && rule_atualiza_horas.valor !== "") {
        if(rule_atualiza_horas.valor.indexOf(',')) {
            let rules = rule_atualiza_horas.valor.split(',');
            let _rules = [];
            for (let i = 0; i < rules.length; i++) {
                _rules.push(+rules[i]);
            }
            rule_atualiza.hour = _rules
        } else {
            rule_atualiza.hour = +rule_atualiza_horas.valor;
        }
   }

   if (rule_atualiza_minutos && rule_atualiza_minutos.valor !== "") {
       if (rule_atualiza_minutos.valor.indexOf(',')) {
           let rules = rule_atualiza_minutos.valor.split(',');
           let _rules = [];
            for (let i = 0; i < rules.length; i++) {
                _rules.push(+rules[i]);
            }
            rule_atualiza.minute = _rules
        } else {
           rule_atualiza.minute = rule_atualiza_minutos.valor;
       }
   }

   if (rule_atualiza_segundos && rule_atualiza_segundos.valor !== "") {
       if (rule_atualiza_segundos.valor.indexOf(',')) {
           let rules = rule_atualiza_segundos.valor.split(',');
           let _rules = [];
           for (let i = 0; i < rules.length; i++) {
               _rules.push(+rules[i]);
           }
           rule_atualiza.second = _rules
       } else {
           rule_atualiza.second = rule_atualiza_segundos.valor;
       }
   }

   if (rule_atualiza_diasSemanas && rule_atualiza_diasSemanas.valor !== "") {
        if (rule_atualiza_diasSemanas.valor.indexOf(',')) {
            let rules = rule_atualiza_diasSemanas.valor.split(',');
            let _rules = [];
            for (let i = 0; i < rules.length; i++) {
                _rules.push(+rules[i]);
            }
            rule_atualiza.dayOfWeek = _rules
        } else {
            rule_atualiza.dayOfWeek = +rule_atualiza_diasSemanas.valor;
        }
   }
    const atualiza = async () => {
        
       let timeout = setTimeout(async () => {
            job_atualiza.cancel();
                await new fun.geraToken().token().then(async (_token) => {
                    
                    let parametros = await fun.getParametros();
                    let skip_qtd_busca_produto = +parametros.filter(val => val.nome_parametro === "skip_qtd_busca_produto")[0].valor;
                    let take_qtd_busca_produto = +parametros.filter(val => val.nome_parametro === "take_qtd_busca_produto")[0].valor;
                    
                    const obj = {
                        where: {
                            ativo: true, excluido: false
                        },
                        order: {data_inclusao: 'DESC'},
                        skip: skip_qtd_busca_produto,
                        take: take_qtd_busca_produto
                    }
                    let _prod = await fun.getProdutos(obj);

                    let qtd_produtos = await fun.getProdutos({where: { ativo: true, excluido: false}});

                    if (skip_qtd_busca_produto >= qtd_produtos.length) {
                        skip_qtd_busca_produto = 0;
                    } else {
                        skip_qtd_busca_produto = +skip_qtd_busca_produto + +take_qtd_busca_produto;
                    }

                    let _repParametros: Repository<Configuracoes> = getRepository(Configuracoes);
                    let param = await _repParametros.findOne({where: {nome_parametro: "skip_qtd_busca_produto"}});
                    param.valor = skip_qtd_busca_produto.toString();
                    await _repParametros.save(param);
                   

                    const executa_alteracoes = async () => {

                        if (_prod.length > 0) {
                            job_atualiza.cancel();
                            let cdProdutos: Array<any> = [];
                            _prod.forEach(async (prod) => {
                                cdProdutos.push(prod.codigo);
                            });
                            let _cdProdutos: Array<any> = [];
                            for (let i = 0; i < cdProdutos.length; i++) {
                                _cdProdutos.push(cdProdutos[i]);

                                if (_cdProdutos.length === 49 || (i === (cdProdutos.length - 1))) {
                                
                                        const atualizacoes = async () => {
                                            let updateProduto = new fun.atualizaProduto(_cdProdutos, _token);
                                            let preco = await updateProduto.preco();
                                            let estoque = await updateProduto.estoque();
                                            let images = await updateProduto.imagens();
                                             
                                            await Promise.all([preco, estoque, images]).finally(() => {
                                                _cdProdutos = [];
                                            })
                                            
                                        }
                                        
                                    let exec = await atualizacoes();
                                    await Promise.all([exec])
                                } 
                                
                            }
                           
                        }
                    }
                    let executa = await executa_alteracoes();
                    await Promise.all([parametros, _prod, qtd_produtos, param, executa]).finally(() => {
                        clearTimeout(timeout);
                        //job_atualiza.reschedule({start: startTime, end: endTime, rule: rule_atualiza});
                    })
                })
                .catch(async (error) => {
                    clearTimeout(timeout);
                    //job_atualiza.reschedule({start: startTime, end: endTime, rule: rule_atualiza});
                    throw new Error("erro ao carregar produtos: " + error)
                })
       }, 3000);
    } 
    var job_atualiza = await cron_atualiza.scheduleJob({start: startTime, end: endTime, rule: rule_atualiza},async function() {
          console.log("Atualizando...")
          await Promise.all([atualiza()]).finally(() => {
            job_atualiza.reschedule({start: startTime, end: endTime, rule: rule_atualiza});
          });
    });

    let set_Hora_inicio_insere = await _repParametros.findOne({where: {nome_parametro: 'set_Hora_inicio_insere'}});
    if (set_Hora_inicio_insere && set_Hora_inicio_insere.valor !== "") {
        let hora = set_Hora_inicio_insere.valor.split(',')[0];
        let minuto = set_Hora_inicio_insere.valor.split(',')[1];
        let segundo = set_Hora_inicio_insere.valor.split(',')[2];
        startTime = new Date().setUTCHours(+hora,+minuto,+segundo);
    
    }
    let set_Hora_fim_insere = await _repParametros.findOne({where: {nome_parametro: 'set_Hora_fim_insere'}});
    if (set_Hora_fim_insere && set_Hora_fim_insere.valor !== "") {
     let hora = set_Hora_fim_insere.valor.split(',')[0];
     let minuto = set_Hora_fim_insere.valor.split(',')[1];
     let segundo = set_Hora_fim_insere.valor.split(',')[2];
     endTime = new Date().setUTCHours(+hora,+minuto,+segundo);
    }

    let rule_insere_horas = await _repParametros.findOne({where: {nome_parametro: 'rule_insere_horas'}});
    let rule_insere_minutos = await _repParametros.findOne({where: {nome_parametro: 'rule_insere_minutos'}});
    let rule_insere_segundos = await _repParametros.findOne({where: {nome_parametro: 'rule_insere_segundos'}});
    let rule_insere_diasSemanas = await _repParametros.findOne({where: {nome_parametro: 'rule_insere_diasSemanas'}});
    var rule_insere = new cron_insere.RecurrenceRule();

    if (rule_insere_horas && rule_insere_horas.valor !== "") {
        if (rule_insere_horas.valor.indexOf(',')) {
            let rules = rule_insere_horas.valor.split(',');
            let _rules = [];
            for (let i = 0; i < rules.length; i++) {
                _rules.push(+rules[i]);
            }
            rule_insere.hour = _rules
        } else {
            rule_insere.hour = +rule_atualiza_horas.valor;
        }
   }

   if (rule_insere_minutos && rule_insere_minutos.valor !== "") {
       if (rule_insere_minutos.valor.indexOf(',')) {
           let rules = rule_insere_minutos.valor.split(',');
           let _rules = [];
            for (let i = 0; i < rules.length; i++) {
                _rules.push(+rules[i]);
            }
            rule_insere.minute = _rules
       } else {
           rule_insere.minute = +rule_atualiza_minutos.valor;
       }
   }

   if (rule_insere_segundos && rule_insere_segundos.valor !== "") {
       if (rule_insere_segundos.valor.indexOf(',')) {
           let rules = rule_insere_segundos.valor.split(',');
           let _rules = [];
            for (let i = 0; i < rules.length; i++) {
                _rules.push(+rules[i]);
            }
            rule_insere.second = _rules
       } else {
           rule_insere.second = +rule_insere_segundos.valor;
       }
   }

   if (rule_insere_diasSemanas && rule_insere_diasSemanas.valor !== "") {
        if (rule_insere_diasSemanas.valor.indexOf(',')) {
            let rules = rule_insere_diasSemanas.valor.split(',');
            let _rules = [];
            for (let i = 0; i < rules.length; i++) {
                _rules.push(+rules[i]);
            }
            rule_insere.dayOfWeek = _rules
        } else {
            rule_insere.dayOfWeek = +rule_insere_diasSemanas.valor;
        }
   }
    const insert = async () => {

        let timeout = setTimeout(async () => {
            job_insere.cancel();
            await new fun.geraToken().token().then(async (_token) => {
            
                let parametros = await fun.getParametros();
                let ultimoNumero = parametros.filter(val => val.nome_parametro == "cod_prod_busca")[0];
                
                const executa_novosReg = async () => {
                    if (ultimoNumero.valor === "0") {
                        try {
                            let maxCodigo = await fun.getMaxCodigo();
                            
                            ultimoNumero.valor = (+maxCodigo["maxCodigo"]).toString();
                            console.log(maxCodigo);
                          
                        } catch (error) {
                            console.log(error)
                        }
                        
                    }
                    let _cdProd: Array<any> = [];
                    let strUltimoN: string = ultimoNumero.valor;  
                    let qtd_lote_pesquisa = parametros.filter(val => val.nome_parametro == "qtd_lote_pesquisa")[0];
                    
                    for (let i = 0; i < (qtd_lote_pesquisa.valor !== "" ? +qtd_lote_pesquisa.valor : 1); i++) {
        
                        ultimoNumero.valor = (+ultimoNumero.valor + 1).toString();
                        let codigo = ultimoNumero.valor;
                        strUltimoN = codigo;
                        _cdProd.push((codigo).toString());
                       
                    }
                    
                    ultimoNumero = parametros.filter(val => val.nome_parametro == "cod_prod_busca")[0];
                    ultimoNumero.valor = strUltimoN.toString();
                    fun.setParametros(ultimoNumero);
                    
                   
                    for (let i = 0; i < _cdProd.length; i++) {
        
                        let produtoExiste = new fun.insereNovoProduto(_cdProd[i], _token).insetNew();
                        await Promise.all([produtoExiste]);
                        
                    }
                }
               let executa = await executa_novosReg();
               await Promise.all([parametros, executa]).finally(() => {
                   clearTimeout(timeout);
                   //job_insere.reschedule({start: startTime, end: endTime, rule: rule_insere})
               })
               
            }).catch((error) => {
                clearTimeout(timeout);
                //job_insere.reschedule({start: startTime, end: endTime, rule: rule_insere})
                throw new Error("Erro ao inserir produtos " + error)
            })
        }, 3000)
       
    }
    var job_insere = await cron_insere.scheduleJob({start: startTime, end: endTime, rule: rule_insere}, async function () {      
       await Promise.all([insert()]).finally(() => {
            job_insere.reschedule({start: startTime, end: endTime, rule: rule_insere})
       });
    })
  
}