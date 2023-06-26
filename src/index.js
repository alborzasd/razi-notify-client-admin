import './index.scss';

import React from 'react';
import ReactDOM from 'react-dom/client';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';

import store from './redux/store';
import { Provider } from 'react-redux';

import CustomToastContainer from './components/shared/CustomToastContainer';

import App from './App';
import LoginPage from './pages/login/LoginPage';
import MainLayout from './pages/MainLayout';
import NotFoundPage from './pages/not-found/NotFoundPage';
import HomePage from './pages/home/HomePage';
import ChannelsPage from './pages/channels/ChannelsPage';
import ChannelDetailsPage from './pages/channels/details/ChannelDetailsPage';
import UsersPage from './pages/users/UsersPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFoundPage />,
    children: [

      {
        path: '/login',
        element: <LoginPage />
      },
      {
        path: '/',
        element: <MainLayout />,
        children: [
          {
            path: '/',
            element: <HomePage />
          },
          {
            path: '/channels',
            element: <ChannelsPage />,
          },
          {
            path: '/channels/:identifier',
            element: <ChannelDetailsPage />
          },
          {
            path: '/users',
            element: <UsersPage />
          },
        ]
      }

    ]
  }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
    <CustomToastContainer />
    </>
);

