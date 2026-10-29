export interface Credentials {
  username: string;
  password: string;
}

/** Svaret från POST /api/auth/login */
export interface AuthResponse {
  token: string;
  username: string;
  expiresAt: string;
}

export interface MessageResponse {
  message: string;
}
