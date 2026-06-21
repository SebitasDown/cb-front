import { get, post, deletes, update } from "../../service/api.js";

const BASE_URL = "http://localhost:3001/comment";

export async function getComments(id_video) {
  const url = `${BASE_URL}?id_video=${id_video}`;
  return await get(url);
}

export async function createComment({ id_user, id_video, comments }) {
  const body = { id_user, id_video, comments };
  return await post(BASE_URL, body);
}

export async function updateComment(id_comment, { id_user, comments }) {
  const url = `${BASE_URL}/${id_comment}`;
  return await update(url, { id_user, comments });
}

export async function deleteComment(id_comment, id_user) {
  const url = `${BASE_URL}/${id_comment}`;
  return await deletes(url, { id_user });
}

export async function toggleLike(id_comment, id_user) {
  const url = `${BASE_URL}/${id_comment}/like`;
  return await post(url, { id_user });
}
