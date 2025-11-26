"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Feather } from 'lucide-react'

export default function Header() {
  return (
    <header className="flex items-center justify-between p-2 border-b shrink-0 h-14 border-primary/20 bg-sidebar">
      <div className="flex items-center gap-2">
        <Feather className="w-6 h-6 text-primary" />
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Chronicle AI
        </h1>
      </div>
      <div className="md:hidden">
        <SidebarTrigger>
            <Feather/>
        </SidebarTrigger>
      </div>
    </header>
  )
}
