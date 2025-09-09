export function parseDateLocal(dateString) {
  if (!dateString) return undefined
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day)
}

// Helper: format Date về "DD/MM/YYYY"
export function formatDateVN(dateString) {
  const d = parseDateLocal(dateString)
  if (!d) return ''
  const dd = d.getDate().toString().padStart(2, '0')
  const mm = (d.getMonth() + 1).toString().padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}
