import { api } from "./api";

export const supplierApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSuppliers: builder.query({
      query: (params = {}) => ({
        url: "/suppliers",
        method: "GET",
        params,
      }),
      providesTags: (result) => [
        { type: "Supplier", id: "LIST" },
        ...(result?.data || []).map((supplier) => ({
          type: "Supplier",
          id: supplier._id,
        })),
      ],
    }),

    getSupplierById: builder.query({
      query: (id) => `/suppliers/${id}`,
      providesTags: (result, error, id) => [
        { type: "Supplier", id },
      ],
    }),

    createSupplier: builder.mutation({
      query: (body) => ({
        url: "/suppliers",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Supplier", id: "LIST" }],
    }),

    updateSupplier: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/suppliers/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Supplier", id },
        { type: "Supplier", id: "LIST" },
      ],
    }),

    deleteSupplier: builder.mutation({
      query: (id) => ({
        url: `/suppliers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Supplier", id },
        { type: "Supplier", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetSuppliersQuery,
  useGetSupplierByIdQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
} = supplierApi;