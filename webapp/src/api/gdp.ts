import { axiosWithAuth } from './utils';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export interface GDPStat {
  date: string;
  count: number;
}

export const fetchGDPStats = async (interval: string = 'day') => {
  const response = await axiosWithAuth().get<GDPStat[]>(`${API_URL}/gdp/stats`, {
    params: { interval },
  });
  return response.data;
};
