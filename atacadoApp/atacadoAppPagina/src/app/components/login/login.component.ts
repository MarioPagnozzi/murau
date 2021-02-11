import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { UsuariosService } from 'src/app/services/usuarios.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  form: any = {};
  constructor(
    private userService: UsuariosService,
    private matSnack: MatSnackBar,
    private router: Router
    
  ) { }

  ngOnInit(): Promise<any> {

    if (this.userService.isStaticLogged) {
      return this.router.navigateByUrl('/home');
    }
    return this.router.navigateByUrl('/login');
  }
  async login(): Promise<void> {
    const result = await this.userService.login(this.form.email, this.form.senha);
    
    if (result.success) {
      this.userService.configureLogin(result);
      this.router.navigateByUrl('/panel');
    } else {
      this.matSnack.open("Usuário ou senha incorreto", undefined, {duration: 2000});
    }
  }

}
