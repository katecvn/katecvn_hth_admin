import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import { DataTable } from '@/components/DataTable'
import Can from '@/utils/can'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'
import { TrashIcon, Pencil1Icon } from '@radix-ui/react-icons'

import {
  deleteSpecification,
  getSpecifications,
} from '@/stores/SpecificationSlice'
import SpecificationDialog from './SpecificationDialog'
import { ConfirmDialog } from '@/components/ComfirmDialog'
import { getSpecificationGroups } from '@/stores/SpecificationGroupSlice'

const SpecificationPage = () => {
  const dispatch = useDispatch()
  const specifications = useSelector(
    (state) => state.specification.specifications,
  )
  const specificationGroups = useSelector(
    (state) => state.specificationGroup.specificationGroups,
  )
  const loading = useSelector((state) => state.specification.loading)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)
  const [itemChoice, setItemChoice] = useState({})

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteSpecification(id)).unwrap()
    } catch (error) {
      console.error('Error deleting Specification:', error)
    }
  }

  useEffect(() => {
    document.title = 'Quản lý thông số sản phẩm'
    dispatch(getSpecifications())
    // dispatch(getSpecificationGroups())
  }, [dispatch])

  const columns = [
    {
      accessorKey: 'id',
      header: 'STT',
      cell: ({ row }) => <div>{row.index + 1}</div>,
    },
    {
      accessorKey: 'name',
      header: 'Tên thông số',
    },
    {
      id: 'groupId',
      accessorFn: (row) => row.groupId,
      header: 'Nhóm',
      cell: ({ row }) => {
        const groupName = row.original.group?.name
        return groupName ? (
          <span>{groupName}</span>
        ) : (
          <span className="italic text-gray-400">Không có</span>
        )
      },
      filterFn: (row, columnId, filterValue) => {
        const groupId = row.original.groupId
        return filterValue.includes(groupId)
      },
      enableSorting: true,
      enableHiding: true,
      meta: {
        filterType: 'multiselect',
        placeholder: 'Lọc nhóm',
        options: specificationGroups.map((g) => ({
          label: g.name,
          value: g.id,
        })),
      },
    },
    {
      id: 'isRequired',
      accessorFn: (row) =>
        typeof row.isRequired === 'boolean'
          ? row.isRequired
            ? '1'
            : '0'
          : String(row.isRequired),
      header: 'Bắt buộc',
      cell: ({ row }) => (
        <span>
          {row.original.isRequired === '1' ||
          row.original.isRequired === 1 ||
          row.original.isRequired === true
            ? 'Có'
            : 'Không'}
        </span>
      ),
      filterFn: (row, columnId, filterValue) => {
        const value =
          typeof row.original.isRequired === 'boolean'
            ? row.original.isRequired
              ? '1'
              : '0'
            : String(row.original.isRequired)
        return filterValue.includes(value)
      },
      enableSorting: true,
      enableHiding: true,
      meta: {
        filterType: 'multiselect',
        placeholder: 'Lọc bắt buộc',
        options: [
          { label: 'Có', value: '1' },
          { label: 'Không', value: '0' },
        ],
      },
    },

    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Can permission={''}>
            <Button
              className="text-blue-500"
              variant="outline"
              size="sm"
              title="Sửa"
              onClick={() => {
                setItemChoice(row)
                setShowUpdateDialog(true)
              }}
            >
              <Pencil1Icon className="h-6 w-6" />
            </Button>
          </Can>
          <Can permission={''}>
            <Button
              variant="outline"
              size="sm"
              className="text-red-500"
              title="Xóa"
              onClick={() => {
                setItemChoice(row)
                setShowDeleteDialog(true)
              }}
            >
              <TrashIcon className="h-6 w-6" />
            </Button>
          </Can>
        </div>
      ),
    },
  ]

  const toolbar = [
    {
      children: (
        <Can permission={''}>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="mx-2"
            variant="outline"
            size="sm"
          >
            <PlusIcon className="mr-2 size-4" aria-hidden="true" />
            Thêm mới
          </Button>

          {showCreateDialog && (
            <SpecificationDialog
              open={showCreateDialog}
              onOpenChange={setShowCreateDialog}
              initialData={null}
              groupOptions={specificationGroups}
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
              Danh sách thông số sản phẩm
            </h2>
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          {specifications && (
            <DataTable
              columns={columns}
              data={specifications}
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
      {showDeleteDialog && (
        <ConfirmDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          description={`Hành động này không thể hoàn tác. Thông số: ${itemChoice.original?.name} sẽ bị xóa.`}
          onConfirm={() => handleDelete(itemChoice?.original?.id)}
          loading={loading}
        />
      )}
      {showUpdateDialog && (
        <SpecificationDialog
          open={showUpdateDialog}
          onOpenChange={setShowUpdateDialog}
          initialData={itemChoice.original}
          groupOptions={specificationGroups}
        />
      )}
    </Layout>
  )
}

export default SpecificationPage
