export default function manifest() {
  return {
    name: 'Nosea Safaris', short_name: 'Nosea', description: 'Safaris and day experiences in Zimbabwe and Southern Africa.',
    start_url: '/', display: 'standalone', background_color: '#FFFFFF', theme_color: '#1E1E1E',
    icons: [{ src: '/icon.png', sizes: '512x512', type: 'image/png' }, { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  };
}
