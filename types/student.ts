export interface Student extends User {
  college: string
  hostelAddress: string
  preferences: {
    dietaryType: DietaryType[]
    cuisinePreferences: CuisineType[]
  }
  rating: number
  totalOrders: number
}

export interface Rating {
  id: string
  fromId: string
  toId: string
  rating: number
  review: string
  orderId: string
  createdAt: Date
}

export interface BankDetails {
  id: string
  userId: string
  accountHolderName: string
  accountNumber: string
  ifscCode: string
  bankName: string
  isVerified: boolean
}

