import { makeAutoObservable } from 'mobx';
import { Parameter, ParameterHistory } from './types';

export class URLEditorStore {
    url: string = 'https://example.com/path?param1=value1&param2=value2&param3=value3';
    parameterHistory: Map<string, ParameterHistory> = new Map();

    constructor() {
        makeAutoObservable(this);
    }

    setUrl(url: string) {
        const previousUrl = this.url;
        this.url = url;
        this.updateParameterHistory(previousUrl, url);
    }

    private updateParameterHistory(previousUrl: string, currentUrl: string) {
        try {
            // Get current parameters
            const currentParams = new Map<string, string>();
            if (currentUrl) {
                const parsedUrl = new URL(currentUrl);
                const params = new URLSearchParams(parsedUrl.search);
                Array.from(params.entries()).forEach(([key, value]) => {
                    currentParams.set(key, value);
                });
            }

            // Get previous parameters
            const previousParams = new Map<string, string>();
            if (previousUrl) {
                const parsedUrl = new URL(previousUrl);
                const params = new URLSearchParams(parsedUrl.search);
                Array.from(params.entries()).forEach(([key, value]) => {
                    previousParams.set(key, value);
                });
            }

            // Update parameter history
            const now = Date.now();

            // Mark current parameters as active
            Array.from(currentParams.entries()).forEach(([key, value]) => {
                if (this.parameterHistory.has(key)) {
                    const existing = this.parameterHistory.get(key)!;
                    this.parameterHistory.set(key, {
                        ...existing,
                        value,
                        isActive: true,
                        lastSeen: now,
                    });
                } else {
                    this.parameterHistory.set(key, {
                        value,
                        isActive: true,
                        lastSeen: now,
                    });
                }
            });

            // Mark parameters that were in previous URL but not in current as inactive
            Array.from(previousParams.entries()).forEach(([key]) => {
                if (!currentParams.has(key)) {
                    if (this.parameterHistory.has(key)) {
                        const existing = this.parameterHistory.get(key)!;
                        this.parameterHistory.set(key, {
                            ...existing,
                            isActive: false,
                            lastSeen: now,
                        });
                    }
                }
            });
        } catch {
            // If URL parsing fails, don't update history
        }
    }

    get parameters(): Parameter[] {
        try {
            const url = new URL(this.url);
            const params = new URLSearchParams(url.search);
            const currentParams = Array.from(params.entries()).map(([key, value]) => ({ key, value }));

            // Add historical parameters that are not currently active
            const historicalParams: Parameter[] = [];

            Array.from(this.parameterHistory.entries()).forEach(([key, data]) => {
                if (!data.isActive) {
                    historicalParams.push({
                        key,
                        value: data.value,
                        isActive: false,
                    });
                }
            });

            // Combine current and historical parameters
            const allParams = [...currentParams.map((p) => ({ ...p, isActive: true })), ...historicalParams];

            // Sort by last seen time (most recent first)
            return allParams.sort((a, b) => {
                const aData = this.parameterHistory.get(a.key);
                const bData = this.parameterHistory.get(b.key);
                const aTime = aData ? aData.lastSeen : 0;
                const bTime = bData ? bData.lastSeen : 0;
                return bTime - aTime;
            });
        } catch {
            return [];
        }
    }

    get autocompleteSuggestions(): string[] {
        try {
            const currentParams = new Set<string>();
            const parsedUrl = new URL(this.url);
            const params = new URLSearchParams(parsedUrl.search);
            Array.from(params.keys()).forEach((key) => {
                currentParams.add(key);
            });

            // Get historical suggestions
            const historicalSuggestions = Array.from(this.parameterHistory.entries())
                .filter(([key, data]) => !data.isActive && !currentParams.has(key))
                .map(([key]) => key)
                .sort();

            // If no historical suggestions, provide some common parameter names as fallback
            if (historicalSuggestions.length === 0) {
                const commonParams = ['id', 'name', 'type', 'page', 'limit', 'search', 'sort', 'order', 'status', 'user'];
                return commonParams.filter(param => !currentParams.has(param));
            }

            return historicalSuggestions;
        } catch {
            return [];
        }
    }

    get highlightedUrl(): string {
        try {
            const url = new URL(this.url);
            const baseUrl = `${url.protocol}//${url.host}${url.pathname}`;
            const params = Array.from(new URLSearchParams(url.search).entries());

            if (params.length === 0) {
                return baseUrl;
            }

            const paramString = params.map(([key, value]) => `${key}=${value}`).join('&');

            return `${baseUrl}?${paramString}`;
        } catch {
            return this.url;
        }
    }
}

export const urlEditorStore = new URLEditorStore();

// Keep the original RootStore for potential future use
class RootStore {
    constructor() {
        makeAutoObservable(this);
    }
    // Add store properties here
}

export const rootStore = new RootStore();
