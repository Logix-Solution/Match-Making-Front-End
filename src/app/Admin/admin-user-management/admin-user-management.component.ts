import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { SharedDataService } from '../../../shared/services/shared-data.service';
import { SharedGlobalService } from '../../../shared/services/shared-global.service';
import { SharedFormFieldValidationService } from 'src/shared/services/shared-form-field-validation.service';
import { environment } from 'src/envirnment/environment.prod';

type TabType = 'all' | 'pending' | 'accepted' | 'rejected';
type ActionType = 'accept' | 'reject' | 'undo' | 'block' | 'unblock' | 'delete';

interface UserItem {
  id: number;              // profileID
  userID: number;
  name: string;
  age: number;
  location: string;
  image: string;
  planBadge: string;       // e.g. "Monthly Plan"
  status: 'pending' | 'accepted' | 'rejected';
  statusID: number;
  active: number;          // 0/1 — drives Block/UnBlock, independent of status
  dateLabel: string;       // "Requested At" or "Member Since"
  dateValue: string;
  profilesSharedCount: number; // TODO: no field provided by API yet — defaulted
  planeView: number;
}

interface ProfileSection {
  title: string;
  iconClass: string;
  items: { description: string; value: string }[];
}

interface ProfileHeader {
  avatar: string;
  name: string;
  age: string;
  location: string;
  occupation: string;
  status: string;
}

interface ActivityItem {
  userPlanID: number;
  planID: number;
  planName: string;
  referenceNo: string;
  paidAmount: string;
  eDoc: string | null;
  eDocPath: string | null;
  toDate: string | null;
  isActive: number; // 0 = not verified, 1 = verified
}

interface MatchProfileItem {
  userProfileStatusID: number;
  statusID: number;
  sourceProfileID: number;
  destinationProfileID: number;
  match: string;
  fullName: string;
  address: string;
  subTypeTitle: string;
  pendingStatusID: number;
}

@Component({
  selector: 'app-admin-user-management',
  templateUrl: './admin-user-management.component.html',
  styleUrls: ['./admin-user-management.component.scss'],
})
export class AdminUserManagementComponent implements OnInit {
  searchQuery = '';
  activeTab: TabType = 'all';

  allUsers: UserItem[] = [];
  filteredUsers: UserItem[] = [];

  isDocPreviewOpen = false;
  docPreviewUrl = '';
  docPreviewLabel = '';

  // ─── Full Profile ("View Details") Modal ───────────────────────────────────
  isDetailModalOpen = false;
  detailLoading = false;
  showAboutModal = false;
  aboutText1 = '';
  profileHeader: ProfileHeader = {
    avatar: '', name: '', age: '', location: '', occupation: '', status: '',
  };
  profileSections: ProfileSection[] = [];

  // ─── Activity Modal (Activities + Matches Profiles, opens on avatar click) ─
  isActivityModalOpen = false;
  activityModalLoading = false;
  activityUser: UserItem | null = null;
  activityPlanBadge = '';
  activities: ActivityItem[] = [];
  matchProfiles: MatchProfileItem[] = [];
  savingMatches = false;

  // ─── Verify Plan (Activate/Deactivate) Modal ────────────────────────────────
  isVerifyModalOpen = false;
  verifyTargetActivity: ActivityItem | null = null;
  verifyModalLoading = false;

  // ─── Generic Action Confirm Modal (Accept/Reject/Undo/Block/UnBlock/Delete) ─
  isActionConfirmOpen = false;
  actionConfirmLoading = false;
  pendingActionType: ActionType | null = null;
  pendingActionUser: UserItem | null = null;

