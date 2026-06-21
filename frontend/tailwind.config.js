/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0E1116",        // fondo principal, negro carbón cálido
        panel: "#161B22",      // superficies / tarjetas
        panel2: "#1D232C",     // superficies elevadas (hover, modales)
        line: "#2A3038",       // bordes sutiles
        gold: {
          DEFAULT: "#C9A227",
          light: "#E8C766",
          dark: "#8C6E16",
        },
        cream: "#F2EFE6",      // texto principal sobre fondo oscuro
        muted: "#8B8F98",      // texto secundario
        ok: "#4C9A6B",
        bad: "#C2503D",
      },
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        sans: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      backgroundImage: {
        "circuit": "radial-gradient(circle at 1px 1px, rgba(201,162,39,0.18) 1px, transparent 0)",
      },
    },
  },
  plugins: [],
};
