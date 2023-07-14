import { createSlice, createSelector } from "@reduxjs/toolkit";

import { tableInstanceNames } from "./tableInstances";

// 'tempUsers' table does not need filter config
// the purpose of this table is to gather filtered data from 'allUSers' table
// with filter it would be a filter of filter !
const initialState = {
  instances: {
    [tableInstanceNames.channels]: {
      searchField: "title", // send to server
      displaySearchField: "نام کانال", // display in ui
      searchValue: "", // send to server
      displaySearchValue: "", // display in ui
      myChannels: true,
      pageNum: 1,
      pageSize: 10,
    },

    [tableInstanceNames.allUsers]: {
      searchField: "username",
      displaySearchField: "نام کاربری",
      searchValue: "",
      displaySearchValue: "",
      pageNum: 1,
      pageSize: 10,
    },

    [tableInstanceNames.usersOfChannel]: {
      // channel details page sends a query to fetch channel by 'identifier'
      // if successful, the '_id' of result is dispatched here to 'channelId'
      // query hook should be skipped if channelId is not defined
      channelId: null,
      searchField: "",
      displaySearchField: "",
      searchValue: "",
      displaySearchValue: "",
      pageNum: 1,
      pageSize: 10,
    },

    [tableInstanceNames.messagesOfChannel]: {
      // channel details page sends a query to fetch channel by 'identifier'
      // if successful, the '_id' of result is dispatched here to 'channelId'
      // query hook should be skipped if channelId is not defined
      channelId: null,
      searchField: "",
      displaySearchField: "",
      searchValue: "",
      displaySearchValue: "",
      pageNum: 1,
      pageSize: 10,
    },

    // may be used later
    // for client side pagination
    [tableInstanceNames.tempUsers]: {
      pageNum: 1,
      pageSize: 10
    }
  },
};

const filterConfigSlice = createSlice({
  name: "filterConfig",
  initialState,
  reducers: {
    // we will reset page number to 1 on every filter change
    setFilterConfig(state, action) {
      const { instanceName, config } = action.payload;
      const currentConfig = state.instances[instanceName];
      if (currentConfig) {
        Object.assign(currentConfig, config);
        currentConfig.pageNum = 1;
      }
    },
    setPageNum(state, action) {
      const { instanceName, pageNum } = action.payload;
      const currentConfig = state.instances[instanceName];
      if (currentConfig) {
        currentConfig.pageNum = pageNum;
      }
    },
  },
});

export const { setFilterConfig, setPageNum } = filterConfigSlice.actions;

export default filterConfigSlice.reducer;

export const selectFilterConfigInstace = (state, instanceName) =>
  state.filterConfig.instances[instanceName];

// channels table selectors
export const selectMyChannelsFilterEnabled = createSelector(
  (state) => selectFilterConfigInstace(state, tableInstanceNames.channels),
  (channelsFilterConfig) => channelsFilterConfig.myChannels
);

export const selectChannelsFilterConfig = createSelector(
  (state) => selectFilterConfigInstace(state, tableInstanceNames.channels),
  (channelsFilterConfig) => channelsFilterConfig
);

// allUsers table selectors
export const selectAllUsersFilterConfig = createSelector(
  (state) => selectFilterConfigInstace(state, tableInstanceNames.allUsers),
  (allUsersFilterConfig) => allUsersFilterConfig
);

// usersOfChannel table selectors
export const selectUsersOfChannelFilterConfig = createSelector(
  (state) => selectFilterConfigInstace(state, tableInstanceNames.usersOfChannel),
  (usersOfChannelFilterConfig) => usersOfChannelFilterConfig
);

// messagesOfChannel table selectors
export const selectMessagesOfChannelFilterConfig = createSelector(
  (state) =>
    selectFilterConfigInstace(state, tableInstanceNames.messagesOfChannel),
  (messagesOfChannelFilterConfig) => messagesOfChannelFilterConfig
);

// tempUsers table selectors
export const selectTempUsersFilterConfig = createSelector(
  (state) => selectFilterConfigInstace(state, tableInstanceNames.tempUsers),
  (tempUsersFilterConfig) => tempUsersFilterConfig
);
