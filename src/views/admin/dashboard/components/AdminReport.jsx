import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  IconInvoice,
  IconNews,
  IconUsersGroup,
  IconAddressBook,
  IconMailOpened,
  IconMessageDots,
  IconCheck,
} from '@tabler/icons-react'
import { useDispatch, useSelector } from 'react-redux'
import { Skeleton } from '@/components/ui/skeleton'
import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getPost } from '@/stores/PostSlice'
import { getUsers } from '@/stores/UserSlice'
import { getContact } from '@/stores/ContactSlice'
import { getCustomerGroup } from '@/stores/CustomerGroupSlice'
import { getInvoice, getSalesSummary  } from '@/stores/InvoiceSlice'
import { useTheme } from '@/components/ThemeProvider'
import Can from '@/utils/can'

const AdminReport = ({ fromDate, toDate }) => {
  const loadingPost = useSelector((state) => state.post.loading)
  const posts = useSelector((state) => state.post.posts)
  const contacts = useSelector((state) => state.contact.contacts)
  const groups = useSelector((state) => state.customerGroup.customerGroups) || []
  const invoices = useSelector((state) => state.invoice.invoices) || []
  const summaryInvoices = useSelector((state) => state.invoice.summary) || []

  const loadingGroups = useSelector((state) => state.customerGroup.loading)
  const loadingInvoices = useSelector((state) => state.invoice.loading)
  const dispatch = useDispatch()
  const { theme } = useTheme()
  const [usedColorIndices, setUsedColorIndices] = useState([])
  const [systemPrefersDark, setSystemPrefersDark] = useState(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches,
  )
  const [admins, setAdmins] = useState([])
  const [customers, setCustomers] = useState([])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e) => setSystemPrefersDark(e.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const actualTheme = useMemo(() => {
    if (theme === 'system') return systemPrefersDark ? 'dark' : 'light'
    return theme
  }, [theme, systemPrefersDark])

  const lightColors = [
    { bg: 'bg-blue-50', text: 'text-blue-600', name: 'blue' },
    { bg: 'bg-green-50', text: 'text-green-600', name: 'green' },
    { bg: 'bg-purple-50', text: 'text-purple-600', name: 'purple' },
    { bg: 'bg-pink-50', text: 'text-pink-600', name: 'pink' },
    { bg: 'bg-yellow-50', text: 'text-yellow-600', name: 'yellow' },
    { bg: 'bg-indigo-50', text: 'text-indigo-600', name: 'indigo' },
    { bg: 'bg-rose-50', text: 'text-rose-600', name: 'rose' },
    { bg: 'bg-cyan-50', text: 'text-cyan-600', name: 'cyan' },
    { bg: 'bg-emerald-50', text: 'text-emerald-600', name: 'emerald' },
    { bg: 'bg-orange-50', text: 'text-orange-600', name: 'orange' },
    { bg: 'bg-teal-50', text: 'text-teal-600', name: 'teal' },
  ]
  const darkColors = [
    { bg: 'bg-blue-900', text: 'text-blue-300', name: 'blue' },
    { bg: 'bg-green-900', text: 'text-green-300', name: 'green' },
    { bg: 'bg-purple-900', text: 'text-purple-300', name: 'purple' },
    { bg: 'bg-pink-900', text: 'text-pink-300', name: 'pink' },
    { bg: 'bg-yellow-900', text: 'text-yellow-300', name: 'yellow' },
    { bg: 'bg-indigo-900', text: 'text-indigo-300', name: 'indigo' },
    { bg: 'bg-rose-900', text: 'text-rose-300', name: 'rose' },
    { bg: 'bg-cyan-900', text: 'text-cyan-300', name: 'cyan' },
    { bg: 'bg-emerald-900', text: 'text-emerald-300', name: 'emerald' },
    { bg: 'bg-orange-900', text: 'text-orange-300', name: 'orange' },
    { bg: 'bg-teal-900', text: 'text-teal-300', name: 'teal' },
  ]
  const themeColors = actualTheme === 'dark' ? darkColors : lightColors

  const getUniqueRandomColor = (lastColorIndex = -1) => {
    let availableIndices = Array.from({ length: themeColors.length }, (_, i) => i).filter(
      (i) => !usedColorIndices.includes(i) && i !== lastColorIndex,
    )
    if (availableIndices.length === 0) {
      availableIndices = Array.from({ length: themeColors.length }, (_, i) => i).filter(
        (i) => i !== lastColorIndex,
      )
    }
    const randomIndex = Math.floor(Math.random() * availableIndices.length)
    const selectedIndex = availableIndices[randomIndex]
    setUsedColorIndices((prev) => {
      const updated = [...prev, selectedIndex]
      return updated.length > 6 ? updated.slice(-6) : updated
    })
    return themeColors[selectedIndex]
  }

  const postColors = useMemo(() => {
    const colors = []
    let lastIndex = -1
    for (let i = 0; i < 5; i++) {
      const color = getUniqueRandomColor(lastIndex)
      colors.push(color)
      lastIndex = themeColors.findIndex((c) => c.name === color.name)
    }
    return colors
  }, [actualTheme])

  const contactColors = useMemo(() => {
    const colors = []
    let lastIndex = -1
    for (let i = 0; i < 4; i++) {
      const color = getUniqueRandomColor(lastIndex)
      colors.push(color)
      lastIndex = themeColors.findIndex((c) => c.name === color.name)
    }
    return colors
  }, [actualTheme])

  const userColors = useMemo(() => {
    const colors = []
    let lastIndex = -1
    for (let i = 0; i < 3; i++) {
      const color = getUniqueRandomColor(lastIndex)
      colors.push(color)
      lastIndex = themeColors.findIndex((c) => c.name === color.name)
    }
    return colors
  }, [actualTheme])

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0)

  useEffect(() => {
    const perms = JSON.parse(localStorage.getItem('permissionCodes')) || []
    const names = perms.map((p) => p.name)
    if (names.includes('post_view')) dispatch(getPost())
    if (names.includes('user_view')) {
      dispatch(getUsers({ type: 'admin' }))
        .unwrap()
        .then((res) => setAdmins(res.users || []))
        .catch(() => {})
      dispatch(getUsers({ type: 'customer' }))
        .unwrap()
        .then((res) => setCustomers(res.users || []))
        .catch(() => {})
    }
    if (names.includes('contact_view')) dispatch(getContact())
    if (names.includes('customer_group_view')) dispatch(getCustomerGroup())
    if (names.includes('order_view')) dispatch(getInvoice())
    if (names.includes('order_view')) {
      dispatch(getInvoice())
      dispatch(getSalesSummary({ status: 'accepted' }))
    }
  }, [dispatch])

  const textTitleClass = actualTheme === 'dark' ? 'text-white' : 'text-gray-800'
  const cardHoverClass = actualTheme === 'dark' ? 'hover:bg-opacity-80' : 'hover:bg-opacity-70'

  const customerGroupCounts = useMemo(() => {
    const map = new Map()
    customers.forEach((c) => {
      const gid = c.customerGroupId || 'ungrouped'
      map.set(gid, (map.get(gid) || 0) + 1)
    })
    return map
  }, [customers])

  const ungroupedCount = customerGroupCounts.get('ungrouped') || 0

  const totalSalesOrders = invoices.length
  const totalSalesAmount = summaryInvoices.reduce((sum, p) => sum + Number(p.totalAmount || 0), 0)

  return (
    <div className="space-y-6">
      <Can permission="post_view">
        <h2 className={`text-xl font-semibold ${textTitleClass}`}>Thống kê bài viết</h2>
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
          <Card className={`${postColors[0]?.bg} ${cardHoverClass} transition-all duration-200`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tổng bài viết</CardTitle>
              <div className="h-4 w-4" title="Tổng số bài viết">
                <IconNews className={`h-4 w-4 ${postColors[0]?.text}`} />
              </div>
            </CardHeader>
            <Link to="/post">
              <CardContent>
                {loadingPost ? (
                  <Skeleton className="h-[20px] w-full rounded-md" />
                ) : (
                  <div className="text-2xl font-bold">{posts?.length || 0}</div>
                )}
              </CardContent>
            </Link>
          </Card>

          <Card className={`${postColors[1]?.bg} ${cardHoverClass} transition-all duration-200`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Bài viết đã duyệt</CardTitle>
              <div className="h-4 w-4" title="Bài viết đã duyệt">
                <IconCheck className={`h-4 w-4 ${postColors[1]?.text}`} />
              </div>
            </CardHeader>
            <Link to="/post">
              <CardContent>
                {loadingPost ? (
                  <Skeleton className="h-[20px] w-full rounded-md" />
                ) : (
                  <div className="text-2xl font-bold">
                    {posts?.filter((p) => p.status === 'active')?.length || 0}
                  </div>
                )}
              </CardContent>
            </Link>
          </Card>

          <Card className={`${postColors[2]?.bg} ${cardHoverClass} transition-all duration-200`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Bài viết chờ duyệt</CardTitle>
              <div className="h-4 w-4" title="Bài viết chờ duyệt">
                <IconInvoice className={`h-4 w-4 ${postColors[2]?.text}`} />
              </div>
            </CardHeader>
            <Link to="/post">
              <CardContent>
                {loadingPost ? (
                  <Skeleton className="h-[20px] w-full rounded-md" />
                ) : (
                  <div className="text-2xl font-bold">
                    {posts?.filter((p) => p.status === 'pending')?.length || 0}
                  </div>
                )}
              </CardContent>
            </Link>
          </Card>

          <Card className={`${postColors[3]?.bg} ${cardHoverClass} transition-all duration-200`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Bài viết đã xuất bản</CardTitle>
              <div className="h-4 w-4" title="Bài viết đã xuất bản">
                <IconInvoice className={`h-4 w-4 ${postColors[3]?.text}`} />
              </div>
            </CardHeader>
            <Link to="/post">
              <CardContent>
                {loadingPost ? (
                  <Skeleton className="h-[20px] w-full rounded-md" />
                ) : (
                  <div className="text-2xl font-bold">
                    {posts?.filter((p) => p.status === 'published')?.length || 0}
                  </div>
                )}
              </CardContent>
            </Link>
          </Card>

          <Card className={`${postColors[4]?.bg} ${cardHoverClass} transition-all duration-200`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Bản nháp</CardTitle>
              <div className="h-4 w-4" title="Bài viết bản nháp">
                <IconInvoice className={`h-4 w-4 ${postColors[4]?.text}`} />
              </div>
            </CardHeader>
            <Link to="/post">
              <CardContent>
                {loadingPost ? (
                  <Skeleton className="h-[20px] w-full rounded-md" />
                ) : (
                  <div className="text-2xl font-bold">
                    {posts?.filter((p) => p.status === 'draft')?.length || 0}
                  </div>
                )}
              </CardContent>
            </Link>
          </Card>
        </div>
      </Can>

      <Can permission="contact_view">
        <h2 className={`mb-2 mt-6 text-xl font-semibold ${textTitleClass}`}>Thống kê liên hệ</h2>
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <Card className={`${contactColors[0]?.bg} ${cardHoverClass} transition-all duration-200`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tổng liên hệ</CardTitle>
              <div className="h-4 w-4" title="Tổng số liên hệ">
                <IconAddressBook className={`h-4 w-4 ${contactColors[0]?.text}`} />
              </div>
            </CardHeader>
            <Link to="/contact">
              <CardContent>
                {loadingPost ? (
                  <Skeleton className="h-[20px] w-full rounded-md" />
                ) : (
                  <div className="text-2xl font-bold">{contacts?.length || 0}</div>
                )}
              </CardContent>
            </Link>
          </Card>

          <Card className={`${contactColors[1]?.bg} ${cardHoverClass} transition-all duration-200`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Đã giải quyết</CardTitle>
              <div className="h-4 w-4" title="Liên hệ đã xử lý">
                <IconCheck className={`h-4 w-4 ${contactColors[1]?.text}`} />
              </div>
            </CardHeader>
            <Link to="/contact">
              <CardContent>
                {loadingPost ? (
                  <Skeleton className="h-[20px] w-full rounded-md" />
                ) : (
                  <div className="text-2xl font-bold">
                    {contacts?.filter((c) => c.status === 'resolved')?.length || 0}
                  </div>
                )}
              </CardContent>
            </Link>
          </Card>

          <Card className={`${contactColors[2]?.bg} ${cardHoverClass} transition-all duration-200`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Đang xử lý</CardTitle>
              <div className="h-4 w-4" title="Liên hệ đang xử lý">
                <IconMessageDots className={`h-4 w-4 ${contactColors[2]?.text}`} />
              </div>
            </CardHeader>
            <Link to="/contact">
              <CardContent>
                {loadingPost ? (
                  <Skeleton className="h-[20px] w-full rounded-md" />
                ) : (
                  <div className="text-2xl font-bold">
                    {contacts?.filter((c) => c.status === 'in_progress')?.length || 0}
                  </div>
                )}
              </CardContent>
            </Link>
          </Card>

          <Card className={`${contactColors[3]?.bg} ${cardHoverClass} transition-all duration-200`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Đang chờ xử lý</CardTitle>
              <div className="h-4 w-4" title="Liên hệ chưa phản hồi">
                <IconMailOpened className={`h-4 w-4 ${contactColors[3]?.text}`} />
              </div>
            </CardHeader>
            <Link to="/contact">
              <CardContent>
                {loadingPost ? (
                  <Skeleton className="h-[20px] w-full rounded-md" />
                ) : (
                  <div className="text-2xl font-bold">
                    {contacts?.filter((c) => c.status === 'pending')?.length || 0}
                  </div>
                )}
              </CardContent>
            </Link>
          </Card>
        </div>
      </Can>

      <Can permission="user_view">
        <h2 className={`mb-2 mt-6 text-xl font-semibold ${textTitleClass}`}>Thống kê người dùng</h2>
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-5">
          <Card className={`${userColors[0]?.bg} ${cardHoverClass} transition-all duration-200`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Nhân viên</CardTitle>
              <div className="h-4 w-4">
                <IconUsersGroup className={`h-4 w-4 ${userColors[0]?.text}`} />
              </div>
            </CardHeader>
            <Link to="/user?role=admin">
              <CardContent>
                <div className="text-2xl font-bold">{admins.length}</div>
              </CardContent>
            </Link>
          </Card>

          <Card className={`${userColors[1]?.bg} ${cardHoverClass} transition-all duration-200`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Khách hàng</CardTitle>
              <div className="h-4 w-4">
                <IconUsersGroup className={`h-4 w-4 ${userColors[1]?.text}`} />
              </div>
            </CardHeader>
            <Link to="/user?role=customer">
              <CardContent>
                <div className="text-2xl font-bold">{customers.length}</div>
              </CardContent>
            </Link>
          </Card>

          <Card className={`${userColors[2]?.bg} ${cardHoverClass} transition-all duration-200`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Phân loại khách</CardTitle>
              <div className="h-4 w-4">
                <IconUsersGroup className={`h-4 w-4 ${userColors[2]?.text}`} />
              </div>
            </CardHeader>
            <Link to="/customer-group">
              <CardContent>
                {loadingGroups ? (
                  <Skeleton className="h-[20px] w-full rounded-md" />
                ) : (
                  <div className="text-2xl font-bold">{groups.length}</div>
                )}
              </CardContent>
            </Link>
          </Card>
        </div>
      </Can>

      <Can permission="customer_group_view">
        <h2 className={`mb-2 mt-6 text-xl font-semibold ${textTitleClass}`}>Thống kê khách hàng</h2>
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <Card className={`${themeColors[0]?.bg} ${cardHoverClass} transition-all duration-200`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Chưa phân loại</CardTitle>
              <div className="h-4 w-4">
                <IconUsersGroup className={`h-4 w-4 ${themeColors[0]?.text}`} />
              </div>
            </CardHeader>
            <Link to="/user?type=customer">
              <CardContent>
                <div className="text-2xl font-bold">{ungroupedCount}</div>
              </CardContent>
            </Link>
          </Card>

          {groups.map((g, idx) => {
            const count = customerGroupCounts.get(g.id) || 0
            const color = themeColors[(idx + 1) % themeColors.length]
            return (
              <Card
                key={g.id}
                className={`${color?.bg} ${cardHoverClass} transition-all duration-200`}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{g.name}</CardTitle>
                  <div className="h-4 w-4">
                    <IconUsersGroup className={`h-4 w-4 ${color?.text}`} />
                  </div>
                </CardHeader>
                <Link to={`/user?type=customer&groupId=${g.id}`}>
                  <CardContent>
                    <div className="text-2xl font-bold">{count}</div>
                  </CardContent>
                </Link>
              </Card>
            )
          })}
        </div>
      </Can>

      <Can permission="order_view">
        <h2 className={`mb-2 mt-6 text-xl font-semibold ${textTitleClass}`}>Thống kê đơn bán</h2>
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <Card className={`${themeColors[2]?.bg} ${cardHoverClass} transition-all duration-200`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tổng đơn bán</CardTitle>
              <div className="h-4 w-4">
                <IconInvoice className={`h-4 w-4 ${themeColors[2]?.text}`} />
              </div>
            </CardHeader>
            <Link to="/invoice">
              <CardContent>
                {loadingInvoices ? (
                  <Skeleton className="h-[20px] w-full rounded-md" />
                ) : (
                  <div className="text-2xl font-bold">{totalSalesOrders}</div>
                )}
              </CardContent>
            </Link>
          </Card>

          <Card className={`${themeColors[3]?.bg} ${cardHoverClass} transition-all duration-200`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tổng giá trị đã bán</CardTitle>
              <div className="h-4 w-4">
                <IconInvoice className={`h-4 w-4 ${themeColors[3]?.text}`} />
              </div>
            </CardHeader>
            <Link to="/sales-report">
              <CardContent>
                {loadingInvoices ? (
                  <Skeleton className="h-[20px] w-full rounded-md" />
                ) : (
                  <div className="text-2xl font-bold">{formatCurrency(totalSalesAmount)}</div>
                )}
              </CardContent>
            </Link>
          </Card>

          <Card className={`${themeColors[4]?.bg} ${cardHoverClass} transition-all duration-200`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Đơn chờ xác nhận</CardTitle>
              <div className="h-4 w-4">
                <IconInvoice className={`h-4 w-4 ${themeColors[4]?.text}`} />
              </div>
            </CardHeader>
            <Link to="/invoice?status=pending">
              <CardContent>
                {loadingInvoices ? (
                  <Skeleton className="h-[20px] w-full rounded-md" />
                ) : (
                  <div className="text-2xl font-bold">
                    {invoices.filter((o) => o.status === 'pending').length}
                  </div>
                )}
              </CardContent>
            </Link>
          </Card>

          <Card className={`${themeColors[5]?.bg} ${cardHoverClass} transition-all duration-200`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Đơn đã xác nhận</CardTitle>
              <div className="h-4 w-4">
                <IconInvoice className={`h-4 w-4 ${themeColors[5]?.text}`} />
              </div>
            </CardHeader>
            <Link to="/invoice?status=accepted">
              <CardContent>
                {loadingInvoices ? (
                  <Skeleton className="h-[20px] w-full rounded-md" />
                ) : (
                  <div className="text-2xl font-bold">
                    {invoices.filter((o) => o.status === 'accepted').length}
                  </div>
                )}
              </CardContent>
            </Link>
          </Card>

          <Card className={`${themeColors[6]?.bg} ${cardHoverClass} transition-all duration-200`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Đơn bị từ chối</CardTitle>
              <div className="h-4 w-4">
                <IconInvoice className={`h-4 w-4 ${themeColors[6]?.text}`} />
              </div>
            </CardHeader>
            <Link to="/invoice?status=rejected">
              <CardContent>
                {loadingInvoices ? (
                  <Skeleton className="h-[20px] w-full rounded-md" />
                ) : (
                  <div className="text-2xl font-bold">
                    {invoices.filter((o) => o.status === 'rejected').length}
                  </div>
                )}
              </CardContent>
            </Link>
          </Card>

        </div>
      </Can>
    </div>
  )
}

export default AdminReport
