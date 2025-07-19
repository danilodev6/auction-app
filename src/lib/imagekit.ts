// lib/imagekit.ts - Updated
export const getImageKitUrl = (supabaseImageUrl: string | null): string => {
  if (!supabaseImageUrl) return "";

  const imagekitEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!imagekitEndpoint || !supabaseUrl) {
    console.warn(
      "ImageKit or Supabase URL not configured, returning original URL",
    );
    return supabaseImageUrl;
  }

  // If it's already an ImageKit URL, return as is
  if (supabaseImageUrl.includes("ik.imagekit.io")) {
    return supabaseImageUrl;
  }

  // Extract the path from the Supabase URL
  const supabaseStoragePrefix = `${supabaseUrl}/storage/v1/object/public/tbsubastas-images/`;

  if (supabaseImageUrl.startsWith(supabaseStoragePrefix)) {
    const imagePath = supabaseImageUrl.replace(supabaseStoragePrefix, "");

    // ✅ CORRECT: Remove the /tbsubastas-images/ prefix since it's already configured as the folder
    const cleanImageKitUrl = `${imagekitEndpoint}/${imagePath}`;

    console.log("Converting Supabase URL to ImageKit:", {
      original: supabaseImageUrl,
      imagePath: imagePath,
      imagekit: cleanImageKitUrl,
    });

    return cleanImageKitUrl;
  }

  // Fallback to original URL
  console.warn("Could not convert to ImageKit URL:", supabaseImageUrl);
  return supabaseImageUrl;
};
