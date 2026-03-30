import { createHashRouter, RouterProvider } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { ProfilesPage } from './pages/ProfilesPage'
import { EditorPage } from './pages/EditorPage'
import { SettingsPage } from './pages/SettingsPage'

const router = createHashRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <ProfilesPage /> },
      { path: 'editor/:profileId', element: <EditorPage /> },
      { path: 'settings', element: <SettingsPage /> }
    ]
  }
])

export default function App() {
  return <RouterProvider router={router} />
}
