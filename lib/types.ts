export type RestaurantLog = {
  id: string;
  name: string;
  location?: string;
  rating: number;
  dateVisited: string;
  review?: string;
  tags: string[];
  createdAt: string;
};
