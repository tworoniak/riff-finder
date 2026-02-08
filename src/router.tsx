import { createBrowserRouter } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import HomePage from './pages/HomePage';
import ArtistPage from './pages/ArtistPage';
import DiscoverPage from './pages/DiscoverPage';
import NotFoundPage from './pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'artist/:id', element: <ArtistPage /> },
      { path: 'discover', element: <DiscoverPage /> },
    ],
  },
]);
