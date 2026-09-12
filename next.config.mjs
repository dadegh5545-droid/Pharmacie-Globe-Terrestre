/**
 * En-têtes de sécurité appliqués à toutes les réponses.
 * Le site est de nature médicale : on limite autant que possible la surface
 * d'attaque (XSS, clickjacking, fuite de référent).
 */
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(self), microphone=(), geolocation=(self), payment=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // `unsafe-inline`/`unsafe-eval` restent nécessaires au runtime Next.js.
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https:",
      // AppSync, Cognito et S3 (backend Amplify) + WhatsApp.
      "connect-src 'self' https://*.amazonaws.com https://*.amazoncognito.com wss://*.amazonaws.com",
      "frame-src 'self' https://www.google.com https://maps.google.com",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "object-src 'none'",
    ].join('; '),
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 420, 640, 768, 1024, 1280, 1536],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
