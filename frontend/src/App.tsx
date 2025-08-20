import { Routes, Route, createBrowserRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import FormBuilder from './pages/FormBuilder'
import FormList from './pages/FormList'
import FormPreview from './pages/FormPreview'
import FormAnalytics from './pages/FormAnalytics'
import PublicForm from './pages/PublicForm'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'

// Create a client
const queryClient = new QueryClient()

// Create router with future flags
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "forms", element: <FormList /> },
      { path: "forms/new", element: <FormBuilder /> },
      { path: "forms/:id/edit", element: <FormBuilder /> },
      { path: "forms/:id/preview", element: <FormPreview /> },
      { path: "forms/:id/analytics", element: <FormAnalytics /> },
      { path: "analytics", element: <Analytics /> },
      { path: "settings", element: <Settings /> },
    ],
  },
  { path: "/form/:id", element: <PublicForm /> },
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <RouterProvider router={router} />
      </div>
    </QueryClientProvider>
  )
}

export default App
