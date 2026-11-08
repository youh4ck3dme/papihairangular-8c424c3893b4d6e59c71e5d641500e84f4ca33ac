/** @type {import('tailwindcss').Config} */
// Tailwind farby a rozmery mapované na tokeny z tokens/tokens.json.
// Zlatá škála má hex hodnoty (rovnaké v oboch témach, podporujú Tailwind opacity `bg-gold/20`).
// Sémantické farby (surface, text, border…) sú var() — menia hodnotu cez html.dark.
module.exports = {
    content: ['./src/**/*.{html,ts}'],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans:    ['var(--font-family-body)',    'system-ui', 'sans-serif'],
                heading: ['var(--font-family-heading)', 'system-ui', 'sans-serif'],
            },
            colors: {
                // Sémantické farby (menia hodnotu podľa témy, bez opacity modifierov)
                surface:         'var(--color-surface)',
                'surface-alt':   'var(--color-surface-alt)',
                text:            'var(--color-text)',
                'text-muted':    'var(--color-text-muted)',
                border:          'var(--color-border)',
                'border-strong': 'var(--color-border-strong)',
                card:            'var(--color-card)',
                'accent-text':   'var(--color-accent-text)',
                'accent-fill':   'var(--color-accent-fill)',
                'on-accent':     'var(--color-on-accent)',
                overlay:         'var(--color-overlay)',
                success:         'var(--color-semantic-success)',
                danger:          'var(--color-semantic-danger)',
                focus:           'var(--color-semantic-focus)',

                // Zlatá škála — jediná, s plnými hex hodnotami pre Tailwind opacity (bg-gold/20 atď.)
                gold: {
                    50:  '#faf6e7',
                    100: '#f3ecc9',
                    200: '#e8d99a',
                    300: '#dec36a',
                    400: '#d4af37',
                    500: '#b8922b',
                    600: '#8a6a12',
                    700: '#6b530e',
                    800: '#4a3908',
                    900: '#2a2005',
                    DEFAULT: '#d4af37', // plocha; na text používať `text-accent-text` (AA 5:1)
                },

                // Legacy aliasy pre existujúce triedy (text-brand-dark, bg-brand-light)
                'brand-dark':  '#000000',
                'brand-light': '#f0f0f0',
            },
            spacing: {
                'pad-x':  'var(--size-pad-x)',
                'header': 'var(--size-header-h)',
                'cta':    'var(--size-cta-h)',
                'touch':  'var(--size-touch)',
            },
            borderRadius: {
                sm:   'var(--radius-sm)',
                DEFAULT: 'var(--radius-md)',
                md:   'var(--radius-md)',
                lg:   'var(--radius-lg)',
                pill: 'var(--radius-pill)',
            },
            maxWidth: {
                container: 'var(--size-container)',
            },
            boxShadow: {
                sm: 'var(--shadow-sm)',
                md: 'var(--shadow-md)',
                lg: 'var(--shadow-lg)',
            },
            transitionDuration: {
                fast: 'var(--motion-duration-fast)',
                base: 'var(--motion-duration-base)',
                hero: 'var(--motion-duration-hero)',
            },
            transitionTimingFunction: {
                'out-expo':    'var(--motion-easing-out)',
                'in-out-sine': 'var(--motion-easing-in-out)',
            },
            zIndex: {
                header: 'var(--z-header)',
                modal:  'var(--z-modal)',
                toast:  'var(--z-toast)',
            },
            backdropFilter: {
                none: 'none',
                blur: 'blur(10px)',
            },
        },
    },
    plugins: [],
};
