"use client"

import { useState } from "react"
import { Edit2, MoreVertical, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import type { MenuItem } from "@/types"

// Sample data - in a real app, this would come from an API
const sampleMenuItems: MenuItem[] = [
  {
    id: "1",
    cookId: "1",
    name: "Butter Chicken",
    description: "Creamy and rich butter chicken with naan",
    price: 199,
    dietaryType: "non-veg",
    cuisineType: "indian",
    mealType: "lunch",
    dayOfWeek: 1,
    isAvailable: true,
  },
  {
    id: "2",
    cookId: "1",
    name: "Vegetable Biryani",
    description: "Fragrant rice with mixed vegetables",
    price: 149,
    dietaryType: "veg",
    cuisineType: "indian",
    mealType: "dinner",
    dayOfWeek: 1,
    isAvailable: true,
  },
  {
    id: "3",
    cookId: "1",
    name: "Chapati",
    description: "Wheat Roti",
    price: 14,
    dietaryType: "veg",
    cuisineType: "indian",
    mealType: "lunch",
    dayOfWeek: 1,
    isAvailable: true,
  },
]

export function MenuList() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(sampleMenuItems)

  const handleDelete = async (id: string) => {
    try {
      // Here we would typically make an API call to delete the item
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setMenuItems((prev) => prev.filter((item) => item.id !== id))

      toast({
        title: "Item deleted",
        description: "Menu item has been deleted successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not delete the item. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getDayName = (day: number) => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    return days[day - 1]
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Day</TableHead>
          <TableHead>Meal Type</TableHead>
          <TableHead>Dietary Type</TableHead>
          <TableHead className="text-right">Price</TableHead>
          <TableHead className="w-[70px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {menuItems.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell>{getDayName(item.dayOfWeek)}</TableCell>
            <TableCell className="capitalize">{item.mealType}</TableCell>
            <TableCell className="capitalize">{item.dietaryType}</TableCell>
            <TableCell className="text-right">₹{item.price}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(item.id)}>
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

