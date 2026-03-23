export const checkImageSafety = async (imageUrl: string) => {
  const API_KEY = "AIzaSyCOK5gCnH14_IGEJ-f_Pv50QDeokXoAHCE";

  try {
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`,
      {
        method: "POST",
        body: JSON.stringify({
          requests: [
            {
              image: {
                source: { imageUri: imageUrl },
              },
              features: [
                { type: "SAFE_SEARCH_DETECTION" },
                { type: "FACE_DETECTION" },
              ],
            },
          ],
        }),
      },
    );

    const result = await response.json();

    // 🔥 SAFE CHECK (crash nahi hoga)
    if (!result.responses || !result.responses[0]) {
      return { ok: true };
    }

    const safe = result.responses[0].safeSearchAnnotation;
    const faces = result.responses[0].faceAnnotations;

    // ❌ Nude block
    if (safe?.adult === "LIKELY" || safe?.adult === "VERY_LIKELY") {
      return { ok: false, msg: "Nude content not allowed ❌" };
    }

    // ❌ No face block
    if (!faces || faces.length === 0) {
      return { ok: false, msg: "Only real human photos allowed ❌" };
    }

    return { ok: true };
  } catch (error) {
    console.log("Vision error:", error);

    // 🔥 FAIL SAFE (kabhi app crash nahi hoga)
    return { ok: true };
  }
};
