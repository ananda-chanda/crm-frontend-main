import { apiSlice } from './apiSlice';

export const roleApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRoles: builder.query({
      query: () => '/roles',
      providesTags: ['Roles'],
    }),
    getRoleById: builder.query({
      query: (id) => `/roles/${id}`,
      providesTags: (result, error, id) => [{ type: 'Roles', id }],
    }),
    createRole: builder.mutation({
      query: (initialRole) => ({
        url: '/roles',
        method: 'POST',
        body: initialRole,
      }),
      invalidatesTags: ['Roles'],
    }),
    updateRole: builder.mutation({
      query: (role) => ({
        url: `/roles/${role.id}`,
        method: 'PUT',
        body: role,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Roles', id: arg.id },
        'Roles'
      ],
    }),
    deleteRole: builder.mutation({
      query: (id) => ({
        url: `/roles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Roles'],
    }),
  }),
});

export const {
  useGetRolesQuery,
  useGetRoleByIdQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation
} = roleApiSlice;
