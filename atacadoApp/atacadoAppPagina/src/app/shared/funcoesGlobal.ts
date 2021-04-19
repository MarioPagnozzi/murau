import { IGrupos } from "../interfaces/IGrupos";

declare var google: any;
export function RetornaDadosUsuario() {
    if (localStorage.getItem("murau:user") == null) {
        return false;
    }
    const usuario = JSON.parse(localStorage.getItem("murau:user") as string);
   /* const usuario: IUsuarios = json.map((u: IUsuarios) => {
       return {
           uid: u.uid,
           nome: u.nome,
           email: u.email,
           foto: u.foto
       }
    });*/
    return usuario;
}
export function RetornaGruposUsuario() {
    if (localStorage.getItem("murau:grupo") == null) {
        return [];
    }
    const json = JSON.parse(localStorage.getItem("murau:grupo") as string);
    const grupos: IGrupos[] = json.map((g: IGrupos) => {
        return {
            nome_grupo: g.nome_grupo
        }
        
    });
    return grupos;
}
export function Permissao(tabela: string, acao: string): boolean {
    if (localStorage.getItem("murau:grupo") == null) {
        return false;
    }
    const json = JSON.parse(localStorage.getItem("murau:grupo") as string);
    let hasPermissao = false;
    const grupos: IGrupos[] = json.map((g: IGrupos) => {
            return {
                nome_grupo: g.nome_grupo,
                permissoes: g.permissoes
            }
            
        });

    if (acao === "V") { 
        
        grupos.forEach((grupo) => {
            grupo.permissoes?.forEach((perm) => {
                if (perm.tabela?.toLowerCase() === tabela.toLowerCase()) {
                    if (perm.visualizar) {
                        hasPermissao = true;
                    }
                }
            })
        })
     
    }
    if (acao === "I") {

        grupos.forEach((grupo) => {
            grupo.permissoes?.forEach((perm) => {
                if (perm.tabela?.toLowerCase() === tabela.toLowerCase()) {
                    if (perm.inserir) {
                        hasPermissao = true;
                    }
                }
            })
        })

    }
    if (acao === "A") {

        grupos.forEach((grupo) => {
            grupo.permissoes?.forEach((perm) => {
                if (perm.tabela?.toLowerCase() === tabela.toLowerCase()) {
                    if (perm.alterar) {
                        hasPermissao = true;
                    }
                }
            })
        })
    }
        
    if (acao === "E") {

        grupos.forEach((grupo) => {
            grupo.permissoes?.forEach((perm) => {
                if (perm.tabela?.toLowerCase() === tabela.toLowerCase()) {
                    if (perm.excluir) {
                        hasPermissao = true;
                    }
                }
            })
        })

    }
    return hasPermissao;
}
interface IChildrenPai {
    label?: string,
    data?: string,
    children?: IChildren[],
    expandedIcon?: string,
    collapsedIcon?: string
}
interface IChildren {
    label?: string,
    data?: string,
    icon?: string,
    type?: string
}
interface IMenuCadastros {
    label?: string,
    children?: IChildrenPai[],
    data?: string,
    expandedIcon?: string,
    collapsedIcon?: string 

}
export function montaMenu() {
   
  
   const menu: IMenuCadastros[] = [];   
   const childrenPai: IChildrenPai[] = [];
   if (localStorage.getItem("murau:grupo") == null) {
        return menu;
    }

   if (Permissao("Clientes", "V")) {
       const children: IChildren[] = [];
       if (Permissao("Clientes", "I")) {
            children.push({
                label: "Novo",
                icon: "pi pi-plus",
                data: "./cliente/novo",
                type: "url"
            });
       }
       children.push({
           label: "Pesquisar",
           icon: "pi pi-search",
           data: "./clientes",
           type: "url"
       })
       childrenPai.push({
           label: "Clientes",
           data: "Manutenção de Clientes",
           expandedIcon: "pi pi-folder-open",
           collapsedIcon: "pi pi-folder",
           children: children
       })
   }

   if (Permissao("Empresas", "V")) {
        const children: IChildren[] = [];
        if (Permissao("Empresas", "I")) {
            children.push({
                label: "Novo",
                icon: "pi pi-plus",
                data: "./empresa/novo",
                type: "url"
            });
        }
        children.push({
            label: "Pesquisar",
            icon: "pi pi-search",
            data: "./empresas",
            type: "url"
        })
        childrenPai.push({
            label: "Empresas",
            data: "Manutenção de Empresas",
            expandedIcon: "pi pi-folder-open",
            collapsedIcon: "pi pi-folder",
            children: children
        })
   }

   if (Permissao("Grupo", "V")) {
        const children: IChildren[] = [];
        if (Permissao("Grupo", "I")) {
            children.push({
                label: "Novo",
                icon: "pi pi-plus",
                data: "./grupo/novo",
                type: "url"
            });
        }
        children.push({
            label: "Pesquisar",
            icon: "pi pi-search",
            data: "./grupos",
            type: "url"
        })
        childrenPai.push({
            label: "Grupos",
            data: "Manutenção de Grupos",
            expandedIcon: "pi pi-folder-open",
            collapsedIcon: "pi pi-folder",
            children: children
        })
    }

   if (Permissao("Permissoes", "V")) {
        const children: IChildren[] = [];
        if (Permissao("Permissoes", "I")) {
            children.push({
                label: "Novo",
                icon: "pi pi-plus",
                data: "./permissao/novo",
                type: "url"
            });
        }
        children.push({
            label: "Pesquisar",
            icon: "pi pi-search",
            data: "./permissoes",
            type: "url"
        })
        childrenPai.push({
            label: "Permissões",
            data: "Manutenção de Permissões",
            expandedIcon: "pi pi-folder-open",
            collapsedIcon: "pi pi-folder",
            children: children
        })
    }

   if (Permissao("Produtos", "V")) {
        const children: IChildren[] = [];
        if (Permissao("Produtos", "I")) {
            children.push({
                label: "Novo",
                icon: "pi pi-plus",
                data: "./produto/novo",
                type: "url"
            });
        }
        children.push({
            label: "Pesquisar",
            icon: "pi pi-search",
            data: "./produtos",
            type: "url"
        })
        childrenPai.push({
            label: "Produtos",
            data: "Manutenção de Produtos",
            expandedIcon: "pi pi-folder-open",
            collapsedIcon: "pi pi-folder",
            children: children
        })
    }

   if (Permissao("Usuarios", "V")) {
        const children: IChildren[] = [];
        if (Permissao("Usuarios", "I")) {
            children.push({
                label: "Novo",
                icon: "pi pi-plus",
                data: "./usuario/novo",
                type: "url"
            });
        }
        children.push({
            label: "Pesquisar",
            icon: "pi pi-search",
            data: "./usuarios",
            type: "url"
        })
        childrenPai.push({
            label: "Usuários",
            data: "Manutenção de Usuários",
            expandedIcon: "pi pi-folder-open",
            collapsedIcon: "pi pi-folder",
            children: children
        })
    }

   if (Permissao("Vendedores", "V")) {
        const children: IChildren[] = [];
        if (Permissao("Vendedores", "I")) {
            children.push({
                label: "Novo",
                icon: "pi pi-plus",
                data: "./vendedor/novo",
                type: "url"
            });
        }
        children.push({
            label: "Pesquisar",
            icon: "pi pi-search",
            data: "./vendedores",
            type: "url"
        })
        childrenPai.push({
            label: "Vendedores",
            data: "Manutenção de Vendedores",
            expandedIcon: "pi pi-folder-open",
            collapsedIcon: "pi pi-folder",
            children: children
        })
    }

   menu.push({
       label: "Cadastros",
       data: "Cadastros de Manutenção do Sistema",
       expandedIcon: "pi pi-folder-open",
       collapsedIcon: "pi pi-folder",
       children: childrenPai
   })
   return menu;

}
export function getAddress(latitude: number, longitude: number): Promise<Array<any>> {
   const geoCoder = new google.maps.Geocoder();
  return new Promise<Array<any>>( async (resolve, reject) => {       
       geoCoder.geocode({ "location" : { lat: latitude, lng: longitude } }, (results: any, status: any) => {
            if (status === 'OK') {
                if (results[0]) {
                    resolve(results);
                } else {
                    reject();
                }
            } else {
                reject();
            }
        });
    });
  }

  export function getLatLong(endereco: string): Promise<Array<any>> {
      const geoCoder = new google.maps.Geocoder();
      return new Promise<Array<any>>( async (resolve, reject) => {
          geoCoder.geocode({"address" : endereco}, (results: any, status: any) => {
              if (status === 'OK') {
                  if (results[0]) {
                      resolve(results);
                  } else {
                      reject();
                  }
              } else {
                  reject();
              }
          });
      });
  }

  export function getUrl(url: any): string {
    let _url = JSON.parse(JSON.stringify(url))
    return _url._value[0].path;
  }