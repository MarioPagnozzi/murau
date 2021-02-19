export abstract class BaseNotificacao {

  notifications: Array<{ message: string }>;

  constructor() {
    this.notifications = new Array<{ message: string }>();
  }

  AddNotification(message: string): void {
    this.notifications.push({ message: message });
  }

  isTrue(value, message) {
    if (value)
      this.notifications.push({ message: message });
  }

  isRequired(value, message) {
    if (!value || value.length <= 0)
      this.notifications.push({ message: message });
  }

  hasMinLen(value, min, message) {
    if (!value || value.length < min)
      this.notifications.push({ message: message });
  }

  hasMaxLen(value, max, message) {
    if (!value || value.length > max)
      this.notifications.push({ message: message });
  }

  isFixedLen(value, len, message) {
    if (value.length != len)
      this.notifications.push({ message: message });
  }

  isEmail(value, message) {
    var reg = new RegExp(/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/);
    if (!reg.test(value))
      this.notifications.push({ message: message });
  }

  isCPFCNPJ (value, message) {
    if (!value) {
      this.notifications.push({ message: message });
    }
    if (value && value.length == 14) {
      let cpf = value.trim();
      cpf = cpf.replace(/\./g,'');
      cpf = cpf.replace('-','');
      cpf = cpf.split('');

      let v1 = 0;
      let v2 = 0;
      let aux = false;

      for (var i = 1; cpf.length > i; i++) {
        aux = cpf[i - 1] != cpf[i];        
      }

      if (!aux) {
        this.notifications.push({message: message});
      }
      
      for (var i = 0, p = 10; (cpf.length - 2) > i; i++, p--) {
        v1 += cpf[i] * p;
      }

      v1 = ((v1 * 10) % 11);

      if (v1 == 10) {
        v1 = 0;
      }

      if (v1 != cpf[9]) {
        this.notifications.push({ message: message });
      }

      for (var i = 0, p = 11; (cpf.length - 1) > i; i++, p--) {
        v2 += cpf[i] * p;
      }

      v2 = ((v2 * 10) % 11);

      if (v2 == 10) {
        v2 = 0;
      }

      if (v2 != cpf[10]) {
        this.notifications.push({ message: message });
      }
    } else if (value && value.length == 18) {
      let cnpj = value.trim();
      cnpj = cnpj.replace(/\./g,'');
      cnpj = cnpj.replace('-','');
      cnpj = cnpj.replace('/','');
      cnpj = cnpj.split('');

      let v1 = 0;
      let v2 = 0;
      let aux = false;

      for (var i = 1; cnpj.length > i; i++) {
        aux = cnpj[i -1] != cnpj[i];
      }

      if (!aux) {
        this.notifications.push({ message: message });
      }

      for(var i = 0, p1 = 5, p2 = 13; (cnpj.length - 2) > i; i++, p1--, p2--) {
        if (p1 >= 2) {
          v1 += cnpj[i] * p1;
        }
        else {
          v1 += cnpj[i] * p2;
        }
      }
      v1 = (v1 % 11);

      if (v1 < 2) {
        v1 = 0;
      }
      else {
        v1 = (11 - v1);
      }

      if (v1 != cnpj[12]) {
        this.notifications.push({ message: message });
      }

      for (var i = 0, p1 = 6, p2 = 14; (cnpj.length - 1) > i; i++, p1--,p2--) {
        if (p1 >= 2) {
          v2 += cnpj[i] * p1;
        }
        else {
          v2 += cnpj[i] * p2;
        }
      }

      v2 = (v2 % 11);

      if (v2 < 2) {
        v2 = 0;
      }
      else {
        v2 = (11 - v2);
      }

      if (v2 != cnpj[13]) {
        this.notifications.push({ message: message });
      }
    }
    else {
      this.notifications.push({ message: message });
    }
  }

  get allNotifications(): Array<{ message: string }> {
    return this.notifications;
  }

  valid(): boolean {
    return this.notifications.length === 0;
  }

}