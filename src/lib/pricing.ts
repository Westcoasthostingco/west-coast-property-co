// Services and pricing for homeowners, from the West Coast Hosting Co pricing sheet.
// The home page teaser reads its "from" numbers from here, so edit prices in one place.
export type Plan = {
  name: string;
  price: string; // shown large on the card
  from?: boolean; // "from $2,500"
  unit: string;
  fee?: string; // one-time onboarding or setup fee
  fit: string;
  features: string[];
  billedSeparately?: string[];
  feature?: boolean; // highlighted card
  ribbon?: string;
};

export const launchPlans: Plan[] = [
  {
    name: "Design & Readiness Plan",
    price: "$495",
    unit: "one-time",
    fit: "For homes that are not guest-ready yet.",
    features: [
      "Two-hour in-person walkthrough of your home",
      "Room-by-room design and staging recommendations",
      "Complete furnishing and supply shopping list, with quantities for linens, towels, and kitchen",
      "Guest safety checklist: smoke and CO detectors, fire extinguisher, first aid kit, exterior lighting",
      "Smart lock and Wi-Fi recommendations",
      "Local permit and registration resources for your county",
      "Written plan delivered within five business days",
    ],
  },
  {
    name: "Listing Launch",
    price: "$750",
    unit: "one-time",
    fit: "For guest-ready homes whose owners plan to host themselves.",
    features: [
      "In-person walkthrough of your home",
      "Listing built on your own Airbnb and Vrbo accounts",
      "Title, description, amenities, and house rules written for you",
      "Nightly rates, minimum stays, cancellation policy, and calendar settings",
      "Check-in and check-out instructions plus saved guest message templates",
      "Photographer recommendation and room-by-room shot list",
      "A follow-up call after your first guest checks out",
    ],
  },
  {
    name: "Turnkey Launch",
    price: "$2,500",
    from: true,
    unit: "one-time",
    fit: "For owners who want us to handle the entire process.",
    feature: true,
    ribbon: "Start to finish",
    features: [
      "Everything in the Design & Readiness Plan and Listing Launch",
      "Furniture and supply ordering coordinated for you",
      "Staging and setup day at the home",
      "Professional photography scheduled and managed",
      "Custom printed welcome guide for your home",
      "Smart lock and Wi-Fi set up",
      "Cleaner introductions and a turnover checklist",
      "Listing live on Airbnb and Vrbo",
      "Guest messaging for your first 30 days",
    ],
    billedSeparately: ["Furniture, supplies, and photography are billed at cost to the owner, approved in advance"],
  },
];

export const cohostPlans: Plan[] = [
  {
    name: "Essential Co-Hosting",
    price: "10%",
    unit: "of booking revenue",
    fee: "+ $250 one-time onboarding",
    fit: "For established listings that need a reliable voice for guests.",
    features: [
      "Guest messaging from first inquiry through checkout",
      "Booking requests and guest screening",
      "Check-in and check-out instructions sent to every guest",
      "Guest reviews and responses",
      "Prompt notice to the owner when something at the home needs attention",
    ],
  },
  {
    name: "Full-Service Co-Hosting",
    price: "20%",
    unit: "of booking revenue",
    fee: "+ $1,200 one-time setup",
    fit: "For owners who want the home fully managed.",
    feature: true,
    features: [
      "Everything in Essential Co-Hosting",
      "Listings managed on Airbnb and Vrbo, plus private bookings",
      "Dynamic pricing and multi-platform calendar sync",
      "Cleaning and turnover scheduling",
      "Maintenance coordination and vendor scheduling",
      "Restocking of guest consumables",
      "Quarterly in-person property check",
      "24/7 guest support and issue resolution",
    ],
  },
];

export const setupFeeWaiver =
  "Sign up for Full-Service Co-Hosting within 30 days of any launch package, and we waive the $1,200 setup fee.";

export const whichFits: [string, string][] = [
  ["Have a home that needs furniture, supplies, or a safety check before guests arrive", "Design & Readiness Plan"],
  ["Have a guest-ready home and plan to host it yourself", "Listing Launch"],
  ["Want the whole process handled from empty home to first booking", "Turnkey Launch"],
  ["Already host and want help with guest communication", "Essential Co-Hosting"],
  ["Want the home managed for you every month", "Full-Service Co-Hosting"],
];

export const billing = [
  "Guest payouts go directly from the platform to the owner. We never hold owner funds or security deposits.",
  "Co-hosting fees are billed monthly on completed stays, with no monthly minimums.",
  "Launch packages are paid at the start of the project.",
];

export const goodToKnow = [
  "Co-hosting is month to month. Either party may end it with 30 days written notice.",
  "Cleaning, repairs, and supplies are paid by the owner and approved in advance.",
  "Home watch and concierge services are available on request.",
];

/** "from" numbers for the home page teaser. */
export const pricingTeaser = {
  cohostFrom: cohostPlans.map((p) => p.price).sort((a, b) => parseFloat(a) - parseFloat(b))[0],
  launchFrom: launchPlans.map((p) => p.price).sort((a, b) => parseFloat(a.replace(/\D/g, "")) - parseFloat(b.replace(/\D/g, "")))[0],
};
