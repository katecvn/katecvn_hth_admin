import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { Button } from './custom/Button'
import { IconChevronsLeft, IconMenu2, IconX } from '@tabler/icons-react'
import { Layout, LayoutHeader } from './custom/Layout'
import Nav from './Nav'
import { sideLinks } from '@/data/SideLink'
import { Link } from 'react-router-dom'

const MENU_COLOR = import.meta.env.VITE_COLOR_MENU || 'rgb(45 101 230)'

const Sidebar = ({ className, isCollapsed, setIsCollapsed }) => {
  const [navOpened, setNavOpened] = useState(false)

  useEffect(() => {
    document.documentElement.style.setProperty('--menu-color', MENU_COLOR)
  }, [])

  return (
    <aside
      className={cn(
        `fixed left-0 right-0 top-0 z-50 w-full border-r-2 border-r-muted transition-[width] md:bottom-0 md:right-auto md:h-svh ${isCollapsed ? 'md:w-14' : 'md:w-64'}`,
        className,
      )}
    >
      {/* Overlay in mobile */}
      <div
        onClick={() => setNavOpened(false)}
        className={`absolute inset-0 transition-[opacity] duration-100 ${navOpened ? 'h-svh opacity-50' : 'h-0 opacity-0'} w-full bg-black md:hidden`}
      />

      <Layout>
        {/* Header */}
        <LayoutHeader className="bg-menu-color sticky top-0 justify-between px-4 py-3 shadow dark:bg-secondary md:px-4">
          <Link to={'/dashboard'}>
            <div className={`flex items-center ${!isCollapsed ? 'gap-2' : ''}`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 256 256"
                className={`transition-all ${isCollapsed ? 'block h-6 w-6' : 'hidden h-8 w-8'}`}
              >
                <rect width="256" height="256" fill="none"></rect>
                <line
                  className={`${isCollapsed ? 'block' : 'hidden'}`}
                  x1="208"
                  y1="128"
                  x2="128"
                  y2="208"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="16"
                ></line>
                <line
                  className={`${isCollapsed ? 'block' : 'hidden'}`}
                  x1="192"
                  y1="40"
                  x2="40"
                  y2="192"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="16"
                ></line>
                <span className="sr-only">Kactec</span>
              </svg>
              <div
                className={`flex flex-col justify-end truncate ${isCollapsed ? 'invisible w-0' : 'visible w-auto'}`}
              >
                <span className="mx-2 text-2xl font-bold uppercase text-secondary dark:text-primary">
                  Admin
                </span>
              </div>
            </div>
          </Link>
          {/* Toggle Button in mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Toggle Navigation"
            aria-controls="sidebar-menu"
            aria-expanded={navOpened}
            onClick={() => setNavOpened((prev) => !prev)}
          >
            {navOpened ? (
              <IconX className="text-secondary dark:text-primary" />
            ) : (
              <IconMenu2 className="text-secondary dark:text-primary" />
            )}
          </Button>
        </LayoutHeader>

        {/* Navigation links */}
        <Nav
          id="sidebar-menu"
          className={`h-full flex-1 overflow-y-auto overflow-x-hidden transition-all ${
            navOpened
              ? 'max-h-[80vh] py-2 md:max-h-screen'
              : 'max-h-0 py-0 md:max-h-screen md:py-2'
          }`}
          closeNav={() => setNavOpened(false)}
          isCollapsed={isCollapsed}
          links={sideLinks}
        />

        {/* Scrollbar width toggle button */}
        <Button
          onClick={() => setIsCollapsed((prev) => !prev)}
          size="icon"
          variant="outline"
          className="absolute -right-5 top-1/2 hidden rounded-full md:inline-flex"
        >
          <IconChevronsLeft
            stroke={1.5}
            className={`h-5 w-5 ${isCollapsed ? 'rotate-180' : ''}`}
          />
        </Button>
      </Layout>
    </aside>
  )
}

export default Sidebar
