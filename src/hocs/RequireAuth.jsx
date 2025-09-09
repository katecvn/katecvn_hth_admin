import ErrorPage from '@/views/error/ErrorPage'
import { Navigate } from 'react-router-dom'

const publicRoutes = [
  '/',
  '/forgot-password',
  '/reset-password',
  '/auth/google/callback',
  '*',
]

const privateRoutes = {
  '/dashboard': [],
  '/user': ['GET_USER'],
  '/product': ['GET_PRODUCT'],
  '/tax': ['GET_TAX'],
  '/category': ['GET_CATEGORY'],
  '/school': ['GET_SCHOOL'],
  '/school-user': ['GET_SCHOOL_USER'],
  '/supplier': ['GET_SUPPLIER'],
  '/unit': ['GET_UNIT'],
  '/receipt': ['GET_RECEIPT'],
  '/receipt-user': ['GET_RECEIPT_USER'],
  '/setting': '',
  '/setting/general-information': ['GENERAL_SETTING'],
  '/setting/sharing-ratio': ['SHARING_RATIO_SETTING'],
  '/setting/system-information': ['SYSTEM_SETTING'],
  '/setting/access-log': ['SESSION_SETTING'],
  '/setting/notification': ['NOTIFICATION_SETTING'],
  '/setting/business-plan': [],
  '/revenue': [],
}

const RequireAuth = ({ component: Component, path, ...rest }) => {
  const isLoggedIn = !!localStorage.getItem('accessToken')
  const isPublicRoute = publicRoutes.includes(path)
  const userPermissions =
    JSON.parse(localStorage.getItem('permissionCodes')) || []

  if (!path) {
    return <Navigate to="/" />
  }

  const requiredPermissions = privateRoutes[path] || []
  if (!isPublicRoute && !isLoggedIn) {
    return <Navigate to="/" />
  }

  if (
    hasSufficientPermissions(userPermissions, requiredPermissions) ||
    isPublicRoute
  ) {
    return <Component {...rest} />
  }

  return (
    <ErrorPage
      code={403}
      message={'Từ chối truy cập'}
      description={'Opps!!! Có vẻ bạn đang cố truy cập tài nguyên trái phép 🙄'}
    />
  )
}

const hasSufficientPermissions = (userPermissions, requiredPermissions) => {
  return true
  // if (!Array.isArray(requiredPermissions)) {
  //   return false
  // }

  // return requiredPermissions.every((permission) =>
  //   userPermissions.includes(permission),
  // )
}

export default RequireAuth
