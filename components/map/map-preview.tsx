"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star } from "lucide-react";
import Link from "next/link";

interface MapLocation {
  latitude: number;
  longitude: number;
}

interface Address {
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

interface Cook {
  id: string;
  cook_id: string;
  first_name: string;
  last_name: string;
  profile_image: string | null;
  rating: number;
  latitude: string;
  longitude: string;
  isAvailable: boolean;
  distance?: number;
  certification?: any;
  address?: any;
}

interface User {
  id: string;
  email: string;
  address: Address;
  first_name?: string;
  last_name?: string;
}

const MAPTILER_API_KEY = process.env.NEXT_PUBLIC_MAPTILER_API_KEY || "XZiubdaky8VdD93jgd6l";
const DEFAULT_ZOOM = 13;
const MAX_DISTANCE_KM = 25; // Radius treated as "nearby"
const FALLBACK_COUNT = 6; // If nobody is nearby, show this many closest cooks

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * 
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

// Geocode address to coordinates
async function geocodeAddress(address: Address): Promise<MapLocation | null> {
  try {
    // Format address as a string
    const addressString = [
      address.street,
      address.city,
      address.state,
      address.pincode
    ].filter(Boolean).join(", ");
    
    if (!addressString) return null;
    
    // Use MapTiler Geocoding API
    const response = await fetch(
      `https://api.maptiler.com/geocoding/${encodeURIComponent(addressString)}.json?key=${MAPTILER_API_KEY}`
    );
    
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const [longitude, latitude] = data.features[0].center;
      return { latitude, longitude };
    }
    
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

export function MapPreview(_props: { children?: React.ReactNode } = {}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<MapLocation | null>(null);
  const [nearbyCooks, setNearbyCooks] = useState<Cook[]>([]);
  const [selectedCook, setSelectedCook] = useState<Cook | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showingClosest, setShowingClosest] = useState(false);
  const markersRef = useRef<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  // Get logged-in user data
  useEffect(() => {
    async function fetchUserData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          console.log("No user session found");
          return null;
        }
        
        // Fetch user profile including address
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (error) {
          console.error("Error fetching user data:", error);
          throw error;
        }
        
        console.log("Fetched user data:", data);
        return data;
      } catch (error) {
        console.error("Failed to fetch user:", error);
        return null;
      }
    }
    
    fetchUserData().then(userData => {
      if (userData) {
        setUser(userData);
        
        // Try to geocode user's address
        if (userData.address) {
          geocodeAddress(userData.address).then(location => {
            if (location) {
              console.log("Geocoded user address to:", location);
              setUserLocation(location);
            } else {
              // Fallback to browser geolocation if geocoding fails
              getBrowserLocation();
            }
          });
        } else {
          // No address, use browser geolocation
          getBrowserLocation();
        }
      } else {
        // No user data, use browser geolocation
        getBrowserLocation();
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fallback to browser geolocation
  const getBrowserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          console.log("Browser location:", position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.info("Geolocation unavailable:", error?.message);
          setError("Location access is off, so we're showing cooks around Mumbai.");
          // Fallback to a default location (e.g., Mumbai)
          setUserLocation({
            latitude: 19.0760,
            longitude: 72.8777,
          });
        }
      );
    } else {
      setError("Geolocation is not supported by your browser");
      // Fallback to a default location
      setUserLocation({
        latitude: 19.0760,
        longitude: 72.8777,
      });
    }
  };

