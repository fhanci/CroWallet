import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";



export const holdingApi = createApi({
    reducerPath: "holdingApi",

    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:8082",
        
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("token");
            if (token){
                headers.set("Authorization", `Bearer ${token}`)
            }
            return headers;
        }
    }),

    tagTypes: ["Holding"],

    endpoints: (builder) => ({
        getUserHolding: builder.query({
            query:(id) => `/api/accounts/${id}/holdings`,
            providesTags: (result) => 
                result 
                    ? [
                        //Her holding için ayrı tag üret
                        ...result.map(({id}) => ({type:"Holding", id})),

                        //Liste için özel bir tag üret
                        {type:"Holding", id:"LIST"},
                    ]

                    //Eğer result yoksa sadece LIST üret
                    : [{type:"Holding", id:"LIST"}],
        }),

        updateHolding:builder.mutation({
            query:({id, ...body}) => ({
                url: `/api/accounts/holdings/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: (result, error, {id}) => [
                //İlgili Holding'in Tag'ını Düşürür
                {type: "Holding", id},
            ],
        }),

        deleteHolding: builder.mutation({
            query: (id) => ({
                url: `/api/accounts/holdings/${id}`,
                method:"DELETE"
            }),

            invalidatesTags: (result,error,id) => [

                ////Her holding için ayrı tag üret
                {type:"Holding",id},

                //Eğer result yoksa sadece LIST üret
                {type:"Holding", id:"LIST"},
            ],
        }),
    }),
});


export const { useGetUserHoldingQuery,useUpdateHoldingMutation,useDeleteHoldingMutation } = holdingApi;