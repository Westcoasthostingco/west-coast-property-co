// Guest reviews shown on the home page, copied from the home's Airbnb or Vrbo
// reviews. Use the guest's first name only, and quote them as written.
export type GuestReview = {
  headline: string; // pull quote, taken from the review
  body: string;
  name: string;
  from?: string; // guest's hometown
  home: string;
  slug: string; // home's page, /properties/<slug>
  platform: "Airbnb" | "Vrbo";
  date: string; // month and year of the stay
};

export const guestReviews: GuestReview[] = [
  {
    headline: "Absolutely LOVED our stay in this BEAUTIFUL beachfront cottage!",
    body: "Tahu-YAH! Absolutely LOVED our stay in this BEAUTIFUL beachfront cottage! Whoever decorated this place needs to win some kind of award, and I’m going to need a link to purchase EVERYTHING, pretty please! 😂 Fantastic hosts, squeaky clean, beyond cute, had everything we could possibly need, did I mention CUTE?! And the view/beach?! AH-MAZING! Definitely staying here again!",
    name: "Brie",
    from: "Ogden, Utah",
    home: "The Leonora by the Sea",
    slug: "the-leonora-by-the-sea",
    platform: "Airbnb",
    date: "October 2026",
  },
  {
    headline: "Seriously one of the best air bnbs I've ever stayed in.",
    body: "BEAUTIFUL! Seriously one of the best air bnbs I've ever stayed in. Everything was so luxurious. Would absolutely book again",
    name: "Nicole",
    from: "Puyallup, Washington",
    home: "The Bedrock",
    slug: "the-bedrock",
    platform: "Airbnb",
    date: "October 2026",
  },
];
