export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  googleLinked: boolean;
};

export type AuthSessionResponse = {
  user: AuthUser;
};
