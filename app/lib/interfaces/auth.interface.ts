export interface UserPublic {
  id: string;
  username: string;
  avatar: string | null;
}

export interface SignupBody {
  username: string;
  password: string;
}

export interface LoginBody {
  username: string;
  password: string;
}

export interface RefreshAuthSessionBody {
  refreshToken: string;
}

export interface LogoutBody {
  refreshToken: string;
}

export interface AuthSessionData {
  accessToken: string;
  refreshToken: string;
  user: UserPublic;
}

export interface LogoutData {
  ok: true;
}
