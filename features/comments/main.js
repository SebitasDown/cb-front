// Sistema de comentarios simple y directo
import { getComments, createComment, updateComment, deleteComment } from './comments.js';

// Variables globales
let currentVideoId = null;
let currentUserId = null;
let comments = [];
let isInitialized = false;
let lastVideoId = null;

// Función principal - se ejecuta cuando se carga la página
export function initComments() {
  // Obtener datos del usuario y video
  currentUserId = getCurrentUserId();
  currentVideoId = getCurrentVideoId();
  
  if (!currentUserId) {
    console.error('❌ Usuario no logueado');
    return;
  }
  
  if (!currentVideoId) {
    console.error('❌ No hay video seleccionado');
    return;
  }
  
  // Verificar si cambió el video
  if (lastVideoId !== currentVideoId) {
    console.log(`🔄 Video cambiado de ${lastVideoId} a ${currentVideoId}, reinicializando...`);
    isInitialized = false;
    lastVideoId = currentVideoId;
  }
  
  // Evitar inicializaciones múltiples para el mismo video
  if (isInitialized) {
    console.log('⚠️ Sistema de comentarios ya inicializado para este video, saltando...');
    return;
  }
  
  console.log('🎯 Inicializando sistema de comentarios para video:', currentVideoId);
  
  // Cargar comentarios
  loadComments();
  
  // Configurar eventos
  setupEvents();
  
  // Marcar como inicializado para este video
  isInitialized = true;
}

// Obtener ID del usuario
function getCurrentUserId() {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.id_user;
  } catch (error) {
    return null;
  }
}

// Obtener ID del video
function getCurrentVideoId() {
  try {
    const video = JSON.parse(localStorage.getItem('currentVideo'));
    return video?.id_video;
  } catch (error) {
    return null;
  }
}

// Cargar comentarios del video
async function loadComments() {
  try {
    const response = await getComments(currentVideoId);
    
    // Filtrar comentarios para asegurar que solo sean del video actual
    comments = response.filter(comment => {
      const commentVideoId = parseInt(comment.id_video);
      const currentVideoIdInt = parseInt(currentVideoId);
      return commentVideoId === currentVideoIdInt;
    });
    
    renderComments();
    
  } catch (error) {
    console.error('❌ Error cargando comentarios:', error);
    showError('Error al cargar comentarios');
  }
}

// Mostrar comentarios en el DOM
function renderComments() {
  const listaComentarios = document.getElementById('listaComentarios');
  if (!listaComentarios) return;
  
  listaComentarios.innerHTML = '';
  
  if (comments.length === 0) {
    listaComentarios.innerHTML = `
      <div class="text-center text-muted py-4">
        <i class="bi bi-chat-dots display-4"></i>
        <p class="mt-2">No hay comentarios para este video</p>
      </div>
    `;
    return;
  }
  
  comments.forEach(comment => {
    const commentElement = createCommentElement(comment);
    listaComentarios.appendChild(commentElement);
  });
}

// Crear elemento HTML de un comentario
function createCommentElement(comment) {
  const div = document.createElement('div');
  div.className = 'comentario border-bottom pb-3 mb-3';
  div.innerHTML = `
    <div class="d-flex align-items-start gap-3">
      <div class="flex-shrink-0">
        <div class="avatar bg-primary rounded-circle d-flex align-items-center justify-content-center text-white" style="width: 40px; height: 40px;">
          ${comment.nickname ? comment.nickname.charAt(0).toUpperCase() : 'U'}
        </div>
      </div>
      <div class="flex-grow-1">
        <div class="d-flex align-items-center gap-2 mb-1">
          <strong class="nombre">${comment.nickname || 'Usuario'}</strong>
          <small class="text-muted">${formatDate(comment.timestamp || comment.comment_date || comment.created_at)}</small>
        </div>
        <p class="texto mb-2">${comment.comments}</p>
        ${comment.id_user == currentUserId ? `
          <div class="comment-actions d-flex justify-content-end gap-2">
            <button class="btn btn-primary btn-sm comment-btn" onclick="editComment(${comment.id_comment}, this)">
              Edit
            </button>
            <button class="btn btn-danger btn-sm comment-btn" onclick="deleteComment(${comment.id_comment}, this)">
              Delete
            </button>
          </div>
        ` : ''}
      </div>
    </div>
  `;
  
  return div;
}

// Formatear fecha
function formatDate(dateString) {
  if (!dateString) {
    return 'Fecha no disponible';
  }
  
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }
    
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
  } catch (error) {
    return 'Error en fecha';
  }
}

