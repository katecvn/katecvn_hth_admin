const Can = ({ permission, children, option = 'every' }) => {
  const userPermissions =
    JSON.parse(localStorage.getItem('permissionCodes')) || []

  const hasPermission = (() => {
    if (!permission) return true

    if (Array.isArray(permission)) {
      return option === 'every'
        ? permission.every((p) =>
            userPermissions.some((perm) => perm.name === p),
          )
        : permission.some((p) =>
            userPermissions.some((perm) => perm.name === p),
          )
    }

    return userPermissions.some((perm) => perm.name === permission)
  })()

  if (hasPermission) {
    // if (true) {
    return <>{children}</>
  }

  return null
}

export default Can
