/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }]
  },
  async headers() {
    return [
      {
        // Make browsers treat the app file as an Android package to download, not as unknown binary.
        source: '/CompareHub.apk',
        headers: [
          { key: 'Content-Type', value: 'application/vnd.android.package-archive' },
          { key: 'Content-Disposition', value: 'attachment; filename="CompareHub.apk"' },
          // Short cache so a new version reaches people soon after it is published.
          { key: 'Cache-Control', value: 'public, max-age=300, must-revalidate' }
        ]
      }
    ];
  }
};

export default nextConfig;
