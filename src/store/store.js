// import { combineReducers, configureStore } from '@reduxjs/toolkit'
// import SliceReducer from './reducer.js'
// import { persistStore, persistReducer } from 'redux-persist';
// import storage from 'redux-persist/lib/storage'
// const persistConfig = {
//     key: 'root',
//     storage,
//   };
//  let rootReducer =combineReducers({user:SliceReducer})
//   const persistedReducer = persistReducer(persistConfig,rootReducer);
// export const store = configureStore({
//    reducer : persistedReducer
//   // ,
//   // middleware:(getDefaultMiddleware)=> getDefaultMiddleware({
//   //   serializableCheck:false
//   // })
// });
// export const persistor = persistStore(store);

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import SliceReducer from './reducer.js';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// 🔹 Correct Persist Config
const persistConfig = {
    key: 'root', // Keep 'root' to store everything properly
    storage
};

// 🔹 Combine Reducers
const rootReducer = combineReducers({ user: SliceReducer });
const persistedReducer = persistReducer(persistConfig, rootReducer);

// 🔹 Configure Store with Middleware Fix
export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false // 🔹 Fix for non-serializable state errors
        })
});

// 🔹 Persistor
export const persistor = persistStore(store);

// 🔹 Debugging (Log Redux State)
store.subscribe(() => {
    console.log("Updated Redux State:", store.getState());
});
