import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SharedGlobalService {
  private readonly USER_KEY = 'currentUser';
  private readonly MENUS_KEY = 'currentMenus';
  private readonly TOKEN_KEY = 'authToken';

  constructor() {}

  private tempUserID: number | null = null;

  setTempUserID(id: number) {
    this.tempUserID = id;
  }

  getTempUserID(): number | null {
    return this.tempUserID;
  }


  saveUserSession(userData: any): void {
    // Save token WITHOUT quotes
    if (userData?.token) {
      const cleanToken = userData.token.replace(/"/g, '').trim();
      localStorage.setItem(this.TOKEN_KEY, cleanToken);
      console.log('Token saved:', cleanToken);
    }

    const userToStore = {
      userLoginId: userData.userLoginId,
      roleId: userData.roleId,
      roleJson: userData.roleJson,
      fullName: userData.fullName,
      loginName: userData.loginName,
      roleTitle: userData.roleTitle,
      companyID: userData.companyID,
      pin: userData.pin,
      token: userData.token,
    };

    localStorage.setItem(this.USER_KEY, JSON.stringify(userToStore));
  }

  saveMenuSession(menuData: any): void {
    localStorage.setItem(this.MENUS_KEY, JSON.stringify(menuData));
  }

  getMenus(): any[] {
    const menus = localStorage.getItem(this.MENUS_KEY);
    return menus ? JSON.parse(menus) : [];
  }

  getMenusIcons(): any[] {
    const menus = localStorage.getItem(this.MENUS_KEY);
    return menus ? JSON.parse(menus) : [];
  }

  getUser(): any {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

getUserID(): any {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user).userLoginId : null;
  }

  getpin(): any {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user).pin : null;
  }

  getCompanyID(): any {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user).companyID : null;
  }

  // Get token WITHOUT quotes
  getToken(): string | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return null;
    
    // Clean token - remove any quotes that might exist
    return token.replace(/"/g, '').trim();
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  getRoleId(): number | null {
    const user = this.getUser();
    return user?.roleId || null;
  }

  getRoleTitle(): string | null {
    const user = this.getUser();
    return user?.roleTitle || null;
  }

  clearSession(): void {
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.MENUS_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
  }

  hasRole(roleId: number): boolean {
    const user = this.getUser();
    if (!user || !user.roleJson) return false;

    try {
      const roles = JSON.parse(user.roleJson);
      return roles.some((role: any) => role.roleId === roleId);
    } catch (e) {
      console.error('Error parsing roleJson', e);
      return false;
    }
  }
}



