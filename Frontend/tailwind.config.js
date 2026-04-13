/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores sólidos para cosas tipo alertas o botones específicos

        'Verde': '#2cf533',
        'Rojo': '#fc5347',
        'Naranja': '#f55f02',

        'primario': {
          '50': '#f2f8fd',
          '100': '#e4effa',
          '200': '#c3dff4',
          '300': '#8dc5ec',
          '400': '#51a7df',
          '500': '#2a8ccd',
          '600': '#1b70ae',
          '700': '#17598d',
          '800': '#174c75',
          '900': '#153753',  // color base
          '950': '#102941',
        },

        'secundario': {
          '50': '#fdfbe9',
          '100': '#fbf5c6',
          '200': '#f8e990ff',
          '300': '#f3d651',
          '400': '#eec224',  // color base
          '500': '#deaa14',
          '600': '#bf830f',
          '700': '#995f0f',
          '800': '#7f4b14',
          '900': '#6c3e17',
          '950': '#3f1f09',
        },

        // Colores con nombres descriptivos
        'brand': {
          'primary': '#6366f1',    // indigo-500
          'secondary': '#8b5cf6',  // violet-500
          'accent': '#f59e0b',      // amber-500
          'success': '#10b981',     // emerald-500
          'warning': '#f97316',     // orange-500
          'error': '#ef4444',       // red-500
        },

        // Colores de fondo útiles
        'surface': {
          'card': '#ffffff',
          'hover': '#f3f4f6',
          'overlay': 'rgba(0, 0, 0, 0.5)',
          'modal': '#f9fafb',
        }
      }
    },
  },
  plugins: [],
  prefix: 'tw-',
  corePlugins: {
    preflight: false,
  },
}