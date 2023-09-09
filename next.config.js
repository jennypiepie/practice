/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, options) => {
        config.module.rules.push({
            test: /\.glb/,
            type: 'asset/resource',
            generator: {
                filename: 'static/chunks/models/[hash][ext]',
            },
        })

        return config
    },
}

module.exports = nextConfig
