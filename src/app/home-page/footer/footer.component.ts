import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  constructor(
   
    private router: Router,
   
  ) {}
   // ── Scroll to a section on the home page ───────────────────────────────────
  scrollToSection(sectionId: string, event: Event): void {
    event.preventDefault();

    if (this.router.url === '/') {
      this.performScroll(sectionId);
    } else {
      this.router.navigate(['/']).then(() => {
        setTimeout(() => this.performScroll(sectionId), 300);
      });
    }
  }

  private performScroll(sectionId: string): void {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

}
