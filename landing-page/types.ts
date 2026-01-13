import { ReactNode } from 'react';

export interface Feature {
  title: string;
  description: string;
  icon: ReactNode;
  color?: string;
}

export interface Coin {
  name: string;
  symbol: string;
  image: string;
  marketCap: string;
  change: number;
}

export interface NavLink {
  label: string;
  href: string;
  external?: boolean;
}