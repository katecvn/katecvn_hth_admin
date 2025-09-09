import { Route, Routes } from 'react-router-dom'
import routes from './routes'
import RequireAuth from './hocs/RequireAuth'
import { useEffect } from 'react'
import { useTheme } from './components/ThemeProvider'
const App = () => {
  const { theme } = useTheme()

  useEffect(() => {
    document.body.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <Routes>
      {routes.map((route, index) => (
        <Route key={index} path={route.path} element={<route.layout />}>
          <Route
            {...route}
            element={
              <RequireAuth component={route.element} path={route.path} />
            }
          />
        </Route>
      ))}
    </Routes>
  )
}

export default App
