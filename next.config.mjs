/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Aumenta el límite a 10 MB (puedes ajustar a '20mb' o más si tus archivos/payloads son más pesados)
    },
  },
}

export default nextConfig