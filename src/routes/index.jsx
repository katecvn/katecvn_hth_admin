import BrandPage from '@/views/admin/brand/BrandPage'
import CategoryPage from '@/views/admin/category/CategoryPage'
import ContactPage from '@/views/admin/contact/ContactPage'
import DashboardPage from '@/views/admin/dashboard/DashboardPage'
import GroupPage from '@/views/admin/group/GroupPage'
import MediaPage from '@/views/admin/media/MediaPage'
import NavigationPage from '@/views/admin/navigation/NavigationPage'
import OptionPage from '@/views/admin/option/OptionPage'
import PagePage from '@/views/admin/page/PagePage'
import PageSectionPage from '@/views/admin/pagesection/PageSectionPage'
import PostPage from '@/views/admin/post/PostPage'
import ProductPage from '@/views/admin/product/ProductPage'
import ReviewPage from '@/views/admin/review/ReviewPage'
import RolePage from '@/views/admin/role/RolePage'
import CommentPage from '@/views/admin/comment/CommentPage'
import TopicPage from '@/views/admin/topic/TopicPage'
import UserPage from '@/views/admin/user/UserPage'
import CustomerGroupPage from '@/views/admin/customer_groups/CustomerGroupPage'
import CustomerGroupDiscountPage from '@/views/admin/customer_group_discounts/CustomerGroupDiscountPage'
import CustomerGroupDiscountHistoryPage from '@/views/admin/customer_group_discount_histories/CustomerGroupDiscountHistoryPage'
import CallbackGoogle from '@/views/auth/components/CallbackGoogle'
import ForgotPasswordPage from '@/views/auth/ForgotPasswordPage'
import LoginPage from '@/views/auth/LoginPage'
import ResetPasswordPage from '@/views/auth/ResetPasswordPage'
import ErrorPage from '@/views/error/ErrorPage'
import AdminLayout from '@/views/layouts/AdminLayout'
import AuthLayout from '@/views/layouts/AuthLayout'
import ErrorLayout from '@/views/layouts/ErrorLayout'
import DiscountPage from '@/views/admin/discount/DiscountPage'
import InvoicePage from '@/views/admin/invoice/InvoicePage'
import SpecificationGroupPage from '@/views/admin/specification_group/SpecificationGroupPage'
import SpecificationPage from '@/views/admin/specification/SpecificationPage'
import ProductAttributePage from '@/views/admin/product_attribute/ProductAttributePage'
import VariantPage from '@/views/admin/variant/VariantPage'

const routes = [
  {
    path: '/dashboard',
    element: DashboardPage,
    layout: AdminLayout,
  },

  {
    path: '/category',
    element: CategoryPage,
    layout: AdminLayout,
  },
  {
    path: '/brand',
    element: BrandPage,
    layout: AdminLayout,
  },
  {
    path: '/topic',
    element: TopicPage,
    layout: AdminLayout,
  },
  {
    path: '/post',
    element: PostPage,
    layout: AdminLayout,
  },
  {
    path: '/comment',
    element: CommentPage,
    layout: AdminLayout,
  },

  {
    path: '/user',
    element: UserPage,
    layout: AdminLayout,
  },

  {
    path: '/customer-group',
    element: CustomerGroupPage,
    layout: AdminLayout,
  },
  {
    path: '/customer-group-discount',
    element: CustomerGroupDiscountPage,
    layout: AdminLayout,
  },
  {
    path: '/customer-group-discount-history',
    element: CustomerGroupDiscountHistoryPage,
    layout: AdminLayout,
  },

  {
    path: '/role',
    element: RolePage,
    layout: AdminLayout,
  },
  {
    path: '/navigation',
    element: NavigationPage,
    layout: AdminLayout,
  },
  {
    path: '/page',
    element: PagePage,
    layout: AdminLayout,
  },
  {
    path: '/pagesection',
    element: PageSectionPage,
    layout: AdminLayout,
  },
  {
    path: '/media',
    element: MediaPage,
    layout: AdminLayout,
  },
  {
    path: '/contact',
    element: ContactPage,
    layout: AdminLayout,
  },
  {
    path: '/product',
    element: ProductPage,
    layout: AdminLayout,
  },
  {
    path: '/product-variant',
    element: VariantPage,
    layout: AdminLayout,
  },
  {
    path: '/product-attribute',
    element: ProductAttributePage,
    layout: AdminLayout,
  },
  {
    path: '/review',
    element: ReviewPage,
    layout: AdminLayout,
  },
  {
    path: '/options',
    element: OptionPage,
    layout: AdminLayout,
  },
  {
    path: '/groups',
    element: GroupPage,
    layout: AdminLayout,
  },
  {
    path: '/specification-group',
    element: SpecificationGroupPage,
    layout: AdminLayout,
  },
  {
    path: '/specification',
    element: SpecificationPage,
    layout: AdminLayout,
  },
  {
    path: '/discount',
    element: DiscountPage,
    layout: AdminLayout,
  },
  {
    path: '/invoice',
    element: InvoicePage,
    layout: AdminLayout,
  },

  {
    path: '/forgot-password',
    element: ForgotPasswordPage,
    layout: AuthLayout,
  },
  {
    path: '/reset-password',
    element: ResetPasswordPage,
    layout: AuthLayout,
  },
  {
    path: '/auth/google/callback',
    element: CallbackGoogle,
    layout: AuthLayout,
  },
  {
    path: '/',
    element: LoginPage,
    layout: AuthLayout,
  },
  {
    path: '*',
    element: ErrorPage,
    layout: ErrorLayout,
  },
]

export default routes
