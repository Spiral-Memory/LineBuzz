export interface LoginCredentials {
  user: string;
  password: string;
}

export interface ChatProvider {
  login(
    credentials: LoginCredentials
  ): Promise<{ authToken: string; userId: string }>;
  sendMessage(text: string, threadId?: string): Promise<any>;
  getThreadMessages(threadId: string): Promise<any>;
  getMessageById(threadId: string): Promise<any>;
}
