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
  onboarding?: string[]; // what the one-time onboarding or setup fee covers
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

// One management plan; how the home starts only changes the one-time fee.
export type StartOption = { label: string; fee: string; feeUnit: string; fit: string; includes: string[]; note?: string };
export const cohostPlan = {
  name: "Full-Service Co-Hosting",
  price: "20%",
  unit: "of booking revenue",
  fit: "Full management for your home, whether it's already listed or starting from scratch.",
  features: [
    "Guest messaging from first inquiry through checkout",
    "Booking requests and guest screening",
    "Check-in and check-out instructions sent to every guest",
    "Guest reviews and responses",
    "Cleaning and turnover scheduling",
    "Listings managed on Airbnb and Vrbo, plus private bookings",
    "Dynamic pricing",
    "Maintenance coordination and vendor scheduling",
    "Quarterly in-person property check",
    "Prompt notice to the owner when something at the home needs attention",
  ],
  starts: [
    {
      label: "Already listed",
      fee: "$250",
      feeUnit: "one-time onboarding",
      fit: "Already on Airbnb or Vrbo? We step in as your co-host and take it from here.",
      includes: [
        "In-person walkthrough of your home",
        "Co-host access set up on your existing listing",
        "Review of your listing, rates, and guidebook",
        "Saved guest message templates",
        "Lock access set up for co-hosts",
      ],
    },
    {
      label: "Starting from scratch",
      fee: "$750",
      feeUnit: "one-time setup",
      fit: "Not listed yet? We build your listing from the ground up, then manage it for you.",
      includes: [
        "In-person walkthrough of your home",
        "Your Airbnb and Vrbo listings created for you",
        "Title, description, amenities, house rules, and rates set up",
        "Saved guest message templates and guidebook",
        "Lock access set up for co-hosts",
      ],
      note: "Professional photography is not included and is paid by the owner separately.",
    },
  ] as StartOption[],
};

export const setupFeeWaiver =
  "Sign up for Full-Service Co-Hosting within 30 days of any launch package, and we waive the onboarding fee.";

export const whichFits: [string, string][] = [
  ["Aren't listed yet and want a listing built and managed for you", "Full-Service Co-Hosting, from scratch"],
  ["Are already on Airbnb or Vrbo and want us to manage it", "Full-Service Co-Hosting, already listed"],
  ["Have a home that needs furniture, supplies, or a safety check before guests arrive", "Design & Readiness Plan"],
  ["Have a guest-ready home and plan to host it yourself", "Listing Launch"],
  ["Want the whole process handled from empty home to first booking", "Turnkey Launch"],
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
  cohostFrom: cohostPlan.price,
  launchFrom: launchPlans.map((p) => p.price).sort((a, b) => parseFloat(a.replace(/\D/g, "")) - parseFloat(b.replace(/\D/g, "")))[0],
};
