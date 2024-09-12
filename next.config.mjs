/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'oqmrqsvgnsedjnzqvabq.supabase.co', // Your Supabase hostname
            port: '',
            pathname: '/storage/v1/object/public/photos/**', // Adjust the path to your storage bucket
          },
        ],
      },
};

export default nextConfig;
