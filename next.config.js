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
                    filename: 'imgs/[hash][ext][query]' // 局部指定输出位置
                }
            }
        )

        return config
    },
}

module.exports = nextConfig
