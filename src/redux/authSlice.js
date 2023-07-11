import {
  createSlice,
  createAsyncThunk,
  createSelector,
} from "@reduxjs/toolkit";
import api from "../axios/api";

import { errorMessages } from "../config";

export const statusEnum = {
  INIT: "INIT",
  // checking authentication status with sending a request to /auth/info
  // if there was a cookie with request (user has logged in before),
  //  server responds with user info. go to state LOGGED_IN
  // if there was not cookie, server responds with 401. go to state LOGGED_OUT
  // if whehter there was a cookie or not but network has problems. go to state INITIAL_FAIL
  CHECKING_AUTH: "CHECKING_AUTH",
  INITIAL_FAIL: "INITIAL_FAIL",
  LOGGED_OUT: "LOGGED_OUT",
  // logging in. if successful go to state LOGGED_IN. else go to state FAILED
  LOADING: "LOADING",
  LOGGED_IN: "LOGGED_IN",
  FAILED: "FAILED",
};

const initialState = {
  status: statusEnum.INIT,
  error: null,
  userInfo: null,
  // separate autoLoginError from login error
  // because we dont want show error message in login page when autoLogin fails
  autoLoginError: null,
};

export const login = createAsyncThunk(
  "auth/login",
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/login", { username, password });
      // console.log(response);
      return response.data?.data?.user;
    } catch (err) {
      console.log(err);
      const response = err.response;
      if (response) {
        // username or password is wrong
        if (response.status >= 400 && response.status < 500) {
          return rejectWithValue({
            message: "خطای احراز هویت",
            username: response.data?.error?.username,
            password: response.data?.error?.password,
          });
        } else if (response.status >= 500) {
          throw new Error(errorMessages.internalServerError);
        } else {
          throw err; // just serialize error and assign to action.error
        }
      } else if (err.request) {
        throw new Error(errorMessages.networkError);
      } else {
        throw new Error(errorMessages.internalAppError);
      }
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/auth/logout");
      // console.log(response);
      return response.data; // return value does not matter here
    } catch (err) {
      console.log(err);
      const response = err.response;
      if (response) {
        if (response.status === 401) {
          // User has logout before, cookie deleted manually, or cookie expired.
          return response.data;
        }
        throw new Error(`خطای ${response.status} از سمت سرور.`);
      } else if (err.request) {
        throw new Error(errorMessages.networkError);
      } else {
        throw new Error(errorMessages.internalAppError);
      }
    }
  }
);

// initialize auth slice in index.js if there is already a cookie saved in browser
// but if not, user has to send his credentials in login page
export const autoLogin = createAsyncThunk(
  "auth/autoLogin",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/auth/info");
      // console.log(response);
      return response.data?.data?.user;
    } catch (err) {
      console.log(err);
      const response = err.response;
      if (response) {
        if (response.status === 401) {
          return rejectWithValue({
            message: "Not Authorized",
            statusCode: 401,
          });
        } else if (response.status >= 500) {
          throw new Error(errorMessages.internalServerError);
        } else {
          throw err;
        }
      } else if (err.request) {
        throw new Error(errorMessages.networkError);
      } else {
        throw new Error(errorMessages.internalAppError);
      }
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      // autoLogin actions
      .addCase(autoLogin.pending, (state, action) => {
        state.status = statusEnum.CHECKING_AUTH;
      })
      .addCase(autoLogin.fulfilled, (state, action) => {
        state.status = statusEnum.LOGGED_IN;
        state.userInfo = action.payload;
      })
      .addCase(autoLogin.rejected, (state, action) => {
        if (action.payload?.statusCode === 401) {
          state.autoLoginError = action.payload;
          state.status = statusEnum.LOGGED_OUT;
        } else {
          state.autoLoginError = action.error;
          state.status = statusEnum.INITIAL_FAIL;
        }
      })
      // login actions
      .addCase(login.pending, (state) => {
        state.status = statusEnum.LOADING;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = statusEnum.LOGGED_IN;
        state.error = null;
        state.userInfo = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        // console.log(action);
        state.status = statusEnum.FAILED;
        if (action.payload) {
          state.error = action.payload;
        } else {
          state.error = action.error;
        }
      })
      // logout action
      .addCase(logout.fulfilled, (state) => {
        state.status = statusEnum.LOGGED_OUT;
        state.userInfo = null;
      });
  },
});

// export const {...} = authSlice.actions

export default authSlice.reducer;

// selectors
export const selectUserInfo = (state) => state.auth.userInfo;

// returns a boolean to show if channel blongs to user id or not
export const selectIsChannelForUser = createSelector(
  selectUserInfo,
  (state, channelOwnerId) => channelOwnerId,
  (userInfo, channelOwnerId) => userInfo._id === channelOwnerId
);
export const selectIsUserRootAdmin = createSelector(
  selectUserInfo,
  (userInfo) => userInfo?.system_role === "root_admin"
);
// returns true if current user is the owner of channel or is root_admin
// takes global state and channelOwnerId (channel.owner_id)
export const canUserModifyChannel = createSelector(
  (state, channelOwnerId) => selectIsChannelForUser(state, channelOwnerId),
  selectIsUserRootAdmin,
  (isChannelForUser, isUserRootAdmin) => isChannelForUser || isUserRootAdmin
);

// later we add department admin that can only modify users from same department
// root_admin can modify any other
export const canCurrentUserModifyThisUser = createSelector(
  selectUserInfo, // current user
  (state, user) => user, // other user
  (currentUser, thisUser) =>
    currentUser?.system_role === "root_admin" ||
    (currentUser?.system_role === "department_admin" &&
      currentUser?.department_id === thisUser?.department_id)
);
