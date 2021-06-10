import { Repository, getRepository, Not, OneToMany, In } from 'typeorm';
import { Request, Response, NextFunction } from 'express';
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
        
        setTimeout(async () => {
            job_atualiza.cancel(true);
            await new fun.geraToken().token().then(async (_token) => {
             
                const obj = {
                    where: {
                        ativo: true, excluido: false
                    }
                }
                let _prod;
                await fun.getProdutos(obj).then(async (result) => {
                    _prod = result;
                }).catch(async (err) => {
                    
                        set_Hora_inicio_atualiza = await _repParametros.findOne({where: {nome_parametro: 'set_Hora_inicio_atualiza'}});
                       
                        

                        if (set_Hora_inicio_atualiza && set_Hora_inicio_atualiza.valor !== "") {
                            let hora = set_Hora_inicio_atualiza.valor.split(',')[0];
                            let minuto = set_Hora_inicio_atualiza.valor.split(',')[1];
                            let segundo = set_Hora_inicio_atualiza.valor.split(',')[2];
                            startTime = new Date().setUTCHours(+hora,+minuto,+segundo);
                        
                        }
                        set_Hora_fim_atualiza = await _repParametros.findOne({where: {nome_parametro: 'set_Hora_fim_atualiza'}});

                        if (set_Hora_fim_atualiza && set_Hora_fim_atualiza.valor !== "") {
                            let hora = set_Hora_fim_atualiza.valor.split(',')[0];
                            let minuto = set_Hora_fim_atualiza.valor.split(',')[1];
                            let segundo = set_Hora_fim_atualiza.valor.split(',')[2];
                            endTime = new Date().setUTCHours(+hora,+minuto,+segundo);
                        }


                        rule_atualiza_horas = await _repParametros.findOne({where: {nome_parametro: 'rule_atualiza_horas'}});
                        rule_atualiza_minutos = await _repParametros.findOne({where: {nome_parametro: 'rule_atualiza_minutos'}});
                        rule_atualiza_segundos = await _repParametros.findOne({where: {nome_parametro: 'rule_atualiza_segundos'}});
                        rule_atualiza_diasSemanas = await _repParametros.findOne({where: {nome_parametro: 'rule_atualiza_diasSemanas'}});
                        rule_atualiza = new cron_atualiza.RecurrenceRule();

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
                        job_atualiza.reschedule({start: startTime, end: endTime, rule: rule_atualiza});
                    
                    throw new Error(err.message);
                })
                
                    if (_prod.length > 0) {
                        job_atualiza.cancel(true);
                        let cdProdutos: Array<any> = [];
                        _prod.forEach(async (prod) => {
                            cdProdutos.push(prod.codigo);
                        });
                        let _cdProdutos: Array<any> = [];
                        for (let i = 0; i < cdProdutos.length; i++) {
                            _cdProdutos.push(cdProdutos[i]);
                            if (_cdProdutos.length === 49 || (i === (cdProdutos.length - 1))) {
                               let lote_cdProdutos = _cdProdutos;
                               _cdProdutos = [];
                                const atualizacoes = async () => {
                                    let atualizaPreco = await new fun.atualizaProduto(lote_cdProdutos, _token).preco()
                                    .then(async () => {
                                        console.log("Preços dos produtos " + lote_cdProdutos + ' foram atualizados');
                                    }).catch(async (error) => {console.log("Erro ao gravar preços do produto: " + error)});
    
                                    let atualizaEstoque = await new fun.atualizaProduto(lote_cdProdutos, _token).estoque()
                                    .then(async () => {
                                        console.log("Estoques dos Produtos: " + lote_cdProdutos + " atualizados")
                                    })
                                    .catch(async (error) => {console.log("Erro ao gravar estoques: " + error.message)});
    
                                    let atualizaImagem = await new fun.atualizaProduto(lote_cdProdutos, _token).imagens()
                                    .then(async () => {
                                    console.log("Imagens dos Produtos: " + lote_cdProdutos + " atualizados")
                                    })
                                    .catch(async (error) => {console.log("Erro ao gravar imagens: " + error.message)});
                                    
                                    let retorno;
                                    try {
                                        retorno = await Promise.all([atualizaPreco, atualizaEstoque, atualizaImagem]).then(() => {
                                            atualizaPreco = undefined;
                                            atualizaEstoque = undefined;
                                            atualizaImagem = undefined;
                                            return true;
                                        }).catch(() => {
                                            atualizaPreco = undefined;
                                            atualizaEstoque = undefined;
                                            atualizaImagem = undefined;
                                            return false
                                        });
                                    } catch (error) {
                                        atualizaPreco = undefined;
                                        atualizaEstoque = undefined;
                                        atualizaImagem = undefined;
                                        throw new Error(error.message);
                                    }
                                    return retorno;
                                }
    
                                if (await atualizacoes()) {
                                    lote_cdProdutos = [];
                                } else {
                                    throw new Error("Erro nas atualizações");
                                }
                            } 
                        }
                        
                    }
            }).catch(async (error) => {
                
                    set_Hora_inicio_atualiza = await _repParametros.findOne({where: {nome_parametro: 'set_Hora_inicio_atualiza'}});

                    if (set_Hora_inicio_atualiza && set_Hora_inicio_atualiza.valor !== "") {
                        let hora = set_Hora_inicio_atualiza.valor.split(',')[0];
                        let minuto = set_Hora_inicio_atualiza.valor.split(',')[1];
                        let segundo = set_Hora_inicio_atualiza.valor.split(',')[2];
                        startTime = new Date().setUTCHours(+hora,+minuto,+segundo);
                    
                    }
                    set_Hora_fim_atualiza = await _repParametros.findOne({where: {nome_parametro: 'set_Hora_fim_atualiza'}});

                    if (set_Hora_fim_atualiza && set_Hora_fim_atualiza.valor !== "") {
                        let hora = set_Hora_fim_atualiza.valor.split(',')[0];
                        let minuto = set_Hora_fim_atualiza.valor.split(',')[1];
                        let segundo = set_Hora_fim_atualiza.valor.split(',')[2];
                        endTime = new Date().setUTCHours(+hora,+minuto,+segundo);
                    }


                    rule_atualiza_horas = await _repParametros.findOne({where: {nome_parametro: 'rule_atualiza_horas'}});
                    rule_atualiza_minutos = await _repParametros.findOne({where: {nome_parametro: 'rule_atualiza_minutos'}});
                    rule_atualiza_segundos = await _repParametros.findOne({where: {nome_parametro: 'rule_atualiza_segundos'}});
                    rule_atualiza_diasSemanas = await _repParametros.findOne({where: {nome_parametro: 'rule_atualiza_diasSemanas'}});
                    rule_atualiza = new cron_atualiza.RecurrenceRule();

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
                    job_atualiza.reschedule({start: startTime, end: endTime, rule: rule_atualiza});
                
                console.log("Erro ao buscar produtos " + error)
            })
        },10000)
        
            set_Hora_inicio_atualiza = await _repParametros.findOne({where: {nome_parametro: 'set_Hora_inicio_atualiza'}});

            if (set_Hora_inicio_atualiza && set_Hora_inicio_atualiza.valor !== "") {
                let hora = set_Hora_inicio_atualiza.valor.split(',')[0];
                let minuto = set_Hora_inicio_atualiza.valor.split(',')[1];
                let segundo = set_Hora_inicio_atualiza.valor.split(',')[2];
                startTime = new Date().setUTCHours(+hora,+minuto,+segundo);
            
            }
            set_Hora_fim_atualiza = await _repParametros.findOne({where: {nome_parametro: 'set_Hora_fim_atualiza'}});

            if (set_Hora_fim_atualiza && set_Hora_fim_atualiza.valor !== "") {
                let hora = set_Hora_fim_atualiza.valor.split(',')[0];
                let minuto = set_Hora_fim_atualiza.valor.split(',')[1];
                let segundo = set_Hora_fim_atualiza.valor.split(',')[2];
                endTime = new Date().setUTCHours(+hora,+minuto,+segundo);
            }


            rule_atualiza_horas = await _repParametros.findOne({where: {nome_parametro: 'rule_atualiza_horas'}});
            rule_atualiza_minutos = await _repParametros.findOne({where: {nome_parametro: 'rule_atualiza_minutos'}});
            rule_atualiza_segundos = await _repParametros.findOne({where: {nome_parametro: 'rule_atualiza_segundos'}});
            rule_atualiza_diasSemanas = await _repParametros.findOne({where: {nome_parametro: 'rule_atualiza_diasSemanas'}});
            rule_atualiza = new cron_atualiza.RecurrenceRule();

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
            job_atualiza.reschedule({start: startTime, end: endTime, rule: rule_atualiza});
        
    }
    var job_atualiza = await cron_atualiza.scheduleJob({start: startTime, end: endTime, rule: rule_atualiza},async function() {
          await atualiza();
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

    var job_insere = await cron_insere.scheduleJob({start: startTime, end: endTime, rule: rule_insere}, async function () {
      
        await new fun.geraToken().token().then(async (_token) => {
            
            let parametros = await fun.getParametros();
            let ultimoNumero = parametros.filter(val => val.nome_parametro == "cod_prod_busca")[0];
            
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
                produtoExiste = undefined;
            }
            
        }).catch((error) => {console.log("Erro ao inserir produtos " + error)})
    })
  
}