// Configurar eventos
function setupEvents() {
  const btnPublicar = document.getElementById('btnPublicar');
  const textarea = document.getElementById('nuevoComentario');
  
  if (btnPublicar) {
    // Remover listeners anteriores si existen
    btnPublicar.removeEventListener('click', createNewComment);
    // Agregar nuevo listener
    btnPublicar.addEventListener('click', createNewComment);
  }
  
  if (textarea) {
    // Remover listeners anteriores si existen
    textarea.removeEventListener('keypress', handleKeyPress);
    // Agregar nuevo listener
    textarea.addEventListener('keypress', handleKeyPress);
  }
}

// Manejador de tecla Enter
function handleKeyPress(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    createNewComment();
  }
}

// Crear nuevo comentario
async function createNewComment() {
  const textarea = document.getElementById('nuevoComentario');
  const text = textarea.value.trim();
  
  if (!text) {
    showError('El comentario no puede estar vacío');
    return;
  }
  
  console.log('🔍 Debug - Datos para crear comentario:', {
    id_user: currentUserId,
    id_video: currentVideoId,
    comments: text
  });
  
  try {
    console.log('📝 Intentando crear comentario...');
    
    const result = await createComment({
      id_user: currentUserId,
      id_video: currentVideoId,
      comments: text
    });
    
    console.log('✅ Resultado de createComment:', result);
    
    // Limpiar textarea
    textarea.value = '';
    
    // Recargar comentarios
    await loadComments();
    
    console.log('🔄 Comentarios recargados');
    
  } catch (error) {
    console.error('❌ Error creando comentario:', error);
    showError('Error al crear comentario');
  }
}

// Editar comentario (función global)
window.editComment = function(commentId, button) {
  const commentDiv = button.closest('.comentario');
  const textElement = commentDiv.querySelector('.texto');
  const currentText = textElement.textContent;
  
  // Crear textarea
  const textarea = document.createElement('textarea');
  textarea.value = currentText;
  textarea.className = 'form-control mt-2';
  textarea.rows = 2;
  
  // Reemplazar texto con textarea
  textElement.parentNode.replaceChild(textarea, textElement);
  
  // Cambiar botón
  button.textContent = 'Save';
  button.className = 'btn btn-success btn-sm';
  
  // Focus en textarea
  textarea.focus();
  textarea.select();
  
  // Cambiar onclick
  button.onclick = () => saveCommentEdit(commentId, button, textarea, currentText);
};

// Guardar edición (función global)
window.saveCommentEdit = async function(commentId, button, textarea, originalText) {
  const newText = textarea.value.trim();
  
  if (!newText) {
    showError('El comentario no puede estar vacío');
    return;
  }
  
  try {
    await updateComment(commentId, {
      id_user: currentUserId,
      comments: newText
    });
    
    // Restaurar texto
    const commentDiv = button.closest('.comentario');
    const textElement = document.createElement('p');
    textElement.className = 'texto mb-2';
    textElement.textContent = newText;
    
    textarea.parentNode.replaceChild(textElement, textarea);
    
    // Restaurar botón
    button.textContent = 'Edit';
    button.className = 'btn btn-primary btn-sm';
    button.onclick = () => editComment(commentId, button);
    
  } catch (error) {
    console.error('❌ Error editando comentario:', error);
    showError('Error al editar comentario');
    
    // Restaurar texto original
    const commentDiv = button.closest('.comentario');
    const textElement = document.createElement('p');
    textElement.className = 'texto mb-2';
    textElement.textContent = originalText;
    
    textarea.parentNode.replaceChild(textElement, textarea);
    
    // Restaurar botón
    button.textContent = 'Edit';
    button.className = 'btn btn-primary btn-sm';
    button.onclick = () => editComment(commentId, button);
  }
};

// Eliminar comentario (función global)
window.deleteComment = async function(commentId, button) {
  if (!confirm('¿Seguro que quieres eliminar este comentario?')) {
    return;
  }
  
  try {
    await deleteComment(commentId);
    
    // Remover del DOM
    const commentDiv = button.closest('.comentario');
    commentDiv.remove();
    
  } catch (error) {
    console.error('❌ Error eliminando comentario:', error);
    showError('Error al eliminar comentario');
  }
};

// Mostrar error
function showError(message) {
  const toast = document.createElement('div');
  toast.className = 'alert alert-danger alert-dismissible fade show position-fixed';
  toast.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
  toast.innerHTML = `
    <i class="bi bi-exclamation-triangle"></i>
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode) {
      toast.remove();
    }
  }, 5000);
}

// Función para resetear el sistema cuando cambia el video
export function resetCommentsSystem() {
  isInitialized = false;
  lastVideoId = null;
  comments = [];
  console.log('🔄 Sistema de comentarios reseteado');
}
