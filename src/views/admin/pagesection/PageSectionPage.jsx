import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import { DataTable } from '@/components/DataTable'
import { dateFormat } from '@/utils/date-format'
import Can from '@/utils/can'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'
import { TrashIcon, Pencil1Icon } from '@radix-ui/react-icons'
import { ConfirmDialog } from '@/components/ComfirmDialog'
import { deletePageSection, getPage, getPageSections } from '@/stores/PageSlice'
import PageDialog from './PageDialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import BannerDialog from './BannerDialog'
import VideoDialog from './VideoDialog'
import FooterDialog from './FooterDialog'
import InfoCompanyDialog from './InfoCompanyDialog'
const PageSectionPage = () => {
  const dispatch = useDispatch()
  const pages = useSelector((state) => state.page?.pages || [])
  const pageSections = useSelector((state) => state.page?.pageSections || [])
  const loading = useSelector((state) => state.page.loading)
  const [activeTab, setActiveTab] = useState(1)
  const [showCreatePageDialog, setShowCreatePageDialog] = useState(false)
  const [showDeletePageDialog, setShowDeletePageDialog] = useState(false)
  const [showUpdatePageDialog, setShowUpdatePageDialog] = useState(false)
  const [showBannerEditDialog, setShowBannerEditDialog] = useState(false)
  const [showInfoEditDialog, setShowInfoEditDialog] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [itemChoice, setItemChoice] = useState({})
  const [showBannerDialog, setShowBannerDialog] = useState(false)
  const [showVideoDialog, setShowVideoDialog] = useState(false)
  const [showVideoEditDialog, setShowVideoEditDialog] = useState(false)
  const [showFooterDialog, setShowFooterDialog] = useState(false)
  const [currentPageId, setCurrentPageId] = useState(null)
  const [sectionTypeVideo, setSectionTypeVideo] = useState(null)
  const handleDelete = async (id) => {
    try {
      await dispatch(
        deletePageSection({ id: id, pageId: itemChoice.original?.pageId }),
      ).unwrap()
    } catch (error) {
      console.error('Error deleting Page:', error)
    }
  }

  useEffect(() => {
    document.title = 'Quản lý trang'
    dispatch(getPage())
    dispatch(getPageSections(1))
  }, [dispatch])

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    dispatch(getPageSections(tabId))
  }
  const extractYouTubeVideoId = (url) => {
    const match = url?.match(
      /(?:youtube\.com\/.*(?:\?|&)v=|youtu\.be\/)([^&]+)/,
    )
    return match ? match[1] : null
  }
  const handleVideoEdit = (type) => {
    setShowVideoEditDialog(true)
    setSectionTypeVideo(type)
  }
  const handleBannerDialog = (type) => {
    setSectionTypeVideo(type)
    setShowBannerEditDialog(true)
  }
  const columns = [
    {
      accessorKey: 'id',
      header: 'STT',
      cell: ({ row }) => <div className="">{row.index + 1}</div>,
    },

    {
      accessorKey: 'content',
      header: 'Nội dung',
      cell: ({ row }) => {
        const contentItems = [...row.getValue('content')] || []
        const firstItem = contentItems[0] || {}
        const { imageUrl, videoUrl } = firstItem

        return (
          <div className="flex max-w-[400px] items-center truncate">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Image preview"
                className="mr-2 h-10 w-10 rounded-md object-cover"
              />
            ) : videoUrl ? (
              <iframe
                src={videoUrl.replace('watch?v=', 'embed/')}
                title={videoUrl}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-48 w-48"
                loading="lazy"
              ></iframe>
            ) : (
              <div>
                {contentItems?.map((item, index) => (
                  <div key={index}>
                    <strong> {item.title}</strong>: {item.value}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Ngày tạo',
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-32 truncate sm:max-w-72 md:max-w-[31rem]">
            {dateFormat(row.getValue('createdAt'))}
          </span>
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            className="text-blue-500"
            variant="outline"
            size="sm"
            title="Chi tiết"
            onClick={() => {
              setItemChoice(row)
              row.original?.sectionType === 'banner'
                ? handleBannerDialog('banner')
                : row.original?.sectionType === 'partner'
                  ? handleBannerDialog('partner')
                  : row.original?.sectionType === 'video'
                    ? handleVideoEdit('video')
                    : row.original?.sectionType === 'feedback'
                      ? handleVideoEdit('feedback')
                      : row.original?.sectionType === 'footer'
                        ? setShowFooterDialog(true)
                        : setShowInfoEditDialog(true)
            }}
          >
            <Pencil1Icon className="h-6 w-6" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-500"
            title="Xóa"
            onClick={() => {
              setItemChoice(row)
              setShowDeletePageDialog(true)
            }}
            disabled={
              row.original?.sectionType === 'footer' ||
              row.original?.sectionType === 'infoCompany'
            }
          >
            <TrashIcon className="h-6 w-6" />
          </Button>
        </div>
      ),
    },
  ]

  const toolbar = [
    {
      children: (
        <Can permission={''}>
          <Button
            onClick={() => setShowCreatePageDialog(true)}
            className="mx-2"
            variant="outline"
            size="sm"
          >
            <PlusIcon className="mr-2 size-4" aria-hidden="true" />
            Thêm mới
          </Button>

          {showCreatePageDialog && (
            <PageDialog
              open={showCreatePageDialog}
              onOpenChange={setShowCreatePageDialog}
              initialData={null}
              pageId={activeTab}
            />
          )}
        </Can>
      ),
    },
  ]

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-2 flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Quản lý trang</h2>
          </div>
        </div>

        {pages.length > 0 ? (
          <Tabs
            defaultValue={pages[0]?.id}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <div className="flex">
              <TabsList className="mb-4">
                {pages?.map((page) => (
                  <TabsTrigger key={page.id} value={page.id}>
                    {page.title}
                  </TabsTrigger>
                ))}
              </TabsList>
              <Button
                onClick={() => {
                  setShowCreatePageDialog(true)
                }}
                className="mx-2"
                variant="outline"
                size="sm"
              >
                <PlusIcon className="mr-2 size-4" aria-hidden="true" />
                Thêm mới
              </Button>
            </div>

            {pages?.map((page) => (
              <TabsContent key={page.id} value={page.id} className="flex-1">
                {page?.id === 1 ? (
                  <div className="mb-4 space-y-6">
                    {/* Banner Section */}
                    <div className="rounded-lg border p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-lg font-medium">Banner</h3>
                        <Button
                          onClick={() => {
                            setShowBannerDialog(true)
                            setCurrentPageId(page.id)
                            setSectionTypeVideo('banner')
                          }}
                          className="ml-auto"
                          variant="outline"
                          size="sm"
                        >
                          <PlusIcon
                            className="mr-2 size-4"
                            aria-hidden="true"
                          />
                          Thêm banner
                        </Button>
                      </div>
                      <div className="-mx-4 flex-1 overflow-auto px-4 py-1">
                        <DataTable
                          columns={columns}
                          data={pageSections.filter(
                            (section) =>
                              section.pageId === page.id &&
                              section.sectionType === 'banner',
                          )}
                          caption="Banner"
                          searchKey="title"
                          showGlobalFilter={false}
                          showColumnFilters={false}
                          enableSorting={true}
                          loading={loading}
                        />
                      </div>
                    </div>

                    <div className="rounded-lg border p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-lg font-medium">Đối tác</h3>
                        <Button
                          onClick={() => {
                            setShowBannerDialog(true)
                            setCurrentPageId(page.id)
                            setSectionTypeVideo('partner')
                          }}
                          className="ml-auto"
                          variant="outline"
                          size="sm"
                        >
                          <PlusIcon
                            className="mr-2 size-4"
                            aria-hidden="true"
                          />
                          Thêm ảnh
                        </Button>
                      </div>
                      <div className="-mx-4 flex-1 overflow-auto px-4 py-1">
                        <DataTable
                          columns={columns}
                          data={pageSections.filter(
                            (section) =>
                              section.pageId === page.id &&
                              section.sectionType === 'partner',
                          )}
                          caption="Banner"
                          searchKey="title"
                          showGlobalFilter={false}
                          showColumnFilters={false}
                          enableSorting={true}
                          loading={loading}
                        />
                      </div>
                    </div>
                    {/* Footer Section */}
                    <div className="rounded-lg border p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-lg font-medium">
                          Thông tin công ty
                        </h3>
                      </div>
                      <div className="-mx-4 flex-1 overflow-auto px-4 py-1">
                        <DataTable
                          columns={columns}
                          data={pageSections.filter(
                            (section) =>
                              section.pageId === page.id &&
                              section.sectionType === 'infoCompany',
                          )}
                          caption=" Thông tin công ty"
                          searchKey="title"
                          showGlobalFilter={false}
                          showColumnFilters={false}
                          enableSorting={true}
                          loading={loading}
                        />
                      </div>
                    </div>
                    <div className="rounded-lg border p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-lg font-medium">Footer</h3>
                      </div>
                      <div className="-mx-4 flex-1 overflow-auto px-4 py-1">
                        <DataTable
                          columns={columns}
                          data={pageSections.filter(
                            (section) =>
                              section.pageId === page.id &&
                              section.sectionType === 'footer',
                          )}
                          caption="Footer"
                          searchKey="title"
                          showGlobalFilter={false}
                          showColumnFilters={false}
                          enableSorting={true}
                          loading={loading}
                        />
                      </div>
                    </div>
                  </div>
                ) : page?.slug === 'lien-he' ? (
                  <div className="mb-4 space-y-6">
                    {/* Footer Section */}
                    <div className="rounded-lg border p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-lg font-medium">
                          Thông tin chi nhánh
                        </h3>
                        <Button
                          onClick={() => {
                            setShowCreateDialog(true)
                            setCurrentPageId(page.id)
                          }}
                          className="ml-auto"
                          variant="outline"
                          size="sm"
                        >
                          <PlusIcon
                            className="mr-2 size-4"
                            aria-hidden="true"
                          />
                          Thêm chi nhánh
                        </Button>
                      </div>
                      <div className="-mx-4 flex-1 overflow-auto px-4 py-1">
                        <DataTable
                          columns={columns}
                          data={pageSections.filter(
                            (section) =>
                              section.pageId === page.id &&
                              section.sectionType === 'lien-he',
                          )}
                          caption=" Thông tin công ty"
                          searchKey="title"
                          showGlobalFilter={false}
                          showColumnFilters={false}
                          enableSorting={true}
                          loading={loading}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <p>Đang cập nhật</p>
                )}
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="flex h-64 items-center justify-center">
            <p className="text-lg text-gray-500">Không có trang nào</p>
          </div>
        )}
      </LayoutBody>
      {showDeletePageDialog && (
        <ConfirmDialog
          open={showDeletePageDialog}
          onOpenChange={setShowDeletePageDialog}
          description={`Hành động này không thể hoàn tác. Phần này sẽ bị xóa.`}
          onConfirm={() => handleDelete(itemChoice.original?.id)}
          loading={loading}
        />
      )}
      {showUpdatePageDialog && (
        <PageDialog
          open={showUpdatePageDialog}
          onOpenChange={setShowUpdatePageDialog}
          initialData={{
            ...itemChoice.original,
            position: itemChoice.original?.position?.toString(),
          }}
          pageId={activeTab}
        />
      )}
      {showCreatePageDialog && (
        <PageDialog
          open={showCreatePageDialog}
          onOpenChange={setShowCreatePageDialog}
          initialData={null}
          pageId={activeTab}
        />
      )}
      {showBannerDialog && (
        <BannerDialog
          open={showBannerDialog}
          onOpenChange={setShowBannerDialog}
          pageId={currentPageId || 1}
          sectionType={sectionTypeVideo}
        />
      )}
      {showBannerEditDialog && (
        <BannerDialog
          open={showBannerEditDialog}
          onOpenChange={setShowBannerEditDialog}
          pageId={activeTab || 1}
          bannerData={itemChoice.original?.content[0]}
          id={itemChoice.original?.id}
          sectionType={sectionTypeVideo}
        />
      )}
      {showVideoDialog && (
        <VideoDialog
          open={showVideoDialog}
          onOpenChange={setShowVideoDialog}
          pageId={activeTab || 1}
          sectionType={sectionTypeVideo}
        />
      )}
      {showVideoEditDialog && (
        <VideoDialog
          open={showVideoEditDialog}
          onOpenChange={setShowVideoEditDialog}
          pageId={activeTab}
          videoData={itemChoice.original?.content[0]}
          id={itemChoice.original?.id}
          sectionType={sectionTypeVideo}
        />
      )}{' '}
      {showFooterDialog && (
        <FooterDialog
          open={showFooterDialog}
          onOpenChange={setShowFooterDialog}
          pageId={activeTab}
          footerData={itemChoice.original?.content}
          id={itemChoice.original?.id}
        />
      )}
      {showInfoEditDialog && (
        <InfoCompanyDialog
          open={showInfoEditDialog}
          onOpenChange={setShowInfoEditDialog}
          pageId={activeTab}
          footerData={itemChoice.original?.content}
          id={itemChoice.original?.id}
        />
      )}{' '}
      {showCreateDialog && (
        <InfoCompanyDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          pageId={activeTab}
          footerData={null}
          id={null}
        />
      )}
    </Layout>
  )
}

export default PageSectionPage
