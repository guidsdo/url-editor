import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { rootStore } from './store';
import { createContext } from 'react';

export const RootStoreContext = createContext(rootStore);

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <RootStoreContext.Provider value={rootStore}>
        <App />
    </RootStoreContext.Provider>
);
