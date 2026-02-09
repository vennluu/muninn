import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export interface ObjectTypeStat {
  id: string;
  name: string;
  object_count: number;
}

export interface PublicFeedItem {
  id: string;
  text: string;
  happened_at: { Time: string; Valid: boolean };
  creator_name: string;
  creator_profile: any;
}

export interface PublicTopObject {
  id: string;
  name: string;
  description: string;
  photo: string;
  type_name: { String: string; Valid: boolean };
  type_values: Record<string, any>;
  fact_count: number;
}

export interface PublicObjectType {
  id: string;
  name: string;
  description: string;
  icon: string;
  object_count: number;
}

export interface Organization {
  id: string;
  name: string;
  profile: any;
}

export const listOrganizations = async () => {
  const response = await axios.get(`${API_URL}/public/orgs`);
  return response.data;
};

export const getPublicStats = async (orgId: string) => {
  const response = await axios.get(`${API_URL}/public/stats?orgId=${orgId}`);
  return response.data;
};

export const getPublicFeed = async (orgId: string, typeId?: string) => {
  let url = `${API_URL}/public/feed?orgId=${orgId}`;
  if (typeId) {
    url += `&typeId=${typeId}`;
  }
  const response = await axios.get(url);
  return response.data;
};

export const getPublicTopObjects = async (orgId: string) => {
  const response = await axios.get(`${API_URL}/public/top-objects?orgId=${orgId}`);
  return response.data;
};

export const getPublicObjectTypes = async (orgId: string) => {
  const response = await axios.get(`${API_URL}/public/object-types?orgId=${orgId}`);
  return response.data;
};

export const getPublicObjectsByType = async (orgId: string, typeId: string) => {
  const response = await axios.get(`${API_URL}/public/objects-by-type?orgId=${orgId}&typeId=${typeId}`);
  return response.data;
};

export const getPublicObjectDetails = async (orgId: string, objectId: string) => {
  const response = await axios.get(`${API_URL}/public/objects/${objectId}?orgId=${orgId}`);
  return response.data;
};
