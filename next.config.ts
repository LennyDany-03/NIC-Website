import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Admin-uploaded BOD/mastermind photos live in the public `bod-photos`
    // Supabase Storage bucket — see supabase/schema.sql and
    // app/admin/dashboard/bod/page.jsx.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
