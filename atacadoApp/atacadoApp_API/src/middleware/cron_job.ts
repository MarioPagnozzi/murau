import { Repository, getRepository, Not, OneToMany, In } from 'typeorm';
import { Request, Response, NextFunction } from 'express';
import { Configuracoes } from '../entity/Configuracoes';
import { Produtos } from '../entity/Produtos';
import { functions } from '../configuracao/functions/globalFunctions';


require('events').EventEmitter.defaultMaxListeners = Infinity;
var cron_atualiza = require("node-schedule");
 var cron_insere = require("node-schedule");

export default async (req: Request, res: Response, next: NextFunction) => {

   let _repParametros: Repository<Configuracoes> = getRepository(Configuracoes);
   let set_Hora_inicio_atualiza = await _repParametros.findOne({where: {nome_parametro: 'set_Hora_inicio_atualiza'}});
   let startTime: any = null;
   let endTime: any = null;

   let fun = new functions();

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
   var job_atualiza = await cron_atualiza.scheduleJob({start: startTime, end: endTime, rule: rule_atualiza},async function() {
        
        let token = await fun.geraToken();
        fun.atualizaProduto(token);
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
   console.log(rule_insere.hour);
   console.log(rule_insere.minute);
   console.log(startTime)
   console.log(endTime)

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
        
        let token = await fun.geraToken();
        fun.insereProduto(token);
    })

}