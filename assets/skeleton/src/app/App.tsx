import React from 'react';
import { RouterProvider } from 'react-router/dom';

import AppProviders from './providers';
import { router } from './router';

const App: React.FC = () => (
  <AppProviders>
    <RouterProvider router={router} />
  </AppProviders>
);

export default App;
