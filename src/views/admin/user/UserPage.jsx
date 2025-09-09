import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import { DataTable } from '@/components/DataTable'
import Can from '@/utils/can'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'
import { TrashIcon, Pencil1Icon } from '@radix-ui/react-icons'
import { ConfirmDialog } from '@/components/ComfirmDialog'
import { deleteUser, getUsers } from '@/stores/UserSlice'
import UserDialog from './components/UserDialog'
import { useSearchParams } from 'react-router-dom'
import { dateFormat } from '@/utils/date-format'
const UserPage = () => {
  const dispatch = useDispatch()
  const [searchParams] = useSearchParams()
  const role = searchParams.get('role')
  const users = useSelector((state) => state.user.users)
  const loading = useSelector((state) => state.user.loading)
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false)
  const [showDeleteUserDialog, setShowDeleteUserDialog] = useState(false)
  const [showUpdateUserDialog, setShowUpdateUserDialog] = useState(false)
  const [itemChoice, setItemChoice] = useState({})

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteUser(id)).unwrap()
    } catch (error) {
      console.error('Error deleting User:', error)
    }
  }
  const handleShowDetails = async (id) => {
    try {
      setShowUpdateUserDialog(true)
    } catch (error) {
      console.error('Error fetching User details:', error)
    }
  }
  useEffect(() => {
    document.title = 'Quản lý người dùng'
    dispatch(getUsers({ type: role }))
  }, [dispatch, role])
  const columns = [
    {
      accessorKey: 'id',
      header: 'STT',
      cell: ({ row }) => <div className="">{row.index + 1}</div>,
    },
    {
      accessorKey: 'full_name',
      header: 'Tên người dùng',
    },
    role === 'admin'
      ? {
          accessorKey: 'roles',
          header: 'Vai trò',
          cell: ({ row }) => {
            const roles = row.getValue('roles')
            return <div>{roles[0]?.description || 'Không xác định'}</div>
          },
        }
      : {
          accessorKey: 'phone_number',
          header: 'Số điện thoại',
          cell: ({ row }) => {
            const phoneNumber = row.getValue('phone_number')
            return (
              <div className={`${phoneNumber ? '' : 'text-muted-foreground'}`}>
                {phoneNumber || 'Không xác định'}
              </div>
            )
          },
        },
    {
      id: 'createdAt',
      header: 'Ngày tạo',
      accessorKey: 'createdAt',
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
          <Can permission={'user_update'}>
            <Button
              className="text-blue-500"
              variant="outline"
              size="sm"
              title="Chi tiết"
              onClick={() => {
                setItemChoice(row)
                handleShowDetails(row.original?.id)
              }}
            >
              <Pencil1Icon className="h-6 w-6" />
            </Button>
          </Can>
          <Can permission={'user_delete'}>
            <Button
              variant="outline"
              size="sm"
              className="text-red-500"
              title="Xóa"
              onClick={() => {
                setItemChoice(row)
                setShowDeleteUserDialog(true)
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
        <Can permission={'user_create'}>
          {role === 'admin' && (
            <Button
              onClick={() => setShowCreateUserDialog(true)}
              className="mx-2"
              variant="outline"
              size="sm"
            >
              <PlusIcon className="mr-2 size-4" aria-hidden="true" />
              Thêm mới
            </Button>
          )}

          {showCreateUserDialog && (
            <UserDialog
              open={showCreateUserDialog}
              onOpenChange={setShowCreateUserDialog}
              initialData={null}
              isModal={role}
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
              Danh sách {role === 'admin' ? 'người dùng' : 'khách hàng'}
            </h2>
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          {users && (
            <DataTable
              columns={columns}
              data={users}
              toolbar={toolbar}
              caption="Danh sách người dùng"
              searchKey="description"
              searchPlaceholder="Tìm theo tên..."
              showGlobalFilter={true}
              showColumnFilters={true}
              enableSorting={true}
              loading={loading}
            />
          )}
        </div>
      </LayoutBody>
      {showDeleteUserDialog && (
        <ConfirmDialog
          open={showDeleteUserDialog}
          onOpenChange={setShowDeleteUserDialog}
          description={`Hành động này không thể hoàn tác. người dùng: ${itemChoice.original?.full_name} sẽ bị xóa.`}
          onConfirm={() => handleDelete(itemChoice.original?.id)}
          loading={loading}
        />
      )}
      {showUpdateUserDialog && (
        <UserDialog
          open={showUpdateUserDialog}
          onOpenChange={setShowUpdateUserDialog}
          userData={{
            ...itemChoice.original,
            role_id: itemChoice.original?.roles[0]?.id,
          }}
          showTrigger={false}
          isUpdate={true}
          isModal={role}
        />
      )}
    </Layout>
  )
}

export default UserPage
