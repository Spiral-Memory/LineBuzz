import { GlobalStorage } from "../../store/globalStorage";

export class AuthSettings {
  static setServerUrl(url: string) {
    GlobalStorage.set("serverUrl", url);
  }

  static getServerUrl(): string | undefined {
    return GlobalStorage.get<string>("serverUrl");
  }

  static deleteServerUrl() {
    GlobalStorage.delete("serverUrl");
  }

  static setProviderName(name: string) {
    GlobalStorage.set("providerName", name);
  }

  static getProviderName(): string | undefined {
    return GlobalStorage.get<string>("providerName");
  }

  static deleteProviderName() {
    GlobalStorage.delete("providerName");
  }
}
