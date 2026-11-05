// Services and pricing for homeowners, from the West Coast Hosting Co pricing sheet.
// The home page teaser reads its "from" numbers from here, so edit prices in one place.
// One management plan; how the home starts only changes the one-time fee.
export type StartOption = { label: string; fee: string; feeUnit: string; fit: string; includes: string[]; note?: string; from?: boolean };
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
        "Review of your listing, rates, and welcome guide for your home",
        "Saved guest message templates",
        "Smart lock set up, including co-host access",
      ],
    },
    {
      label: "Starting from scratch",
      fee: "$750",
      from: true,
      feeUnit: "one-time setup",
      fit: "Not listed yet? We build your listing from the ground up, then manage it for you.",
      includes: [
        "In-person walkthrough of your home",
        "Your Airbnb and Vrbo listings created for you",
        "Title, description, amenities, house rules, and rates set up",
        "Saved guest message templates",
        "Welcome guide for your home",
        "Smart lock set up, including co-host access",
      ],
      note: "Professional photography is not included and is paid by the owner separately.",
    },
  ] as StartOption[],
};

export const billing = [
  "Guest payouts go directly from the platform to the owner. We never hold owner funds or security deposits.",
  "Co-hosting fees are billed monthly on completed stays, with no monthly minimums.",
  "Onboarding and setup fees are paid at the start.",
];

export const goodToKnow = [
  "Co-hosting is month to month. Either party may end it with 30 days written notice.",
  "Cleaning, repairs, and supplies are paid by the owner and approved in advance.",
  "Home watch and concierge services are available on request.",
];

/** "from" numbers for the home page teaser. */
export const pricingTeaser = {
  cohostFrom: cohostPlan.price,
  setupFrom: cohostPlan.starts.map((o) => o.fee).sort((a, b) => parseFloat(a.replace(/\D/g, "")) - parseFloat(b.replace(/\D/g, "")))[0],
};
