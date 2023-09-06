import { createApi } from "@reduxjs/toolkit/query/react";
import axiosApiInstance from "../axios/api";
import { errorMessages } from "../config";

import { transformResponseForGetChannels } from "./channelsSlice";
import { transformResponseForGetMessagesOfChannel } from "./messagesSlice";
import {
  transformResponseForGetAllUsersTable,
  transformResponseForGetUsersOfChannelTable,
} from "./usersSlice";

const axiosBaseQuery = async ({ url, method, data, params, headers }) => {
  try {
    const response = await axiosApiInstance({
      url,
      method,
      data,
      params,
      headers,
    });
    // baseQuery option expects this custom callback return {data:...} or {error:...} object
    return {
      // successful response in axios has a `data` field
      // that contains what ever server returned (html, json string, ...)
      // in the backend, successfull response is a json object in the form of {data:...}
      data: response?.data?.data,
    };
  } catch (err) {
    const errorValue = {
      status: err?.response?.status,
      message: errorMessages.internalAppError,
      // in the backend, error response is a json object in the form of {error:...}
      // or it can be an html string (handled by server itself (not backend source code))
      responseData: err?.response?.data?.error || err?.response?.data,
      details: err?.message,
    };

    if (err?.response) {
      console.log(err);
      if (err?.response?.status === 401) {
        return {
          error: { ...errorValue, message: errorMessages.notAuthorized },
        };
      } else {
        return {
          error: {
            ...errorValue,
            message: errorMessages.statusErrorFromServer(err?.response?.status),
          },
        };
      }
    } else if (err?.request) {
      return {
        error: { ...errorValue, message: errorMessages.networkError },
      };
    } else {
      return {
        error: errorValue,
      };
    }
  }
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery,
  tagTypes: ["Channels", "Messages", "Users", "UsersOfChannel", "Departments"],

  endpoints: (builder) => ({
    /////////////////////////////////////////////////////////////////////////
    // queries for channels

    getChannels: builder.query({
      query: (filterConfig) => ({
        url: "/channels",
        method: "get",
        // some additional fields like displaySearchField is also sent
        // but server will ignore it
        params: { ...filterConfig }, // query parameters in url => site.com/?param=value&
      }),
      transformResponse: transformResponseForGetChannels,
      providesTags: (result) =>
        result
          ? // successful query
            [
              ...result?.entities?.map(({ _id }) => ({
                type: "Channels",
                id: _id,
              })),
              { type: "Channels", id: "LIST" },
            ]
          : // an error occurred, but we still want to refetch this query when `{ type: 'Posts', id: 'LIST' }` is invalidated
            [{ type: "Channels", id: "LIST" }],
    }),

    // this query does not send any network request
    // it is used to invalidate the cache for getChannels
    // important note: the cache key that provides the tag below but has reference count 0
    // does not refetch, until a component subscribe to that within 60s
    // DESIRED behavior :)
    invalidateChannels: builder.mutation({
      queryFn: () => [],
      invalidatesTags: [{ type: "Channels", id: "LIST" }],
    }),

    deleteChannel: builder.mutation({
      query: (id) => ({ url: `/channels/${id}`, method: "delete" }),
      // force channel list and channel details page to refetch
      invalidatesTags: (result, error, id) =>
        result
          ? [
              { type: "Channels", id: "LIST" },
              { type: "Departments", id: "LIST" },
            ]
          : [],
    }),

    getChannelByIdentifier: builder.query({
      query: (identifier) => ({
        url: `/channels/${identifier}`,
        method: "get",
      }),
      // the '_id' is different from 'identifier'
      providesTags: (result) => [{ type: "Channels", id: result?._id }],
    }),

    editChannel: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/channels/${id}`,
        method: "patch",
        data: body,
      }),
      // force channel list and channel details page to refetch
      // notice that the {id} is in curly braces. because it's part of the arg
      invalidatesTags: (result, error, { id }) =>
        result ? [{ type: "Channels", id }] : [],
    }),

    createChannel: builder.mutation({
      query: (body) => ({ url: "/channels", method: "post", data: body }),
      // force channel list to refetch (if result was successful)
      invalidatesTags: (result) =>
        result
          ? [
              { type: "Channels", id: "LIST" },
              { type: "Departments", id: "LIST" },
            ]
          : [],
    }),

    getMyOwnChannels: builder.query({
      query: (searchValue) => ({
        url: "/channels",
        method: "get",
        params: { template: "myOwn", searchValue },
      }),
      providesTags: (result) =>
        result
          ? [
              { type: "Channels", id: "LIST" },
              ...result.map((channel) => ({
                type: "Channels",
                id: channel?._id,
              })),
            ]
          : [{ type: "Channels", id: "LIST" }],
    }),

    /////////////////////////////////////////////////////////////////////////
    // queries for users (mutate single user)

    getUsers: builder.query({
      query: (filterConfig) => ({
        url: "/users",
        method: "get",
        params: filterConfig,
      }),
      transformResponse: transformResponseForGetAllUsersTable,
      providesTags: (result) =>
        result
          ? [
              ...result?.entities?.map(({ _id }) => ({
                type: "Users",
                id: _id,
              })),
              { type: "Users", id: "LIST" },
            ]
          : [{ type: "Users", id: "LIST" }],
    }),

    // invalidates two cache entries
    // allUsersTable, usersOfChannelTable
    // because they use two separate endpoints (so they have two separate cache)
    // but provide same tag
    invalidateUsers: builder.mutation({
      queryFn: () => [],
      invalidatesTags: [{ type: "Users", id: "LIST" }],
    }),

    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `/users/${userId}`,
        method: "delete",
      }),
      invalidatesTags: (result, error, userId) =>
        result ? [{ type: "Users", id: "LIST" }] : [],
    }),

    getUserByUsername: builder.query({
      query: (username) => ({
        url: `/users/${username}`,
        method: "get",
      }),
      providesTags: (result) => [{ type: "Users", id: result?._id }],
    }),

    editUser: builder.mutation({
      query: ({ userId, ...body }) => ({
        url: `/users/${userId}`,
        method: "patch",
        data: body,
      }),
      invalidatesTags: (result, error, { userId }) =>
        result ? [{ type: "Users", id: userId }] : [],
    }),

    createUser: builder.mutation({
      query: (body) => ({
        url: `/users`,
        method: "post",
        data: body,
      }),
      invalidatesTags: (result) =>
        result ? [{ type: "Users", id: "LIST" }] : [],
    }),

    /////////////////////////////////////////////////////////////////////////
    // queries for messages

    getMessagesOfChannel: builder.query({
      query: ({ channelId, ...filterConfig }) => ({
        url: `/channels/${channelId || "@invalid"}/messages`,
        method: "get",
        params: filterConfig,
      }),
      transformResponse: transformResponseForGetMessagesOfChannel,
      providesTags: (result) =>
        result
          ? [
              ...result?.entities?.map(({ _id }) => ({
                type: "Messages",
                id: _id,
              })),
              { type: "Messages", id: "LIST" },
            ]
          : [{ type: "Messages", id: "LIST" }],
    }),

    invalidateMessages: builder.mutation({
      queryFn: () => [],
      invalidatesTags: [{ type: "Messages", id: "LIST" }],
    }),

    deleteMessage: builder.mutation({
      query: ({ channelId, messageId }) => ({
        url: `/channels/${channelId}/messages/${messageId}`,
        method: "delete",
      }),
      // force messages list (in channel details) and messages details page to refetch
      invalidatesTags: (result, error, { messageId }) =>
        result ? [{ type: "Messages", id: "LIST" }] : [],
    }),

    getMessage: builder.query({
      query: ({ channelIdentifier, messageId }) => ({
        url: `/channels/${channelIdentifier}/messages/${messageId}`,
        method: "get",
      }),
      providesTags: (result) => [{ type: "Messages", id: result?._id }],
    }),

    editMessage: builder.mutation({
      query: ({ channelId, messageId, ...body }) => ({
        url: `/channels/${channelId}/messages/${messageId}`,
        method: "patch",
        data: body,
      }),
      // force messages list (in channel details) and messages details page to refetch
      invalidatesTags: (result, error, { messageId }) =>
        result ? [{ type: "Messages", id: messageId }] : [],
    }),

    createMessage: builder.mutation({
      query: ({ channelId, ...body }) => ({
        url: `/channels/${channelId}/messages`,
        method: "post",
        data: body,
      }),
      // force messages list (in channel details) and messages details page to refetch
      invalidatesTags: (result) =>
        result ? [{ type: "Messages", id: "LIST" }] : [],
    }),

    /////////////////////////////////////////////////////////////////////////

    getUsersOfChannel: builder.query({
      query: ({ channelId, ...filterConfig }) => ({
        url: `/channels/${channelId || "@invalid"}/members`,
        method: "get",
        params: filterConfig,
      }),
      transformResponse: transformResponseForGetUsersOfChannelTable,
      providesTags: (result, error, { channelId }) =>
        (result
          ? [
              ...result?.entities?.map(({ _id }) => ({
                type: "Users",
                id: _id,
              })),
              { type: "Users", id: "LIST" },
            ]
          : [{ type: "Users", id: "LIST" }]
        ).concat([{ type: "UsersOfChannel", id: channelId }]),
    }),

    /////////////////////////////////////////////////////////////////////////
    // queries for table search dropdown instances

    getDepartments: builder.query({
      query: () => ({
        url: "/departments",
        method: "get",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: "Departments", id: _id })),
              { type: "Departments", id: "LIST" },
            ]
          : [{ type: "Departments", id: "LIST" }],
    }),
    getSystemRoles: builder.query({
      query: () => ({
        url: "/constants/system_roles",
        method: "get",
      }),
    }),
    getStudentPositions: builder.query({
      query: () => ({
        url: "/constants/student_positions",
        method: "get",
      }),
    }),
    getLecturerPositions: builder.query({
      query: () => ({
        url: "/constants/lecturer_positions",
        method: "get",
      }),
    }),

    /////////////////////////////////////////////////////////////////////////
    // queries for group operations (temp-users page)

    // finds multiple users by sending multiple usernames
    findUsersByUsernames: builder.query({
      query: (usernames) => ({
        url: "users/findByUsernames",
        method: "post",
        data: { usernames },
      }),
      transformResponse: transformResponseForGetAllUsersTable,
    }),

    addManyUsersToChannel: builder.mutation({
      query: ({ channelIdentifier, users }) => ({
        url: `/channels/${channelIdentifier}/members`,
        method: "post",
        data: { users }, // partial object of users, '_id', 'username', 'fullname'
      }),
      // UsersOfChannel provides channel _id (not identifier)
      invalidatesTags: (result) =>
        result ? [{ type: "UsersOfChannel", id: result?.channel?._id }] : [],
    }),

    // only request method differs from the above
    removeManyUsersFromChannel: builder.mutation({
      query: ({ channelIdentifier, users }) => ({
        url: `/channels/${channelIdentifier}/members`,
        method: "delete",
        data: { users }, // partial object of users, '_id', 'username', 'fullname'
      }),
      // UsersOfChannel provides channel _id (not identifier)
      invalidatesTags: (result) =>
        result ? [{ type: "UsersOfChannel", id: result?.channel?._id }] : [],
    }),

    /////////////////////////////////////////////////////////////////////////
    // queries for group operations (users page)

    addManyUsers: builder.mutation({
      query: (users) => ({
        url: "/users/addMany",
        method: "post",
        data: { users },
      }),
      invalidatesTags: (result) =>
        result
          ? [
              { type: "Users", id: "LIST" },
              { type: "Departments", id: "LIST" },
            ]
          : [],
    }),

    editManyUsers: builder.mutation({
      query: (users) => ({
        url: "/users/editMany",
        method: "patch",
        data: { users },
      }),
      invalidatesTags: (result) =>
        result
          ? [
              ...result?.entities?.map(({ _id }) => ({
                type: "Users",
                id: _id,
              })),
              { type: "Users", id: "LIST" },
              { type: "Departments", id: "LIST" },
            ]
          : [],
    }),

    deleteManyUsers: builder.mutation({
      query: (usernames) => ({
        url: "/users/deleteMany",
        method: "delete",
        data: { usernames },
      }),
      invalidatesTags: (result) =>
        result
          ? [
              ...result?.entities?.map(({ _id }) => ({
                type: "Users",
                id: _id,
              })),
              { type: "Users", id: "LIST" },
              { type: "Departments", id: "LIST" },
            ]
          : [],
    }),

    /////////////////////////////////////////////////////////////////////////
    // queries for departments (main page)

    getDepartmentsReport: builder.query({
      query: () => ({
        url: "/departments/report",
        method: "get",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: "Departments", id: _id })),
              { type: "Departments", id: "LIST" },
            ]
          : [{ type: "Departments", id: "LIST" }],
    }),

    createDepartment: builder.mutation({
      query: (body) => ({
        url: "/departments",
        method: "post",
        data: body,
      }),
      invalidatesTags: (result) =>
        result ? [{ type: "Departments", id: "LIST" }] : [],
    }),

    editDepartment: builder.mutation({
      query: ({ departmentId, ...body }) => ({
        url: `/departments/${departmentId}`,
        method: "patch",
        data: body,
      }),
      invalidatesTags: (result, error, { departmentId }) =>
        result ? [{ type: "Departments", id: departmentId }] : [],
    }),

    deleteDepartment: builder.mutation({
      query: ({ departmentId }) => ({
        url: `/departments/${departmentId}`,
        method: "delete",
      }),
      invalidatesTags: (result) =>
        result ? [{ type: "Departments", id: "LIST" }] : [],
    }),

    editDepartmentProfileImage: builder.mutation({
      query: ({ departmentId, body }) => ({
        url: `/departments/${departmentId}/profile-image`,
        method: "patch",
        data: body,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
      invalidatesTags: (result, error, { departmentId }) =>
        result ? [{ type: "Departments", id: departmentId }] : [],
    }),

    deleteDepartmentProfileImage: builder.mutation({
      query: ({ departmentId }) => ({
        url: `/departments/${departmentId}/profile-image`,
        method: "delete",
      }),
      // it removes profile image of specific departmentId
      // so it invalidates specific tag id
      invalidatesTags: (result, error, { departmentId }) =>
        result ? [{ type: "Departments", id: departmentId }] : [],
    }),
  }),
});

export const {
  useGetChannelsQuery,
  useInvalidateChannelsMutation,
  useDeleteChannelMutation,
  useGetChannelByIdentifierQuery,
  useEditChannelMutation,
  useCreateChannelMutation,
  useGetMyOwnChannelsQuery,

  useGetUsersQuery,
  useInvalidateUsersMutation,
  useDeleteUserMutation,
  useGetUserByUsernameQuery,
  useEditUserMutation,
  useCreateUserMutation,

  useGetMessagesOfChannelQuery,
  useInvalidateMessagesMutation,
  useDeleteMessageMutation,
  useGetMessageQuery,
  useEditMessageMutation,
  useCreateMessageMutation,

  useGetUsersOfChannelQuery,

  useGetDepartmentsQuery,
  useGetSystemRolesQuery,
  useGetStudentPositionsQuery,
  useGetLecturerPositionsQuery,

  useLazyFindUsersByUsernamesQuery,
  useAddManyUsersToChannelMutation,
  useRemoveManyUsersFromChannelMutation,

  useAddManyUsersMutation,
  useEditManyUsersMutation,
  useDeleteManyUsersMutation,

  useGetDepartmentsReportQuery,
  useCreateDepartmentMutation,
  useEditDepartmentMutation,
  useDeleteDepartmentMutation,
  useEditDepartmentProfileImageMutation,
  useDeleteDepartmentProfileImageMutation,
} = apiSlice;
