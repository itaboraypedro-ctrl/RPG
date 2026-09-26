import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "*.supabase.co";

const nextConfig: NextConfig = {
  // A IA que tece a campanha lê os documentos normativos do Sacramento em runtime.
  outputFileTracingIncludes: {
    "/api/ai/weave-campaign": ["./docs/01_Sacramento_Criador_de_Personagens.md", "./docs/02_Sacramento_Gerenciador_de_Partidas.md"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHost,
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
