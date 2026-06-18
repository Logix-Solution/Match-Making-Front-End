import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SharedDataService } from 'src/shared/services/shared-data.service';
import { SharedFormFieldValidationService } from 'src/shared/services/shared-form-field-validation.service';

// ─── Interface ────────────────────────────────────────────────────────────────
interface SaveUserLoginInterface {
  fullName: string; // 0
  spType: string; // 1
  email: string; // 2
  phoneNumber: string; // 3
  password: string; // 4
}

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
})
export class SignInComponent implements OnInit {
  // ─── Form Field Models ────────────────────────────────────────────────────
  fullName: string = '';
  email: string = '';
  phone: string = '';
  password: string = '';

  // ─── UI State ─────────────────────────────────────────────────────────────
  hidePassword: boolean = true;
  isLoading: boolean = false;

  // ─── Page Fields (API payload) ────────────────────────────────────────────
  pageFields: SaveUserLoginInterface = {
    fullName: '',
    spType: 'insert',
    email: '',
    phoneNumber: '',
    password: '',
  };

  // ─── Form Fields (for saveHttp validation) ────────────────────────────────
  formFields: any[] = [
    {
      value: '',
      msg: ' Enter Your Full Name',
      type: 'textbox',
      required: true,
    }, // 0 fullName
    { value: 'insert', msg: '', type: 'hidden', required: false }, // 4 spType
    {
      value: '',
      msg: ' Enter Your  Email',
      type: 'textbox',
      required: true,
    }, // 1 email
    {
      value: '',
      msg: ' Enter Your Phone Number',
      type: 'textbox',
      required: true,
    }, // 2 phoneNumber
    {
      value: '',
      msg: ' Enter Your Password',
      type: 'textbox',
      required: true,
    }, // 3 password
  ];

  constructor(
    private router: Router,
    private dataService: SharedDataService,
    private toastr: ToastrService,
    private valid: SharedFormFieldValidationService,
  ) {}

  ngOnInit(): void {}

  // ─── Toggle Password Visibility ───────────────────────────────────────────
  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  // ─── Close Modal ──────────────────────────────────────────────────────────
  closeModal(): void {
    this.router.navigate(['/login']);
  }

  // ─── Google Sign Up ───────────────────────────────────────────────────────
  signUpWithGoogle(): void {
    console.log('Initiating Google authentication sign up pipeline...');
  }

  // ─── Create Profile (Save) ────────────────────────────────────────────────
  createProfile(): void {
    // ─── Sync bound fields → formFields[] ──────────────────────────────
    this.formFields[0].value = this.fullName;
    this.formFields[1].value = 'insert';
    this.formFields[2].value = this.email;
    this.formFields[3].value = this.phone;
    this.formFields[4].value = this.password;

    // ─── Sync formFields → pageFields ──────────────────────────────────
    this.pageFields.fullName = this.formFields[0].value;
    this.pageFields.spType = this.formFields[1].value;
    this.pageFields.email = this.formFields[2].value;
    this.pageFields.phoneNumber = this.formFields[3].value;
    this.pageFields.password = this.formFields[4].value;

   if (!this.valid.validateToastr(this.formFields)) return;



  this.isLoading = true;


    console.log('PageFields:', this.pageFields);
    console.log('FormFields:', this.formFields);

    this.isLoading = true;

    // ─── API Call ───────────────────────────────────────────────────────
    this.dataService
      .saveHttp(this.pageFields, this.formFields, 'auth-api/saveUserLogin')
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          const apiResponse = Array.isArray(response) ? response[0] : response;
          if (apiResponse?.includes('Success')) {
            this.valid.apiInfoResponse('User Created Successfully');
            this.router.navigate(['/login']);
          } else {
            this.valid.apiErrorResponse(apiResponse);
          }
        },
        error: (err: any) => {
          this.isLoading = false;
          console.log('Registration Error:', err);
        },
      });
  }
}
