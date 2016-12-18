import { PhoneNumber } from "./text";
export type UserId = string;

export interface UserWithoutPassword {
  username: UserId;
  name: string;
  email: string;
  phone: PhoneNumber;
  level: UserPrivileges;
  role: string;
}

export interface UserActionInfo {
  timestamp: Date,
  user: UserWithoutPassword
}

export enum UserPrivileges {
  VIEW_ONLY, BASIC, MODIFY_ALL, SUPERUSER
}

export function isAboveMinimumPrivilege(minimum: UserPrivileges) {
  return (level: UserPrivileges) => {
    switch (minimum) {
      case UserPrivileges.SUPERUSER: return level == UserPrivileges.SUPERUSER;
      case UserPrivileges.BASIC: return level == UserPrivileges.SUPERUSER || level == UserPrivileges.MODIFY_ALL || level == UserPrivileges.BASIC;
      case UserPrivileges.MODIFY_ALL: return level == UserPrivileges.SUPERUSER || level == UserPrivileges.MODIFY_ALL;
      case UserPrivileges.VIEW_ONLY: return true;
    }
  }
}

export function prettyUserPrivilegesLevel(level: UserPrivileges) {
  switch (level) {
    case UserPrivileges.SUPERUSER: return 'Superuser';
    case UserPrivileges.MODIFY_ALL: return 'Modify all';
    case UserPrivileges.BASIC: return 'Basic';
    case UserPrivileges.VIEW_ONLY: return 'View only'
  }
}
