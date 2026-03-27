/**
 * DEPRECATED: This file contains mock profile data and should NOT be used.
 * 
 * All user data must come from Firestore in the "users" collection.
 * 
 * This file is kept for reference only. Remove if no longer needed.
 * 
 * Real user fields from Firestore:
 * - name
 * - age
 * - gender
 * - bio
 * - photos (array)
 * - video (optional)
 * - latitude, longitude
 * - and other fields
 */

export type ProfileType = {
  id: string;
  name: string;
  age: number;
  gender: "male" | "female";
  bio: string;
  image: string;
};

/**
 * @deprecated - Use Firestore data instead
 * This is mock data kept for reference only
 */
export const profiles: ProfileType[] = [
  {
    id: "1",
    name: "Riya",
    age: 23,
    gender: "female",
    bio: "Love coffee dates & long drives 🌸",
    image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e",
  },
  {
    id: "2",
    name: "Ananya",
    age: 25,
    gender: "female",
    bio: "Foodie | Traveler | Good vibes only ✨",
    image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91",
  },
  {
    id: "3",
    name: "Aman",
    age: 26,
    gender: "male",
    bio: "Gym & coding enthusiast 💪💻",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
  },
];
