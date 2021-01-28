import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EmpresaComponent } from './components/empresa/empresa.component';
import { EmpresasComponent } from './components/empresas/empresas.component';
import { GrupoComponent } from './components/grupo/grupo.component';
import { GruposComponent } from './components/grupos/grupos.component';
import { HomeComponent } from './components/home/home.component';
import { PanelComponent } from './components/panel/panel.component';
import { PermissaoComponent } from './components/permissao/permissao.component';
import { PermissoesComponent } from './components/permissoes/permissoes.component';
import { ProdutoComponent } from './components/produto/produto.component';
import { ProdutosComponent } from './components/produtos/produtos.component';
import { UsuarioComponent } from './components/usuario/usuario.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { VendedorComponent } from './components/vendedor/vendedor.component';
import { VendedoresComponent } from './components/vendedores/vendedores.component';

const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'panel', component: PanelComponent },
  { path: 'perfil/:user', component: PanelComponent },
  { path: 'empresa/:cod', component: EmpresaComponent },
  { path: 'empresas', component: EmpresasComponent},
  { path: 'grupo/:uid', component: GrupoComponent },
  { path: 'grupos', component: GruposComponent },
  { path: 'permissao/:uid', component: PermissaoComponent },
  { path: 'permissoes', component: PermissoesComponent },
  { path: 'produto/:cod', component: ProdutoComponent },
  { path: 'produtos', component: ProdutosComponent },
  { path: 'usuario/:uid', component: UsuarioComponent },
  { path: 'usuarios', component: UsuariosComponent },
  { path: 'vendedor/:cod', component: VendedorComponent },
  { path: 'vendedores', component: VendedoresComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
