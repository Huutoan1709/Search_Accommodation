/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{html,js}'],
    theme: {
        extend: {
            backgroundColor: {
                'overlay-30': 'rgba(0, 0, 0, 0.3)',
                'overlay-70': 'rgba(0, 0, 0, 0.7)',
            },
            cursor: {
                pointer: 'pointer',
            },
        },
    },
    plugins: [],
};
