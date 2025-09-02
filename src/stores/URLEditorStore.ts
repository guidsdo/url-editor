import { action, computed, observable, reaction } from "mobx";
import { createContext } from "react";

export const UrlEditorStoreContext = createContext<URLEditorStore | null>(null);

const EXAMPLE_URL = "https://example.com/path?param1=value1&param2=value2&param3=value3";

export class URLEditorStore {
    @observable accessor cachedParameters: Map<string, string> = new Map();
    @observable accessor url: string = EXAMPLE_URL;

    @computed private get activeParameters(): [key: string, value: string][] {
        return Array.from(new URL(this.url).searchParams);
    }

    constructor() {
        reaction(
            () => this.url,
            () =>
                this.activeParameters.forEach(([key, value]) => {
                    this.cachedParameters.set(key, value);
                }),
            { fireImmediately: true }
        );
    }

    @action setUrl(url: string) {
        this.url = url;
    }

    @action setParameterValue(key: string, value: string) {
        const url = new URL(this.url);
        url.searchParams.set(key, value);
        this.url = url.toString();
        this.cachedParameters.set(key, value);
    }
}
