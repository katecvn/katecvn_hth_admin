import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import { DataTable } from '@/components/DataTable'
import Can from '@/utils/can'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'
import { TrashIcon, Pencil1Icon } from '@radix-ui/react-icons'
import { ConfirmDialog } from '@/components/ComfirmDialog'
import { deleteRole, getRoles, getRoleById } from '@/stores/RoleSlice'
import CreateRoleDialog from './components/CreateRoleDialog'
import UpdateRoleDialog from './components/UpdateRoleDialog'

const RolePage = () => {
  const dispatch = useDispatch()
  const roles = useSelector((state) => state.role.roles)
  const loading = useSelector((state) => state.role.loading)
  const selectedRole = useSelector((state) => state.role.selectedRole)
  const [showCreateRoleDialog, setShowCreateRoleDialog] = useState(false)
  const [showDeleteRoleDialog, setShowDeleteRoleDialog] = useState(false)
  const [showUpdateRoleDialog, setShowUpdateRoleDialog] = useState(false)
  const [itemChoice, setItemChoice] = useState({})

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteRole(id)).unwrap()
    } catch (error) {
      console.error('Error deleting role:', error)
    }
  }
  const handleShowDetails = async (id) => {
    try {
      await dispatch(getRoleById(id)).unwrap()
      setShowUpdateRoleDialog(true)
    } catch (error) {
      console.error('Error fetching role details:', error)
    }
  }
  useEffect(() => {
    document.title = 'Quản lý vai trò'
    dispatch(getRoles())
  }, [dispatch])
  const columns = [
    {
      accessorKey: 'id',
      header: 'STT',
      cell: ({ row }) => <div className="">{row.index + 1}</div>,
    },
    {
      accessorKey: 'description',
      header: 'Tên vai trò',
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Can permission={'role_update'}>
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
          <Can permission={'role_delete'}>
            <Button
              variant="outline"
              size="sm"
              className="text-red-500"
              title="Xóa"
              onClick={() => {
                setItemChoice(row)
                setShowDeleteRoleDialog(true)
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
        <Can permission={'role_create'}>
          <Button
            onClick={() => setShowCreateRoleDialog(true)}
            className="mx-2"
            variant="outline"
            size="sm"
          >
            <PlusIcon className="mr-2 size-4" aria-hidden="true" />
            Thêm mới
          </Button>

          {showCreateRoleDialog && (
            <CreateRoleDialog
              open={showCreateRoleDialog}
              onOpenChange={setShowCreateRoleDialog}
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
              Danh sách vai trò
            </h2>
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          {roles && (
            <DataTable
              columns={columns}
              data={roles}
              toolbar={toolbar}
              caption="Danh sách vai trò"
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
      {showDeleteRoleDialog && (
        <ConfirmDialog
          open={showDeleteRoleDialog}
          onOpenChange={setShowDeleteRoleDialog}
          description={`Hành động này không thể hoàn tác. vai trò: ${itemChoice.original?.name} sẽ bị xóa.`}
          onConfirm={() => handleDelete(itemChoice.original?.id)}
          loading={loading}
        />
      )}
      {showUpdateRoleDialog && (
        <UpdateRoleDialog
          open={showUpdateRoleDialog}
          onOpenChange={setShowUpdateRoleDialog}
          role={selectedRole}
          showTrigger={false}
        />
      )}
    </Layout>
  )
}

export default RolePage
