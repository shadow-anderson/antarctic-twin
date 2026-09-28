/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./styles/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        iceBg: "#F7F9FB",
        cardBg: "#FFFFFF",
        cardBorder: "#E4E9EF",
        polarNavy: {
          DEFAULT: "#0B2942",
          dark: "#071B2C",
          light: "#143D61",
        },
        glacierTeal: {
          DEFAULT: "#0E7C86",
          dark: "#0B626A",
          light: "#EBF7F8",
          subtle: "#F0FAF9",
        },
        amberGold: {
          DEFAULT: "#C98A2C",
          hover: "#B77A23",
          light: "#FDF3E2",
        },
        textPrimary: "#0F1B2A",
        textSecondary: "#5B6B7D",
        statusEmerald: {
          DEFAULT: "#1E9E6D",
          light: "#E8F7F0",
        },
        statusAmber: {
          DEFAULT: "#D4922A",
          light: "#FEF6E9",
        },
        statusRose: {
          DEFAULT: "#D14343",
          light: "#FDE8E8",
        },
        provenanceViolet: {
          DEFAULT: "#6366A8",
          light: "#F0F1FA",
        },
        ops: {
          bg: "#0D2130",
          panel: "#132B3C",
          card: "#183548",
          text: "#E6EEF1",
          "text-2": "#9DB2BC",
          "text-3": "#6F8794",
          teal: "#2FA3A8",
          amber: "#D9A441",
          green: "#4FB58A",
          red: "#D4706F",
          violet: "#8F86B8",
          ice: "#6FA8C7",
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: "0 1px 3px rgba(15,27,42,0.03), 0 4px 12px rgba(15,27,42,0.05)",
        cardHover: "0 4px 6px -1px rgba(15,27,42,0.05), 0 10px 20px -3px rgba(15,27,42,0.08)",
        dropdown: "0 10px 25px -5px rgba(15,27,42,0.1), 0 8px 10px -6px rgba(15,27,42,0.05)",
        goldBtn: "0 2px 6px rgba(201,138,44,0.35)",
      },
      keyframes: {
        /* ── pre-existing (moved from <style jsx>) ── */
        fadeSlideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        /* ── spine / cascade animations ── */
        'spine-draw': {
          '0%':   { transform: 'scaleY(0)' },
          '100%': { transform: 'scaleY(1)' },
        },
        'node-pop': {
          '0%':   { transform: 'scale(0.6)', opacity: '0' },
          '60%':  { transform: 'scale(1.12)', opacity: '1' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
        'node-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0px rgba(76,127,145,0.45)' },
          '50%':      { boxShadow: '0 0 0 7px rgba(76,127,145,0)' },
        },
        'spine-sweep': {
          '0%':   { top: '-15%' },
          '100%': { top: '110%' },
        },
      },
      animation: {
        'fade-slide-up':   'fadeSlideUp 0.5s ease-out both',
        'fade-slide-up-6': 'fadeSlideUp 0.6s ease-out both',
        'fade-in':         'fadeIn 0.4s ease-out both',
        'spine-draw':      'spine-draw 450ms ease-out both',
        'node-pop':        'node-pop 350ms ease-out both',
        'node-pulse':      'node-pulse 1.2s ease-in-out infinite',
        'spine-sweep':     'spine-sweep 800ms ease-in-out forwards',
      },
    },
  },
  plugins: [],
};
