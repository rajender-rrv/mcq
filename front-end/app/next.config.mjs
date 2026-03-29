/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: { unoptimized: true },
    basePath: "/matdash-nextjs",
	assetPrefix: "/matdash-nextjs",
    //output: 'export',
    trailingSlash: false
};

//module.exports = nextConfig;
export default nextConfig;
