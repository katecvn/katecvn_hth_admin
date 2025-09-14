import {
  IconBox,
  IconCategory,
  IconLayoutDashboard,
  IconSettings,
  IconUserCog,
  IconUsers,
  IconBuildingFactory2,
  IconPresentation,
  IconNews,
  IconAdjustments,
  IconSitemap,
  IconPhotoPlus,
  IconSettingsPause,
  IconAddressBook,
  IconUser,
  IconLayoutDistributeHorizontal,
  IconAB2,
  IconBubbleText,
  IconDiscount,
  IconShoppingCartDollar,
  IconStackBack,
  IconStar,
  IconCategoryPlus,
  IconListDetails,
  IconLayoutList,
  IconFileInvoice,
  IconList,
  IconUsersGroup,
  IconBinaryTree2,
} from '@tabler/icons-react'

export const sideLinks = [
  {
    title: 'Tổng quan',
    href: '/dashboard',
    icon: <IconLayoutDashboard size={18} />,
    // permission: 'GET_REPORT',
  },
  {
    title: 'Đơn hàng',
    href: '/invoice',
    icon: <IconShoppingCartDollar size={18} />,
    sub: [
      {
        title: 'Đơn hàng',
        href: '/invoice',
        icon: <IconFileInvoice size={18} />,
      },
      {
        title: 'Đánh giá',
        href: '/review',
        icon: <IconStar size={18} />,
      },
      {
        title: 'Giảm giá',
        href: '/discount',
        icon: <IconDiscount size={18} />,
      },
    ],
  },
  {
    title: 'Sản phẩm',
    icon: <IconLayoutList size={18} />,
    permission: 'product_view',
    sub: [
      {
        title: 'Sản phẩm',
        href: '/product',
        icon: <IconBox size={18} />,
        permission: 'product_view',
      },
      {
        title: 'Biến thể',
        href: '/product-variant',
        icon: <IconBinaryTree2 size={18} />,
        permission: 'product_view',
      },
      {
        title: 'Nhóm sản phẩm',
        href: '/groups',
        icon: <IconStackBack size={18} />,
      },
      {
        title: 'Tùy chọn sản phẩm',
        href: '/options',
        icon: <IconAB2 size={18} />,
      },
      {
        title: 'Nhóm thông số kỹ thuật',
        href: '/specification-group',
        icon: <IconCategoryPlus size={18} />,
      },
      {
        title: 'Thông số kỹ thuật',
        href: '/specification',
        icon: <IconList size={18} />,
      },
      {
        title: 'Thuộc tính sản phẩm',
        href: '/product-attribute',
        icon: <IconListDetails size={18} />,
      },
      {
        title: 'Danh mục sản phẩm',
        href: '/category',
        icon: <IconCategory size={18} />,
      },
      {
        title: 'Thương hiệu',
        href: '/brand',
        icon: <IconBuildingFactory2 size={18} />,
      },
      {
        title: 'Giảm giá theo khách hàng',
        href: '/customer-group-discount',
        icon: <IconDiscount size={18} />,
        permission: 'customer_group_discount_view',
      },
    ],
  },
  {
    title: 'Bài viết',
    icon: <IconNews size={18} />,
    sub: [
      {
        title: 'Bài viết',
        href: '/post',
        icon: <IconNews size={18} />,
        permission: 'post_view',
      },
      {
        title: 'Chủ đề',
        href: '/topic',
        icon: <IconPresentation size={18} />,
        permission: 'topic_view',
      },
      {
        title: 'Bình luận',
        href: '/comment',
        icon: <IconBubbleText size={18} />,
      },
    ],
  },

  {
    title: 'Nhân viên',
    href: '/user?role=admin',
    icon: <IconUser size={18} />,
    permission: 'user_view',
  },

  {
    title: 'Khách hàng',
    icon: <IconUsersGroup size={18} />,
    permission: 'user_view',
    sub: [
      {
        title: 'Danh sách khách hàng',
        href: '/user?role=customer',
        icon: <IconUsers size={18} />,
        permission: 'user_view',
      },
      {
        title: 'Phân loại khách hàng',
        href: '/customer-group',
        icon: <IconUsersGroup size={18} />,
        permission: 'user_view',
      },
    ],
  },

  {
    title: 'Hình ảnh',
    href: '/media',
    icon: <IconPhotoPlus size={18} />,
    permission: 'file_view',
  },
  {
    title: 'Liên hệ',
    href: '/contact',
    icon: <IconAddressBook size={18} />,
    permission: 'contact_view',
  },

  {
    title: 'Cài đặt',
    href: '/settings',
    icon: <IconSettings size={18} />,
    sub: [
      {
        title: 'Menu',
        href: '/navigation',
        icon: <IconAdjustments size={18} />,
      },
      {
        title: 'Trang',
        href: '/page',
        icon: <IconSitemap size={18} />,
      },
      {
        title: 'Cài đặt trang',
        href: '/pagesection',
        icon: <IconSettingsPause size={18} />,
      },
      {
        title: 'Vai trò',
        href: '/role',
        icon: <IconUserCog size={18} />,
        permission: 'role_view',
      },
    ],
  },
]
