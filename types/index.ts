export type UserRole = "student" | "cook" | "delivery" | "admin"

export type UserStatus = "pending" | "active" | "suspended"

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready_for_pickup"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"

export type MealType = "breakfast" | "lunch" | "dinner"

export type CuisineType = "indian" | "chinese" | "continental" | "other"

export type DietaryType = "veg" | "non-veg" | "vegan"

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: UserRole
  status: UserStatus
  createdAt: Date
  updatedAt: Date
}

export interface Cook extends User {
  address: string
  profilePicture?: string
  certification?: string
  rating: number
  totalOrders: number
  totalEarnings: number
  isAvailable: boolean
}

export interface MenuItem {
  id: string
  cookId: string
  name: string
  description: string
  price: number
  dietaryType: DietaryType
  cuisineType: CuisineType
  mealType: MealType
  dayOfWeek: number
  isAvailable: boolean
}

export interface Order {
  id: string
  studentId: string
  cookId: string
  deliveryId?: string
  items: MenuItem[]
  status: OrderStatus
  totalAmount: number
  specialInstructions?: string
  createdAt: Date
  updatedAt: Date
}

