import { getComments, createComment, updateComment, deleteComment } from './comments.js';

// Usuario y video reales desde localStorage
const currentUserId = JSON.parse(localStorage.getItem("user"))?.id_user;
const currentVideoId = 1; // Por ahora hardcodeado, se puede hacer dinámico después

// Bandera para evitar inicializaciones múltiples
let isInitialized = false;

export function initComments() {
  // Evitar inicializaciones múltiples
  if (isInitialized) {
    console.log('⚠️ Sistema de comentarios ya inicializado, saltando...');
    return;
  }

  // Verificar que el usuario esté logueado
  if (!currentUserId) {
    console.error('Usuario no logueado, no se pueden cargar comentarios');
    return;
  }

  console.log('Usuario logueado con ID:', currentUserId);

  // Referencias a los elementos del DOM dentro de videoplayer.html, ya cargados
  const listaComentarios = document.getElementById('listaComentarios');
  const textareaComentario = document.getElementById('nuevoComentario');
  const btnPublicar = document.getElementById('btnPublicar');

  if (!listaComentarios || !textareaComentario || !btnPublicar) {
    console.error('Elementos de comentarios no encontrados en el DOM');
    return;
  }

  // Botón siempre visible; el input es el protagonista visual

  async function cargarComentarios() {
    try {
      const comentarios = await getComments(currentVideoId);
      listaComentarios.innerHTML = '';
      comentarios.forEach(({ id_comment, id_user, nickname, comments }) => {
        const div = crearComentarioElement(id_comment, id_user, nickname, comments);
        listaComentarios.appendChild(div);
      });
    } catch (error) {
      console.error('Error cargando comentarios:', error);
    }
  }

  function crearComentarioElement(id_comment, id_user, nickname, comments) {
    const div = document.createElement('div');
    div.className = 'comentario';

    // Header con avatar (inicial) + nickname
    const header = document.createElement('div');
    header.className = 'comment-header';

    const avatar = document.createElement('span');
    avatar.className = 'avatar-initials';
    const firstLetter = (nickname || '?').trim().charAt(0).toUpperCase();
    avatar.textContent = firstLetter || '?';

    const nombreElem = document.createElement('span');
    nombreElem.className = 'nombre';
    nombreElem.textContent = nickname || 'User';

    header.appendChild(avatar);
    header.appendChild(nombreElem);

    const textoElem = document.createElement('div');
    textoElem.className = 'texto';
    textoElem.textContent = comments;

    // Botonera (solo visible para el autor)
    const botonesDiv = document.createElement('div');
    botonesDiv.className = 'botonesComentario d-flex gap-2 mt-2 justify-content-end';

    const btnEditar = document.createElement('button');
    btnEditar.textContent = 'Edit';
    btnEditar.className = 'btn btn-primary btn-sm';

    const btnBorrar = document.createElement('button');
    btnBorrar.textContent = 'Delete';
    btnBorrar.className = 'btn btn-primary btn-sm';

    if (id_user === currentUserId) {
      btnEditar.onclick = () => editarComentario(div, id_comment, textoElem, btnEditar);
      btnBorrar.onclick = () => borrarComentario(div, id_comment);
      botonesDiv.appendChild(btnEditar);
      botonesDiv.appendChild(btnBorrar);
    }

    div.appendChild(header);
    div.appendChild(textoElem);
    if (id_user === currentUserId) {
      div.appendChild(botonesDiv);
    }

    return div;
  }
  async function borrarComentario(div, id_comment) {
    if (!confirm('¿Seguro que quieres borrar este comentario?')) return;

    try {
      const result = await deleteComment(id_comment, currentUserId);
      if (result) {
        div.remove();
      } else {
        alert('No se pudo borrar el comentario');
      }
    } catch (error) {
      alert('Error al borrar comentario');
      console.error(error);
    }
  }

  function editarComentario(div, id_comment, textoElem, btnEditar) {
    if (btnEditar.textContent === 'Edit') {
      const inputTextoEdit = document.createElement('textarea');
      inputTextoEdit.value = textoElem.textContent;
      inputTextoEdit.style.width = '100%';
      inputTextoEdit.style.marginTop = '5px';

      div.replaceChild(inputTextoEdit, textoElem);
      btnEditar.textContent = 'Save';

      btnEditar.onclick = async () => {
        const nuevoTexto = inputTextoEdit.value.trim();
        if (!nuevoTexto) {
          alert('El comentario no puede estar vacío');
          return;
        }

        try {
          console.log('🔍 Frontend - Enviando UPDATE:', {
            id_comment,
            id_user: currentUserId,
            comments: nuevoTexto
          });
          
          await updateComment(id_comment, {
            id_user: currentUserId,
            comments: nuevoTexto,
          });

          textoElem.textContent = nuevoTexto;
          div.replaceChild(textoElem, inputTextoEdit);
          btnEditar.textContent = 'Edit';
          btnEditar.onclick = () => editarComentario(div, id_comment, textoElem, btnEditar);
        } catch (error) {
          alert('Error al guardar comentario');
          console.error(error);
        }
      };
    }
  }

  async function agregarComentario() {
    const comments = textareaComentario.value.trim();
    if (!comments) {
      alert('El comentario no puede estar vacío');
      return;
    }

    try {
      const nuevoComentario = await createComment({
        id_user: currentUserId,
        id_video: currentVideoId,
        comments,
      });

      const div = crearComentarioElement(
        nuevoComentario.id_comment,
        nuevoComentario.id_user,
        nuevoComentario.nickname,
        nuevoComentario.comments
      );

      listaComentarios.prepend(div);
      textareaComentario.value = '';
    } catch (error) {
      alert('Error al agregar comentario');
      console.error(error);
    }
  }



  btnPublicar.addEventListener('click', agregarComentario);

  // Carga inicial de comentarios
  cargarComentarios();

  // Marcar como inicializado para evitar duplicados
  isInitialized = true;
  console.log('✅ Sistema de comentarios inicializado completamente');
}
