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

  // Extract the path from the Supabase URL
  // Example: https://oegkjipmpbucywefggtm.supabase.co/storage/v1/object/public/tbsubastas-images/image.jpg
  // Should become: tbsubastas-images/image.jpg
  const supabaseStoragePrefix = `${supabaseUrl}/storage/v1/object/public/`;

  if (supabaseImageUrl.startsWith(supabaseStoragePrefix)) {
    const imagePath = supabaseImageUrl.replace(supabaseStoragePrefix, "");
    return `${imagekitEndpoint}/${imagePath}`;
  }

  // If it's already an ImageKit URL or different format, return as is
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
