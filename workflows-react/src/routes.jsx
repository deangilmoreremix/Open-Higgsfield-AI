import { createBrowserRouter, RouterProvider, Route, Navigate } from 'react-router-dom';
import { WorkflowProvider } from './context/WorkflowContext';

import WorkflowsPage from './pages/WorkflowsPage';
import WorkflowBuilderPage from './pages/WorkflowBuilderPage';
import TemplatesPage from './pages/TemplatesPage';
import AppShell from './components/AppShell';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <Navigate to="/workflows" replace />,
      },
      {
        path: 'workflows',
        element: <WorkflowsPage />,
      },
      {
        path: 'workflows/new',
        element: <WorkflowBuilderPage />,
      },
      {
        path: 'workflows/:id',
        element: <WorkflowBuilderPage />,
      },
      {
        path: 'workflows/:id/:tab',
        element: <WorkflowBuilderPage />,
      },
      {
        path: 'templates',
        element: <TemplatesPage />,
      },
    ],
  },
]);

export default function Routes() {
  return (
    <WorkflowProvider>
      <RouterProvider router={router} />
    </WorkflowProvider>
  );
}