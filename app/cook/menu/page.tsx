import type { Metadata } from "next"

import { MenuForm } from "@/components/cook/menu-form"
import { MenuList } from "@/components/cook/menu-list"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const metadata: Metadata = {
  title: "Menu Management",
  description: "Manage your weekly menu and meal prices",
}

export default function MenuPage() {
  return (
    <div className="space-y-6 p-10 pb-16">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Menu Management</h2>
        <p className="text-muted-foreground">Manage your weekly menu and meal prices</p>
      </div>
      <Separator />
      <Tabs defaultValue="view" className="space-y-4">
        <TabsList>
          <TabsTrigger value="view">View Menu</TabsTrigger>
          <TabsTrigger value="add">Add Item</TabsTrigger>
        </TabsList>
        <TabsContent value="view" className="space-y-4">
          <MenuList />
        </TabsContent>
        <TabsContent value="add" className="space-y-4">
          <MenuForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}

