// Listing content for each home: description, highlights, beds, amenities,
// house rules, location, and photos. Taken from each home's own Airbnb listing
// (and Vrbo for The Grand View) on the date below, then lightly edited.
// The listing is the source of truth: refresh this file when a listing changes.
// Photos live in public/photos/<slug>/NN.webp.

export const LISTING_CONTENT_FETCHED = "2026-10-04";

export type ListingPhoto = { src: string; room: string; width: number; height: number };
export type ListingContent = {
  about: string[];
  highlights: { title: string; body: string }[];
  sleeping: { room: string; beds: string }[];
  amenityGroups: { title: string; items: string[] }[];
  notIncluded: string[];
  rules: { title: string; detail?: string }[];
  safety: string[];
  locationLabel: string;
  locationSummary?: string;
  nearby: { place: string; distance: string }[];
  listingRating?: { value: number; count: number; platform: "Airbnb" | "Vrbo" };
  photos: ListingPhoto[];
  featured: number[]; // indexes into photos for the gallery grid
  source: string;
};

export const listingContent: Record<string, ListingContent> = {
  "the-grand-view": {
    "about": [
      "The Grand View is a luxury retreat in the heart of downtown Gig Harbor: a spacious three-bedroom main residence plus a private studio guest house, made for families or groups who want time together and a little privacy too.",
      "Unobstructed views take in Puget Sound, Mount Rainier, and the entrance to Gig Harbor, and the scenery shifts from sunrise to sunset.",
      "Inside are generous living spaces, three and a half bathrooms, a game room, an oversized dining table and bar area, and a fully equipped kitchen. Outside, there is a secluded courtyard with a fire pit and an expansive deck facing the water.",
      "It is a fully walkable location. Downtown’s boutiques, waterfront dining, and nearly three miles of harborfront sidewalks are moments away, and a private driveway and two-car garage leave room for cars, e-bikes, or scooters.",
      "The home was styled and furnished by Harbornest, a boutique in downtown Gig Harbor, and much of it is shoppable: if you fall for a throw, a lamp, or a piece of art, Harbornest can help you take it home or ship it."
    ],
    "highlights": [
      {
        "title": "In Gig Harbor, near the waterfront",
        "body": "About a 5-min walk to Grandview Forest Park, with downtown shops and dining within walking distance"
      },
      {
        "title": "Private deck with mountain and water views",
        "body": "A game room, fire pit, and outdoor seating area overlooking Puget Sound and Mount Rainier"
      },
      {
        "title": "Main home plus a studio guest house",
        "body": "A full kitchen, in-unit washer and dryer, and a private studio guest house for extra space"
      }
    ],
    "sleeping": [
      {
        "room": "Bedroom 1",
        "beds": "1 king bed"
      },
      {
        "room": "Bedroom 2",
        "beds": "1 king bed"
      },
      {
        "room": "Bedroom 3",
        "beds": "2 double beds"
      },
      {
        "room": "Bedroom 4",
        "beds": "1 queen bed"
      }
    ],
    "amenityGroups": [
      {
        "title": "Bathroom",
        "items": [
          "Hair dryer",
          "Cleaning products",
          "Shampoo",
          "Conditioner",
          "Body soap",
          "Hot water",
          "Shower gel"
        ]
      },
      {
        "title": "Bedroom and laundry",
        "items": [
          "Washer",
          "Free dryer",
          "Essentials (Towels, bed sheets, soap, and toilet paper)",
          "Hangers",
          "Bed linens",
          "Extra pillows and blankets",
          "Iron",
          "Drying rack for clothing",
          "Clothing storage"
        ]
      },
      {
        "title": "Entertainment",
        "items": [
          "TV",
          "Sound system",
          "Books and reading material"
        ]
      },
      {
        "title": "Family",
        "items": [
          "Pack ’n play / travel crib",
          "Board games",
          "Babysitter recommendations"
        ]
      },
      {
        "title": "Heating and cooling",
        "items": [
          "Air conditioning",
          "Indoor fireplace",
          "Heating"
        ]
      },
      {
        "title": "Home safety",
        "items": [
          "Smoke alarm",
          "Carbon monoxide alarm",
          "Fire extinguisher",
          "First aid kit"
        ]
      },
      {
        "title": "Internet and office",
        "items": [
          "Wifi"
        ]
      },
      {
        "title": "Kitchen and dining",
        "items": [
          "Kitchen",
          "Refrigerator",
          "Microwave",
          "Cooking basics (Pots and pans, oil, salt and pepper)",
          "Dishes and silverware (Plates, bowls, cups, cutlery, and other utensils)",
          "Mini fridge",
          "Freezer",
          "Dishwasher",
          "Stove",
          "Oven",
          "Hot water kettle",
          "Coffee maker: Keurig coffee machine",
          "Wine glasses",
          "Toaster",
          "Baking sheet",
          "Blender",
          "Rice maker",
          "Barbecue utensils (Grill, charcoal, bamboo skewers/iron skewers, etc.)",
          "Dining table",
          "Coffee"
        ]
      },
      {
        "title": "Outdoor",
        "items": [
          "Private patio or balcony",
          "Backyard",
          "Fire pit",
          "Outdoor furniture",
          "Outdoor dining area",
          "BBQ grill",
          "Sun loungers"
        ]
      },
      {
        "title": "Parking and facilities",
        "items": [
          "Free parking on premises",
          "Single level home"
        ]
      },
      {
        "title": "Services",
        "items": [
          "Pets allowed (Assistance animals are always allowed)",
          "Long term stays allowed",
          "Housekeeping - available at extra cost"
        ]
      }
    ],
    "notIncluded": [
      "Exterior security cameras on property"
    ],
    "rules": [
      {
        "title": "Check-in after 3:00 PM"
      },
      {
        "title": "Checkout before 11:00 AM"
      },
      {
        "title": "10 guests maximum"
      },
      {
        "title": "Pets allowed"
      },
      {
        "title": "Quiet hours",
        "detail": "10:00 PM - 7:00 AM"
      },
      {
        "title": "No parties or events"
      },
      {
        "title": "No smoking"
      }
    ],
    "safety": [
      "Carbon monoxide alarm installed",
      "Smoke alarm installed"
    ],
    "locationLabel": "Gig Harbor, Washington",
    "locationSummary": "On a peninsula across Puget Sound, marinas and working waterfronts meet harbor kayaking, maritime traditions, and broad water views.",
    "nearby": [
      {
        "place": "Grandview Forest Park",
        "distance": "3 min walk"
      },
      {
        "place": "Skansie Brothers Park",
        "distance": "10 min walk"
      },
      {
        "place": "Harbor History Museum",
        "distance": "3 min drive"
      },
      {
        "place": "Tacoma Dome",
        "distance": "20 min drive"
      },
      {
        "place": "Seattle-Tacoma International Airport",
        "distance": "46 min drive"
      }
    ],
    "photos": [
      {
        "src": "/photos/the-grand-view/01.webp",
        "room": "Living room",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/02.webp",
        "room": "Living room",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/03.webp",
        "room": "Living room",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/04.webp",
        "room": "Living room",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/05.webp",
        "room": "Living room",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/06.webp",
        "room": "Full kitchen",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/07.webp",
        "room": "Full kitchen",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/08.webp",
        "room": "Full kitchen",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/09.webp",
        "room": "Full kitchen",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/10.webp",
        "room": "Full kitchen",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/11.webp",
        "room": "Full kitchen",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/12.webp",
        "room": "Full kitchen",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/13.webp",
        "room": "Full kitchen",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/14.webp",
        "room": "Full kitchen",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/15.webp",
        "room": "Dining area",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/16.webp",
        "room": "Dining area",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/17.webp",
        "room": "Dining area",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/18.webp",
        "room": "Dining area",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/19.webp",
        "room": "Dining area",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/20.webp",
        "room": "Dining area",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/21.webp",
        "room": "Dining area",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/22.webp",
        "room": "Bedroom 1",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/23.webp",
        "room": "Bedroom 1",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/24.webp",
        "room": "Bedroom 1",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/25.webp",
        "room": "Bedroom 1",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/26.webp",
        "room": "Bedroom 2",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/27.webp",
        "room": "Bedroom 2",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/28.webp",
        "room": "Bedroom 3",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/29.webp",
        "room": "Bedroom 4",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/30.webp",
        "room": "Full bathroom 1",
        "width": 1280,
        "height": 1920
      },
      {
        "src": "/photos/the-grand-view/31.webp",
        "room": "Full bathroom 1",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/32.webp",
        "room": "Full bathroom 1",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/33.webp",
        "room": "Full bathroom 1",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/34.webp",
        "room": "Full bathroom 2",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/35.webp",
        "room": "Full bathroom 2",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/36.webp",
        "room": "Full bathroom 2",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/37.webp",
        "room": "Full bathroom 2",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/38.webp",
        "room": "Full bathroom 2",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/39.webp",
        "room": "Full bathroom 3",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/40.webp",
        "room": "Half bathroom",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/41.webp",
        "room": "Backyard",
        "width": 1280,
        "height": 719
      },
      {
        "src": "/photos/the-grand-view/42.webp",
        "room": "Backyard",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/43.webp",
        "room": "Backyard",
        "width": 1280,
        "height": 719
      },
      {
        "src": "/photos/the-grand-view/44.webp",
        "room": "Backyard",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/45.webp",
        "room": "Patio",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/46.webp",
        "room": "Balcony",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/47.webp",
        "room": "Balcony",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/48.webp",
        "room": "Balcony",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/49.webp",
        "room": "Balcony",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/50.webp",
        "room": "Courtyard",
        "width": 1280,
        "height": 719
      },
      {
        "src": "/photos/the-grand-view/51.webp",
        "room": "Courtyard",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/52.webp",
        "room": "Courtyard",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/53.webp",
        "room": "Laundry area",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/54.webp",
        "room": "Exterior",
        "width": 1280,
        "height": 719
      },
      {
        "src": "/photos/the-grand-view/55.webp",
        "room": "Exterior",
        "width": 1280,
        "height": 719
      },
      {
        "src": "/photos/the-grand-view/56.webp",
        "room": "Exterior",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/57.webp",
        "room": "Exterior",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/58.webp",
        "room": "Exterior",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/59.webp",
        "room": "Exterior",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/60.webp",
        "room": "Exterior",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/61.webp",
        "room": "Exterior",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/62.webp",
        "room": "Exterior",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/63.webp",
        "room": "Exterior",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/64.webp",
        "room": "Exterior",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/65.webp",
        "room": "Exterior",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/66.webp",
        "room": "Game room",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/67.webp",
        "room": "More photos",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/68.webp",
        "room": "More photos",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/69.webp",
        "room": "More photos",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/70.webp",
        "room": "More photos",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-grand-view/71.webp",
        "room": "More photos",
        "width": 1280,
        "height": 853
      }
    ],
    "featured": [
      53,
      0,
      5,
      45
    ],
    "source": "https://www.airbnb.com/rooms/1669272090087857131"
  },
  "the-leonora-by-the-sea": {
    "about": [
      "A charming waterfront cabin on the peaceful shores of Hood Canal in Tahuya, cozy yet stylish, for a romantic getaway or a family trip built around the water.",
      "Two bedrooms and a queen sofa bed sleep up to five. A private beach waits about 50 feet from the door, for paddle boarding, oysters, or lounging by the shore with a glass of wine.",
      "Inside there is a well-stocked kitchen and a wood-burning fireplace; outside, a grill and dining area look over the water. Check-in is self check-in with a smart lock."
    ],
    "highlights": [
      {
        "title": "On Hood Canal with beach access",
        "body": "A waterfront cabin on Hood Canal with beach access steps from the door for paddleboarding and oyster picking."
      },
      {
        "title": "Cozy cabin with a full kitchen",
        "body": "A well-stocked kitchen, wood-burning fireplace, and outdoor grill and dining area overlooking the water."
      }
    ],
    "sleeping": [
      {
        "room": "Bedroom 1",
        "beds": "1 queen bed"
      },
      {
        "room": "Bedroom 2",
        "beds": "1 double bed, 1 single bed"
      },
      {
        "room": "Living room",
        "beds": "1 sofa bed"
      }
    ],
    "amenityGroups": [
      {
        "title": "Bathroom",
        "items": [
          "Hair dryer",
          "Cleaning products",
          "Shampoo",
          "Conditioner",
          "Body soap",
          "Hot water",
          "Shower gel"
        ]
      },
      {
        "title": "Bedroom and laundry",
        "items": [
          "Washer"
        ]
      },
      {
        "title": "Entertainment",
        "items": [
          "TV"
        ]
      },
      {
        "title": "Family",
        "items": [
          "Crib",
          "Children’s books and toys for ages 0-2 years old and 2-5 years old",
          "Board games"
        ]
      },
      {
        "title": "Heating and cooling",
        "items": [
          "Indoor fireplace",
          "Portable fans",
          "Heating"
        ]
      },
      {
        "title": "Home safety",
        "items": [
          "Smoke alarm",
          "Carbon monoxide alarm",
          "Fire extinguisher",
          "First aid kit"
        ]
      },
      {
        "title": "Internet and office",
        "items": [
          "Wifi"
        ]
      },
      {
        "title": "Kitchen and dining",
        "items": [
          "Kitchen",
          "Refrigerator",
          "Microwave",
          "Cooking basics (Pots and pans, oil, salt and pepper)",
          "Dishes and silverware (Plates, bowls, cups, cutlery, and other utensils)",
          "Freezer",
          "Stove",
          "Oven",
          "Hot water kettle",
          "Coffee maker",
          "Wine glasses",
          "Toaster",
          "Barbecue utensils (Grill, charcoal, bamboo skewers/iron skewers, etc.)",
          "Dining table",
          "Coffee"
        ]
      },
      {
        "title": "Location features",
        "items": [
          "Waterfront",
          "Beach access"
        ]
      },
      {
        "title": "Outdoor",
        "items": [
          "Outdoor dining area",
          "BBQ grill"
        ]
      },
      {
        "title": "Parking and facilities",
        "items": [
          "Free parking on premises"
        ]
      },
      {
        "title": "Services",
        "items": [
          "Long term stays allowed",
          "Self check-in",
          "Smart lock"
        ]
      }
    ],
    "notIncluded": [
      "Exterior security cameras on property",
      "Dryer",
      "Air conditioning",
      "Essentials"
    ],
    "rules": [
      {
        "title": "Check-in after 3:00 PM"
      },
      {
        "title": "Checkout before 11:00 AM"
      },
      {
        "title": "Self check-in with smart lock"
      },
      {
        "title": "5 guests maximum"
      },
      {
        "title": "No pets"
      },
      {
        "title": "Quiet hours",
        "detail": "10:00 PM - 7:00 AM"
      },
      {
        "title": "No parties or events"
      },
      {
        "title": "No smoking"
      },
      {
        "title": "Throw trash away"
      },
      {
        "title": "Turn things off"
      }
    ],
    "safety": [
      "Carbon monoxide alarm installed",
      "Smoke alarm installed",
      "Must climb stairs"
    ],
    "locationLabel": "Tahuya, on Hood Canal, Washington",
    "nearby": [],
    "listingRating": {
      "value": 4.99,
      "count": 87,
      "platform": "Airbnb"
    },
    "photos": [
      {
        "src": "/photos/the-leonora-by-the-sea/01.webp",
        "room": "Living room",
        "width": 1280,
        "height": 960
      },
      {
        "src": "/photos/the-leonora-by-the-sea/02.webp",
        "room": "Living room",
        "width": 1280,
        "height": 960
      },
      {
        "src": "/photos/the-leonora-by-the-sea/03.webp",
        "room": "Living room",
        "width": 1280,
        "height": 1707
      },
      {
        "src": "/photos/the-leonora-by-the-sea/04.webp",
        "room": "Living room",
        "width": 1280,
        "height": 960
      },
      {
        "src": "/photos/the-leonora-by-the-sea/05.webp",
        "room": "Living room",
        "width": 1280,
        "height": 960
      },
      {
        "src": "/photos/the-leonora-by-the-sea/06.webp",
        "room": "Full kitchen",
        "width": 1280,
        "height": 960
      },
      {
        "src": "/photos/the-leonora-by-the-sea/07.webp",
        "room": "Full kitchen",
        "width": 1280,
        "height": 960
      },
      {
        "src": "/photos/the-leonora-by-the-sea/08.webp",
        "room": "Full kitchen",
        "width": 1280,
        "height": 960
      },
      {
        "src": "/photos/the-leonora-by-the-sea/09.webp",
        "room": "Dining area",
        "width": 1280,
        "height": 960
      },
      {
        "src": "/photos/the-leonora-by-the-sea/10.webp",
        "room": "Dining area",
        "width": 1280,
        "height": 960
      },
      {
        "src": "/photos/the-leonora-by-the-sea/11.webp",
        "room": "Bedroom 1",
        "width": 1280,
        "height": 960
      },
      {
        "src": "/photos/the-leonora-by-the-sea/12.webp",
        "room": "Bedroom 1",
        "width": 1280,
        "height": 960
      },
      {
        "src": "/photos/the-leonora-by-the-sea/13.webp",
        "room": "Bedroom 1",
        "width": 1280,
        "height": 960
      },
      {
        "src": "/photos/the-leonora-by-the-sea/14.webp",
        "room": "Bedroom 1",
        "width": 1280,
        "height": 960
      },
      {
        "src": "/photos/the-leonora-by-the-sea/15.webp",
        "room": "Bedroom 1",
        "width": 1280,
        "height": 1707
      },
      {
        "src": "/photos/the-leonora-by-the-sea/16.webp",
        "room": "Bedroom 2",
        "width": 1280,
        "height": 960
      },
      {
        "src": "/photos/the-leonora-by-the-sea/17.webp",
        "room": "Bedroom 2",
        "width": 1280,
        "height": 1707
      },
      {
        "src": "/photos/the-leonora-by-the-sea/18.webp",
        "room": "Bedroom 2",
        "width": 1280,
        "height": 960
      },
      {
        "src": "/photos/the-leonora-by-the-sea/19.webp",
        "room": "Bedroom 2",
        "width": 1280,
        "height": 1035
      },
      {
        "src": "/photos/the-leonora-by-the-sea/20.webp",
        "room": "Bedroom 2",
        "width": 1280,
        "height": 960
      },
      {
        "src": "/photos/the-leonora-by-the-sea/21.webp",
        "room": "Full bathroom",
        "width": 1280,
        "height": 960
      },
      {
        "src": "/photos/the-leonora-by-the-sea/22.webp",
        "room": "Full bathroom",
        "width": 1280,
        "height": 960
      },
      {
        "src": "/photos/the-leonora-by-the-sea/23.webp",
        "room": "Full bathroom",
        "width": 1280,
        "height": 960
      },
      {
        "src": "/photos/the-leonora-by-the-sea/24.webp",
        "room": "Deck",
        "width": 1280,
        "height": 1707
      },
      {
        "src": "/photos/the-leonora-by-the-sea/25.webp",
        "room": "Deck",
        "width": 1280,
        "height": 960
      },
      {
        "src": "/photos/the-leonora-by-the-sea/26.webp",
        "room": "Deck",
        "width": 1280,
        "height": 960
      },
      {
        "src": "/photos/the-leonora-by-the-sea/27.webp",
        "room": "Exterior",
        "width": 1280,
        "height": 1707
      },
      {
        "src": "/photos/the-leonora-by-the-sea/28.webp",
        "room": "Exterior",
        "width": 1280,
        "height": 984
      },
      {
        "src": "/photos/the-leonora-by-the-sea/29.webp",
        "room": "More photos",
        "width": 1280,
        "height": 960
      },
      {
        "src": "/photos/the-leonora-by-the-sea/30.webp",
        "room": "More photos",
        "width": 1280,
        "height": 960
      },
      {
        "src": "/photos/the-leonora-by-the-sea/31.webp",
        "room": "More photos",
        "width": 1280,
        "height": 960
      },
      {
        "src": "/photos/the-leonora-by-the-sea/32.webp",
        "room": "More photos",
        "width": 1280,
        "height": 1707
      },
      {
        "src": "/photos/the-leonora-by-the-sea/33.webp",
        "room": "More photos",
        "width": 1280,
        "height": 960
      }
    ],
    "featured": [
      30,
      1,
      8,
      11
    ],
    "source": "https://www.airbnb.com/rooms/1250729879856529802"
  },
  "the-bedrock": {
    "about": [
      "A private mountain home on 5 wooded acres, about 8 miles from Packwood and 35 minutes from White Pass Ski Area.",
      "It sleeps 8 across two bedrooms plus a versatile loft, with a king, a queen, two doubles, and a queen Euro bed.",
      "Ski in winter, or explore Mount Rainier and Gifford Pinchot National Forest in spring, summer, and fall. Evenings are for the hot tub under the stars or the fire pit and BBQ, with deer and elk for neighbors."
    ],
    "highlights": [
      {
        "title": "In the forest near Packwood",
        "body": "On 5 wooded acres about 8 miles from Packwood, with Mount Rainier and Gifford Pinchot National Forest nearby"
      },
      {
        "title": "Hot tub, fire pit, and grill on 5 acres",
        "body": "A hot tub surrounded by forest, with a fire pit and BBQ grill for evenings outdoors"
      },
      {
        "title": "Full kitchen with all the essentials",
        "body": "A full kitchen with an oven, dishwasher, and coffee maker for cooking in between adventures"
      }
    ],
    "sleeping": [
      {
        "room": "Bedroom 1",
        "beds": "1 king bed"
      },
      {
        "room": "Bedroom 2",
        "beds": "1 queen bed"
      },
      {
        "room": "Loft",
        "beds": "2 double beds"
      },
      {
        "room": "Additional",
        "beds": "1 queen Euro bed"
      }
    ],
    "amenityGroups": [
      {
        "title": "Bathroom",
        "items": [
          "Bathtub",
          "Hair dryer",
          "Cleaning products",
          "Shampoo",
          "Conditioner",
          "Body soap",
          "Hot water",
          "Shower gel"
        ]
      },
      {
        "title": "Bedroom and laundry",
        "items": [
          "Washer",
          "Dryer",
          "Essentials (Towels, bed sheets, soap, and toilet paper)",
          "Hangers",
          "Bed linens",
          "Extra pillows and blankets",
          "Room-darkening shades",
          "Clothing storage"
        ]
      },
      {
        "title": "Entertainment",
        "items": [
          "TV"
        ]
      },
      {
        "title": "Heating and cooling",
        "items": [
          "Air conditioning",
          "Indoor fireplace",
          "Ceiling fan",
          "Heating"
        ]
      },
      {
        "title": "Home safety",
        "items": [
          "Exterior security cameras on property",
          "Smoke alarm",
          "Carbon monoxide alarm",
          "Fire extinguisher"
        ]
      },
      {
        "title": "Internet and office",
        "items": [
          "Wifi"
        ]
      },
      {
        "title": "Kitchen and dining",
        "items": [
          "Kitchen",
          "Refrigerator",
          "Microwave",
          "Cooking basics (Pots and pans, oil, salt and pepper)",
          "Dishes and silverware (Plates, bowls, cups, cutlery, and other utensils)",
          "Freezer",
          "Dishwasher",
          "Stove",
          "Oven",
          "Hot water kettle",
          "Coffee maker",
          "Wine glasses",
          "Toaster",
          "Baking sheet",
          "Barbecue utensils (Grill, charcoal, bamboo skewers/iron skewers, etc.)",
          "Dining table",
          "Coffee"
        ]
      },
      {
        "title": "Outdoor",
        "items": [
          "Fire pit",
          "Outdoor furniture",
          "BBQ grill"
        ]
      },
      {
        "title": "Parking and facilities",
        "items": [
          "Free parking on premises",
          "Hot tub"
        ]
      }
    ],
    "notIncluded": [],
    "rules": [
      {
        "title": "Check-in after 3:00 PM"
      },
      {
        "title": "Checkout before 11:00 AM"
      },
      {
        "title": "8 guests maximum"
      }
    ],
    "safety": [
      "Exterior security cameras on property",
      "Carbon monoxide alarm installed",
      "Smoke alarm installed"
    ],
    "locationLabel": "Randle, near Packwood, Washington",
    "locationSummary": "Volcanic peak views and backpacking define this mountain area, where forested trails and low-key craft beer spots set an outdoorsy pace.",
    "nearby": [
      {
        "place": "Packwood",
        "distance": "about 8 miles"
      },
      {
        "place": "White Pass Ski Area",
        "distance": "about 35 minutes"
      },
      {
        "place": "Mount Rainier National Park",
        "distance": "nearby"
      },
      {
        "place": "Gifford Pinchot National Forest",
        "distance": "nearby"
      }
    ],
    "photos": [
      {
        "src": "/photos/the-bedrock/01.webp",
        "room": "Living room",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-bedrock/02.webp",
        "room": "Living room",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-bedrock/03.webp",
        "room": "Living room",
        "width": 1280,
        "height": 1920
      },
      {
        "src": "/photos/the-bedrock/04.webp",
        "room": "Living room",
        "width": 1280,
        "height": 867
      },
      {
        "src": "/photos/the-bedrock/05.webp",
        "room": "Living room",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-bedrock/06.webp",
        "room": "Living room",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-bedrock/07.webp",
        "room": "Living room",
        "width": 1280,
        "height": 870
      },
      {
        "src": "/photos/the-bedrock/08.webp",
        "room": "Living room",
        "width": 1280,
        "height": 1920
      },
      {
        "src": "/photos/the-bedrock/09.webp",
        "room": "Living room",
        "width": 1280,
        "height": 1788
      },
      {
        "src": "/photos/the-bedrock/10.webp",
        "room": "Living room",
        "width": 1280,
        "height": 1816
      },
      {
        "src": "/photos/the-bedrock/11.webp",
        "room": "Full kitchen",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-bedrock/12.webp",
        "room": "Full kitchen",
        "width": 1280,
        "height": 1920
      },
      {
        "src": "/photos/the-bedrock/13.webp",
        "room": "Full kitchen",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-bedrock/14.webp",
        "room": "Full kitchen",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-bedrock/15.webp",
        "room": "Full kitchen",
        "width": 1280,
        "height": 1920
      },
      {
        "src": "/photos/the-bedrock/16.webp",
        "room": "Full kitchen",
        "width": 1280,
        "height": 1903
      },
      {
        "src": "/photos/the-bedrock/17.webp",
        "room": "Full kitchen",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-bedrock/18.webp",
        "room": "Dining area",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-bedrock/19.webp",
        "room": "Dining area",
        "width": 1280,
        "height": 1920
      },
      {
        "src": "/photos/the-bedrock/20.webp",
        "room": "Dining area",
        "width": 1280,
        "height": 1779
      },
      {
        "src": "/photos/the-bedrock/21.webp",
        "room": "Dining area",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-bedrock/22.webp",
        "room": "Dining area",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-bedrock/23.webp",
        "room": "Dining area",
        "width": 1280,
        "height": 1920
      },
      {
        "src": "/photos/the-bedrock/24.webp",
        "room": "Bedroom 1",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-bedrock/25.webp",
        "room": "Bedroom 1",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-bedrock/26.webp",
        "room": "Bedroom 1",
        "width": 1280,
        "height": 1920
      },
      {
        "src": "/photos/the-bedrock/27.webp",
        "room": "Bedroom 1",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-bedrock/28.webp",
        "room": "Bedroom 1",
        "width": 1280,
        "height": 1920
      },
      {
        "src": "/photos/the-bedrock/29.webp",
        "room": "Bedroom 2",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-bedrock/30.webp",
        "room": "Bedroom 2",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-bedrock/31.webp",
        "room": "Full bathroom 1",
        "width": 1280,
        "height": 1920
      },
      {
        "src": "/photos/the-bedrock/32.webp",
        "room": "Full bathroom 1",
        "width": 1280,
        "height": 1991
      },
      {
        "src": "/photos/the-bedrock/33.webp",
        "room": "Full bathroom 1",
        "width": 1280,
        "height": 1920
      },
      {
        "src": "/photos/the-bedrock/34.webp",
        "room": "Full bathroom 1",
        "width": 1280,
        "height": 1893
      },
      {
        "src": "/photos/the-bedrock/35.webp",
        "room": "Full bathroom 2",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-bedrock/36.webp",
        "room": "Full bathroom 2",
        "width": 1280,
        "height": 1920
      },
      {
        "src": "/photos/the-bedrock/37.webp",
        "room": "Laundry area",
        "width": 1280,
        "height": 1920
      },
      {
        "src": "/photos/the-bedrock/38.webp",
        "room": "Laundry area",
        "width": 1280,
        "height": 1920
      },
      {
        "src": "/photos/the-bedrock/39.webp",
        "room": "Exterior",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-bedrock/40.webp",
        "room": "Exterior",
        "width": 1280,
        "height": 838
      },
      {
        "src": "/photos/the-bedrock/41.webp",
        "room": "Exterior",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-bedrock/42.webp",
        "room": "Exterior",
        "width": 1280,
        "height": 823
      },
      {
        "src": "/photos/the-bedrock/43.webp",
        "room": "Exterior",
        "width": 1280,
        "height": 1920
      },
      {
        "src": "/photos/the-bedrock/44.webp",
        "room": "Exterior",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-bedrock/45.webp",
        "room": "Exterior",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-bedrock/46.webp",
        "room": "Exterior",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-bedrock/47.webp",
        "room": "Exterior",
        "width": 1280,
        "height": 909
      },
      {
        "src": "/photos/the-bedrock/48.webp",
        "room": "Exterior",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-bedrock/49.webp",
        "room": "Hot tub",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-bedrock/50.webp",
        "room": "Sleeping loft with 2 double beds",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-bedrock/51.webp",
        "room": "Game room",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-bedrock/52.webp",
        "room": "Game room",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-bedrock/53.webp",
        "room": "Game room",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-bedrock/54.webp",
        "room": "More photos",
        "width": 1280,
        "height": 853
      },
      {
        "src": "/photos/the-bedrock/55.webp",
        "room": "More photos",
        "width": 1280,
        "height": 1920
      }
    ],
    "featured": [
      38,
      0,
      48,
      10
    ],
    "source": "https://www.airbnb.com/rooms/1780528394795968142"
  },
};

export const getListingContent = (slug: string): ListingContent | undefined => listingContent[slug];
