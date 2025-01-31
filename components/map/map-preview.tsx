"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Loader } from "@googlemaps/js-api-loader"
import { Loader2, MapPin } from "lucide-react"
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form"
import { debounce } from "@/utils/debounce"

interface MapPreviewProps {
  address?: string
  latitude?: number
  longitude?: number
  onLocationSelect?: (lat: number, lng: number) => void
}

export function MapPreview({ address, latitude, longitude, onLocationSelect }: MapPreviewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [marker, setMarker] = useState<google.maps.Marker | null>(null)
  const [loading, setLoading] = useState(true)
  const [geocoding, setGeocoding] = useState(false)

  // Initialize map
  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: "AIzaSyD1OjzcrhV-eNQI8hYxrS05axt9PCj0I8k",
        version: "weekly",
        libraries: ["places"],
      })

      try {
        const google = await loader.load()
        if (!mapRef.current) return

        const initialPosition = {
          lat: latitude || 20.5937,
          lng: longitude || 78.9629,
        }

        const mapInstance = new google.maps.Map(mapRef.current, {
          center: initialPosition,
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        })

        const markerInstance = new google.maps.Marker({
          position: initialPosition,
          map: mapInstance,
          draggable: true,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: "#FF0000",
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#FFFFFF",
          },
        })

        markerInstance.addListener("dragend", () => {
          const position = markerInstance.getPosition()
          if (position && onLocationSelect) {
            onLocationSelect(position.lat(), position.lng())
          }
        })

        setMap(mapInstance)
        setMarker(markerInstance)
        setLoading(false)
      } catch (error) {
        console.error("Error loading Google Maps:", error)
        setLoading(false)
      }
    }

    initMap()
  }, [latitude, longitude, onLocationSelect])

  // Geocode address and update map
  const geocodeAddress = useCallback(
    async (addressToGeocode: string) => {
      if (!map || !marker || !addressToGeocode.trim()) return

      setGeocoding(true)
      const geocoder = new google.maps.Geocoder()

      try {
        const results = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
          geocoder.geocode({ address: addressToGeocode }, (results, status) => {
            if (status === "OK" && results) {
              resolve(results)
            } else {
              reject(new Error(`Geocoding failed: ${status}`))
            }
          })
        })

        const location = results[0].geometry.location
        map.setCenter(location)
        map.setZoom(16)
        marker.setPosition(location)

        if (onLocationSelect) {
          onLocationSelect(location.lat(), location.lng())
        }
      } catch (error) {
        console.error("Geocoding error:", error)
        // You might want to show a toast here for user feedback
      } finally {
        setGeocoding(false)
      }
    },
    [map, marker, onLocationSelect],
  )

  // Debounced geocoding
  const debouncedGeocodeAddress = useCallback(
    debounce((address: string) => geocodeAddress(address), 1000),
    [geocodeAddress],
  )

  // Watch address changes
  useEffect(() => {
    if (address) {
      debouncedGeocodeAddress(address)
    }
  }, [address, debouncedGeocodeAddress])

  if (loading) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center bg-muted rounded-md">
        <MapPin className="h-6 w-4 animate-pulse" />
      </div>
    )
  }

  return (
    <FormField
      name="location"
      render={() => (
        <FormItem>
          <div className="space-y-2">
            <FormLabel>Location on Map</FormLabel>
            <FormControl>
              <div className="relative">
                <div ref={mapRef} className="h-[300px] w-full rounded-md" />
                {geocoding && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-md">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                )}
              </div>
            </FormControl>
            <FormDescription>
              {geocoding
                ? "Finding location on map..."
                : "Drag the marker to adjust your exact location or type your address above"}
            </FormDescription>
          </div>
        </FormItem>
      )}
    />
  )
}

