// lib/imagekit.ts
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

  // Extract the path from the Supabase URL for S3-Compatible storage
  // Example: https://oegkjipmpbucywefggtm.supabase.co/storage/v1/object/public/tbsubastas-images/c67f9280-1148-4be4-8029-d60758453f6c/image.jpg
  // Should become: https://ik.imagekit.io/hhewzuqdk/c67f9280-1148-4be4-8029-d60758453f6c/image.jpg
  // Note: ImageKit bucket is configured with folder "/images" so the path will be images/c67f9280-1148-4be4-8029-d60758453f6c/image.jpg
  const supabaseStoragePrefix = `${supabaseUrl}/storage/v1/object/public/tbsubastas-images/`;

  if (supabaseImageUrl.startsWith(supabaseStoragePrefix)) {
    const imagePath = supabaseImageUrl.replace(supabaseStoragePrefix, "");
    // Since ImageKit bucket folder is "/images", we need to include that in the path
    const cleanImageKitUrl = `${imagekitEndpoint}/images/${imagePath}`;

    console.log("Converting Supabase URL to ImageKit (S3-Compatible):", {
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

export const getOptimizedImageUrl = (
  supabaseImageUrl: string | null,
  transformations?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: "webp" | "jpg" | "png" | "avif";
    crop?: "maintain_ratio" | "force" | "at_least" | "at_max";
    focus?: "auto" | "face" | "center";
  },
): string => {
  if (!supabaseImageUrl) return "";

  const imagekitUrl = getImageKitUrl(supabaseImageUrl);

  if (!transformations || !imagekitUrl.includes("ik.imagekit.io")) {
    return imagekitUrl;
  }

  // Build transformation string
  const transforms: string[] = [];

  if (transformations.width) transforms.push(`w-${transformations.width}`);
  if (transformations.height) transforms.push(`h-${transformations.height}`);
  if (transformations.quality) transforms.push(`q-${transformations.quality}`);
  if (transformations.format) transforms.push(`f-${transformations.format}`);
  if (transformations.crop) transforms.push(`c-${transformations.crop}`);
  if (transformations.focus) transforms.push(`fo-${transformations.focus}`);

  if (transforms.length === 0) return imagekitUrl;

  const transformString = `tr:${transforms.join(",")}`;

  // Insert transformation string after the endpoint
  return imagekitUrl.replace(
    "https://ik.imagekit.io/hhewzuqdk/",
    `https://ik.imagekit.io/hhewzuqdk/${transformString}/`,
  );
};
