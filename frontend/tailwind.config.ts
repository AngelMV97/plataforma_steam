import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'selector', // Uses the 'dark' class on the HTML element
  theme: {
    extend: {
      colors: {
        // Gomot Design Colors
        gomot: {
          primary: '#2F6F6D',
          secondary: '#4A9B98',
          light: '#5B8FB9',
          dark: '#1F3A5F',
        },
      },
    },
  },
  plugins: [],
};

export default config;
