import Dexie, { Table } from 'dexie';
import { LocationPoint } from '../types';

export interface SavedRoute {
  id: string;
  name: string;
  country: string;
  points: [number, number][];
  difficulty: string;
  vehicleTypes: string[];
  status: string;
  downloadedAt: number;
}

export interface SavedPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: string;
  address?: string;
  description?: string;
  image?: string;
  downloadedAt: number;
}

export class OfflineDatabase extends Dexie {
  routes!: Table<SavedRoute>;
  points!: Table<SavedPoint>;

  constructor() {
    super('OverlandOfflineDB');
    this.version(1).stores({
      routes: 'id, name, country',
      points: 'id, name, category'
    });
  }
}

export const db = new OfflineDatabase();

export const saveRouteOffline = async (route: any) => {
  await db.routes.put({
    ...route,
    downloadedAt: Date.now()
  });
};

export const removeRouteOffline = async (id: string) => {
  await db.routes.delete(id);
};

export const savePointOffline = async (point: LocationPoint) => {
  await db.points.put({
    ...point,
    downloadedAt: Date.now()
  } as SavedPoint);
};

export const removePointOffline = async (id: string) => {
  await db.points.delete(id);
};

export const exportToGPX = (route: SavedRoute) => {
  const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Trilhas e Rodas" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${route.name}</name>
    <desc>${route.country} - ${route.difficulty}</desc>
  </metadata>
  <trk>
    <name>${route.name}</name>
    <trkseg>
      ${route.points.map(p => `<trkpt lat="${p[0]}" lon="${p[1]}"></trkpt>`).join('\n      ')}
    </trkseg>
  </trk>
</gpx>`;

  const blob = new Blob([gpx], { type: 'application/gpx+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${route.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.gpx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