  constructor(
    private dataService: SharedDataService,
    private sharedGlobalService: SharedGlobalService,
    private valid: SharedFormFieldValidationService,
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  // ─── Load + Map (single endpoint feeds all 4 tabs) ─────────────────────────
  loadUsers(): void {
    this.dataService
      .getHttp('core-api/Admin/getRequestManagement', {})
      .subscribe({
        next: (res: any) => {
          const data = Array.isArray(res) ? res : [];
          this.allUsers = data.map((u: any) => this.mapUser(u));
          this.applyFilters();
        },
        error: (err) => console.error('User Management load error:', err),
      });
  }

  private mapUser(u: any): UserItem {
    const hasImage = u.eDoc && u.eDoc.trim() !== '';
    const image = hasImage
      ? environment.productUrl + 'assets/user-images/userProfile/' + u.eDoc
      : 'assets/images/profile1.png';

    // API sends statusTitle (string) as the source of truth for status placement —
    // statusID / the typo'd statusIS field are NOT reliable, so we derive from statusTitle.
    const status = this.mapStatusTitle(u.statusTitle);

    return {
      id: u.profileID,
      userID: u.userID,
      name: u.fullname || u.firstName || 'Unknown',
      age: this.calculateAge(u.dob),
      location: this.extractLocation(u.userProfile),
      image,
      planBadge: this.extractPlanBadge(u.userPlans),
      status,
      statusID: this.statusIDFromStatus(status),
      active: u.active,
      // "membersince" is a top-level field on the API response (e.g. "07/24/2026 00:00:00") —
      // shown as "Member Since" across all/pending/accepted tabs; falls back to dob if missing.
      dateLabel: 'Member Since',
      dateValue: this.formatDate(u.membersince || u.dob),
      // TODO: no "profiles shared" field provided by API — defaulting until wired up
      profilesSharedCount: u.profilesSharedCount ?? u.sharedProfileCount ?? 0,
        planeView: u.planeView ?? 0,

    };
  }

  private extractLocation(userProfileJson: string): string {
    let profileItems: any[] = [];
    try { profileItems = JSON.parse(userProfileJson || '[]'); } catch { profileItems = []; }
    const locationItem = profileItems.find((p: any) => p.cityID !== undefined && p.isPreference === 0);
    return locationItem ? `${locationItem.cityName}, ${locationItem.countryName}` : 'N/A';
  }

  private extractPlanBadge(userPlansJson: string): string {
    let plans: any[] = [];
    try { plans = JSON.parse(userPlansJson || '[]'); } catch { plans = []; }

    // Only an active, non-Registration plan counts as the badge —
    // Registration being isActive:1 should still fall through to "Free Plan".
    const activePlan = plans.find((p: any) => +p.isActive === 1 && p.planName !== 'Registration');

    return activePlan?.planName ? `${activePlan.planName} Plan` : '';
  }

  // ── Derives status from statusTitle string (e.g. "Reject", "Accept", "Pending") ──
  private mapStatusTitle(statusTitle: string | null | undefined): 'pending' | 'accepted' | 'rejected' {
    const title = (statusTitle || '').trim().toLowerCase();
    if (title.startsWith('accept') || title.startsWith('approv')) return 'accepted';
    if (title.startsWith('reject')) return 'rejected';
    return 'pending';
  }

  // Keeps a numeric statusID internally consistent with `status`, since the API's
  // own statusID/statusIS field isn't reliable for this purpose.
  private statusIDFromStatus(status: 'pending' | 'accepted' | 'rejected'): number {
    switch (status) {
      case 'accepted': return 2;
      case 'rejected': return 3;
      default: return 1;
    }
  }

  // Browser Date parsing of "MM/DD/YYYY HH:mm:ss" strings (e.g. membersince) is
  // inconsistent across browsers — fall back to manual parsing if native parse fails.
  private parseFlexibleDate(value: string | null | undefined): Date | null {
    if (!value) return null;

    const direct = new Date(value);
    if (!isNaN(direct.getTime())) return direct;

    const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (match) {
      const [, month, day, year] = match;
      const manual = new Date(+year, +month - 1, +day);
      if (!isNaN(manual.getTime())) return manual;
    }
    return null;
  }

  formatDate(dob: string | null): string {
    const date = this.parseFlexibleDate(dob);
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  calculateAge(dob: string): number {
    if (!dob) return 0;
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }

  // ─── Tabs + Search ──────────────────────────────────────────────────────────
  setTab(tab: TabType): void {
    this.activeTab = tab;
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    const q = this.searchQuery.trim().toLowerCase();
    this.filteredUsers = this.allUsers.filter((u) => {
      const matchesTab = this.activeTab === 'all' || u.status === this.activeTab;
      const matchesSearch = !q ||
        u.name.toLowerCase().includes(q) ||
        u.location.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }

  // ─── Accept / Reject / Undo — open confirm modal first ─────────────────────
  onAccept(item: UserItem): void { this.openActionConfirm('accept', item); }
  onReject(item: UserItem): void { this.openActionConfirm('reject', item); }
  onUndo(item: UserItem): void { this.openActionConfirm('undo', item); }

  // ─── Block / Un-Block (Accepted tab) — open confirm modal first ────────────
  onBlockUser(item: UserItem): void {
    this.openActionConfirm(item.active === 1 ? 'block' : 'unblock', item);
  }

  // ─── Delete — open confirm modal first ──────────────────────────────────────
  onDeleteUser(item: UserItem): void { this.openActionConfirm('delete', item); }

  // ─── Generic Action Confirm Modal ───────────────────────────────────────────
  private openActionConfirm(type: ActionType, item: UserItem): void {
    this.pendingActionType = type;
    this.pendingActionUser = item;
    this.isActionConfirmOpen = true;
  }

  closeActionConfirm(): void {
    if (this.actionConfirmLoading) return;
    this.isActionConfirmOpen = false;
    this.pendingActionType = null;
    this.pendingActionUser = null;
  }

  confirmPendingAction(): void {
    if (!this.pendingActionType || !this.pendingActionUser) return;
    const item = this.pendingActionUser;

    switch (this.pendingActionType) {
      case 'accept': this.performSaveStatus(item, 2, 'Request Accepted Successfully'); break;
      case 'reject': this.performSaveStatus(item, 3, 'Request Rejected Successfully'); break;
      case 'undo':   this.performSaveStatus(item, 1, 'Request Restored Successfully'); break;
      case 'block':
      case 'unblock': this.performBlockToggle(item); break;
      case 'delete': this.performDelete(item); break;
    }
  }

  get actionConfirmTitle(): string {
    switch (this.pendingActionType) {
      case 'accept': return 'Accept this Request?';
      case 'reject': return 'Reject this Request?';
      case 'undo': return 'Restore this Request?';
      case 'block': return 'Block this User?';
      case 'unblock': return 'Un Block this User?';
      case 'delete': return 'Delete this User?';
      default: return '';
    }
  }

  get actionConfirmMessage(): string {
    const name = this.pendingActionUser?.name || 'this user';
    switch (this.pendingActionType) {
      case 'accept': return `${name}'s request will be accepted and moved to the Accepted tab.`;
      case 'reject': return `${name}'s request will be rejected and moved to the Rejected tab.`;
      case 'undo': return `${name}'s request will be restored back to Pending.`;
      case 'block': return `${name} will be blocked and won't be able to access their account.`;
      case 'unblock': return `${name} will be un blocked and can access their account again.`;
      case 'delete': return `${name}'s account will be permanently deleted. This cannot be undone.`;
      default: return '';
    }
  }

  get actionConfirmButtonLabel(): string {
    switch (this.pendingActionType) {
      case 'accept': return 'Accept';
      case 'reject': return 'Reject';
      case 'undo': return 'Restore';
      case 'block': return 'Block';
      case 'unblock': return 'Un Block';
      case 'delete': return 'Delete';
      default: return 'Confirm';
    }
  }

  // Reloads the full list from the server after a successful save instead of
  // patching local state — guarantees the card lands under whatever tab the
  // API's statusTitle actually reports, avoiding drift between client and server.
  private performSaveStatus(item: UserItem, statusID: number, successMsg: string): void {
    const adminID = this.sharedGlobalService.getUserID();
    const payload = { userID: item.userID, statusID, adminID, spType: 'update' };
    console.log('Saving status for user:', item.userID, 'to statusID:', statusID, 'with payload:', payload);
    this.actionConfirmLoading = true;

    this.dataService.postDirect('user-api/User/saveUserRequest', payload).subscribe({
      next: (res: any) => {
        const response = Array.isArray(res) ? res[0] : res;
        this.actionConfirmLoading = false;
        if (response?.includes('Success')) {
          this.valid.apiInfoResponse(successMsg);
          this.closeActionConfirm();
          this.loadUsers();
        } else {
          this.valid.apiErrorResponse(response);
        }
      },
      error: (err) => {
        this.actionConfirmLoading = false;
        this.valid.apiErrorResponse('Something went wrong.');
        console.error(err);
      },
    });
  }

  private performBlockToggle(item: UserItem): void {
    const isCurrentlyActive = item.active === 1;
    const spType = isCurrentlyActive ? 'Deactive' : 'Active';
    const adminID = this.sharedGlobalService.getUserID();
    const payload = { adminID, userID: item.userID, spType };
    this.actionConfirmLoading = true;

    this.dataService.postDirect('core-api/Admin/SaveUserDeactive', payload).subscribe({
      next: (res: any) => {
        const response = Array.isArray(res) ? res[0] : res;
        this.actionConfirmLoading = false;
        if (response?.includes('Success')) {
          item.active = isCurrentlyActive ? 0 : 1;
          this.valid.apiInfoResponse(
            isCurrentlyActive ? `${item.name} has been blocked` : `${item.name} has been activated`,
          );
          this.closeActionConfirm();
        } else {
          this.valid.apiErrorResponse(response);
        }
      },
      error: (err) => {
        this.actionConfirmLoading = false;
        this.valid.apiErrorResponse('Something went wrong. Please try again.');
        console.error('Block/Active error:', err);
      },
    });
  }

  private performDelete(item: UserItem): void {
    const payload = {
      userID: item.userID,
      profileID: item.id,
      spType: 'Delete',
    };

    console.log('Deleting user:', item.userID, 'with payload:', payload);
    this.actionConfirmLoading = true;

    this.dataService.postDirect('core-api/Profile/DeleteUserAccount', payload).subscribe({
      next: (res: any) => {
        const response = Array.isArray(res) ? res[0] : res;
        this.actionConfirmLoading = false;
        if (response?.includes('Success')) {
          this.valid.apiInfoResponse('User deleted successfully');
          this.closeActionConfirm();
          this.loadUsers();
        } else {
          this.valid.apiErrorResponse(response);
        }
      },
      error: (err) => {
        this.actionConfirmLoading = false;
        this.valid.apiErrorResponse('Something went wrong. Please try again.');
        console.error('DeleteUserAccount error:', err);
      },
    });
  }

  // ─── Full Profile ("View Details") Modal ───────────────────────────────────
  onViewDetails(item: UserItem): void {
    this.isDetailModalOpen = true;
    this.detailLoading = true;
    this.profileSections = [];
    this.aboutText1 = '';
    document.body.classList.add('modal-open');

    this.dataService.getHttp(`core-api/Profile/getUserDetails?UserID=${item.userID}`, {}).subscribe({
      next: (res: any) => {
        const u = Array.isArray(res) ? res[0] : res;
        if (!u) { this.detailLoading = false; return; }
        this.buildProfile(u);
        this.detailLoading = false;
      },
      error: (err) => { console.error('getUserDetails error:', err); this.detailLoading = false; },
    });
  }

  closeDetailModal(): void {
    this.isDetailModalOpen = false;
    document.body.classList.remove('modal-open');
  }

  openAboutModal(): void { this.showAboutModal = true; }
  closeAboutModal(): void { this.showAboutModal = false; }

  getSectionByTitle(title: string): ProfileSection | undefined {
    return this.profileSections.find((s) => s.title === title);
  }

  buildProfile(user: any): void {
    let profileItems: any[] = [];
    try { profileItems = JSON.parse(user.userProfile || '[]'); } catch { profileItems = []; }

    const get = (typeID: number) =>
      profileItems.find((p: any) => p.typeID === typeID && p.isPreference === 0)?.subTypeTitle || '—';
    const getInstitute = (typeID: number) =>
      profileItems.find((p: any) => p.typeID === typeID && p.isPreference === 0);

    const location = this.extractLocation(user.userProfile);
    const eduItem = getInstitute(4);
    const occItem = getInstitute(5);
    const incItem = getInstitute(6);

    this.aboutText1 = user.aboutme || '';

    this.profileHeader = {
      avatar: user.eDoc && user.eDoc.trim() !== ''
        ? environment.productUrl + 'assets/user-images/userProfile/' + user.eDoc
        : 'assets/images/profile1.png',
      name: user.fullname || user.firstName || 'Unknown',
      age: `${this.calculateAge(user.dob)} years`,
      location,
      occupation: occItem?.subTypeTitle || '—',
      status: get(10),
    };

    this.profileSections = [
      { title: 'Education & Career', iconClass: 'bi bi-briefcase', items: [
        { description: 'Education', value: eduItem?.subTypeTitle || '—' },
        { description: 'Institute', value: eduItem?.instituteName || '—' },
        { description: 'Occupation', value: occItem?.subTypeTitle || '—' },
        { description: 'Monthly Income', value: incItem?.subTypeTitle || '—' },
      ]},
      { title: 'Personal Information', iconClass: 'bi bi-person', items: [
        { description: 'Cast', value: get(1) },
        { description: 'Ethnicity', value: get(3) },
        { description: 'Gender', value: get(22) },
        { description: 'Marital Status', value: get(10) },
        { description: 'Height', value: get(26) },
        { description: 'No of Siblings', value: get(25) },
        { description: 'Disability', value: get(30) },
      ]},
      { title: 'Religion', iconClass: 'bi bi-moon', items: [
        { description: 'Religion', value: get(7) },
        { description: 'Sect', value: get(8) },
        { description: 'Religion Importance', value: get(9) },
      ]},
      { title: 'Family', iconClass: 'bi bi-house', items: [
        { description: 'Housing Situation', value: get(11) },
        { description: 'Father Occupation', value: get(12) },
        { description: 'Mother Occupation', value: get(13) },
        { description: 'Family Involvement', value: get(14) },
        { description: 'No of Siblings', value: get(25) },
        { description: 'Want Kids', value: get(19) },
      ]},
      { title: 'Appearance', iconClass: 'bi bi-person-bounding-box', items: [
        { description: 'Body Type', value: get(15) },
        { description: 'Skin Tone', value: get(16) },
        { description: 'Height', value: get(26) },
        { description: 'Disability', value: get(30) },
      ]},
      { title: 'Lifestyle', iconClass: 'bi bi-cup-hot', items: [
        { description: 'Smoke', value: get(17) },
        { description: 'Alcohol', value: get(18) },
        { description: 'Want Kids', value: get(19) },
      ]},
    ];
  }

  // ─── Activity Modal (Activities + Matches Profiles) — opens on avatar click ─
  onOpenActivityModal(item: UserItem): void {
    this.isActivityModalOpen = true;
    this.activityModalLoading = true;
    this.activityUser = item;
    this.activities = [];
    this.matchProfiles = [];
    this.activityPlanBadge = '';
    document.body.classList.add('modal-open');

    forkJoin({
      userDetails: this.dataService.getHttp(`core-api/Profile/getUserDetails?UserID=${item.userID}`, {}),
      matches: this.dataService.getHttp(`core-api/Admin/getBestMatchProfiles?baseProfileID=${item.id}`, {}),
    }).subscribe({
      next: ({ userDetails, matches }: any) => {
        const u = Array.isArray(userDetails) ? userDetails[0] : userDetails;
        this.buildActivities(u);

        // New endpoint returns a single wrapper object (or array-wrapped object)
        // with matchedProfiles as a JSON string — needs to be parsed.
        const matchResult = Array.isArray(matches) ? matches[0] : matches;

        let matchedList: any[] = [];
        try {
          matchedList = JSON.parse(matchResult?.matchedProfiles || '[]');
        } catch {
          matchedList = [];
        }

        const baseProfileID = +matchResult?.baseProfileID || item.id;
        this.matchProfiles = matchedList.map((m: any) => {
          const derivedStatus = this.mapMatchStatus(m.statusTitle);
          return {
            userProfileStatusID: +m.userProfileStatusID || 0,
            statusID: derivedStatus,
            sourceProfileID: baseProfileID,
            destinationProfileID: +m.MatchedProfileID,
            match: (m.MatchPercentage ?? 0).toString(),
            fullName: m.MatchedProfileName || 'Unknown',
            address: [m.CityName, m.CountryName].filter(Boolean).join(', '),
            subTypeTitle: m.Gender || '',
            pendingStatusID: derivedStatus,
          };
        });

        this.activityModalLoading = false;
      },
      error: (err) => { console.error('Activity modal load error:', err); this.activityModalLoading = false; },
    });
  }

  private buildActivities(user: any): void {
    let plans: any[] = [];
    try { plans = JSON.parse(user?.userPlans || '[]'); } catch { plans = []; }

    const mapped: ActivityItem[] = plans.map((p: any) => ({
      userPlanID: p.userPlanID,
        planID: p.planID,
      planName: p.planName === 'Registration' ? 'Registration Fee' : `${p.planName} Plan`,
      referenceNo: p.referenceNo,
      paidAmount: p.paidAmount,
      eDoc: p.eDoc || null,
      eDocPath: p.eDocPath || null,
      toDate: p.toDate || p.fromDate || p.effectDate || null,
      isActive: +p.isActive || 0,
    }));

    // Registration Fee always pinned first; everything else sorted by toDate,
    // latest first — matches "show latest on top" requirement.
    const registrationRows = mapped.filter((a) => a.planName === 'Registration Fee');
    const otherRows = mapped
      .filter((a) => a.planName !== 'Registration Fee')
      .sort((a, b) => new Date(b.toDate || 0).getTime() - new Date(a.toDate || 0).getTime());

    this.activities = [...registrationRows, ...otherRows];

    const current = plans.find((p: any) => p.CurrentPlan === 1);
    this.activityPlanBadge = current?.planName ? `${current.planName} Plan` : '';
  }

  closeActivityModal(): void {
    this.isActivityModalOpen = false;
    this.activityUser = null;
    document.body.classList.remove('modal-open');
    this.loadUsers();
  }

  toggleMatchStatus(match: MatchProfileItem, statusID: number): void {
    match.pendingStatusID = statusID;
  }

  saveMatchStatuses(): void {
    if (!this.activityUser) return;
    const changed = this.matchProfiles.filter((m) => m.pendingStatusID !== m.statusID);

    if (changed.length === 0) { this.closeActivityModal(); return; }

    this.savingMatches = true;
    const userID = this.sharedGlobalService.getUserID(); // logged-in admin's ID, not activityUser.userID

    const payloads = changed.map((m) => ({
      userProfileStatusID: m.userProfileStatusID || 0,
      statusID: m.pendingStatusID,
      sourceProfileID: m.sourceProfileID,
      destinationProfileID: m.destinationProfileID,
      userID,
      spType: 'insert',
    }));

    console.log('saveMatchProfileStatus payloads for userID:', userID, payloads);

    const calls = payloads.map((payload) =>
      this.dataService.postDirect('core-api/Admin/saveMatchProfileStatus', payload),
    );

    forkJoin(calls).subscribe({
      next: () => {
        this.valid.apiInfoResponse('Match visibility updated successfully');
        this.savingMatches = false;
        this.closeActivityModal();
      },
      error: (err) => {
        this.valid.apiErrorResponse('Something went wrong while saving.');
        console.error('saveMatchProfileStatus error:', err);
        this.savingMatches = false;
      },
    });
  }

  private mapMatchStatus(statusTitle: string | null | undefined): number {
    const title = (statusTitle || '').trim().toLowerCase();
    if (title.startsWith('hide')) return 1;
    if (title.startsWith('show')) return 2;
    return 2; // default to Show if title is missing/unrecognized
  }

  // ─── Payment Doc Preview Modal (opens from Activities action icon) ─────────
  onViewActivityDoc(activity: ActivityItem): void {
    if (!activity.eDoc) {
      this.valid.apiInfoResponse('No document uploaded for this plan.');
      return;
    }
    // Payment docs are uploaded separately from profile images —
    // adjust the folder segment below if your backend serves them elsewhere.
    this.docPreviewUrl = environment.productUrl + 'assets/user-images/PaymentImage/' + activity.eDoc;
    console.log('Opening doc preview for activity:', activity, 'with URL:', this.docPreviewUrl);
    this.docPreviewLabel = activity.planName;
    this.isDocPreviewOpen = true;
  }

  closeDocPreview(): void {
    this.isDocPreviewOpen = false;
    this.docPreviewUrl = '';
  }

  // ─── Verify Plan (Activate/Deactivate) — opens confirm modal, then saves ───
  openVerifyConfirm(activity: ActivityItem): void {
    this.verifyTargetActivity = activity;
    this.isVerifyModalOpen = true;
  }

  closeVerifyModal(): void {
    this.isVerifyModalOpen = false;
    this.verifyTargetActivity = null;
  }

  verifyplan(): void {
    if (!this.verifyTargetActivity || !this.activityUser) return;

    const activity = this.verifyTargetActivity;
    const newIsActive = activity.isActive === 1 ? 0 : 1;

    const payload = {
      userPlanID: activity.userPlanID,
      isActive: newIsActive,
      profileID: this.activityUser.id,
      userID: this.activityUser.userID,
      spType: 'update',
    };

    console.log('SaveVerifyUserPlan payload:', payload);

    this.verifyModalLoading = true;

    this.dataService.postDirect('core-api/Admin/SaveVerifyUserPlan', payload).subscribe({
      next: (res: any) => {
        const response = Array.isArray(res) ? res[0] : res;
        this.verifyModalLoading = false;
        if (response?.includes('Success')) {
          activity.isActive = newIsActive;
          this.valid.apiInfoResponse(
            newIsActive === 1 ? 'Plan verified successfully' : 'Plan verification removed'
          );
          this.closeVerifyModal();
        } else {
          this.valid.apiErrorResponse(response);
        }
      },
      error: (err) => {
        this.verifyModalLoading = false;
        this.valid.apiErrorResponse('Something went wrong. Please try again.');
        console.error('SaveVerifyUserPlan error:', err);
      },
    });
  }

// ─── Mark Plan as Read (fires only for unapproved plans, isActive === 0) ───
onApproveClick(activity: ActivityItem): void {
  // Only send read-status for plans that are currently unapproved (isActive 0) —
  // approved plans don't need this call, they just open the verify/unverify confirm.
  if (activity.isActive === 0) {
    this.saveReadPlan(activity);
  }
  this.openVerifyConfirm(activity);
}

private saveReadPlan(activity: ActivityItem): void {
  if (!this.activityUser) return;

  const adminID = this.sharedGlobalService.getUserID();
  const payload = {
    userID: adminID,
    userPlanID: activity.userPlanID,
    planID: activity.planID,
    isRead: 1,
    profileID: this.activityUser.id, // profileID comes from getRequestManagement, mapped as UserItem.id
    spType: 'insert',
  };

  console.log('saveReadPlanByAdmin payload:', payload);

  this.dataService.postDirect('core-api/Admin/saveReadPlanByAdmin', payload).subscribe({
    next: (res: any) => console.log('saveReadPlanByAdmin response:', res),
    error: (err) => console.error('saveReadPlanByAdmin error:', err),
  });
}

}