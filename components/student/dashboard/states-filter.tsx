"use client"

import * as React from "react"
import { Check } from "lucide-react"

import { states } from "@/lib/data/states"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { cn } from "@/lib/utils"

interface StatesFilterProps {
  selectedState: string
  onStateChange: (state: string) => void
}

export function StatesFilter({ selectedState, onStateChange }: StatesFilterProps) {
  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      className="w-full"
    >
      <CarouselContent className="-ml-2 md:-ml-4">
        {states.map((state) => (
          <CarouselItem key={state} className="pl-2 md:pl-4 basis-auto">
            <Card
              className={cn("border-2", selectedState === state ? "border-primary bg-primary/5" : "border-transparent")}
            >
              <CardContent className="flex items-center gap-2 p-2">
                <Button variant="ghost" className="h-auto p-0" onClick={() => onStateChange(state)}>
                  {state}
                </Button>
                {selectedState === state && <Check className="h-4 w-4 text-primary" />}
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}

