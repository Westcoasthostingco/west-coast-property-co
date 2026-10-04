import { permanentRedirect } from "next/navigation";

// The site is a showcase of the homes only; the old owners page now lands on the homes.
export default function Services() {
  permanentRedirect("/properties");
}
