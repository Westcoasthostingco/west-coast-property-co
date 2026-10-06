// Owner testimonials shown on the home page. Only add a quote the person has
// actually said or approved, with their permission to publish it.
export type Testimonial = {
  headline: string; // pull quote
  body: string;
  name: string;
  role: string;
};

export const testimonials: Testimonial[] = [
  {
    headline: "I never have to worry whether the cleaners will show up, or whether the house will be ready and meet my standards.",
    body: "West Coast Hosting Co is exceptional. The quality of their work is very high, and I never have to worry whether the cleaners will show up or whether the house will be ready and up to my standards. Christi and Melissa keep me in the loop, and the communication has been great. They're the reason my property earns five-star reviews, and guests love staying with us.",
    name: "Jonathan Berg",
    role: "Property owner",
  },
];
