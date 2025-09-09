import React, { useEffect, useState } from 'react'
import Can from '@/utils/can'
import AdminReport from './components/AdminReport'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import { endOfMonth, format, startOfMonth } from 'date-fns'
import { useForm } from 'react-hook-form'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover.jsx'
import { Button } from '@/components/custom/Button.jsx'
import { cn } from '@/lib/utils.js'
import { CalendarIcon } from 'lucide-react'
import { DatePicker } from '@/components/custom/DatePicker.jsx'

const DashboardPage = () => {
  const current = new Date()
  const [filters, setFilters] = useState({
    fromDate: startOfMonth(current),
    toDate: endOfMonth(current),
  })
  const form = useForm({
    defaultValues: {
      fromDate: filters.fromDate,
      toDate: filters.toDate,
    },
  })

  const onSubmit = async (data) => {
    setFilters({
      fromDate: data.fromDate || filters.fromDate,
      toDate: data.toDate || filters.toDate,
    })
  }

  useEffect(() => {
    document.title = 'Trang quản trị - Admin'
  }, [])

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-8 block items-center justify-between space-y-2 md:flex lg:flex">
          <h2 className="text-2xl font-bold tracking-tight">Tổng quan</h2>
        </div>

        {/* <Can permission={['GET_REPORT']}> */}
        <AdminReport fromDate={filters.fromDate} toDate={filters.toDate} />
        {/* </Can> */}
      </LayoutBody>
    </Layout>
  )
}

export default DashboardPage
