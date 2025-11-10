/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Urbanist_400Regular"],
        light: ["Urbanist_300Light"],
        regular: ["Urbanist_400Regular"],
        medium: ["Urbanist_500Medium"],
        semibold: ["Urbanist_600SemiBold"],
        bold: ["Urbanist_700Bold"],
        extrabold: ["Urbanist_800ExtraBold"],
      },
    },
  },
  plugins: [],
};
