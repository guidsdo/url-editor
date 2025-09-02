import { computed, observable } from "mobx";
import { createContext } from "react";

export const UrlEditorStoreContext = createContext<URLEditorStore | null>(null);

const EXAMPLE_URL = "https://example.com/path?param1=value1&param2=value2&param3=value3";

export class URLEditorStore {
    @observable accessor url: string = EXAMPLE_URL;

    @computed get parameters(): [key: string, value: string][] {
        return Array.from(new URL(this.url).searchParams);
    }
}
