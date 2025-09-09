import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import { DataTable } from '@/components/DataTable'
import Can from '@/utils/can'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'
import { TrashIcon, Pencil1Icon } from '@radix-ui/react-icons'

import {
  deleteSpecificationGroup,
  getSpecificationGroups,
} from '@/stores/SpecificationGroupSlice'
import SpecificationGroupDialog from './SpecificationGroupDialog'
import { ConfirmDialog } from '@/components/ComfirmDialog'

const SpecificationGroupPage = () => {
  const dispatch = useDispatch()
  const specificationGroups = useSelector(
    (state) => state.specificationGroup.specificationGroups,
  )
  const loading = useSelector((state) => state.specificationGroup.loading)
  const [
    showCreateSpecificationGroupDialog,
    setShowCreateSpecificationGroupDialog,
  ] = useState(false)
  const [
    showDeleteSpecificationGroupDialog,
    setShowDeleteSpecificationGroupDialog,
  ] = useState(false)

  const [
    showUpdateSpecificationGroupDialog,
    setShowUpdateSpecificationGroupDialog,
  ] = useState(false)

  const [itemChoice, setItemChoice] = useState({})

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteSpecificationGroup(id)).unwrap()
    } catch (error) {
      console.error('Error deleting Topic:', error)
    }
  }
  useEffect(() => {
    document.title = 'Quản lý nhóm thông số sản phẩm'
    dispatch(getSpecificationGroups())
  }, [dispatch])
  const columns = [
    {
      accessorKey: 'id',
      header: 'STT',
      cell: ({ row }) => <div className="">{row.index + 1}</div>,
    },
    {
      accessorKey: 'name',
      header: 'Tên nhóm',
    },
    {
      accessorKey: 'position',
      header: 'Vị trí',
      cell: ({ row }) => {
        const position = row.getValue('position')
        return <span className={`rounded-md px-3 py-1`}>{position}</span>
      },
    },

    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Can permission={'topic_update'}>
            <Button
              className="text-blue-500"
              variant="outline"
              size="sm"
              title="Chi tiết"
              onClick={() => {
                setItemChoice(row)
                setShowUpdateSpecificationGroupDialog(true)
              }}
            >
              <Pencil1Icon className=" h-6 w-6" />
            </Button>
          </Can>

          <Can permission={'topic_delete'}>
            <Button
              variant="outline"
              size="sm"
              className="text-red-500"
              title="Xóa"
              onClick={() => {
                setItemChoice(row)
                setShowDeleteSpecificationGroupDialog(true)
              }}
            >
              <TrashIcon className=" h-6 w-6" />
            </Button>
          </Can>
        </div>
      ),
    },
  ]
  const toolbar = [
    {
      children: (
        <Can permission={'topic_create'}>
          <Button
            onClick={() => setShowCreateSpecificationGroupDialog(true)}
            className="mx-2"
            variant="outline"
            size="sm"
          >
            <PlusIcon className="mr-2 size-4" aria-hidden="true" />
            Thêm mới
          </Button>

          {showCreateSpecificationGroupDialog && (
            <SpecificationGroupDialog
              open={showCreateSpecificationGroupDialog}
              onOpenChange={setShowCreateSpecificationGroupDialog}
              initialData={null}
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
            <h2 className="text-2xl font-bold tracking-tight">
              Danh sách nhóm thông số sản phẩm
            </h2>
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          {specificationGroups && (
            <DataTable
              columns={columns}
              data={specificationGroups}
              toolbar={toolbar}
              caption="Danh sách thông số sản phẩm"
              searchKey="name"
              searchPlaceholder="Tìm theo tên..."
              showGlobalFilter={true}
              showColumnFilters={true}
              enableSorting={true}
              loading={loading}
            />
          )}
        </div>
      </LayoutBody>
      {showDeleteSpecificationGroupDialog && (
        <ConfirmDialog
          open={showDeleteSpecificationGroupDialog}
          onOpenChange={setShowDeleteSpecificationGroupDialog}
          description={`Hành động này không thể hoàn tác. chủ đề: ${itemChoice.original?.name} sẽ bị xóa.`}
          onConfirm={() => handleDelete(itemChoice?.original?.id)}
          loading={loading}
        />
      )}
      {showUpdateSpecificationGroupDialog && (
        <SpecificationGroupDialog
          open={showUpdateSpecificationGroupDialog}
          onOpenChange={setShowUpdateSpecificationGroupDialog}
          initialData={itemChoice.original}
        />
      )}
    </Layout>
  )
}

export default SpecificationGroupPage
