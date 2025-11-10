"use client"

import * as React from "react"

type Tab = "account" | "interests" | "preferences" | "sessions" | "accounts" | "billing"

interface SettingsContextValue {
  openSettingsDialog: (tab?: Tab) => void
  closeSettingsDialog: () => void
  open: boolean
  setOpen: (open: boolean) => void
  initialTab: Tab
  setInitialTab: (tab: Tab) => void
}

const SettingsContext = React.createContext<SettingsContextValue | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const [initialTab, setInitialTab] = React.useState<Tab>("account")

  const openSettingsDialog = React.useCallback((tab: Tab = "account") => {
    setInitialTab(tab)
    setOpen(true)
  }, [])

  const closeSettingsDialog = React.useCallback(() => {
    setOpen(false)
  }, [])

  const value = React.useMemo(
    () => ({
      openSettingsDialog,
      closeSettingsDialog,
      open,
      setOpen,
      initialTab,
      setInitialTab,
    }),
    [openSettingsDialog, closeSettingsDialog, open, initialTab]
  )

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettingsState() {
  const context = React.useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettingsState must be used within SettingsProvider")
  }
  return {
    open: context.open,
    setOpen: context.setOpen,
    initialTab: context.initialTab,
    setInitialTab: context.setInitialTab,
  }
}

export const useSettingsDialogState = useSettingsState

export function useSettingsDialog() {
  const context = React.useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within SettingsProvider")
  }
  return {
    openSettingsDialog: context.openSettingsDialog,
    closeSettingsDialog: context.closeSettingsDialog,
  }
}

