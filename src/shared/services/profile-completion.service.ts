import { Injectable } from '@angular/core';
import { Observable, forkJoin, map, switchMap, of } from 'rxjs';
import { SharedDataService } from './shared-data.service';
import { SharedGlobalService } from './shared-global.service';

export interface CompletionResult {
  profileID: number;
  profileCompletion: number;
  preferencesCompletion: number;
  overallCompletion: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileCompletionService {

  constructor(
    private dataService: SharedDataService,
    private sharedGlobalService: SharedGlobalService,
  ) {}

  // ─── Generic column-based completion calculator ──────────────────────────
  private calculateFieldCompletion(obj: any, excludeKeys: string[] = ['profileID']): number {
    if (!obj) return 0;

    const keys = Object.keys(obj).filter(k => !excludeKeys.includes(k));
    const totalColumns = keys.length;
    if (totalColumns === 0) return 0;

    const filledColumns = keys.filter(k => {
      const val = obj[k];
      return val !== null && val !== undefined && val !== '';
    }).length;

    return Math.round((filledColumns / totalColumns) * 100);
  }

  // ─── Safely pick the record matching profileID out of an array,        ──
  // ─── since some endpoints currently return ALL profiles, not just one  ──
  private pickMatchingRecord(res: any, profileID: number): any {
    if (Array.isArray(res)) {
      return res.find((item: any) => item.profileID === profileID) ?? res[0] ?? null;
    }
    return res;
  }

  // ─── Resolve profileID from the logged-in userID ─────────────────────────
  private getProfileID(): Observable<number | null> {
    const userID = this.sharedGlobalService.getUserID();

    return this.dataService.getHttp(`core-api/Profile/getUserDetails?UserID=${userID}`, {}).pipe(
      map((res: any) => {
        const user = Array.isArray(res) ? res[0] : res;
        return user?.profileID ?? null;
      })
    );
  }

  // ─── Main entry point: profile %, preferences %, overall % ──────────────
  calculateCompletion(): Observable<CompletionResult> {
    return this.getProfileID().pipe(
      switchMap((profileID) => {
        if (!profileID) {
          return of({
            profileID: 0,
            profileCompletion: 0,
            preferencesCompletion: 0,
            overallCompletion: 0,
          });
        }

        return forkJoin({
          profile: this.dataService.getHttp(`core-api/Profile/userProfileDetails?profileID=${profileID}`, {}),
          preferences: this.dataService.getHttp(`core-api/Preferences/userPreferencesDetails?profileID=${profileID}`, {}),
        }).pipe(
          map(({ profile, preferences }) => {
            const profileData     = this.pickMatchingRecord(profile, profileID);
            const preferencesData = this.pickMatchingRecord(preferences, profileID);

            const profileCompletion     = this.calculateFieldCompletion(profileData);
            const preferencesCompletion = this.calculateFieldCompletion(preferencesData);
            const overallCompletion     = Math.round((profileCompletion + preferencesCompletion) / 2);

            return {
              profileID,
              profileCompletion,
              preferencesCompletion,
              overallCompletion,
            };
          })
        );
      })
    );
  }
}