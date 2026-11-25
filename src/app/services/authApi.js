import { api } from "./api";

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: ({ username, password }) => ({
        url: "/auth/login",
        method: "POST",
        body: {
          username,
          password,
        },
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useLoginMutation } = authApi;