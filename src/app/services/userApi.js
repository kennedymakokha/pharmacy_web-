
import { api } from "./api";

export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: ({ page = 1, limit = 10, search = "", role = "" } = {}) => ({
        url: "/auth",
        method: "GET",
        params: { page, limit, search, role },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((user) => ({
                type: "User",
                id: user.uuid,
              })),
              { type: "User", id: "LIST" },
            ]
          : [{ type: "User", id: "LIST" }],
    }),

    getUserOverview: builder.query({
      query: () => ({
        url: "/auth/overview",
        method: "GET",
      }),
      providesTags: [{ type: "User", id: "OVERVIEW" }],
    }),

    createUser: builder.mutation({
      query: (body) => ({
        url: "/auth",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "User", id: "LIST" },
        { type: "User", id: "OVERVIEW" },
      ],
    }),

    updateUser: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/auth/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: [
        { type: "User", id: "LIST" },
        { type: "User", id: "OVERVIEW" },
      ],
    }),

    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/auth/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "User", id: "LIST" },
        { type: "User", id: "OVERVIEW" },
      ],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetUsersQuery,
  useGetUserOverviewQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApi;
