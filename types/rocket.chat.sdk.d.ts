declare module "@rocket.chat/sdk" {
  export class Rocketchat {
	constructor(options: any);
	connect(options: any): Promise<void>;
	resume(options: any): Promise<void>;
	subscribeRoom(rid: string): Promise<void>;
	onMessage(callback: (message: any) => void): void;
  }
}