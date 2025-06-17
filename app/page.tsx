"use client";
import { useState } from "react";
import { CooksList } from "@/components/student/dashboard/cooks-list";
import { StatesFilter } from "@/components/student/dashboard/states-filter";
import { states } from "@/lib/data/states";
import { StateCards } from "@/components/student/dashboard/StateCards";
import { MapPreview } from "@/components/map/map-preview";
import { RoleBasedRedirect } from "@/components/auth/role-based-redirect";
import Link from "next/link";

export default function DashboardPage() {
  const [selectedState, setSelectedState] = useState<string>(states[0]);

  return (
    <RoleBasedRedirect>
      <div className="space-y-6">
      {/* Header Section with Background */}
      <div className="relative h-32 mb-4 rounded-lg overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url('https://img.freepik.com/premium-photo/cozy-kitchen-with-plants-sunlight_21085-115553.jpg?w=1480')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/30" />
        </div>
        <div className="relative h-full flex flex-col justify-center px-6 z-10">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Dashboard
          </h1>
          <p className="text-gray-200">
            Browse delicious home-cooked meals from verified cooks in your area
          </p>
        </div>
      </div>
      <StateCards
        states={states}
        selectedState={selectedState}
        onStateSelect={setSelectedState}
      />

      <div className="px-6">
        <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent border-b-2 border-orange-400 pb-2">
          Households nearby you
        </h2>
      </div>

      <StatesFilter
        selectedState={selectedState}
        onStateChange={setSelectedState}
      />
      <CooksList selectedState={selectedState} />
      <div className="px-6">
        <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent border-b-2 border-orange-400 pb-2">
          Dabba Providers near you
        </h2>
      </div>

      <MapPreview>{/* Map component and related logic goes here */}</MapPreview>

      <footer className="mt-8 p-6 bg-gray-800 text-white">
        <div className="container mx-auto flex flex-col md:flex-row justify-between">
          <div className="mb-6 md:mb-0">
            <h3 className="font-semibold text-lg">Contact Us</h3>
            <p className="mt-2">
              <a href="mailto:campusdabba@gmail.com" className="hover:underline">
                Email: campusdabba@gmail.com
              </a>
            </p>
            <p>
              <a href="tel:+919022392820" className="hover:underline">
                Phone: +91 9022392820
              </a>
            </p>
          </div>
          <div className="mb-6 md:mb-0">
            <h3 className="font-semibold text-lg">Help</h3>
            <p className="mt-2">
              <Link href="/faq" className="hover:underline">
                FAQ
              </Link>
            </p>
            <p>
              <Link href="/support" className="hover:underline">
                Support
              </Link>
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-lg">About Us</h3>
            <p className="mt-2">
              <Link href="/about" className="hover:underline">
                Company Info
              </Link>
            </p>
            <p>
              <Link href="/careers" className="hover:underline">
                Careers
              </Link>
            </p>
          </div>
        </div>
        <div className="mt-6 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} Campus Dabba. All rights reserved.
        </div>
      </footer>
    </div>
    </RoleBasedRedirect>
  );
}