  // Fetch cooks data
  useEffect(() => {
    async function fetchCooks() {
      try {
        setIsLoading(true);
        
        const { data: cooksData, error: cooksError } = await supabase
          .from("cooks")
          .select(`
            id,
            cook_id,
            first_name,
            last_name,
            address,
            rating,
            profile_image,
            latitude,
            longitude,
            isAvailable,
            certification
          `);

        if (cooksError) {
          console.error("Error fetching cooks:", cooksError);
          throw cooksError;
        }

        console.log("Fetched cooks data:", cooksData);
        return cooksData || [];
      } catch (error) {
        console.error("Error fetching cooks:", error);
        setError("Failed to load cooks data");
        return [];
      } finally {
        setIsLoading(false);
      }
    }

    if (userLocation) {
      fetchCooks().then(cooks => {
        // Filter cooks with valid coordinates and calculate distance
        const cooksWithDistance = cooks
          .filter(cook => {
            // Check if cook has valid coordinates
            const lat = parseFloat(cook.latitude);
            const lng = parseFloat(cook.longitude);
            return !isNaN(lat) && !isNaN(lng);
          })
          .map(cook => {
            const cookLat = parseFloat(cook.latitude);
            const cookLng = parseFloat(cook.longitude);
            const distance = calculateDistance(
              userLocation.latitude, 
              userLocation.longitude, 
              cookLat, 
              cookLng
            );
            return { ...cook, distance };
          })
          .sort((a, b) => a.distance - b.distance);

        const nearby = cooksWithDistance.filter(cook => cook.distance <= MAX_DISTANCE_KM);
        setShowingClosest(nearby.length === 0);
        setNearbyCooks(nearby.length ? nearby : cooksWithDistance.slice(0, FALLBACK_COUNT));
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation]);

  // Initialize map when user location and cooks are available
  useEffect(() => {
    if (!mapRef.current || !userLocation || map) return;

    // Load MapTiler GL JS
    const script = document.createElement('script');
    script.src = 'https://cdn.maptiler.com/maptiler-sdk-js/latest/maptiler-sdk.umd.min.js';
    script.async = true;
    
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = 'https://cdn.maptiler.com/maptiler-sdk-js/latest/maptiler-sdk.css';
    
    document.head.appendChild(stylesheet);
    document.body.appendChild(script);

    script.onload = () => {
      if (!window.maptilersdk) {
        console.error("MapTiler SDK not loaded");
        return;
      }
      
      window.maptilersdk.config.apiKey = MAPTILER_API_KEY;
      
      const newMap = new window.maptilersdk.Map({
        container: mapRef.current!,
        style: window.maptilersdk.MapStyle.STREETS,
        center: [userLocation.longitude, userLocation.latitude],
        zoom: DEFAULT_ZOOM,
        attributionControl: true
      });
      
      // Add user marker
      newMap.on('load', () => {
        console.log("Map loaded");

        // Simple pin for user location - no label
        const userMarker = new window.maptilersdk.Marker({
          color: "#3b82f6", // Blue pin
          scale: 0.8 // Slightly smaller
        })
        .setLngLat([userLocation.longitude, userLocation.latitude])
        .addTo(newMap);
        
      });
      
      setMap(newMap);
    };
    
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      if (stylesheet.parentNode) {
        stylesheet.parentNode.removeChild(stylesheet);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation]);

  // Draw cook markers whenever the map or the cook list changes
  useEffect(() => {
    if (!map || !window.maptilersdk) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const bounds = new window.maptilersdk.LngLatBounds();
    if (userLocation) bounds.extend([userLocation.longitude, userLocation.latitude]);

    nearbyCooks.forEach(cook => {
      const cookLat = parseFloat(cook.latitude);
      const cookLng = parseFloat(cook.longitude);
      if (isNaN(cookLat) || isNaN(cookLng)) return;

      const popup = new window.maptilersdk.Popup({ offset: 25, closeButton: false, maxWidth: '220px' })
        .setHTML(`<div style="padding:4px"><strong>${cook.first_name} ${cook.last_name}</strong><br>${Number(cook.rating).toFixed(1)} ★ · ${cook.distance?.toFixed(1)} km away</div>`);

      const marker = new window.maptilersdk.Marker({ color: cook.isAvailable ? "#ea580c" : "#6b7280", scale: 0.8 })
        .setLngLat([cookLng, cookLat])
        .setPopup(popup)
        .addTo(map);
      markersRef.current.push(marker);
      bounds.extend([cookLng, cookLat]);
    });

    if (nearbyCooks.length) {
      map.fitBounds(bounds, { padding: 60, maxZoom: 14, duration: 0 });
    }
  }, [map, nearbyCooks, userLocation]);

  useEffect(() => () => { map?.remove(); }, [map]);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Find cooks near you</CardTitle>
            {error && <p className="text-sm text-muted-foreground">{error}</p>}
          </CardHeader>
          <CardContent>
            <div 
              ref={mapRef} 
              className="w-full h-[400px] rounded-md bg-muted relative overflow-hidden"
            >
              {!map && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              )}
              
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>{showingClosest ? "Closest dabba providers" : "Nearby dabba providers"}</CardTitle>
            {showingClosest && nearbyCooks.length > 0 && (
              <p className="text-sm text-muted-foreground">No one within {MAX_DISTANCE_KM} km yet, so here are the closest.</p>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-[360px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : nearbyCooks.length === 0 ? (
              <div className="text-center h-[360px] flex items-center justify-center">
                <div>
                  <p className="mb-4">No cooks found near your location.</p>
                  <p className="text-sm text-muted-foreground">Try expanding your search area or check back later.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 h-[360px] overflow-y-auto pr-2">
                {nearbyCooks.map(cook => (
                  <div 
                    key={cook.id} 
                    className={`flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer ${selectedCook?.id === cook.id ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setSelectedCook(cook)}
                  >
                    <div className="flex-shrink-0">
                      {cook.profile_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={cook.profile_image} alt="" className="rounded-full object-cover h-[50px] w-[50px]" />
                      ) : (
                        <div className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-400 font-semibold text-white">
                          {`${cook.first_name?.[0] ?? ""}${cook.last_name?.[0] ?? ""}`}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">
                        {cook.first_name} {cook.last_name}
                      </h4>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Star className="h-3 w-3 mr-1" />
                        <span>{Number(cook.rating).toFixed(1)}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{cook.distance?.toFixed(1)} km away</span>
                      </div>
                      <div className="mt-2">
                        <Badge 
                          variant={cook.isAvailable ? "default" : "secondary"}
                          className={cook.isAvailable ? "bg-green-100 text-green-800" : ""}
                        >
                          {cook.isAvailable ? "Available" : "Unavailable"}
                        </Badge>
                      </div>
                    </div>
                    <Button asChild size="sm" className="flex-shrink-0">
                      <Link href={`/cooks/${cook.id}`}>
                        View
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

