import { Globe2 } from "lucide-react";

// Real, well-known Indian chefs and cooks around the world, with publicly
// documented facts only. Shown for inspiration - they are not affiliated
// with Campus Dabba and are not cooks on the platform.
const chefs = [
  {
    name: "Madhur Jaffrey",
    place: "New York, USA",
    note: "Author of An Invitation to Indian Cooking (1973), which introduced home-style Indian food to the West.",
  },
  {
    name: "Vineet Bhatia",
    place: "London, UK",
    note: "First Indian chef to win a Michelin star, at Zaika in London in 2001.",
  },
  {
    name: "Garima Arora",
    place: "Bangkok, Thailand",
    note: "Chef of Gaa; first Indian woman to earn a Michelin star.",
  },
  {
    name: "Asma Khan",
    place: "London, UK",
    note: "Founder of Darjeeling Express, run by an all-women kitchen team; featured on Chef's Table.",
  },
  {
    name: "Vikas Khanna",
    place: "New York, USA",
    note: "Michelin-starred at Junoon, longtime MasterChef India judge, now runs Bungalow in New York.",
  },
  {
    name: "Gaggan Anand",
    place: "Bangkok, Thailand",
    note: "His restaurant Gaggan was ranked No. 1 in Asia's 50 Best Restaurants several years running.",
  },
  {
    name: "Maneet Chauhan",
    place: "Nashville, USA",
    note: "Chopped judge on Food Network and chef-owner of Chauhan Ale & Masala House.",
  },
  {
    name: "Manish Mehrotra",
    place: "New Delhi, India",
    note: "Chef behind Indian Accent, regularly named among Asia's best restaurants.",
  },
];

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);

export function GlobalChefs() {
  return (
    <section className="container py-12 md:py-16">
      <div className="max-w-2xl">
        <p className="flex items-center gap-2 text-sm font-medium text-orange-600">
          <Globe2 className="h-4 w-4" /> Ghar ka khana, gone global
        </p>
        <h2 className="mt-2 text-2xl md:text-3xl font-bold tracking-tight">
          Indian cooks who took home food to the world
        </h2>
        <p className="mt-2 text-muted-foreground">
          Every one of them started with the food they grew up eating. Our home cooks are carrying
          the same tradition, one dabba at a time.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {chefs.map((chef) => (
          <div
            key={chef.name}
            className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-400 text-sm font-semibold text-white">
                {initials(chef.name)}
              </div>
              <div className="min-w-0">
                <p className="font-semibold leading-tight">{chef.name}</p>
                <p className="text-xs text-muted-foreground">{chef.place}</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{chef.note}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Featured for inspiration only. These chefs are not affiliated with Campus Dabba.
      </p>
    </section>
  );
}
