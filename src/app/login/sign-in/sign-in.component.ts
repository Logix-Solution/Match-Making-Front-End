
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SharedDataService } from 'src/shared/services/shared-data.service';
import { SharedFormFieldValidationService } from 'src/shared/services/shared-form-field-validation.service';
import { environment } from 'src/envirnment/environment';

interface SaveUserLoginInterface {
  fullName:      string;
  spType:        string;
  email:         string;
  phoneNumber:   string;
  password:      string;
  countryCodeID: number;
}

interface Country {
  country_id: number;
  country_name: string;
  country_code: string;
  nationality: string;
  currencyTypeID: number;
}

declare const google: any;

type TouchedField = 'fullName' | 'email' | 'phone' | 'password';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
})
export class SignInComponent implements OnInit {

  // ─── Form Field Models ────────────────────────────────────────────────
  fullName: string  = '';
  email:    string  = '';
  phone:    string  = '';
  password: string  = '';

  // ─── Country Code (dropdown + phone, same row) ─────────────────────────
  countries: Country[] = [];
  selectedCountryCodeID: number | null = null; // country_id — sent as countryCodeID
  selectedCountryCode:   string = '';            // country_code — shown in dropdown

  // ─── UI State ───────────────────────────────────────────────────────
  hidePassword: boolean = true;
  isLoading:    boolean = false;
  isGoogleLoading: boolean = false;

  touched = {
    fullName: false,
    email:    false,
    phone:    false,
    password: false,
  };

  markTouched(field: TouchedField): void {
    this.touched[field] = true;
  }

  private readonly emailPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // ─── Country code → required phone digit length ────────────────────────
  private countryPhoneLengths: { [code: string]: number } = {
    '+93':  9,   // Afghanistan
    '+355': 9,   // Albania
    '+213': 9,   // Algeria
    '+376': 6,   // Andorra
    '+244': 9,   // Angola
    '+54':  10,  // Argentina
    '+374': 8,   // Armenia
    '+61':  9,   // Australia
    '+43':  10,  // Austria
    '+994': 9,   // Azerbaijan
    '+973': 8,   // Bahrain
    '+880': 10,  // Bangladesh
    '+375': 9,   // Belarus
    '+32':  9,   // Belgium
    '+501': 7,   // Belize
    '+229': 8,   // Benin
    '+975': 8,   // Bhutan
    '+591': 8,   // Bolivia
    '+387': 8,   // Bosnia and Herzegovina
    '+267': 8,   // Botswana
    '+55':  11,  // Brazil
    '+673': 7,   // Brunei
    '+359': 9,   // Bulgaria
    '+226': 8,   // Burkina Faso
    '+257': 8,   // Burundi
    '+238': 7,   // Cabo Verde
    '+855': 9,   // Cambodia
    '+237': 9,   // Cameroon
    '+1':   10,  // Canada / United States
    '+236': 8,   // Central African Republic
    '+235': 8,   // Chad
    '+56':  9,   // Chile
    '+86':  11,  // China
    '+57':  10,  // Colombia
    '+269': 7,   // Comoros
    '+242': 9,   // Congo
    '+506': 8,   // Costa Rica
    '+385': 9,   // Croatia
    '+53':  8,   // Cuba
    '+357': 8,   // Cyprus
    '+420': 9,   // Czech Republic
    '+45':  8,   // Denmark
    '+253': 8,   // Djibouti
    '+593': 9,   // Ecuador
    '+20':  10,  // Egypt
    '+503': 8,   // El Salvador
    '+240': 9,   // Equatorial Guinea
    '+291': 7,   // Eritrea
    '+372': 8,   // Estonia
    '+251': 9,   // Ethiopia
    '+679': 7,   // Fiji
    '+358': 9,   // Finland
    '+33':  9,   // France
    '+995': 9,   // Georgia
    '+49':  10,  // Germany
    '+233': 9,   // Ghana
    '+30':  10,  // Greece
    '+502': 8,   // Guatemala
    '+224': 9,   // Guinea
    '+245': 7,   // Guinea-Bissau
    '+592': 7,   // Guyana
    '+509': 8,   // Haiti
    '+504': 8,   // Honduras
    '+36':  9,   // Hungary
    '+91':  10,  // India
    '+62':  10,  // Indonesia
    '+98':  10,  // Iran
    '+964': 10,  // Iraq
    '+353': 9,   // Ireland
    '+972': 9,   // Israel
    '+39':  10,  // Italy
    '+81':  10,  // Japan
    '+962': 9,   // Jordan
    '+7':   10,  // Kazakhstan / Russia
    '+254': 9,   // Kenya
    '+965': 8,   // Kuwait
    '+996': 9,   // Kyrgyzstan
    '+856': 9,   // Laos
    '+371': 8,   // Latvia
    '+961': 8,   // Lebanon
    '+266': 8,   // Lesotho
    '+231': 8,   // Liberia
    '+218': 9,   // Libya
    '+423': 7,   // Liechtenstein
    '+370': 8,   // Lithuania
    '+352': 9,   // Luxembourg
    '+60':  9,   // Malaysia
    '+960': 7,   // Maldives
    '+223': 8,   // Mali
    '+356': 8,   // Malta
    '+52':  10,  // Mexico
    '+373': 8,   // Moldova
    '+976': 8,   // Mongolia
    '+212': 9,   // Morocco
    '+258': 9,   // Mozambique
    '+95':  9,   // Myanmar
    '+977': 10,  // Nepal
    '+31':  9,   // Netherlands
    '+64':  9,   // New Zealand
    '+234': 10,  // Nigeria
    '+47':  8,   // Norway
    '+968': 8,   // Oman
    '+92':  10,  // Pakistan
    '+970': 9,   // Palestine
    '+507': 8,   // Panama
    '+595': 9,   // Paraguay
    '+51':  9,   // Peru
    '+63':  10,  // Philippines
    '+48':  9,   // Poland
    '+351': 9,   // Portugal
    '+974': 8,   // Qatar
    '+40':  9,   // Romania
    '+250': 9,   // Rwanda
    '+966': 9,   // Saudi Arabia
    '+221': 9,   // Senegal
    '+381': 9,   // Serbia
    '+65':  8,   // Singapore
    '+421': 9,   // Slovakia
    '+386': 8,   // Slovenia
    '+27':  9,   // South Africa
    '+82':  10,  // South Korea
    '+34':  9,   // Spain
    '+94':  9,   // Sri Lanka
    '+249': 9,   // Sudan
    '+46':  9,   // Sweden
    '+41':  9,   // Switzerland
    '+963': 9,   // Syria
    '+886': 9,   // Taiwan
    '+992': 9,   // Tajikistan
    '+255': 9,   // Tanzania
    '+66':  9,   // Thailand
    '+228': 8,   // Togo
    '+216': 8,   // Tunisia
    '+90':  10,  // Turkey
    '+993': 8,   // Turkmenistan
    '+256': 9,   // Uganda
    '+380': 9,   // Ukraine
    '+971': 9,   // United Arab Emirates
    '+44':  10,  // United Kingdom
    '+598': 8,   // Uruguay
    '+998': 9,   // Uzbekistan
    '+58':  10,  // Venezuela
    '+84':  9,   // Vietnam
    '+967': 9,   // Yemen
    '+260': 9,   // Zambia
    '+263': 9,   // Zimbabwe
  };

