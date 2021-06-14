import { EntitySubscriberInterface, EventSubscriber, InsertEvent } from "typeorm";
import { Produtos } from "../src/entity/Produtos";
import * as fun from "../src/configuracao/functions/globalFunctions";

@EventSubscriber()
export class ProdutoSubscriber implements EntitySubscriberInterface<Produtos> {
    
    listemTo() {
        return Produtos;
    }

    afterInsert(event: InsertEvent<Produtos>) {

        setTimeout(async () => {
           
                await new fun.geraToken().token().then(async (_token) => {
                    const atualizacoes = async () => {

                        //setTimeout(() => {
                          await  new fun.atualizaProduto(event.entity.codigo, _token).preco()
                            .then(async () => {
                                await new fun.atualizaProduto(event.entity.codigo, _token).estoque()
                                .then(async () => {
                                    await new fun.atualizaProduto(event.entity.codigo, _token).imagens()
                                    .then(() => {                           
                                    })
                                    .catch(() => {                          
                                        throw new Error("Erro ao atualizar as imagnes")
                                    })
                                })
                                .catch(() => {
                                    throw new Error("Erro ao atualizar os estoques")
                                })
                            })
                            .catch(() => {                  
                                throw new Error("Erro ao atualizar produtos")
                            })
                        //}, 10000)
                    }
            
                await atualizacoes();
                })
                .catch(() => {
                    throw new Error("Erro ao atualizar produtos - 'Trigger afiter insert'")
                })
        }, 3000);
        
    }
}