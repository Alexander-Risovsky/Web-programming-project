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
        sans: ['"Montserrat"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        primary: "#4F46E5",
        primaryHover: "#625AE4",
        secondary: "#CBC8F8",
        backgroundCenterBar: "#F8FAFC",
      },
      keyframes: {
        gradient: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        slideup: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideinleft: {
          "0%": { opacity: "0", transform: "translateX(-8px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        fadein: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scalein: {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 10px 30px rgba(79,70,229,0.12)" },
          "50%": { boxShadow: "0 14px 40px rgba(79,70,229,0.25)" },
        },
        countup: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        gradient: "gradient 12s ease infinite",
        float: "float 6s ease-in-out infinite",
        "slide-up": "slideup 0.5s ease forwards",
        "slide-in-left": "slideinleft 0.4s ease forwards",
        "fade-in": "fadein 0.6s ease forwards",
        "scale-in": "scalein 0.5s ease forwards",
        glow: "glow 2.5s ease-in-out infinite",
        "count-up": "countup 0.5s ease forwards",
      },
      boxShadow: {
        soft: "0 10px 40px rgba(15, 23, 42, 0.08)",
      },
    },

    plugins: [],
  },
};
