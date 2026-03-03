import { configureStore } from "@reduxjs/toolkit";
import { accountApi } from "../api/accountApi";
import { holdingApi } from "../api/holdingsApi";




export const store = configureStore({
    reducer: {
        [accountApi.reducerPath] : accountApi.reducer,
        [holdingApi.reducerPath] : holdingApi.reducer
    }, 
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(accountApi.middleware).concat(holdingApi.middleware),
});