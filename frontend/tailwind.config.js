// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   content: [],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// }

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        //jakarta: ['"Plus Jakarta Sans"', "sans-serif"],
        //sans: ['"Plus Jakarta Sans"', "sans-serif"],
        sans: [
          '"Plus Jakarta Sans"',
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      colors: {
        primary: "#4F46E5",
        primaryHover: "#625AE4",
        secondary: "#CBC8F8",
        backgroundCenterBar: "#F8FAFC",
      },
    },

    plugins: [],
  },
};
