// src/lib/imagekit.ts
export const getImageKitUrl = (supabaseImageUrl: string | null): string => {
  if (!supabaseImageUrl) return "";

  const imagekitEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!imagekitEndpoint || !supabaseUrl) {
    return supabaseImageUrl;
  }

  // Extract path from Supabase URL
  const supabaseStoragePrefix = `${supabaseUrl}/storage/v1/object/public/tbsubastas-images/images/`;

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

  const transforms: string[] = [];
  if (transformations?.width) transforms.push(`w-${transformations.width}`);
  if (transformations?.height) transforms.push(`h-${transformations.height}`);
  if (transformations?.quality) transforms.push(`q-${transformations.quality}`);
  if (transformations?.format) transforms.push(`f-${transformations.format}`);
  if (transformations?.crop) transforms.push(`c-${transformations.crop}`);

  const transformString =
    transforms.length > 0 ? `tr:${transforms.join(",")}/` : "";

  return imagekitUrl.replace(
    "https://ik.imagekit.io/hhewzuqdk/",
    `https://ik.imagekit.io/hhewzuqdk/${transformString}`,
  );
};
