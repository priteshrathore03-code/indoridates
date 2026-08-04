import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../firebaseConfig";

export const uploadImage = async (imageUri: string) => {
  try {
    // Image URI -> Blob
    const response = await fetch(imageUri);
    const blob = await response.blob();

    // Unique File Name
    const fileName = `images/${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 10)}.jpg`;

    // Storage Reference
    const imageRef = ref(storage, fileName);

    // Upload
    await uploadBytes(imageRef, blob);

    // Download URL
    const downloadURL = await getDownloadURL(imageRef);

    return downloadURL;
  } catch (error) {
    console.log("Upload Error:", error);
    throw error;
  }
};
export const uploadDocument = async (fileUri: string, fileName: string) => {
  try {
    const response = await fetch(fileUri);
    const blob = await response.blob();

    const storagePath = `documents/${Date.now()}-${fileName}`;

    const documentRef = ref(storage, storagePath);

    await uploadBytes(documentRef, blob);

    const downloadURL = await getDownloadURL(documentRef);

    return downloadURL;
  } catch (error) {
    console.log("UPLOAD DOCUMENT ERROR =>", error);
    throw error;
  }
};
export const uploadVoice = async (voiceUri: string) => {
  try {
    const response = await fetch(voiceUri);
    const blob = await response.blob();

    const storagePath = `voices/${Date.now()}.m4a`;

    const voiceRef = ref(storage, storagePath);

    await uploadBytes(voiceRef, blob);

    const downloadURL = await getDownloadURL(voiceRef);

    return downloadURL;
  } catch (error) {
    console.log("UPLOAD VOICE ERROR =>", error);
    throw error;
  }
};

