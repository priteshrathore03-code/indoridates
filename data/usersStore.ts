import AsyncStorage from "@react-native-async-storage/async-storage";

export type UserType = {
  phone: string;
  firstName: string;
  lastName: string;
  gender: string;
  age: number;
  photos: string[];
  video?: string;
};

const USERS_KEY = "ALL_USERS";

export const saveUserToDatabase = async (user: UserType) => {
  const existing = await AsyncStorage.getItem(USERS_KEY);
  let users: UserType[] = existing ? JSON.parse(existing) : [];

  const index = users.findIndex((u) => u.phone === user.phone);

  if (index !== -1) {
    users[index] = user; // update existing
  } else {
    users.push(user); // new user
  }

  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const getAllUsers = async (): Promise<UserType[]> => {
  const data = await AsyncStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
};

export const getUserByPhone = async (phone: string) => {
  const users = await getAllUsers();
  return users.find((u) => u.phone === phone);
};
