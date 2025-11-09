import { AuthService } from './AuthService';

interface Services {
    AuthService: AuthService;
}

const serviceInstances = new Map<keyof Services, any>();

export const Container = {
    register<K extends keyof Services>(key: K, instance: Services[K]): void {
        if (serviceInstances.has(key)) {
            console.warn(`Service ${key} already registered.`);
            return;
        }
        serviceInstances.set(key, instance);
    },

    get<K extends keyof Services>(key: K): Services[K] {
        if (!serviceInstances.has(key)) {
            throw new Error(`Service ${key} not registered in container.`);
        }
        return serviceInstances.get(key) as Services[K];
    }
};