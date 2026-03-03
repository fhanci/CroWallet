import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import { backendUrl } from "../utils/envVariables";

export const accountApi = createApi({
    reducerPath: "accountApi",

    baseQuery: fetchBaseQuery({
        baseUrl: backendUrl,
        
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("token");
            if (token){
                headers.set("Authorization", `Bearer ${token}`)
            }
            return headers;
        }
    }),

    tagTypes: ["Account"],

    endpoints: (builder) => ({
        getUserID: builder.query({
            query:() => "/api/accounts/me",
            providesTags: (result) => 
                result 
                    ? [{type:"Account", id: result}] 
                    : [{type:"Account", id:"ME"}],
        }),
    }),
});


export const { useGetUserIDQuery } = accountApi;