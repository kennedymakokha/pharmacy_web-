
import { api } from "./api";

export const medicineApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMedicines: builder.query({
      query: ({
        page = 1,
        limit = 10,
        search = "",
        category = "",
      } = {}) => ({
        url: "/medicines",
        method: "GET",
        params: { page, limit, search, category },
      }),

      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((medicine) => ({
                type: "Medicine",
                id: medicine._id,
              })),
              { type: "Medicine", id: "LIST" },
            ]
          : [{ type: "Medicine", id: "LIST" }],
    }),

    getMedicineById: builder.query({
      query: (id) => `/medicines/${id}`,
      providesTags: (result, error, id) => [
        { type: "Medicine", id },
      ],
    }),

    createMedicine: builder.mutation({
      query: (body) => ({
        url: "/medicines",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Medicine", id: "LIST" }],
    }),

    updateMedicine: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/medicines/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Medicine", id },
        { type: "Medicine", id: "LIST" },
      ],
    }),

    deleteMedicine: builder.mutation({
      query: (id) => ({
        url: `/medicines/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Medicine", id },
        { type: "Medicine", id: "LIST" },
      ],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetMedicinesQuery,
  useGetMedicineByIdQuery,
  useCreateMedicineMutation,
  useUpdateMedicineMutation,
  useDeleteMedicineMutation,
} = medicineApi;