  pageFields: SaveUserLoginInterface = {
    fullName:      '',
    spType:        'insert',
    email:         '',
    phoneNumber:   '',
    password:      '',
    countryCodeID: 0,
  };

  // IMPORTANT: this array must have exactly as many entries as pageFields
  // has keys, in the SAME order — SharedDataService.setInterface() maps
  // them positionally by index, not by name.
  formFields: any[] = [
    { value: '',       msg: ' Enter Your Full Name',    type: 'textbox', required: true  }, // 0 fullName
    { value: 'insert', msg: '',                         type: 'hidden',  required: false }, // 1 spType
    { value: '',       msg: ' Enter Your Email',        type: 'textbox', required: true  }, // 2 email
    { value: '',       msg: ' Enter Your Phone Number', type: 'textbox', required: true  }, // 3 phoneNumber
    { value: '',       msg: ' Enter Your Password',     type: 'textbox', required: true  }, // 4 password
    { value: 0,        msg: '',                         type: 'hidden',  required: false }, // 5 countryCodeID
  ];

  // ─── OTP Verification Modal ─────────────────────────────────────────
  showOtpModal = false;
  otpDigits: string[] = ['', '', '', ''];
  readonly OTP_LENGTH = 4;
  isSendingOtp = false;
  isVerifyingOtp = false;
  otpErrorMessage = '';

  constructor(
    private router:      Router,
    private dataService: SharedDataService,
    private toastr:      ToastrService,
    private valid:       SharedFormFieldValidationService,
  ) {}

  ngOnInit(): void {
    this.loadGoogleScript();
    this.getCountries();
  }

  // ─── Countries (for country code dropdown) ─────────────────────────────
  getCountries(): void {
    this.dataService.getHttp('cmis-api/getCountry', {}).subscribe({
      next: (res: any) => {
        this.countries = Array.isArray(res) ? res : [];
      },
      error: (err) => console.error('Error loading countries:', err),
    });
  }

  onCountryCodeChange(): void {
    const selected = this.countries.find(c => c.country_id === this.selectedCountryCodeID);
    this.selectedCountryCode = selected?.country_code || '';
    // Re-validate phone against the newly selected country's expected length
    this.markTouched('phone');
  }

