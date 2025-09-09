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
import { useTheme } from '@/components/ThemeProvider'

const AdminReport = ({ fromDate, toDate }) => {
  const loading = useSelector((state) => state.post.loading)
  const posts = useSelector((state) => state.post.posts)
  const contacts = useSelector((state) => state.contact.contacts)
  const users = useSelector((state) => state.user.users)
  const dispatch = useDispatch()
  const { theme } = useTheme()
  const [usedColorIndices, setUsedColorIndices] = useState([])

  const [systemPrefersDark, setSystemPrefersDark] = useState(
    window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches,
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e) => {
      setSystemPrefersDark(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const actualTheme = useMemo(() => {
    if (theme === 'system') {
      return systemPrefersDark ? 'dark' : 'light'
    }
    return theme
  }, [theme, systemPrefersDark])

  useEffect(() => {
    dispatch(getPost())
    dispatch(getUsers())
    dispatch(getContact())
  }, [dispatch])

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
    let availableIndices = Array.from(
      { length: themeColors.length },
      (_, i) => i,
    ).filter((i) => !usedColorIndices.includes(i) && i !== lastColorIndex)

    if (availableIndices.length === 0) {
      availableIndices = Array.from(
        { length: themeColors.length },
        (_, i) => i,
      ).filter((i) => i !== lastColorIndex)
    }

    const randomIndex = Math.floor(Math.random() * availableIndices.length)
    const selectedIndex = availableIndices[randomIndex]

    setUsedColorIndices((prev) => {
      const updated = [...prev, selectedIndex]
      return updated.length > 3 ? updated.slice(-3) : updated
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
    for (let i = 0; i < 1; i++) {
      const color = getUniqueRandomColor(lastIndex)
      colors.push(color)
      lastIndex = themeColors.findIndex((c) => c.name === color.name)
    }
    return colors
  }, [actualTheme])

  const textTitleClass = actualTheme === 'dark' ? 'text-white' : 'text-gray-800'
  const cardHoverClass =
    actualTheme === 'dark' ? 'hover:bg-opacity-80' : 'hover:bg-opacity-70'

  return (
    <div className="space-y-4">
      <h2 className={`mb-2 text-xl font-semibold ${textTitleClass}`}>
        Thống kê bài viết
      </h2>
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
        <Card
          className={`${postColors[0]?.bg} ${cardHoverClass} transition-all duration-200`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tổng bài viết</CardTitle>
            <div className="h-4 w-4" title="Tổng số bài viết">
              <IconNews className={`h-4 w-4 ${postColors[0]?.text}`} />
            </div>
          </CardHeader>

          <Link to={'/post'}>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[20px] w-full rounded-md" />
              ) : (
                <div className="space-y-1">
                  <div className="text-2xl font-bold">{posts?.length || 0}</div>
                </div>
              )}
            </CardContent>
          </Link>
        </Card>
        <Card
          className={`${postColors[1]?.bg} ${cardHoverClass} transition-all duration-200`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Bài viết đã duyệt
            </CardTitle>
            <div className="h-4 w-4" title="Bài viết đã duyệt">
              <IconCheck className={`h-4 w-4 ${postColors[1]?.text}`} />
            </div>
          </CardHeader>

          <Link to={'/post'}>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[20px] w-full rounded-md" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {posts?.filter((p) => p.status === 'active')?.length || 0}
                  </div>
                </>
              )}
            </CardContent>
          </Link>
        </Card>
        <Card
          className={`${postColors[2]?.bg} ${cardHoverClass} transition-all duration-200`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Bài viết chờ duyệt
            </CardTitle>
            <div className="h-4 w-4" title="Bài viết chờ duyệt">
              <IconInvoice className={`h-4 w-4 ${postColors[2]?.text}`} />
            </div>
          </CardHeader>

          <Link to={'/post'}>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[20px] w-full rounded-md" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {posts?.filter((p) => p.status === 'pending')?.length || 0}
                  </div>
                </>
              )}
            </CardContent>
          </Link>
        </Card>
        <Card
          className={`${postColors[3]?.bg} ${cardHoverClass} transition-all duration-200`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Bài viết đã xuất bản
            </CardTitle>
            <div className="h-4 w-4" title="Bài viết đã xuất bản">
              <IconInvoice className={`h-4 w-4 ${postColors[3]?.text}`} />
            </div>
          </CardHeader>

          <Link to={'/post'}>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[20px] w-full rounded-md" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {posts?.filter((p) => p.status === 'published')?.length ||
                      0}
                  </div>
                </>
              )}
            </CardContent>
          </Link>
        </Card>
        <Card
          className={`${postColors[4]?.bg} ${cardHoverClass} transition-all duration-200`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Bản nháp</CardTitle>
            <div className="h-4 w-4" title="Bài viết bản nháp">
              <IconInvoice className={`h-4 w-4 ${postColors[4]?.text}`} />
            </div>
          </CardHeader>

          <Link to={'/post'}>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[20px] w-full rounded-md" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {posts?.filter((p) => p.status === 'draft')?.length || 0}
                  </div>
                </>
              )}
            </CardContent>
          </Link>
        </Card>
      </div>

      <h2 className={`mb-2 mt-6 text-xl font-semibold ${textTitleClass}`}>
        Thống kê liên hệ
      </h2>
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card
          className={`${contactColors[0]?.bg} ${cardHoverClass} transition-all duration-200`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tổng liên hệ</CardTitle>
            <div className="h-4 w-4" title="Tổng số liên hệ">
              <IconAddressBook
                className={`h-4 w-4 ${contactColors[0]?.text}`}
              />
            </div>
          </CardHeader>

          <Link to={'/contact'}>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[20px] w-full rounded-md" />
              ) : (
                <div className="space-y-1">
                  <div className="text-2xl font-bold">
                    {contacts?.length || 0}
                  </div>
                </div>
              )}
            </CardContent>
          </Link>
        </Card>

        <Card
          className={`${contactColors[1]?.bg} ${cardHoverClass} transition-all duration-200`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Đã giải quyết</CardTitle>
            <div className="h-4 w-4" title="Liên hệ đã xử lý">
              <IconCheck className={`h-4 w-4 ${contactColors[1]?.text}`} />
            </div>
          </CardHeader>

          <Link to={'/contact'}>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[20px] w-full rounded-md" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {contacts?.filter((c) => c.status === 'resolved')?.length ||
                      0}
                  </div>
                </>
              )}
            </CardContent>
          </Link>
        </Card>

        <Card
          className={`${contactColors[2]?.bg} ${cardHoverClass} transition-all duration-200`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Đang xử lý</CardTitle>
            <div className="h-4 w-4" title="Liên hệ đang xử lý">
              <IconMessageDots
                className={`h-4 w-4 ${contactColors[2]?.text}`}
              />
            </div>
          </CardHeader>

          <Link to={'/contact'}>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[20px] w-full rounded-md" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {contacts?.filter((c) => c.status === 'in_progress')
                      ?.length || 0}
                  </div>
                </>
              )}
            </CardContent>
          </Link>
        </Card>

        <Card
          className={`${contactColors[3]?.bg} ${cardHoverClass} transition-all duration-200`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Đang chờ xử lý
            </CardTitle>
            <div className="h-4 w-4" title="Liên hệ chưa phản hồi">
              <IconMailOpened className={`h-4 w-4 ${contactColors[3]?.text}`} />
            </div>
          </CardHeader>

          <Link to={'/contact'}>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[20px] w-full rounded-md" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {contacts?.filter((c) => c.status === 'pending')?.length ||
                      0}
                  </div>
                </>
              )}
            </CardContent>
          </Link>
        </Card>
      </div>

      <h2 className={`mb-2 mt-6 text-xl font-semibold ${textTitleClass}`}>
        Thống kê người dùng
      </h2>
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
        <Card
          className={`${userColors[0]?.bg} ${cardHoverClass} transition-all duration-200`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Người dùng</CardTitle>
            <div className="h-4 w-4" title="Tổng số người dùng">
              <IconUsersGroup className={`h-4 w-4 ${userColors[0]?.text}`} />
            </div>
          </CardHeader>

          <Link to={'/user'}>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[20px] w-full rounded-md" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{users?.length || 0}</div>
                </>
              )}
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  )
}

export default AdminReport
