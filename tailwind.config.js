/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{html,ts}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Lato', 'sans-serif'],
                serif: ['Playfair Display', 'serif'],
            },
            colors: {
                'gold': '#D4AF37',
                'gold-light': '#FFD700', /* Brighter gold for gradients */
                'gold-dark': '#B8860B',  /* Darker gold for gradients */
                'brand-dark': '#000000',  /* AMOLED Black */
                'brand-light': '#f0f0f0',
                primary: {
                    50: '#fbf8f1',
                    100: '#f5edd9',
                    200: '#ebd8b0',
                    300: '#dec082',
                    400: '#d4af37', // Gold base
                    500: '#b8922b',
                    600: '#997220',
                    700: '#7a561c',
                    800: '#66461c',
                    900: '#563a1b',
                },
                copper: {
                    50: '#fdf8f6',
                    100: '#f2e8e5',
                    200: '#eaddd7',
                    300: '#e0cec7',
                    400: '#d2bab0',
                    500: '#c0a093',
                    600: '#b87333', // Copper base
                    700: '#9d5e2a',
                    800: '#844d25',
                    900: '#6b3d1f',
                }
            },
            backdropFilter: { // For liquid-glass effect
                'none': 'none',
                'blur': 'blur(10px)',
            }
        },
    },
    plugins: [],
}
