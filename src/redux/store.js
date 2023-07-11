import {configureStore} from '@reduxjs/toolkit';

import {apiSlice} from './apiSlice';
import authReducer from './authSlice';
// import channelsReducer from './channelsSlice';
import filterConfigReducer from './filterConfigSlice';

export default configureStore({
    reducer: {
        [apiSlice.reducerPath]: apiSlice.reducer,  
        auth: authReducer,
        // channels: channelsReducer,
        filterConfig: filterConfigReducer,
    },
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware().concat(apiSlice.middleware)
});