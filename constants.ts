import { ServiceProvider } from './types';

export const MOCK_PROVIDERS: ServiceProvider[] = [
  {
    id: '1',
    name: 'Budi Teknisi AC',
    whatsapp: '6281234567890',
    location: {
      lat: -6.2088,
      lng: 106.8456,
      address: 'Jakarta Pusat'
    },
    serviceType: 'AC & Pendingin',
    rating: 4.8,
    description: 'Melayani cuci AC, tambah freon, dan perbaikan AC mati total.'
  },
  {
    id: '2',
    name: 'Siti ART Harian',
    whatsapp: '6281298765432',
    location: {
      lat: -6.2297,
      lng: 106.8167,
      address: 'Jakarta Selatan'
    },
    serviceType: 'Kebersihan',
    rating: 4.9,
    description: 'Bersih-bersih rumah, setrika, dan masak harian.'
  },
  {
    id: '3',
    name: 'Agus Tukang Ledeng',
    whatsapp: '6281122334455',
    location: {
      lat: -6.1751,
      lng: 106.8272,
      address: 'Gambir, Jakarta'
    },
    serviceType: 'Plumbing',
    rating: 4.7,
    description: 'Perbaikan pipa bocor, pasang pompa air, dan kuras tandon.'
  }
];

export const SERVICE_CATEGORIES = [
  'AC & Pendingin',
  'Kebersihan',
  'Plumbing',
  'Kelistrikan',
  'Elektronik',
  'Pertukangan',
  'Lainnya'
];
