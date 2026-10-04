import { permanentRedirect } from "next/navigation";

// The site no longer takes bookings (guests book on Airbnb or Vrbo). Old
// checkout return links land on the homes instead.
export default function Page() {
  permanentRedirect("/properties");
}
