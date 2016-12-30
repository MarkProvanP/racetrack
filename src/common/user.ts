import { PhoneNumber } from "./text";
export type UserId = string;

export class UserWithoutPassword {
  constructor(
    public username: UserId,
    public name: string,
    public email: string,
    public phone: PhoneNumber,
    public level: UserPrivileges,
    public role: string
  ) {}

  static fromJSON(obj) {
    return new UserWithoutPassword(
      obj.username,
      obj.name,
      obj.email,
      PhoneNumber.parse(obj.phone),
      obj.level,
      obj.role
    )
  }
}

export class UserActionInfo {
  constructor(
    public timestamp: Date,
    public user: UserWithoutPassword
  ) {}

  static fromJSON(obj) {
    if (!obj) return undefined;
    return new UserActionInfo(
      obj.timestamp,
      UserWithoutPassword.fromJSON(obj.user)
    )
  }
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
