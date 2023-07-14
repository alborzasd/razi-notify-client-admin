import {
  createSlice,
  createAsyncThunk,
  createSelector,
  createEntityAdapter,
} from "@reduxjs/toolkit";

import { useSelector } from "react-redux";

const tempUsersAdapter = createEntityAdapter({
  selectId: (tempUser) => tempUser._id,
});

const initialState = tempUsersAdapter.getInitialState();

const tempUsersSlice = createSlice({
  name: "tempUsers",
  initialState,
  reducers: {
    addUserToTempUsersTable(state, action) {
      const user = action.payload;
      tempUsersAdapter.addOne(state, user);
    },
    addManyUsersToTempUsersTable(state, action) {
      const users = action.payload;
      tempUsersAdapter.addMany(state, users);
    },
    removeUserIdFromTempUsersTable(state, action) {
      const id = action.payload;
      tempUsersAdapter.removeOne(state, id);
    },
    clearTempUsersTable(state) {
      tempUsersAdapter.removeAll(state);
    },
  },
});

export const {
  addUserToTempUsersTable,
  addManyUsersToTempUsersTable,
  removeUserIdFromTempUsersTable,
  clearTempUsersTable,
} = tempUsersSlice.actions;

export default tempUsersSlice.reducer;

export const {
  selectAll: selectAllTempUsers,
  selectById: selectTempUserById,
  selectIds: selectTempUsersIds,
} = tempUsersAdapter.getSelectors((state) => state.tempUsers);

// data table expects query hook to fetch data
// we create this memoized selector that returns a result
// similar to what the query hook returns
// for example returns temp users in the data field of result
// and also isLoading, isFetching always false
// because this selector gets data from local store, not from server
// this selector also attaches a rowNum field to data entities
// that rowNum is dependent to the order of addind data to tempUsers table
export const selectAllTempUsersQuery = createSelector(
  selectAllTempUsers,
  (tempUsers) => {
    const result = {
      isLoading: false,
      isFetching: false,
      isSuccess: true,
      error: null,
      data: {
        entities: [],
        meta: {},
      },
    };

    result.data.entities = tempUsers.map((tempUser, index) => {
      const copy = { ...tempUser, rowNum: index + 1 };
      return copy;
    });

    return result;
  }
);

// data table will call this as a query hook
// it will also pass the filterConfig and skip option to this callback
// but they are ignored here
// this function returns whatever the useSelector returns
// and acts like a query hook but every time result is successful and data is came from
// local redux state
export const useSelectAllTempUsersQuery = () =>
  useSelector(selectAllTempUsersQuery);

// is used for the action button that adds a user to temp users table
// if this selector returns true,
// a color will be set to the add button icon (instead of gray)
export const selectIsUserIdInsideTempUsers = createSelector(
  selectTempUserById,
  (tempUser) => Boolean(tempUser)
);

// is used by the link menu item that refers to temp-users page
export const selectTempUsersCount = createSelector(
  selectAllTempUsers,
  (tempUsers) => tempUsers?.length ?? 0
);

// select all temp users to send to the server
// for adding or removing from a channel members
// partial object of each user is selected
// the partial contains '_id', 'username', 'fullname'
export const selectAllTempUsersToChangeMembership = createSelector(
  selectAllTempUsers,
  (tempUsers) =>
    tempUsers.map(({ _id, username, first_name, last_name }) => ({
      _id,
      username,
      fullname: `${first_name} ${last_name}`,
    }))
);
