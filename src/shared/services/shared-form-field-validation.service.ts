import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { MyFormField } from '../interfaces/myFormFields';

@Injectable({
  providedIn: 'root'
})
export class SharedFormFieldValidationService {

  private found!: boolean;

  constructor(private toastr: ToastrService, private datePipe: DatePipe) {}

  showToastr() {
    this.toastr.success('Yahoo ho gaya kaam!');
  }

  validateToastr(validate: MyFormField[]): boolean {
  this.found = true;

  for (let field of validate) {
    const value = field.value?.toString().trim() ?? '';

    // ✅ 1. Required field is EMPTY
    if (field.required && (value === '' || value === '0')) {
      this.toastr.info(`Please ${field.msg}`);
      return false;
    }

    // ✅ 2. If field has value → validate by type
    if (value !== '') {
      if (field.type === 'name' && !this.validateName(value)) {
        this.toastr.info(`Please enter a correct name`);
        return false;
      }

      if (field.type === 'number' && !this.validateNumber(value)) {
        this.toastr.info(`Please enter a correct number`);
        return false;
      }

      // Add other validations if needed...
      if (field.type === 'email' && !this.validateEmail(value)) {
        this.toastr.info(`Please enter a correct email`);
        return false;
      }

      if (field.type === 'mobile' && !this.validateMobile(value)) {
        this.toastr.info(`Please enter a correct mobile number`);
        return false;
      }

      if (field.type === 'cnic' && !this.validateCNIC(value)) {
        this.toastr.info(`Please enter a correct CNIC`);
        return false;
      }
    }
  }

  return true;
}

  // api response send error msg rather than data
  apiErrorResponse(errorMsg: string) {
    this.toastr.error(errorMsg);
  }

  apiSuccessResponse(msg: string) {
    this.toastr.success(msg);
  }

  apiInfoResponse(msg: string) {
    this.toastr.info(msg);
  }

  resetFormFields(formFields: MyFormField[]): MyFormField[] {
    for (let i = 0; i < formFields.length; i++) {
      if (formFields[i].required == true) {
        formFields[i].value = '';
      }
    }
    return formFields;
  }

  // //web service response split
  splitResponse(response: string): string {
    return response.split('|||')[1];
  }

  // // changeDateFormat
  // fields value validations and formatting
  dateFormat(date?: Date): string {
    const formattedDate = this.datePipe.transform(date, 'yyyy-MM-dd');
    return formattedDate ?? '';
  }

  validateName(name: string): boolean {
  return /^[A-Za-z ]+$/.test(name);
}


  validateNumber(num: string): boolean {
  return /^[0-9]+$/.test(num);
}


  allowOnlyNumbers(event: KeyboardEvent): boolean {
    const charCode = event.which || event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  restrictNumberRange(event: KeyboardEvent, currentValue: string): boolean {
    const charCode = event.which || event.keyCode;
    const inputChar = String.fromCharCode(charCode);

    // Prevent input if it's not a number
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
      return false;
    }

    // Calculate the new value after adding the input character
    const newValue = +(currentValue + inputChar);

    // Restrict the value to be within the range 1 to 100
    if (newValue < 1 || newValue > 100) {
      event.preventDefault();
      return false;
    }

    return true;
  }

  validateEmail(email: string): boolean {
  return /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(email);
}


  validateNTN(ntn: string, msg: string): boolean {
    if (ntn.length == 9) {
      return true;
    } else {
      this.showMsg(msg, 'invalid');
      return false;
    }
  }

  validateMobile(mobile: string): boolean {
  return mobile.length === 12;
}


  validatePhone(phone: string, msg: string): boolean {
    if (phone.length == 11) {
      return true;
    } else {
      this.showMsg(msg, 'invalid');
      return false;
    }
  }
  validateCNIC(cnic: string): boolean {
  return cnic.length === 15;
}


  validPasswordStrength(password: string, msg: string): boolean {
    var letterNumber = /^[0-9a-zA-Z!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/;

    if (password.length > 7) {
      if (password.match(letterNumber)) {
        return true;
      } else {
        this.showMsg(msg, 'alphabets, special character and digit allowed in ');
        return false;
      }
    } else {
      this.showMsg(msg, 'minimum 8 characters in ');
      return false;
    }
  }

  validateSpecialChar(SpecialChar: string, msg: string): boolean {
    var regEx = /^[a-zA-Z0-9 ]+$/;
    if (SpecialChar.match(regEx)) {
      return true;
    } else {
      this.showMsg(msg, 'invalid');
      return false;
    }
  }

  showMsg(msg: string, rep: string) {
    this.toastr.info(msg.replace('enter', rep));
  }
}
