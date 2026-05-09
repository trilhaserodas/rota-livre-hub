export interface ToolCard {
  id: string;
  name: string;
  description: string;
  path: string;
  icon: any;
  category: 'finance' | 'travel' | 'info' | 'utility';
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

export interface LocationPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: 'tourism' | 'camping' | 'secure' | 'repair' | 'hostel' | 'water' | 'viewpoint' | 'dangerous' | 'bike_route' | 'moto_route';
  description: string;
  image?: string;
}
