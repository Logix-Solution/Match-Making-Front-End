export interface UserInterface {
  userLoginId: number;
  loginName: string;
  fullName?: string | null;
  userCNIC?: string | null;
  companyID?: number;
  isTeacher?: boolean;
  isParent?: boolean;
  isEmployee?: boolean;
  roleId: number;
  pin?: string | null;
  token: string;
}