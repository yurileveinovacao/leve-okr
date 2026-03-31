'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

type SidebarContextType = {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  toggle: () => void
}

const SidebarContext = createContext<SidebarContextType>({
  isOpen: false,
  setIsOpen: () => {},
  toggle: () => {}
})

export function useSidebar() {
  return useContext(SidebarContext)
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const toggle = () => setIsOpen(!isOpen)

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen, toggle }}>
      {children}
    </SidebarContext.Provider>
  )
}
