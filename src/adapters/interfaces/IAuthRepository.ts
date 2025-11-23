export interface AuthSession {
  username: string;
  access_token: string;
  refresh_token: string;
}


export interface IAuthRepository {
  exchangeTokenForSession(thirdPartyToken: string): Promise<AuthSession>;
  signOut(): Promise<void>;
}