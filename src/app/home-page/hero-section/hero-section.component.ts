import { Component,OnInit,OnDestroy } from '@angular/core';

@Component({
  selector: 'app-hero-section',
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.scss']
})
export class HeroSectionComponent implements OnInit, OnDestroy {
 
  // ── Background images (cycle automatically) ───────────────────────────────
  bgImages = [
    '../../assets/images/bg1.png',
    '../../assets/images/bg2.png',
    '../../assets/images/bg3.png',
  ];
  activeBg = 0;
 
  // ── Happy couples (dynamic — replace with API data) ───────────────────────
  coupleAvatars = [
    '../../assets/images/couple1.png',
    '../../assets/images/couple2.png',
    '../../assets/images/couple3.png',
    '../../assets/images/couple4.png',
    '../../assets/images/couple5.png',
  ];
  visibleAvatars: string[] = [];
  avatarIndex = 0;
 
  // ── Heart images (show/hide) ──────────────────────────────────────────────
  heartImages = [
    '../../assets/images/couple-heart1.png',
    '../../assets/images/couple-heart2.png',
  ];
  activeHeart = 0;
  heartVisible = true;
 
  // ── Timers ────────────────────────────────────────────────────────────────
  private bgTimer!: ReturnType<typeof setInterval>;
  private avatarTimer!: ReturnType<typeof setInterval>;
  private heartTimer!: ReturnType<typeof setInterval>;
 
  ngOnInit(): void {
    // Show first 4 avatars initially
    this.visibleAvatars = this.coupleAvatars.slice(0, 4);
 
    // Cycle background every 4s
    this.bgTimer = setInterval(() => {
      this.activeBg = (this.activeBg + 1) % this.bgImages.length;
    }, 4000);
 
    // Cycle one avatar at a time every 2s
    this.avatarTimer = setInterval(() => {
      this.avatarIndex = (this.avatarIndex + 1) % this.coupleAvatars.length;
      const updated = [...this.visibleAvatars];
      updated[this.avatarIndex % 4] = this.coupleAvatars[this.avatarIndex];
      this.visibleAvatars = [...updated];
    }, 2000);
 
    // Toggle heart visibility every 1.5s
    this.heartTimer = setInterval(() => {
      this.heartVisible = !this.heartVisible;
      if (!this.heartVisible) {
        setTimeout(() => {
          this.activeHeart = (this.activeHeart + 1) % this.heartImages.length;
          this.heartVisible = true;
        }, 600);
      }
    }, 1500);
  }
 
  ngOnDestroy(): void {
    clearInterval(this.bgTimer);
    clearInterval(this.avatarTimer);
    clearInterval(this.heartTimer);
  }
}