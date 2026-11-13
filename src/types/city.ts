/**
 * A photo reference is a path relative to the app's document directory
 * (e.g. "photos/rome.jpg"), or a full URI (file://, https://).
 */
export type PhotoRef = string;

export type Sight = {
  name: string;
  description: string;
  details: string;
  photo?: PhotoRef;
  latitude: number;
  longitude: number;
};

export type Neighborhood = {
  name: string;
  description: string;
  sights: Sight[];
};

export type City = {
  name: string;
  description: string;
  photo?: PhotoRef;
  neighborhoods: Neighborhood[];
};

export type StoredCity = {
  id: string;
  city: City;
};
