export interface UserWithoutPassword {
  username: string;
  name: string;
  email: string;
  phone: PhoneNumber;
}

export interface UserActionInfo {
  timestamp: Date,
  user: UserWithoutPassword
}

