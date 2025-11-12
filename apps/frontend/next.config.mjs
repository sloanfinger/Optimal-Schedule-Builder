/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  rewrites: async () => [
    { source: "/create", destination: "/courses/subject" },
    {
      source: "/courses",
      destination: "/courses/subject",
    },
  ],
};

export default nextConfig;
