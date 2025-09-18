import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { IconInvoice } from '@tabler/icons-react'
import { useDispatch, useSelector } from 'react-redux'
import { Skeleton } from '@/components/ui/skeleton'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPurchaseOrders } from '@/stores/PurchaseOrderSlice'
import { getRewardPoints } from '@/stores/UserSlice'
import { useTheme } from '@/components/ThemeProvider'
import Can from '@/utils/can'

const UserReport = ({ fromDate, toDate }) => {
  const dispatch = useDispatch()
  const orders = useSelector((s) => s.purchaseOrder.orders) || []
  const loadingOrders = useSelector((s) => s.purchaseOrder.loading)

  const rewardPoints = useSelector((s) => s.user.rewardPoints)
  const loadingUser = useSelector((s) => s.user.loading)

  const { theme } = useTheme()
  const [systemPrefersDark, setSystemPrefersDark] = useState(
    window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches,
  )

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e) => setSystemPrefersDark(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const perms = JSON.parse(localStorage.getItem('permissionCodes')) || []
    const names = perms.map((p) => p.name)

    if (names.includes('purchase_order_view')) {
      const dateRange =
        fromDate && toDate ? { dateRange: { from: fromDate, to: toDate } } : {}
      dispatch(getPurchaseOrders({ ...dateRange, status: 'accepted' }))
    }

    if (names.includes('reward_point_overview_view')) {
      dispatch(getRewardPoints())
    }
  }, [dispatch, fromDate, toDate])

  const actualTheme = useMemo(() => {
    if (theme === 'system') return systemPrefersDark ? 'dark' : 'light'
    return theme
  }, [theme, systemPrefersDark])

  const lightColors = [
    { bg: 'bg-blue-50', text: 'text-blue-600' },
    { bg: 'bg-green-50', text: 'text-green-600' },
    { bg: 'bg-purple-50', text: 'text-purple-600' },
    { bg: 'bg-pink-50', text: 'text-pink-600' },
    { bg: 'bg-yellow-50', text: 'text-yellow-600' },
    { bg: 'bg-indigo-50', text: 'text-indigo-600' },
  ]
  const darkColors = [
    { bg: 'bg-blue-900', text: 'text-blue-300' },
    { bg: 'bg-green-900', text: 'text-green-300' },
    { bg: 'bg-purple-900', text: 'text-purple-300' },
    { bg: 'bg-pink-900', text: 'text-pink-300' },
    { bg: 'bg-yellow-900', text: 'text-yellow-300' },
    { bg: 'bg-indigo-900', text: 'text-indigo-300' },
  ]
  const themeColors = actualTheme === 'dark' ? darkColors : lightColors
  const cardHoverClass =
    actualTheme === 'dark' ? 'hover:bg-opacity-80' : 'hover:bg-opacity-70'
  const textTitleClass = actualTheme === 'dark' ? 'text-white' : 'text-gray-800'

  const formatCurrency = (n) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(n || 0)

  const totalOrders = orders.length
  const totalAmount = orders.reduce((s, o) => s + Number(o.totalAmount || 0), 0)
  const cntPending = orders.filter((o) => o.status === 'pending').length
  const cntAccepted = orders.filter((o) => o.status === 'accepted').length
  const cntRejected = orders.filter((o) => o.status === 'rejected').length

  return (
    <div className="space-y-6">
      {/* Thống kê đơn mua */}
      <Can permission="purchase_order_view">
        <h2 className={`mt-6 text-xl font-semibold ${textTitleClass}`}>
          Thống kê đơn mua
        </h2>

        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {/* Tổng đơn mua */}
          <Card
            className={`${themeColors[0]?.bg} ${cardHoverClass} transition-all duration-200`}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Tổng đơn mua
              </CardTitle>
              <div className="h-4 w-4">
                <IconInvoice className={`h-4 w-4 ${themeColors[0]?.text}`} />
              </div>
            </CardHeader>
            <Link to="/purchase-order">
              <CardContent>
                {loadingOrders ? (
                  <Skeleton className="h-[20px] w-full rounded-md" />
                ) : (
                  <div className="text-2xl font-bold">{totalOrders}</div>
                )}
              </CardContent>
            </Link>
          </Card>

          {/* Tổng giá trị */}
          <Card
            className={`${themeColors[1]?.bg} ${cardHoverClass} transition-all duration-200`}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Tổng giá trị mua
              </CardTitle>
              <div className="h-4 w-4">
                <IconInvoice className={`h-4 w-4 ${themeColors[1]?.text}`} />
              </div>
            </CardHeader>
            <Link to="/purchase-order-report">
              <CardContent>
                {loadingOrders ? (
                  <Skeleton className="h-[20px] w-full rounded-md" />
                ) : (
                  <div className="text-2xl font-bold">
                    {formatCurrency(totalAmount)}
                  </div>
                )}
              </CardContent>
            </Link>
          </Card>

          {/* Chờ xác nhận */}
          <Card
            className={`${themeColors[2]?.bg} ${cardHoverClass} transition-all duration-200`}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Chờ xác nhận
              </CardTitle>
              <div className="h-4 w-4">
                <IconInvoice className={`h-4 w-4 ${themeColors[2]?.text}`} />
              </div>
            </CardHeader>
            <Link to="/purchase-order?status=pending">
              <CardContent>
                {loadingOrders ? (
                  <Skeleton className="h-[20px] w-full rounded-md" />
                ) : (
                  <div className="text-2xl font-bold">{cntPending}</div>
                )}
              </CardContent>
            </Link>
          </Card>

          {/* Đã xác nhận */}
          <Card
            className={`${themeColors[3]?.bg} ${cardHoverClass} transition-all duration-200`}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Đã xác nhận</CardTitle>
              <div className="h-4 w-4">
                <IconInvoice className={`h-4 w-4 ${themeColors[3]?.text}`} />
              </div>
            </CardHeader>
            <Link to="/purchase-order?status=accepted">
              <CardContent>
                {loadingOrders ? (
                  <Skeleton className="h-[20px] w-full rounded-md" />
                ) : (
                  <div className="text-2xl font-bold">{cntAccepted}</div>
                )}
              </CardContent>
            </Link>
          </Card>

          {/* Đã từ chối */}
          <Card
            className={`${themeColors[4]?.bg} ${cardHoverClass} transition-all duration-200`}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Đã từ chối</CardTitle>
              <div className="h-4 w-4">
                <IconInvoice className={`h-4 w-4 ${themeColors[4]?.text}`} />
              </div>
            </CardHeader>
            <Link to="/purchase-order?status=rejected">
              <CardContent>
                {loadingOrders ? (
                  <Skeleton className="h-[20px] w-full rounded-md" />
                ) : (
                  <div className="text-2xl font-bold">{cntRejected}</div>
                )}
              </CardContent>
            </Link>
          </Card>
        </div>
      </Can>

      {/* Điểm thưởng */}
      <Can permission="reward_point_overview_view">
        <h2 className={`mt-6 text-xl font-semibold ${textTitleClass}`}>
          Điểm thưởng
        </h2>
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <Card
            className={`${themeColors[5]?.bg} ${cardHoverClass} transition-all duration-200`}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Điểm thưởng</CardTitle>
              <div className="h-4 w-4">
                <IconInvoice className={`h-4 w-4 ${themeColors[5]?.text}`} />
              </div>
            </CardHeader>
            <Link to="/reward-point-histories">
              <CardContent>
                {loadingUser ? (
                  <Skeleton className="h-[20px] w-full rounded-md" />
                ) : (
                  <div className="text-2xl font-bold">{rewardPoints}</div>
                )}
              </CardContent>
            </Link>
          </Card>
        </div>
      </Can>
    </div>
  )
}

export default UserReport
