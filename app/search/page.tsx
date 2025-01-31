'use client'

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"


export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setIsLoading(true)
    try {
      // TODO: Replace with actual API endpoint
      const response = await fetch(`/api/search?query=${searchQuery}`)
      const data = await response.json()
      setSearchResults(data)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-16">
      <div className="flex flex-col items-center gap-8 max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center">Find a Cook</h1>
        
        <div className="flex w-full gap-4">
          <Input
            type="text"
            placeholder="Search for cooks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center w-full py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mt-8">
            {searchResults.map((cook: any) => (
              <Card key={cook.id} className="p-4">
                <h3 className="font-semibold">{cook.name}</h3>
                <p className="text-sm text-gray-600">{cook.specialty}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
