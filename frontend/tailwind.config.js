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
    },
  },
  plugins: [],
};
