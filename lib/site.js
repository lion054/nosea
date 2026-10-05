export const SITE = {
  name: 'Nosea Safaris',
  tagline: 'Experience the wilderness',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://noseasafaris.com',
  email: 'info@noseasafaris.com',
  phone: '+263 71 844 4603',
  whatsapp: '263718444603',
  base: 'Harare, Zimbabwe',
};

export const waLink = (text = '') => `https://wa.me/${SITE.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
