import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  ElementRef,
  HostListener,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-searchable-select',
  templateUrl: './searchable-select.component.html',
  styleUrls: ['./searchable-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchableSelectComponent),
      multi: true,
    },
  ],
})
export class SearchableSelectComponent implements ControlValueAccessor {
  // ─── Config Inputs ─────────────────────────────────────────────────────
  @Input() items: any[] = [];
  @Input() bindLabel: string = 'label';   // property to display, e.g. 'subTypeTitle'
  @Input() bindValue: string = 'value';   // property to bind as the actual value, e.g. 'subTypeID'
  @Input() placeholder: string = 'Select...';
  @Input() searchPlaceholder: string = 'Search...';
  @Input() disabled: boolean = false;
  @Input() clearable: boolean = true;

  // ─── Emitted when the dropdown closes / loses focus (for markTouched patterns) ──
  @Output() touched = new EventEmitter<void>();

  isOpen = false;
  searchTerm = '';
  selectedValue: any = '';

  private onChange: (value: any) => void = () => {};
  private onTouchedFn: () => void = () => {};

  constructor(private elRef: ElementRef) {}

  get filteredItems(): any[] {
    if (!this.searchTerm.trim()) return this.items;
    const term = this.searchTerm.toLowerCase();
    return this.items.filter((item) =>
      String(item[this.bindLabel] ?? '').toLowerCase().includes(term)
    );
  }

  get selectedLabel(): string {
    if (this.selectedValue === null || this.selectedValue === undefined || this.selectedValue === '') {
      return '';
    }
    const match = this.items.find(
      (item) => String(item[this.bindValue]) === String(this.selectedValue)
    );
    return match ? match[this.bindLabel] : '';
  }

  toggleOpen(): void {
    if (this.disabled) return;
    this.isOpen = !this.isOpen;
    this.searchTerm = '';
    if (!this.isOpen) {
      this.emitTouched();
    }
  }

  selectItem(item: any): void {
    this.selectedValue = item[this.bindValue];
    this.onChange(this.selectedValue);
    this.isOpen = false;
    this.searchTerm = '';
    this.emitTouched();
  }

  clearSelection(event: Event): void {
    event.stopPropagation();
    this.selectedValue = '';
    this.onChange('');
    this.emitTouched();
  }

  private emitTouched(): void {
    this.onTouchedFn();
    this.touched.emit();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isOpen && !this.elRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
      this.emitTouched();
    }
  }

  // ─── ControlValueAccessor ─────────────────────────────────────────────
  writeValue(value: any): void {
    this.selectedValue = value ?? '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouchedFn = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}