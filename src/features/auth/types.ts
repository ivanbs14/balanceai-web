export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type AuthSessionResponse = {
  user: AuthUser;
};
