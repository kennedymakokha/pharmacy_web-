import { api } from "./api";

export const prescriptionApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPrescriptions: builder.query({
      query: (params = {}) => ({
        url: "/prescriptions",
        method: "GET",
        params,
      }),

      providesTags: (result) => [
        { type: "Prescription", id: "LIST" },
        ...(result?.data || []).map((item) => ({
          type: "Prescription",
          id: item._id,
        })),
      ],
    }),

    getPrescriptionById: builder.query({
      query: (id) => `/prescriptions/${id}`,
      providesTags: (result, error, id) => [
        { type: "Prescription", id },
      ],
    }),

    createPrescription: builder.mutation({
      query: (body) => ({
        url: "/prescriptions",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Prescription", id: "LIST" }],
    }),

    verifyPrescription: builder.mutation({
      query: (id) => ({
        url: `/prescriptions/${id}/verify`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Prescription", id },
        { type: "Prescription", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetPrescriptionsQuery,
  useGetPrescriptionByIdQuery,
  useCreatePrescriptionMutation,
  useVerifyPrescriptionMutation,
} = prescriptionApi;