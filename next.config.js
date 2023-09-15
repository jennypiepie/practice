/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, options) => {
        config.module.rules.push(
            {
                test: /\.glb/,
                type: 'asset/resource',
                generator: {
                    filename: 'static/chunks/models/[hash][ext]',
                },
            },
            {
                test: /\.glsl/,
                type: 'asset/source',
                generator: {
                    filename: 'static/chunks/shaders/[hash][ext]',
                },
            },
            {
                test: /\.(jpe?g|png|svg|gif)/i,
                type: 'asset',
                generator: {
                    filename: 'static/chunks/imgs/[hash][ext][query]'
                }
            },
            {
                test: /\.json$/,
                type: 'json',
                generator: {
                    filename: 'static/chunks/json/[hash][ext][query]'
                }
            }
        )

        return config
    },
}

module.exports = nextConfig
