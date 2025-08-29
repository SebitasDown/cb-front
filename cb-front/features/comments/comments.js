import { get,post,deletes,update, } from "../../service/api.js";

const BASE_URL = "https://cb-back-prueba.vercel.app/comment";

// Obtener comentarios de un video
export async function getComments(id_video) {
  const url = `${BASE_URL}?id_video=${id_video}`;
  return await get(url);
}

// Crear un nuevo comentario
export async function createComment({ id_user, id_video, comments }) {
  const body = { id_user, id_video, comments };
  return await post(BASE_URL, body);
}

// Editar comentario existente
export async function updateComment(id_comment, { id_user, comments }) {
  const url = `${BASE_URL}/${id_comment}`;
  const body = { id_user, comments };
  return await update(url, body);
}

// Borrar comentario
export async function deleteComment(id_comment) {
  const url = `${BASE_URL}/${id_comment}`;
  return await deletes(url);
}
