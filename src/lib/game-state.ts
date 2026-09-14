import{useSyncExternalStore}from"react";import{createWorldStore}from"./world-store.ts";export*from"./world-model.ts";
const gameStore=createWorldStore(()=>window.localStorage);const getState=()=>gameStore.getSnapshot().state;
export function useGame(){const snapshot=useSyncExternalStore(gameStore.subscribe,gameStore.getSnapshot,gameStore.getServerSnapshot);return{...snapshot,dispatch:gameStore.dispatch,getState};}
