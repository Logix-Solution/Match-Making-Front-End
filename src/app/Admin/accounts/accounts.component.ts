import { Component, OnInit, HostListener } from '@angular/core';
import { SharedDataService } from 'src/shared/services/shared-data.service';
import { SharedGlobalService } from 'src/shared/services/shared-global.service';
import { SharedFormFieldValidationService } from 'src/shared/services/shared-form-field-validation.service';

interface BankDetail {
  bankDetailID: number;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  active: number; // 0 | 1
}

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss']
})
export class AccountsComponent implements OnInit {

  accounts: BankDetail[] = [];
  isLoading = false;

  showModal = false;
  isEditMode = false;
  activeMenuId: number | null = null;

  form: BankDetail = this.getEmptyForm();

  constructor(
    private dataService: SharedDataService,
    private global: SharedGlobalService,
    private valid: SharedFormFieldValidationService,
  ) {}

  ngOnInit(): void {
    this.loadAccounts();
  }

  private getEmptyForm(): BankDetail {
    return {
      bankDetailID: 0,
      bankName: '',
      accountNumber: '',
      accountHolderName: '',
      active: 1
    };
  }

  loadAccounts(): void {
    this.isLoading = true;
    const userID = this.global.getUserID();

    (this.dataService.getHttp('core-api/Payment/getBankDetails', { userID }) as any)
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;
          this.accounts = Array.isArray(res) ? res : (res ? [res] : []);
        },
        error: (err: any) => {
          this.isLoading = false;
          console.error('getBankDetails error:', err);
        }
      });
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.form = this.getEmptyForm();
    this.showModal = true;
    this.activeMenuId = null;
  }

  openEditModal(account: BankDetail): void {
    this.isEditMode = true;
    this.form = { ...account };
    this.showModal = true;
    this.activeMenuId = null;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveAccount(): void {
    const validate = [
      { value: this.form.accountHolderName, msg: 'Please enter account holder name', type: 'textBox', required: true },
      { value: this.form.accountNumber,     msg: 'Please enter IBAN',                type: 'textBox', required: true },
      { value: this.form.bankName,          msg: 'Please enter bank name',           type: 'textBox', required: true },
    ];

    if (this.valid.validateToastr(validate) !== true) {
      return;
    }

    const payload: any = {
      bankDetailID: this.isEditMode ? this.form.bankDetailID : 0,
      accountHolderName: this.form.accountHolderName,
      accountNumber: this.form.accountNumber,
      bankName: this.form.bankName,
      userID: this.global.getUserID(),
      spType: this.isEditMode ? 'update' : 'insert'
    };

    (this.dataService.postDirect('core-api/Payment/saveBankDetails', payload) as any)
      .subscribe({
        next: () => {
          this.valid.apiSuccessResponse(this.isEditMode ? 'Account updated successfully!' : 'Account added successfully!');
          this.closeModal();
          this.loadAccounts();
        },
        error: (err: any) => {
          console.error('saveBankDetails error:', err);
          this.valid.apiErrorResponse('Failed to save account. Please try again.');
        }
      });
  }

  toggleStatus(account: BankDetail): void {
    const newStatus = account.active === 1 ? 0 : 1;
    account.active = newStatus;

    const payload = {
      bankDetailID: account.bankDetailID,
      active: newStatus,
      userID: this.global.getUserID(),
      spType: 'status'
    };
   console.log(payload,'status');
    (this.dataService.postDirect('core-api/Payment/saveBankDetails', payload) as any)
      .subscribe({
        next: () => {
          this.valid.apiSuccessResponse(
            newStatus === 1 ? 'Account activated successfully!' : 'Account deactivated successfully!'
          );
        },
        error: (err: any) => {
          account.active = account.active === 1 ? 0 : 1;
          console.error('toggleStatus error:', err);
          this.valid.apiErrorResponse('Failed to update status. Please try again.');
        }
      });
  }

  // ─── ⋮ dropdown menu — click on dots button ─────────────────────────────
 console = console;

toggleMenu(account: BankDetail, event: Event): void {
  event.stopPropagation();
  event.preventDefault();

  console.log('--- THREE DOTS CLICKED ---');
  console.log('Clicked Account ID:', account.bankDetailID);
  console.log('Previous Active Menu ID:', this.activeMenuId);

  if (this.activeMenuId === account.bankDetailID) {
    this.activeMenuId = null;
    console.log('Menu state changed to: CLOSED');
  } else {
    this.activeMenuId = account.bankDetailID;
    console.log('Menu state changed to: OPEN for ID', this.activeMenuId);
  }
}

@HostListener('document:click', ['$event'])
clickOutside(event: Event): void {
  const target = event.target as HTMLElement;

  if (this.activeMenuId !== null && !target.closest('.menu-wrap')) {
    console.log('--- DOCUMENT CLICKED OUTSIDE: CLOSING MENU ---');
    this.activeMenuId = null;
  }
}

  deleteAccount(account: BankDetail): void {
    this.activeMenuId = null;

    if (!confirm(`Delete account "${account.accountHolderName}"?`)) {
      return;
    }

    const payload = {
      bankDetailID: account.bankDetailID,
      userID: this.global.getUserID(),
      spType: 'delete'
    };

    (this.dataService.postDirect('core-api/Payment/saveBankDetails', payload) as any)
      .subscribe({
        next: () => {
          this.valid.apiSuccessResponse('Account deleted successfully!');
          this.accounts = this.accounts.filter(a => a.bankDetailID !== account.bankDetailID);
        },
        error: (err: any) => {
          console.error('deleteBankDetails error:', err);
          this.valid.apiErrorResponse('Failed to delete account. Please try again.');
        }
      });
  }
}