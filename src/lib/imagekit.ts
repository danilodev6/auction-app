// lib/imagekit.ts
export const getImageKitUrl = (supabaseImageUrl: string | null): string => {
  if (!supabaseImageUrl) return "";

  const imagekitEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

  if (!imagekitEndpoint) {
    console.warn("ImageKit URL not configured, returning original URL");
    return supabaseImageUrl;
  }

  // If it's already an ImageKit URL, return as is
  if (supabaseImageUrl.includes("ik.imagekit.io")) {
    return supabaseImageUrl;
  }

  // For Web Folder origin, we need to pass the full Supabase URL to ImageKit
  const imageKitUrl = `${imagekitEndpoint}/${supabaseImageUrl}`;

  console.log("Converting Supabase URL to ImageKit (Web Folder):", {
    original: supabaseImageUrl,
    imagekit: imageKitUrl,
  });

  return imageKitUrl;
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

  // For Web Folder origin, insert transformations after the endpoint but before the source URL
  // Example: https://ik.imagekit.io/hhewzuqdk/tr:w-400,h-400/https://...
  return imagekitUrl.replace(
    `${process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}/`,
    `${process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}/${transformString}/`,
  );
};
