import { useReducer } from 'react'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const moneyFormatter = Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const MoneyInput = ({ required, description = '', ...props }) => {
  const initialValue = props.form.getValues()[props.name]
    ? moneyFormatter
        .format(props.form.getValues()[props.name])
        .replace(/\./g, ',')
    : ''

  const [value, setValue] = useReducer((_, next) => {
    const digits = next.replace(/\D/g, '')
    return moneyFormatter.format(Number(digits)).replace(/\./g, ',')
  }, initialValue)

  function handleChange(realChangeFn, formattedValue) {
    const digits = formattedValue.replace(/\D/g, '')
    realChangeFn(digits)
  }

  return (
    <FormField
      control={props.form.control}
      name={props.name}
      render={({ field }) => {
        field.value = value
        const _change = field.onChange

        return (
          <FormItem className="mb-2 space-y-1">
            <FormLabel required={required}>{props.label}</FormLabel>
            <FormControl>
              <Input
                className="text-end"
                placeholder={props.placeholder}
                type="text"
                {...field}
                onChange={(ev) => {
                  setValue(ev.target.value)
                  handleChange(_change, ev.target.value)
                }}
                value={value}
              />
            </FormControl>

            {description.length > 0 && (
              <FormDescription className="text-primary">
                {description}
              </FormDescription>
            )}
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}

export default MoneyInput
