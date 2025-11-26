"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Feather } from 'lucide-react'

export default function Header() {
  return (
    <header className="flex items-center justify-between p-2 border-b shrink-0 h-14">
      <div className="flex items-center gap-2">
        <Feather className="w-6 h-6 text-primary-foreground" />
        <h1 className="text-xl font-bold tracking-tight text-primary-foreground">
          Chronicle AI
        </h1>
      </div>
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
    </header>
  )
}
