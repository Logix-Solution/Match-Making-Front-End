import { Component ,OnInit, ViewChild, ElementRef} from '@angular/core';

interface EventItem {
  id: number;
  title: string;
  city: string;
  country: string;
  imageUrl: string;
}

@Component({
  selector: 'app-admin-event-gallery',
  templateUrl: './admin-event-gallery.component.html',
  styleUrls: ['./admin-event-gallery.component.scss']
})
export class AdminEventGalleryComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;

  searchQuery: string = '';
  isModalOpen: boolean = false;
  
  allEvents: EventItem[] = [];
  filteredEvents: EventItem[] = [];

  // Working data placeholder model instance mapping form data securely
  newEvent = {
    title: '',
    country: '',
    city: ''
  };

  ngOnInit(): void {
    this.generateMockGalleryDataset();
    this.filteredEvents = [...this.allEvents];
  }

  onSearchChange(): void {
    const cleanQuery = this.searchQuery.trim().toLowerCase();
    if (!cleanQuery) {
      this.filteredEvents = [...this.allEvents];
      return;
    }
    this.filteredEvents = this.allEvents.filter(ev => 
      ev.title.toLowerCase().includes(cleanQuery) || 
      ev.city.toLowerCase().includes(cleanQuery)
    );
  }

  // Modal Control Interactivity Engines
  openUploadModal(): void {
    this.isModalOpen = true;
    this.resetForm();
  }

  closeUploadModal(): void {
    this.isModalOpen = false;
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      console.log(`Target local configuration asset staged payload size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
    }
  }

  onPublishEvent(): void {
    if (!this.newEvent.title || !this.newEvent.city) {
      alert('Please fill out the title and city selection blocks before submitting.');
      return;
    }

    const createdRecord: EventItem = {
      id: this.allEvents.length + 1,
      title: this.newEvent.title,
      city: this.newEvent.city,
      country: this.newEvent.country || 'Pakistan',
      imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=600&q=80'
    };

    this.allEvents.unshift(createdRecord);
    this.onSearchChange();
    this.closeUploadModal();
  }

  onEditEvent(eventItem: EventItem): void {
    console.log('Staging layout modal override update data parameters for element structure target ID:', eventItem.id);
  }

  onDeleteEvent(eventItem: EventItem): void {
    this.allEvents = this.allEvents.filter(ev => ev.id !== eventItem.id);
    this.onSearchChange();
  }

  private resetForm(): void {
    this.newEvent = {
      title: '',
      country: '',
      city: ''
    };
  }

  private generateMockGalleryDataset(): void {
    const basePhotoAsset = 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=600&q=80';
    
    // Seed exactly 9 cards matching layout output distribution pattern
    this.allEvents = Array.from({ length: 9 }, (_, idx) => ({
      id: idx + 1,
      title: 'Summer Networking',
      city: 'Lahore',
      country: 'Pakistan',
      imageUrl: basePhotoAsset
    }));
  }
}