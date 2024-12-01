export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  data: {
    message: string;
    token: string;
  };
}
