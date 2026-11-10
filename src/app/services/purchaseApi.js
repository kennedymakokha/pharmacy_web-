
import { api } from "./api";

export const purchaseApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPurchases: builder.query({
      query: ({ page = 1, limit = 10, search = "", status = "" } = {}) => ({
        url: "/purchases",
        params: { page, limit, search, status },
      }),
      providesTags: (result) => [
        { type: "Purchase", id: "LIST" },
        ...(result?.data || []).map((purchase) => ({
          type: "Purchase",
          id: purchase._id,
        })),
      ],
    }),

    createPurchase: builder.mutation({
      query: (body) => ({
        url: "/purchases",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Purchase", id: "LIST" }],
    }),

    receivePurchase: builder.mutation({
      query: (id) => ({
        url: `/purchases/${id}/receive`,
        method: "PATCH",
      }),
      invalidatesTags: [
        { type: "Purchase", id: "LIST" },
        { type: "Medicine", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetPurchasesQuery,
  useCreatePurchaseMutation,
  useReceivePurchaseMutation,
} = purchaseApi;
