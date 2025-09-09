import { Button } from '@/components/custom/Button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
} from '@/components/ui/dialog'
import { PlusIcon } from '@radix-ui/react-icons'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDispatch, useSelector } from 'react-redux'
import { updateRole } from '@/stores/RoleSlice'
import { updateRoleSchema } from '../schema'
import { useEffect, useState } from 'react'
import { getPermission } from '@/stores/PermissionSlice'
import { Checkbox } from '@/components/ui/checkbox'
const UpdateRoleDialog = ({
  role,
  open,
  onOpenChange,
  showTrigger = true,
  ...props
}) => {
  const loading = useSelector((state) => state.role.loading)
  const permissions = useSelector((state) => state.permission.permissions)
  const form = useForm({
    resolver: zodResolver(updateRoleSchema),
    defaultValues: {
      description: role?.description || '',
      name: role?.name || '',
    },
  })
  const [checkedPermissions, setCheckedPermissions] = useState([])
  const dispatch = useDispatch()
  const onSubmit = async (data) => {
    let dataUpdate = {
      name: data.name,
      description: data.description,
      permissionIds: checkedPermissions,
    }
    try {
      await dispatch(
        updateRole({ id: role.id, dataUpdate: dataUpdate }),
      ).unwrap()
      form.reset()
      onOpenChange?.(false)
    } catch (error) {
      console.log('Submit error: ', error)
    }
  }

  useEffect(() => {
    dispatch(getPermission())
    setCheckedPermissions(role?.permissions?.map((permission) => permission.id))
  }, [dispatch, role?.permissions])

  const handleCheck = (permissionId, isChecked, children = [], parentId) => {
    let updatedCheckedPermissions = [...checkedPermissions]

    const processPermissions = (id, add) => {
      updatedCheckedPermissions = add
        ? [...updatedCheckedPermissions, id]
        : updatedCheckedPermissions?.filter((checkedId) => checkedId !== id)
    }

    processPermissions(permissionId, isChecked)
    children.forEach((child) => processPermissions(child.id, isChecked))

    if (parentId) {
      const parent = permissions.find(
        (permission) => permission.id === parentId,
      )
      const allChildrenChecked = parent?.children?.every((child) =>
        updatedCheckedPermissions?.includes(child.id),
      )
      processPermissions(parentId, allChildrenChecked)
    }
    setCheckedPermissions(updatedCheckedPermissions)
  }

  const renderPermission = (permissions, parentId = null) => {
    return permissions.map((permission) => (
      <div key={permission.id} className="mb-1 ml-4">
        <div className="items-top flex space-x-2">
          <Checkbox
            checked={checkedPermissions?.includes(permission.id)}
            onCheckedChange={(isChecked) =>
              handleCheck(
                permission.id,
                isChecked,
                permission.children,
                parentId,
              )
            }
            id={permission.code}
          />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor={permission.code}
              className="text-xs leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {permission.description}
            </label>
          </div>
        </div>
        {permission?.children &&
          renderPermission(permission.children, permission.id)}
      </div>
    ))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button className="mx-2" variant="outline" size="sm">
            <PlusIcon className="mr-2 size-4" aria-hidden="true" />
            Cập nhật
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="md:h-auto md:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Cập nhật vai trò: {role?.name}</DialogTitle>
          <DialogDescription>
            Điền vào chi tiết phía dưới để cập nhật vai trò
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-auto p-1 md:max-h-[75vh]">
          <Form {...form}>
            <form id="update-role" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="mb-3 grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel required={true}>Mã vai trò</FormLabel>
                      <FormControl>
                        <Input
                          // readOnly
                          placeholder="Nhập mã vai trò"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel required={true}>Tên vai trò</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Nhập tên vai trò"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="col-span-full">
                  <label htmlFor="permissions" className="text-sm font-medium">
                    Chọn các quyền cho vai trò
                  </label>
                </div>
                <>{renderPermission(permissions)}</>
              </div>
            </form>
          </Form>
        </div>

        <DialogFooter className="flex gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset()
              }}
            >
              Hủy
            </Button>
          </DialogClose>

          <Button form="update-role" loading={loading}>
            Cập nhật
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default UpdateRoleDialog
