import { PhoneNumber } from "./text";
export type UserId = string;

export interface UserWithoutPassword {
  username: UserId;
  name: string;
  email: string;
  phone: PhoneNumber;
}

export interface UserActionInfo {
  timestamp: Date,
  user: UserWithoutPassword
}

export enum UserPrivileges {
  SUPERUSER, MODIFY_ALL, BASIC, VIEW_ONLY
}


export function prettyUserPrivilegesLevel(level: UserPrivileges) {
  console.log('level', level);
  switch (level) {
    case UserPrivileges.SUPERUSER: return 'Superuser';
    case UserPrivileges.MODIFY_ALL: return 'Modify all';
    case UserPrivileges.BASIC: return 'Basic';
    case UserPrivileges.VIEW_ONLY: return 'View only'
  }
}
