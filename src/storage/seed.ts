import type { City } from "@/types/city";

import { hasCityIndex, saveCity } from "./cities";

const SAMPLE_CITIES: Record<string, City> = {
  "sample-athens": {
    name: "Athens",
    description:
      "Birthplace of democracy, where ancient ruins sit among lively neighborhoods and rooftop cafés with Acropolis views.",
    neighborhoods: [
      {
        name: "Plaka",
        description: "Winding lanes of neoclassical houses at the foot of the Acropolis.",
        sights: [
          {
            name: "Acropolis",
            description: "The ancient citadel crowned by the Parthenon.",
            details: "Arrive at opening time to avoid the heat and the crowds.",
            latitude: 37.9715,
            longitude: 23.7257,
          },
          {
            name: "Anafiotika",
            description: "A tiny Cycladic-style village tucked under the Acropolis.",
            details: "Whitewashed houses and narrow stairways; best explored on foot.",
            latitude: 37.9724,
            longitude: 23.7287,
          },
        ],
      },
    ],
  },
  "sample-rome": {
    name: "Rome",
    description:
      "The Eternal City, layering nearly three thousand years of history into piazzas, churches and trattorias.",
    neighborhoods: [
      {
        name: "Centro Storico",
        description: "The historic heart, packed with fountains, domes and piazzas.",
        sights: [
          {
            name: "Pantheon",
            description: "A Roman temple with the world's largest unreinforced concrete dome.",
            details: "Look up at the oculus; on rainy days water falls straight through.",
            latitude: 41.8986,
            longitude: 12.4769,
          },
        ],
      },
    ],
  },
  "sample-kyoto": {
    name: "Kyoto",
    description:
      "Japan's former imperial capital, home to thousands of temples, shrines, gardens and traditional wooden machiya.",
    neighborhoods: [
      {
        name: "Higashiyama",
        description: "Preserved streets climbing toward Kiyomizu-dera.",
        sights: [
          {
            name: "Kiyomizu-dera",
            description: "A hillside temple famous for its wooden stage.",
            details: "Visit at dusk for views over the city as the lanterns light up.",
            latitude: 34.9949,
            longitude: 135.785,
          },
        ],
      },
    ],
  },
};

/** In development, writes sample cities when nothing has been stored yet. */
export async function seedIfEmpty(): Promise<void> {
  if (!__DEV__ || (await hasCityIndex())) return;
  for (const [id, city] of Object.entries(SAMPLE_CITIES)) {
    await saveCity(id, city);
  }
}
