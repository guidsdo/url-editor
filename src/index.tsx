import ReactDOM from "react-dom/client";
import { App } from "./App";
import { URLEditorStore, UrlEditorStoreContext } from "./stores/URLEditorStore";

const urlEditorStore = new URLEditorStore();

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
    <UrlEditorStoreContext.Provider value={urlEditorStore}>
        <App />
    </UrlEditorStoreContext.Provider>
);
