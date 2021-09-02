import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { UsuariosService } from 'src/app/services/usuarios.service';
import {ErrorStateMatcher} from '@angular/material/core';
import {FormBuilder, FormControl, FormGroupDirective, NgForm, Validators} from '@angular/forms';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  form: any = {};
  toppings: any;
  constructor(
    private userService: UsuariosService,
    private matSnack: MatSnackBar,
    private router: Router,
    private fb: FormBuilder
    
  ) {
    this.toppings = fb.group({
      lembrar: true
    });
   }

  ngOnInit(): Promise<any> {
    document.getElementById("limiter")?.scrollIntoView();
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
  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);

  senhaFormControl = new FormControl('', [
    Validators.required
  ]);
  matcher = new MyErrorStateMatcher();

}
