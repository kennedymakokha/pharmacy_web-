
import { api } from "./api";

export const saleApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSales: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: "/sales",
        method: "GET",
        params: { page, limit },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((sale) => ({
                type: "Sale",
                id: sale._id,
              })),
              { type: "Sale", id: "LIST" },
            ]
          : [{ type: "Sale", id: "LIST" }],
    }),

    getSaleById: builder.query({
      query: (id) => `/sales/${id}`,
      providesTags: (result, error, id) => [{ type: "Sale", id }],
    }),

    createSale: builder.mutation({
      query: (body) => ({
        url: "/sales",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Sale", id: "LIST" },
        { type: "Medicine", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSalesQuery,
  useGetSaleByIdQuery,
  useCreateSaleMutation,
} = saleApi;
