import { AuthService } from './AuthService';
import { TeamService } from './TeamService';
import { MessageService } from './MessageService';
import { SnippetService } from './SnippetService';
import {NavigatorService} from './NavigatorService';
import { logger } from "../utils/logger";

interface Services {
    AuthService: AuthService;
    TeamService: TeamService;
    MessageService: MessageService;
    SnippetService: SnippetService;
    NavigatorService: NavigatorService;
}

export class ServiceContainer {
    private static services: Map<string, any> = new Map();

    static register<K extends keyof Services>(key: K, service: Services[K]): void {
        if (this.services.has(key)) {
            logger.warn("ServiceContainer", `Service ${key} already registered.`);
            return;
        }
        this.services.set(key, service);
    }

    static get<K extends keyof Services>(key: K): Services[K] {
        if (!this.services.has(key)) {
            throw new Error(`Service ${key} not registered in container.`);
        }
        return this.services.get(key) as Services[K];
    }
}

export const Container = ServiceContainer;