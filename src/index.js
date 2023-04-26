import './index.scss';

import React from 'react';
import ReactDOM from 'react-dom/client';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';

import MainLayout from './pages/MainLayout';
import NotFoundPage from './pages/not-found/NotFoundPage';
import HomePage from './pages/home/HomePage';
import ChannelsPage from './pages/channels/ChannelsPage';
import UsersPage from './pages/users/UsersPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        path: '/',
        element: <HomePage />
      },
      {
        path: '/channels',
        element: <ChannelsPage />
      },
      {
        path: '/users',
        element: <UsersPage />
      },
    ]
  }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

