import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { backendUrl } from "../utils/envVariables";



export const holdingApi = createApi({
    reducerPath: "holdingApi",

    baseQuery: fetchBaseQuery({
        baseUrl: backendUrl,

        prepareHeaders: (headers) => {
            const token = localStorage.getItem("token");
            if (token) {
                headers.set("Authorization", `Bearer ${token}`)
            }
            return headers;
        }
    }),

    tagTypes: ["Holding"],

    endpoints: (builder) => ({
        getUserAsset: builder.query({
            query: () => `/api/asset/my-assets`,
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ id }) => ({ type: "Holding", id })),
                        { type: "Holding", id: "LIST" }
                    ]
                    : [{ type: "Holding", id: "LIST" }],
        }),

        updateAsset: builder.mutation({
            query: ({ ...body }) => ({
                url: `/api/asset/updateAsset`,
                method: "PUT",
                body
            }),
            invalidatesTags: (result, error, { id }) => [
                //İlgili Holding'in Tag'ını Düşürür
                { type: "Holding", id },
                { type: "Holding", id: "LIST" }
            ],
        }),

        deleteTransaction: builder.mutation({
            query: ({ ...body }) => ({
                url: `api/asset/delete_transaction`,
                method: "DELETE",
                body
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "Holding", id: id },
                { type: "Holding", id: "LIST" },
            ]
        }),

        deleteAsset: builder.mutation({
            query: (assetId) => ({
                url: `/api/asset/delete-asset/${assetId}`,
                method: "DELETE"
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "Holding", id: id },
                { type: "Holding", id: "LIST" },
            ]
        }),

        addTransaction: builder.mutation({
            query: (body) => ({
                url: '/api/asset/addTransaction',
                method: "POST",
                body
            }),

            invalidatesTags: () => [
                { type: "Holding", id: "LIST" },
            ],
        }),

        sellTransaction: builder.mutation({
            query: (body) => ({
                url: '/api/asset/sellInvestment',
                method: "POST",
                body
            }),

            invalidatesTags: () => [
                { type: "Holding", id: "LIST" },
            ],
        })
    }),
});


export const { useDeleteAssetMutation, useGetUserAssetQuery, useUpdateAssetMutation, useAddTransactionMutation, useDeleteTransactionMutation, useSellTransactionMutation } = holdingApi;