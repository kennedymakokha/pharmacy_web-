import { api } from "./api";

export const categoryApi = api.injectEndpoints({
  endpoints: builder => ({
    // GET /categories
    getCategories: builder.query({
      query: () => ({
        url: "/categories",
        method: "GET",
      }),

      providesTags: ["Category"],
    }),

    // POST /categories
    createCategory: builder.mutation({
      query: body => ({
        url: "/categories",
        method: "POST",
        body,
      }),

      invalidatesTags: ["Category"],
    }),

    // PUT /categories/:id
    updateCategory: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/categories/${id}`,
        method: "PUT",
        body,
      }),

      invalidatesTags: ["Category"],
    }),

    // DELETE /categories/:id
    deleteCategory: builder.mutation({
      query: id => ({
        url: `/categories/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: ["Category"],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;