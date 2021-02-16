import {Directive } from '@angular/core';
import { Validator, AbstractControl, NG_VALIDATORS } from '@angular/forms';

@Directive({
    // tslint:disable-next-line: directive-selector
    selector: '[nomeValidateDirective]',
    providers: [
      {provide: NG_VALIDATORS, useExisting: AppNomeValidateDirective, multi: true}
    ]
  })
  export class AppNomeValidateDirective implements Validator {
    validate(control: AbstractControl): {[key: string]: any} | null {
      if (!control.value || (control.value && control.value.length <= 10)) {
        return { 'nomeInvalid': true }; // return object if the validation is not passed.
      }
      return null; // return null if validation is passed.
    }
  }

  @Directive({
      // tslint:disable-next-line: directive-selector
      selector: '[cnpjValidateDirective]',
      providers: [
          {provide: NG_VALIDATORS, useExisting: AppCnpjValidateDirective, multi: true}
      ]
  })
  export class AppCnpjValidateDirective implements Validator {
      validate(control: AbstractControl): {[key: string]: any} | null {
          if (!control.value || (control.value && control.value.length <= 14)) {
              return {'cnpjInvalid': true};
          }
          return null;
      }
  }

  @Directive({
    // tslint:disable-next-line: directive-selector
    selector: '[cepValidateDirective]',
    providers: [
        {provide: NG_VALIDATORS, useExisting: AppCepValidateDirective, multi: true}
    ]
})
export class AppCepValidateDirective implements Validator {
    validate(control: AbstractControl): {[key: string]: any} | null {
        if (!control.value || (control.value && control.value.length <= 8)) {
            return {'cepInvalid': true};
        }
        return null;
    }
}

@Directive({
  // tslint:disable-next-line: directive-selector
  selector: '[ufValidateDirective]',
  providers: [
      {provide: NG_VALIDATORS, useExisting: AppUfValidateDirective, multi: true}
  ]
})
export class AppUfValidateDirective implements Validator {
  validate(control: AbstractControl): {[key: string]: any} | null {
      if (!control.value || (control.value && control.value.length <= 1)) {
          return {'ufInvalid': true};
      }
      return null;
  }
}

@Directive({
  // tslint:disable-next-line: directive-selector
  selector: '[emailValidateDirective]',
  providers: [
      {provide: NG_VALIDATORS, useExisting: AppEmailValidateDirective, multi: true}
  ]
})
export class AppEmailValidateDirective implements Validator {
  validate(control: AbstractControl): {[key: string]: any} | null {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (!control.value || !re.test(control.value.toString().toLowerCase()) || (control.value && control.value.length <= 1)) {
          return {'emailInvalid': true};
      }
      return null;
  }
}