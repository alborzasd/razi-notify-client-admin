// import {
//     createSlice,
//     createAsyncThunk,
//     createSelector,
//     createEntityAdapter
// } from '@reduxjs/toolkit';

// import api from '../axios/api';
// import { errorMessages } from '../config';
// import { paginate } from '../utilities/utilities';

// export const statusEnum = {
//     INIT: 'INIT',
//     LOADING: 'LOADING',
//     SUCCESS: 'SUCCESS',
//     FAILED: 'FAILED'
// }

// const channelsAdapter = createEntityAdapter({
//     selectId: (channel) => channel._id,
//     // sortComparer: (a, b) => a.createdAt.localeCompare(b.createdAt)
// });

// const initialState = channelsAdapter.getInitialState({
//     status: statusEnum.INIT,
//     error: null,
//     // after fetch all data by selector. we pass the data to filter callback that is generated by user inputs
//     filterCallback: null,
//     // configure pagination options (which page to show, how many results per page, ...)
//     paginationCongif: {
//         pageNum: 1,
//         pageSize: 10,
//     }
// });

// export const fetchChannels = createAsyncThunk('channels/fetchChannels', async(_, {rejectWithValue}) => {
//     try {
//         const response = await api.get('/channels');
//         return response.data?.data;
//     }
//     catch(err) {
//         console.log(err);
//         const response = err.response;
//         if(response){
//             let message = `خطای ${response.status} از سمت سرور`;
//             if(response.data?.error?.message){
//                 message += ' ( ' + response.data.error.message + ' ) ';
//             }
//             throw new Error(message);
//         }
//         else if(err.request){
//             throw new Error(errorMessages.networkError);
//         }
//         else{
//             throw new Error(errorMessages.internalAppError);
//         }
//     }
// });

// const channelsSlice = createSlice({
//     name: 'channels',
//     initialState,
//     reducers: {
//         filterCallbackUpdated(state, action) {
//             state.filterCallback = action.payload;
//         },
//         pageNumUpdated(state, action) {
//             const {pageNum, maxValidPage} = action.payload;
//             if(pageNum >= 1 && pageNum <= maxValidPage) {
//                 state.paginationCongif.pageNum = pageNum;
//             }
//         },
//         pageSizeUpdated(state, action) {
//             const pageSize = action.payload;
//             if(pageSize >= 1) {
//                 state.paginationCongif.pageSize = pageSize;
//             }
//             // reset current page number
//             state.paginationCongif.pageNum = 1;
//         }
//     },
//     extraReducers(builder) {
//         builder
//             .addCase(fetchChannels.pending, (state, action) => {
//                 state.status = statusEnum.LOADING;
//             })
//             .addCase(fetchChannels.fulfilled, (state, action) => {
//                 // console.log(action);
//                 state.status = statusEnum.SUCCESS;
//                 channelsAdapter.setAll(state, action.payload); // also you can pass action
//             })
//             .addCase(fetchChannels.rejected, (state, action) => {
//                 state.status = statusEnum.FAILED;
//                 if(action.payload) {
//                     state.error = action.payload;
//                 }
//                 else {
//                     state.error = action.error;
//                 }
//             });
//     }
// });

// export const {
//     filterCallbackUpdated,
//     pageNumUpdated,
//     pageSizeUpdated
// } = channelsSlice.actions

// export default channelsSlice.reducer;

// export const {
//     selectAll: selectAllChannels,
//     selectById: selectChannelById,
//     selectIds: selectChannelIds
// } = channelsAdapter.getSelectors(state => state.channels);

// export const selectFilterCallback = (state) => state.channels.filterCallback;
// export const selectPaginationConfig = (state) => state.channels.paginationCongif;
// export const selectLoadingStatus = (state) => state.channels.status;
// export const selectError = (state) => state.channels.error;

// export const selectFilteredChannels = createSelector(
//     selectAllChannels,
//     selectFilterCallback,
//     (channels, filterCallback) => {
//         let result = filterCallback ? channels.filter(filterCallback) : channels;
//         result = result.map((item, index) => ({...item, rowNum: index+1}));
//         return result;
//     }
// );

// export const selectPaginatedChannels = createSelector(
//     selectFilteredChannels,
//     selectPaginationConfig,
//     (channels, config) => {
//         return paginate(channels, config.pageSize, config.pageNum);
//     }
// );

// export const selectCurrentPaginationInfo = createSelector(
//     selectFilteredChannels,
//     selectPaginationConfig,
//     (channels, config) => {
//         return {
//             currentPage: config.pageNum,
//             resultsPerPage: config.pageSize,
//             resultCount: channels.length,
//             pageCount: Math.ceil(channels.length / config.pageSize),
//             resultRange: {
//                 start: (config.pageNum-1)*(config.pageSize) + 1,
//                 end: Math.min((config.pageNum)*(config.pageSize), channels.length)
//             }
//         }
//     }
// );

export const transformResponseForGetChannels = (response, _, filterConfig) => {
    // console.log('arg', filterConfig);
    // console.log(response);
    const {pageNum, pageSize, totalCount} = response.meta;
    const entitiesCount = response.entities.length;
    // if user wants second page of entities with pageSize=10
    // server skips first 10 and returns entities with index:10 to index:19 (index from 0)
    // the offset must be (2-1)*10+1 = 11
    // so when mapping response entities to assign them rowNumber
    // the rowNumber range will be 11 to 20
    const offset = (pageNum - 1) * pageSize + 1;
    // this range will be shown in table footer
    const rowNumberRange = [offset, offset + entitiesCount - 1];
    const totalPageCount = 
        pageSize === 0 ? 
            1 // pageSize: 0 means get all entites in one page 
            : Math.ceil(totalCount / pageSize);
    response.meta = {
        ...response.meta,
        rowNumberRange,
        totalPageCount,
        entitiesCount,
    }
    response.entities = response.entities.map((entity, index) => {
        entity.rowNum = index + offset;
        return entity;
    });
    return response;
}
