import { cache } from "react";
import {
  getCategoriesApi,
  getPaginatedVideosApi,
  getVideoByIdApi,
  getVideoByIdRawApi,
  getVideoCommentsApi,
} from "./api";

export const getCategories = cache(getCategoriesApi);
export const getVideoById = cache(getVideoByIdApi);
export const getVideoByIdRaw = cache(getVideoByIdRawApi);
export const getVideoComments = cache(getVideoCommentsApi);
export const getPaginatedVideos = cache(getPaginatedVideosApi);
