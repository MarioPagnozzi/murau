import { AdminGuard } from './shared/admin.guard';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ClientesComponent } from './components/clientes/clientes.component';
import { EmpresaComponent } from './components/empresa/empresa.component';
import { EmpresasComponent } from './components/empresas/empresas.component';
import { GrupoComponent } from './components/grupo/grupo.component';
import { GruposComponent } from './components/grupos/grupos.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { PanelComponent } from './components/panel/panel.component';
import { PermissaoComponent } from './components/permissao/permissao.component';
import { PermissoesComponent } from './components/permissoes/permissoes.component';
import { ProdutoComponent } from './components/produto/produto.component';
import { ProdutosComponent } from './components/produtos/produtos.component';
import { UsuarioComponent } from './components/usuario/usuario.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { VendedorComponent } from './components/vendedor/vendedor.component';
import { VendedoresComponent } from './components/vendedores/vendedores.component';
import { CreateClienteComponent } from './components/create-cliente/create-cliente.component';
import { ClienteComponent } from './components/cliente/cliente.component';
import { PedidoComponent } from './components/pedido/pedido.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/home' },
  { path: 'home', component: HomeComponent},
  { path: 'login', component: LoginComponent},
  { path: 'panel', component: PanelComponent, canActivate: [AdminGuard] },
  { path: 'perfil/:user', component: PanelComponent, canActivate: [AdminGuard] },
  { path: 'empresa/:cod', component: EmpresaComponent, canActivate: [AdminGuard] },
  { path: 'empresas', component: EmpresasComponent, canActivate: [AdminGuard] },
  { path: 'grupo/:cod', component: GrupoComponent, canActivate: [AdminGuard] },
  { path: 'grupos', component: GruposComponent, canActivate: [AdminGuard] },
  { path: 'permissao/:cod', component: PermissaoComponent, canActivate: [AdminGuard] },
  { path: 'permissoes', component: PermissoesComponent, canActivate: [AdminGuard] },
  { path: 'produto/:cod', component: ProdutoComponent, canActivate: [AdminGuard] },
  { path: 'produtos', component: ProdutosComponent, canActivate: [AdminGuard] },
  { path: 'usuario/:cod', component: UsuarioComponent, canActivate: [AdminGuard] },
  { path: 'usuarios', component: UsuariosComponent, canActivate: [AdminGuard] },
  { path: 'vendedor/:cod', component: VendedorComponent, canActivate: [AdminGuard] },
  { path: 'vendedores', component: VendedoresComponent, canActivate: [AdminGuard] },
  { path: 'clientes', component: ClientesComponent, canActivate: [AdminGuard] },
  { path: 'cliente/:cod', component: ClienteComponent, canActivate: [AdminGuard] },
  { path: 'pedido/:cod/:cli/:url', component: PedidoComponent, canActivate: [AdminGuard] },

  { path: 'cadastro', component: CreateClienteComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
