import { api } from "./api";

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: ({ phone_number, password }) => ({
        url: "/auth/login",
        method: "POST",
        body: {
          phone_number,
          password,
        },
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useLoginMutation } = authApi;