import { axiosWithAuth } from "./utils";
import { Tag } from "../types/Tag";

const API_URL = process.env.REACT_APP_API_URL;

export interface CreateTagParams {
  name: string;
  description: string;
  color_schema: {
    background: string;
    text: string;
  };
}

export interface UpdateTagParams {
  description: string;
  color_schema: {
    background: string;
    text: string;
  };
}

export interface ListTagsParams {
  page: number;
  pageSize: number;
  query?: string;
}

export interface ListTagsResponse {
  tags: Tag[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export const createTag = async (params: CreateTagParams): Promise<Tag> => {
  const response = await axiosWithAuth().post(
    `${API_URL}/setting/tags`,
    params,
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  return response.data;
};

export const updateTag = async (
  id: string,
  params: UpdateTagParams,
): Promise<Tag> => {
  const response = await axiosWithAuth().put(
    `${API_URL}/setting/tags/${id}`,
    params,
  );
  return response.data;
};

export const deleteTag = async (id: string): Promise<void> => {
  await axiosWithAuth().delete(`${API_URL}/setting/tags/${id}`);
};

export const listTags = async (
  params: ListTagsParams,
): Promise<ListTagsResponse> => {
  const response = await axiosWithAuth().get(`${API_URL}/setting/tags`, {
    params: {
      page: params.page,
      page_size: params.pageSize,
      q: params.query,
    },
  });
  return response.data;
};

export const getTag = async (id: string): Promise<Tag> => {
  const response = await axiosWithAuth().get(`${API_URL}/setting/tags/${id}`);
  return response.data;
};

export const getTags = async (ids: string[]): Promise<Tag[]> => {
  if (!ids || ids.length === 0) return [];
  const response = await axiosWithAuth().get(`${API_URL}/setting/tags/ids`, {
    params: {
      tag_ids: ids.join(","),
    },
  });
  return response.data;
};

export interface GrantTagAccessParams {
  creator_id: string;
  tag_id: string;
}

export interface RevokeTagAccessParams {
  creator_id: string;
  tag_id: string;
}

export const grantAccessToTag = async (
  params: GrantTagAccessParams,
): Promise<void> => {
  await axiosWithAuth().post(`${API_URL}/setting/tags/access`, params);
};

export const revokeAccessToTag = async (
  params: RevokeTagAccessParams,
): Promise<void> => {
  try {
    await axiosWithAuth().delete(
      `${API_URL}/setting/tags/access/${params.creator_id}/${params.tag_id}`,
    );
  } catch (e: any) {
    if (e?.response?.status !== 405 && e?.response?.status !== 404) throw e;
    await axiosWithAuth().delete(
      `${API_URL}/setting/tags/access/${params.creator_id}`,
      { params: { tag_id: params.tag_id } },
    );
  }
};

export const getAccessibleTagsForMember = async (
  creatorId: string,
): Promise<Tag[]> => {
  try {
    const response = await axiosWithAuth().get(
      `${API_URL}/setting/tags/access-member/${creatorId}`,
    );
    return response.data;
  } catch (e: any) {
    if (e?.response?.status !== 404) throw e;
    const response = await axiosWithAuth().get(
      `${API_URL}/setting/tags/access/${creatorId}`,
    );
    return response.data;
  }
};
