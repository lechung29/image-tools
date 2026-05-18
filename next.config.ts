/** @format */

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    webpack: (config, { isServer }) => {
        if (isServer) {
            if (!Array.isArray(config.externals)) {
                config.externals = [];
            }
            config.externals.push("sharp");
        }
        return config;
    },
};

export default nextConfig;
