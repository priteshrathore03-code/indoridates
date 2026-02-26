export const isProfileComplete = (profile: {
  name?: string;
  age?: number;
  gender?: string;
  photos?: string[];
}) => {
  if (!profile.name) return false;
  if (!profile.age) return false;
  if (!profile.gender) return false;
  if (!profile.photos || profile.photos.length < 3) return false;

  return true;
};
