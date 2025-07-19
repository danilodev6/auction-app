// src/lib/imagekit.ts
export const getImageKitUrl = (supabaseImageUrl: string | null): string => {
  if (!supabaseImageUrl) return "";

  const imagekitEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!imagekitEndpoint || !supabaseUrl) {
    return supabaseImageUrl;
  }

  const supabaseStoragePrefix = `${supabaseUrl}/storage/v1/object/public/tbsubastas-images/`;

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
    quality?: number;
    format?: string;
    crop?: string;
    focus?: string;
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
  if (transformations?.focus) transforms.push(`fo-${transformations.focus}`);

  const transformString =
    transforms.length > 0 ? `tr:${transforms.join(",")}/` : "";
  return imagekitUrl.replace(
    "ik.imagekit.io/",
    `ik.imagekit.io/${transformString}`,
  );
};
