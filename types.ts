/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ServiceProvider {
  id: string;
  name: string;
  whatsapp: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  serviceType: string;
  rating: number;
  description: string;
  imageUrl?: string;
}

export type AppView = 'home' | 'register';
