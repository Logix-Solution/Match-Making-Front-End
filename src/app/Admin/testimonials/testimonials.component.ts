import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { SharedDataService } from '../../../shared/services/shared-data.service';
import { SharedGlobalService } from '../../../shared/services/shared-global.service';
import { SharedFormFieldValidationService } from 'src/shared/services/shared-form-field-validation.service';
import { environment } from 'src/envirnment/environment';

interface FeedbackItem {
  id:          number;
  mediaTypeID: number;     
  personName:  string;
  date:        string;
  imageUrl:    string;
  videoLink:   string;
}

@Component({
  selector: 'app-testimonials',
  templateUrl: './testimonials.component.html',
  styleUrls: ['./testimonials.component.scss']
})
export class TestimonialsComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;

  allFeedback:   FeedbackItem[] = [];
  imageList:     FeedbackItem[] = [];
  videoList:     FeedbackItem[] = [];

  // ── Dropdown & Modal State ────────────────────────────────────────────────
  isDropdownOpen: boolean = false;
  isModalOpen:    boolean = false;
  uploadType:     'image' | 'video' | null = null;   // determines which modal UI shows

  // ── Form Fields ───────────────────────────────────────────────────────────
  newFeedback = {
    personName: '',
    date:       '',
    videoLink:  '',
  };

  selectedFile:    File | null = null;
  selectedFileB64: string      = '';
  selectedFileExt: string      = '';
  selectedFileName: string     = '';

  private readonly IMAGE_PATH =  environment.imageUrl + 'Feedback';

  constructor(
    private dataService:         SharedDataService,
    private sharedGlobalService: SharedGlobalService,
    private valid:               SharedFormFieldValidationService,
  ) {}

  ngOnInit(): void {
    this.loadFeedback();
  }

  // ── Load Feedback List ────────────────────────────────────────────────────
  loadFeedback(): void {
    this.dataService.getHttp('core-api/Admin/getFeedback', {}).subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : [];
        this.allFeedback = data.map((f: any) => ({
          id:          f.feedbackID,
          mediaTypeID: f.mediaTypeID,
          personName:  f.personName || 'Unknown',
          date:        f.date,
          imageUrl:    f.eImage    || '',
          videoLink:   f.videoLink || '',
        }));

        // Split into image / video lists — video has a videoLink, image has eImage
        this.imageList = this.allFeedback.filter(f => f.mediaTypeID === 1 || (!f.videoLink && f.imageUrl));
        this.videoList = this.allFeedback.filter(f => f.mediaTypeID === 2 || (f.videoLink && !f.imageUrl));
      },
      error: (err) => console.error('Feedback load error:', err)
    });
  }

  // ── Dropdown Toggle ───────────────────────────────────────────────────────
  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  // ── Open Modal by Type ────────────────────────────────────────────────────
  openUploadModal(type: 'image' | 'video'): void {
    this.uploadType  = type;
    this.isModalOpen = true;
    this.isDropdownOpen = false;
    this.resetForm();
  }

  closeUploadModal(): void {
    this.isModalOpen = false;
    this.uploadType   = null;
    this.resetForm();
  }

  // ── File Upload (Image) ───────────────────────────────────────────────────
  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;
    this.selectedFile     = file;
    this.selectedFileName = file.name;
    this.selectedFileExt  = file.name.split('.').pop() || 'jpg';

    const reader = new FileReader();
    reader.onload = () => {
      const result          = reader.result as string;
      this.selectedFileB64  = result.split(',')[1];
    };
    reader.readAsDataURL(file);
  }

  // ── Save (Image or Video) ─────────────────────────────────────────────────
  onPublishFeedback(): void {
    if (!this.newFeedback.personName) {
      this.valid.apiErrorResponse('Please enter person name.'); return;
    }

    if (this.uploadType === 'image' && !this.selectedFileB64) {
      this.valid.apiErrorResponse('Please upload an image.'); return;
    }
    if (this.uploadType === 'video' && !this.newFeedback.videoLink) {
      this.valid.apiErrorResponse('Please paste a video link.'); return;
    }

    const userID  = this.sharedGlobalService.getUserID();
    const payload = {
      feedbackID:  0,
      mediaTypeID: this.uploadType === 'image' ? 1 : 2,
      videoLink:   this.uploadType === 'video' ? this.newFeedback.videoLink : '',
      eImage:      this.uploadType === 'image' ? this.selectedFileB64 : '',
      eImagePath:  this.IMAGE_PATH,
      eImageExt:   this.uploadType === 'image' ? this.selectedFileExt : '',
      date:        this.newFeedback.date || new Date().toISOString().split('T')[0],
      personName:  this.newFeedback.personName,
      userID:      userID,
      spType:      'insert'
    };

    this.dataService.postDirect('core-api/Admin/SaveFeedBack', payload).subscribe({
      next: (res: any) => {
        const response = Array.isArray(res) ? res[0] : res;
        if (response?.includes('Success')) {
          this.valid.apiInfoResponse('Feedback uploaded successfully.');
          this.closeUploadModal();
          this.loadFeedback();
        } else {
          this.valid.apiErrorResponse(response);
        }
      },
      error: (err) => {
        this.valid.apiErrorResponse('Something went wrong. Please try again.');
        console.error('SaveFeedback error:', err);
      }
    });
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  onDeleteFeedback(item: FeedbackItem): void {
    const userID  = this.sharedGlobalService.getUserID();
    const payload = {
      feedbackID:  item.id,
      mediaTypeID: item.mediaTypeID,
      videoLink:   item.videoLink,
      eImage:      '',
      eImagePath:  this.IMAGE_PATH,
      eImageExt:   '',
      date:        '',
      personName:  item.personName,
      userID:      userID,
      spType:      'delete'
    };

    this.dataService.postDirect('core-api/Admin/SaveFeedBack', payload).subscribe({
      next: (res: any) => {
        const response = Array.isArray(res) ? res[0] : res;
        if (response?.includes('Success')) {
          this.valid.apiInfoResponse('Feedback deleted successfully.');
          this.loadFeedback();
        } else {
          this.valid.apiErrorResponse(response);
        }
      },
      error: (err) => {
        this.valid.apiErrorResponse('Something went wrong. Please try again.');
        console.error('DeleteFeedback error:', err);
      }
    });
  }

  // ── View Image / Video ────────────────────────────────────────────────────
  previewImageUrl: string  = '';
  isImagePreviewOpen: boolean = false;

  openImagePreview(item: FeedbackItem): void {
    if (!item.imageUrl) return;
    this.previewImageUrl    = item.imageUrl;
    this.isImagePreviewOpen = true;
  }

  closeImagePreview(): void {
    this.isImagePreviewOpen = false;
    this.previewImageUrl    = '';
  }

  openVideoLink(item: FeedbackItem): void {
    if (!item.videoLink) return;
    let url = item.videoLink.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    window.open(url, '_blank');
  }

  private resetForm(): void {
    this.newFeedback = { personName: '', date: '', videoLink: '' };
    this.selectedFile     = null;
    this.selectedFileB64  = '';
    this.selectedFileExt  = '';
    this.selectedFileName = '';
  }
}