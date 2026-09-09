import { apiSlice } from './apiSlice';

export const timelineApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTimeline: builder.query({
      query: ({ onModel, id }) => `/timeline/${onModel}/${id}`,
      providesTags: (result, error, { onModel, id }) => [{ type: 'Timeline', id }],
    }),
    getGlobalLogs: builder.query({
      query: (params) => ({
        url: '/timeline/logs',
        params,
      }),
      providesTags: ['Timeline', 'Dashboard'],
    }),
  }),
});

export const {
  useGetTimelineQuery,
  useGetGlobalLogsQuery,
} = timelineApiSlice;
