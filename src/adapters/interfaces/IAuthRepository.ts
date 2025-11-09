export interface AuthSession {
  access_token: string;
  user_id: string;
}


export interface IAuthRepository {
  exchangeTokenForSession(thirdPartyToken: string): Promise<AuthSession>;
}