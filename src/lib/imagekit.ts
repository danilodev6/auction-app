// src/lib/imagekit.ts
export const getImageKitUrl = (supabaseImageUrl: string | null): string => {
  if (!supabaseImageUrl) return "";

  const imagekitEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

  if (!imagekitEndpoint) {
    console.warn("ImageKit endpoint not configured");
    return supabaseImageUrl;
  }

  // Extract path from Supabase URL
  const supabaseStoragePrefix =
    "https://oegkjipmpbucywefggtm.supabase.co/storage/v1/object/public/tbsubastas-images/images/";

  if (supabaseImageUrl.startsWith(supabaseStoragePrefix)) {
    const imagePath = supabaseImageUrl.replace(supabaseStoragePrefix, "");
    return `${imagekitEndpoint}/${imagePath}`;
  }

  return supabaseImageUrl;
};

export const getOptimizedImageUrl = (
  supabaseImageUrl: string | null,
  transformations?: {
    width?: number;
    height?: number;
    quality?: string;
    format?: string;
    crop?: string;
  },
): string => {
  if (!supabaseImageUrl) return "";

  const imagekitUrl = getImageKitUrl(supabaseImageUrl);
  if (!imagekitUrl.includes("ik.imagekit.io")) return imagekitUrl;

  // Build transformation string correctly
  const transforms: string[] = [];
  if (transformations?.width) transforms.push(`w-${transformations.width}`);
  if (transformations?.height) transforms.push(`h-${transformations.height}`);
  if (transformations?.format) transforms.push(`f-${transformations.format}`);
  if (transformations?.crop) transforms.push(`c-${transformations.crop}`);
  if (transformations?.quality) transforms.push(`q-${transformations.quality}`);

  const transformString =
    transforms.length > 0 ? `tr:${transforms.join(",")}/` : "";

  // Correct ImageKit transformation format
  return imagekitUrl.replace(
    `https://ik.imagekit.io/hhewzuqdk/`,
    `https://ik.imagekit.io/hhewzuqdk/${transformString}`,
  );
};
