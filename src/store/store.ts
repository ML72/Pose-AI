import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';
import thunk from 'redux-thunk';

import { uiSlice } from "./slices/ui";
import { dataSlice } from "./slices/data";

const combinedReducer = combineReducers({
    [uiSlice.name]: uiSlice.reducer,
    [dataSlice.name]: dataSlice.reducer
});

const persistConfig = {
  key: 'pose-ai-root',
  whitelist: [], // Nothing to persist for now
  storage
}
const persistedReducer = persistReducer(persistConfig, combinedReducer);

export const store = configureStore({
  reducer: persistedReducer,
  devTools: true,
  middleware: [thunk]
});

export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;