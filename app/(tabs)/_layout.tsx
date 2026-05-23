import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { auth, db } from "../../firebaseConfig";


export default function TabsLayout() {
  const [plansCount, setPlansCount] = useState(0);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "plans"), (snap) => {
      setPlansCount(snap.docs.length);
    });

    return () => unsub();
  }, []);
  const [chatCount, setChatCount] = useState(0);

  useEffect(() => {
    const myUid = auth.currentUser?.uid;

    if (!myUid) return;

    let likesLength = 0;
    let matchesLength = 0;

    const unsubLikes = onSnapshot(
      query(collection(db, "likes"), where("to", "==", myUid)),
      (snap) => {
        likesLength = snap.docs.length;
        setChatCount(likesLength + matchesLength);
      },
    );

    const unsubMatches = onSnapshot(
      query(
        collection(db, "chatRooms"),
        where("users", "array-contains", myUid),
      ),
      (snap) => {
        matchesLength = snap.docs.length;
        setChatCount(likesLength + matchesLength);
      },
    );

    return () => {
      unsubLikes();
      unsubMatches();
    };
  }, []);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#ff4d6d",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: {
          height: 65,
          paddingBottom: 30,
          paddingTop: 6,
          marginBottom: 6,
          backgroundColor: "#fff",
          borderTopWidth: 0.5,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          marginBottom: 4,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="todo"
        options={{
          title: "Todo",
          tabBarIcon: ({ color, size }) => (
            <View>
              <Ionicons name="list-outline" size={size} color={color} />

              {plansCount > 0 && (
                <View
                  style={{
                    position: "absolute",
                    top: -5,
                    right: -10,
                    backgroundColor: "#ff2d95",
                    borderRadius: 10,
                    minWidth: 18,
                    height: 18,
                    justifyContent: "center",
                    alignItems: "center",
                    paddingHorizontal: 4,
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: "bold",
                    }}
                  >
                    {plansCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, size }) => (
            <View>
              <Ionicons name="chatbubble-outline" size={size} color={color} />

              {chatCount > 0 && (
                <View
                  style={{
                    position: "absolute",
                    top: -5,
                    right: -10,
                    backgroundColor: "#ff2d95",
                    borderRadius: 10,
                    minWidth: 18,
                    height: 18,
                    justifyContent: "center",
                    alignItems: "center",
                    paddingHorizontal: 4,
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: "bold",
                    }}
                  >
                    {chatCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
