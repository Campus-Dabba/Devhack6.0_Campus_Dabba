<<<<<<< HEAD
import type { Metadata } from "next"
import { CooksList } from "@/components/student/dashboard/cooks-list"
import { StatesFilter } from "@/components/student/dashboard/states-filter"

export const metadata: Metadata = {
  title: "Browse Cooks",
  description: "Find and explore home cooks in your area",
}

export default function BrowseCooksPage() {
=======
"use client";

import type { Metadata } from "next";
import { CooksList } from "@/components/student/dashboard/cooks-list";
import { StatesFilter } from "@/components/student/dashboard/states-filter";
import { createContext, useState } from "react";
import { metadata } from "./metadata";

export default function BrowseCooksPage() {
  const [selectedState, setSelectedState] = useState("All States");

  const handleStateChange = (state: string) => {
    setSelectedState(state);
  };
>>>>>>> a6396a4 (Version lOLZ)
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Browse Cooks</h1>
<<<<<<< HEAD
        <p className="text-muted-foreground">Discover talented home cooks and their delicious offerings</p>
      </div>
      <StatesFilter />
      <CooksList />
    </div>
  )
}




=======
        <p className="text-muted-foreground">
          Discover talented home cooks and their delicious offerings
        </p>
      </div>
      <StatesFilter
        selectedState={selectedState}
        onStateChange={handleStateChange}
      />
      <CooksList selectedState={selectedState} />
    </div>
  );
}
>>>>>>> a6396a4 (Version lOLZ)
