/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["oegkjipmpbucywefggtm.supabase.co", "ik.imagekit.io"],

    remotePatterns: [
      {
        protocol: "https",
        hostname: "oegkjipmpbucywefggtm.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        pathname: "/hhewzuqdk/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "platform-lookaside.fbsbx.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