  // ─── Google Sign-In (unchanged) ──────────────────────────────────────
  loadGoogleScript(): void {
    if (typeof google !== 'undefined') {
      this.initGoogleSignIn();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => this.initGoogleSignIn();
    document.head.appendChild(script);
  }

  initGoogleSignIn(): void {
    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response: any) => this.handleGoogleResponse(response),
      auto_select: false,
      cancel_on_tap_outside: true,
    });
  }

  signUpWithGoogle(): void {
    if (typeof google === 'undefined') {
      this.toastr.error('Google Sign-In is not available. Please try again.');
      return;
    }
    google.accounts.id.prompt();
  }

  handleGoogleResponse(response: any): void {
    try {
      const credential = response.credential;
      const payload = JSON.parse(atob(credential.split('.')[1]));
      const userName = payload.name || '';
      const email = payload.email || '';

      this.isGoogleLoading = true;

      const googlePayload = {
        userID: 0,
        userRoleID: 0,
        userName: userName,
        contact: '',
        email: email,
        roleID: 3,
        spType: 'insert'
      };

      (this.dataService.postDirect('auth-api/GoogleSaveUser', googlePayload) as any)
        .subscribe({
          next: (res: any) => {
            this.isGoogleLoading = false;
            const apiResponse = Array.isArray(res) ? res[0] : res;
            if (apiResponse?.includes('Success') || apiResponse?.includes('success')) {
              this.valid.apiInfoResponse('Account created successfully with Google!');
              this.router.navigate(['/login']);
            } else {
              this.valid.apiErrorResponse(apiResponse || 'Google sign-up failed. Please try again.');
            }
          },
          error: (err: any) => {
            this.isGoogleLoading = false;
            this.valid.apiErrorResponse('Google sign-up failed. Please try again.');
          }
        });

    } catch (e) {
      this.isGoogleLoading = false;
      this.toastr.error('Failed to process Google Sign-In. Please try again.');
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  closeModal(): void {
    this.router.navigate(['/login']);
  }

  private markAllTouched(): void {
    this.touched.fullName = true;
    this.touched.email    = true;
    this.touched.phone    = true;
    this.touched.password = true;
  }

  get fullNameError(): string {
    if (!this.touched.fullName) return '';
    if (!this.fullName?.trim()) return 'Full name is required';
    return '';
  }

  get emailError(): string {
    if (!this.touched.email) return '';
    if (!this.email?.trim()) return 'Email is required';
    if (!this.emailPattern.test(this.email.trim())) return 'Enter a valid email address';
    return '';
  }

  // ─── Phone error — requires country code selected + validates digit length ─
  get phoneError(): string {
    if (!this.touched.phone) return '';

    if (!this.selectedCountryCodeID) return 'Please select a country code';

    const digitsOnly = (this.phone || '').replace(/\D/g, '');
    if (!digitsOnly) return 'Phone number is required';

    const expectedLength = this.countryPhoneLengths[this.selectedCountryCode];
    if (expectedLength && digitsOnly.length !== expectedLength) {
      return `Enter a valid ${expectedLength}-digit phone number for ${this.selectedCountryCode}`;
    }

    return '';
  }

  get passwordError(): string {
    if (!this.touched.password) return '';
    if (!this.password?.trim()) return 'Password is required';
    return '';
  }

  get isFormValid(): boolean {
    return !this.fullNameError && !this.emailError && !this.phoneError && !this.passwordError
      && !!this.fullName?.trim() && !!this.email?.trim()
      && !!this.selectedCountryCodeID && !!this.phone?.trim()
      && !!this.password?.trim();
  }

  // ─── Step 1: Validate → open OTP modal → send OTP ────────────────────
  createProfile(): void {
    this.markAllTouched();

    if (!this.isFormValid) {
      return;
    }

    this.formFields[0].value = this.fullName;
    this.formFields[1].value = 'insert';
    this.formFields[2].value = this.email;
    this.formFields[3].value = this.phone;
    this.formFields[4].value = this.password;
    this.formFields[5].value = this.selectedCountryCodeID;

    this.pageFields.fullName      = this.formFields[0].value;
    this.pageFields.spType        = this.formFields[1].value;
    this.pageFields.email         = this.formFields[2].value;
    this.pageFields.phoneNumber   = this.formFields[3].value;
    this.pageFields.password      = this.formFields[4].value;
    this.pageFields.countryCodeID = this.formFields[5].value;

    console.log('SignUp pageFields (with countryCodeID):', this.pageFields);

    if (!this.valid.validateToastr(this.formFields)) return;

    // Open the modal immediately, don't wait on the network call
    this.openOtpModal();
    this.requestOtp();
  }

  // ─── Step 2: Send OTP (runs while modal is already open) ─────────────
  private requestOtp(): void {
    this.isSendingOtp = true;
    this.dataService.sendOTP(this.email).subscribe({
      next: (res: any) => {
        this.isSendingOtp = false;
      },
      error: (err: any) => {
        this.isSendingOtp = false;
        this.toastr.error('Could not send verification code, please try again');
      }
    });
  }

  private openOtpModal(): void {
    this.otpDigits = ['', '', '', ''];
    this.otpErrorMessage = '';
    this.showOtpModal = true;
    setTimeout(() => {
      const first = document.getElementById('signup-otp-box-0') as HTMLInputElement;
      if (first) first.focus();
    });
  }

  trackByIndex(index: number): number {
    return index;
  }

  closeOtpModal(): void {
    this.showOtpModal = false;
  }

  // ─── OTP box handling ─────────────────────────────────────────────────
  onOtpInput(event: any, index: number): void {
    const input = event.target as HTMLInputElement;
    const cleaned = input.value.replace(/\D/g, '').slice(-1);
    input.value = cleaned;
    this.otpDigits[index] = cleaned;
    this.otpErrorMessage = '';

    if (cleaned && index < this.OTP_LENGTH - 1) {
      const next = document.getElementById(`signup-otp-box-${index + 1}`) as HTMLInputElement;
      if (next) next.focus();
    }

    if (index === this.OTP_LENGTH - 1 && cleaned && this.otpDigits.every(d => d)) {
      this.verifyOtpAndSave();
    }
  }

  onOtpKeyDown(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;
    if (event.key === 'Backspace' && !input.value && index > 0) {
      const prev = document.getElementById(`signup-otp-box-${index - 1}`) as HTMLInputElement;
      if (prev) prev.focus();
    }
  }

  resendOtp(): void {
    if (this.isSendingOtp) return;
    this.otpDigits = ['', '', '', ''];
    this.otpErrorMessage = '';
    this.isSendingOtp = true;
    this.dataService.sendOTP(this.email).subscribe({
      next: () => {
        this.isSendingOtp = false;
        this.toastr.success('Verification code resent');
        const first = document.getElementById('signup-otp-box-0') as HTMLInputElement;
        if (first) first.focus();
      },
      error: () => {
        this.isSendingOtp = false;
        this.toastr.error('Failed to resend code, please try again');
      }
    });
  }

  // ─── Step 3: Verify OTP, then save ─────────────────────────────────────
  verifyOtpAndSave(): void {
    const otp = this.otpDigits.join('');
    if (otp.length !== this.OTP_LENGTH) {
      this.otpErrorMessage = `Please enter the ${this.OTP_LENGTH}-digit code`;
      return;
    }

    this.isVerifyingOtp = true;
    this.otpErrorMessage = '';

    this.dataService.verifyOTP(otp).subscribe({
      next: (response: any) => {
        this.isVerifyingOtp = false;
        if (response && response.length > 0) {
          this.saveProfile();
        } else {
          this.otpErrorMessage = 'Invalid code, please try again';
          this.otpDigits = ['', '', '', ''];
        }
      },
      error: (err: any) => {
        this.isVerifyingOtp = false;
        this.otpErrorMessage = (err?.status === 400 || err?.status === 404)
          ? 'Invalid or expired code'
          : 'Failed to verify code, please try again';
        this.otpDigits = ['', '', '', ''];
      }
    });
  }

  // ─── Step 4: Actual save (was old createProfile body) ─────────────────
  private saveProfile(): void {
    this.isLoading = true;

    console.log('Saving user with payload:', this.pageFields);

    this.dataService
      .saveHttp(this.pageFields, this.formFields, 'auth-api/saveUserLogin')
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;

          const apiResponse = Array.isArray(response) ? response[0] : response;

          // Log the raw response so we can always see exactly what the API sent back
          console.log('saveUserLogin raw response:', response, '| resolved apiResponse:', apiResponse);

          const normalized = (apiResponse || '').toString().trim().toLowerCase();

          if (normalized.includes('success')) {
            this.showOtpModal = false;
            this.valid.apiInfoResponse('User Created Successfully');
            this.router.navigate(['/login']);
          } else if (normalized.includes('email already exist')) {
            this.showOtpModal = false;
            this.valid.apiErrorResponse('Email already exists');
          } else {
            this.showOtpModal = false;
            this.valid.apiErrorResponse(apiResponse || 'Something went wrong. Please try again.');
          }
        },
        error: (err: any) => {
          this.isLoading = false;
          this.showOtpModal = false;
          console.log('Registration Error:', err);
          this.valid.apiErrorResponse('Something went wrong. Please try again.');
        },
      });
  }
}