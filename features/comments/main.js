// Sistema de comentarios optimizado y robusto
import { getComments, createComment, updateComment, deleteComment, toggleLike } from './comments.js';

// Variables globales
let currentVideoId = null;
let currentUserId = null;
let comments = [];
let isInitialized = false;
let lastVideoId = null;
let isLoading = false;
let retryCount = 0;
const MAX_RETRIES = 2; // Reducido de 3 a 2
const RETRY_DELAY = 2000; // Aumentado a 2 segundos para ser menos agresivo

// Función principal - se ejecuta cuando se carga la página
export function initComments() {
  // Esperar a que el DOM esté completamente cargado
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initCommentsInternal());
    return;
  }
  
  // Verificar que los elementos necesarios estén disponibles
  if (!document.getElementById('listaComentarios')) {
    console.log('🔄 Elementos del DOM no listos, reintentando en 100ms...');
    setTimeout(initComments, 100);
    return;
  }
  
  initCommentsInternal();
}

// Inicialización interna
function initCommentsInternal() {
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
  
  // Resetear siempre al navegar a la página (el router recrea el DOM)
  isInitialized = false;
  lastVideoId = currentVideoId;
  retryCount = 0;
  
  console.log('🎯 Inicializando sistema de comentarios para video:', currentVideoId);
  
  // Cargar comentarios con retry automático
  loadCommentsWithRetry();
  
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

// Cargar comentarios con retry automático
async function loadCommentsWithRetry() {
  if (isLoading) {
    console.log('⚠️ Ya se están cargando comentarios, saltando...');
    return;
  }
  
  isLoading = true;
  
  // Solo mostrar loading state en el primer intento
  if (retryCount === 0) {
    showLoadingState();
  }
  
  // Timeout de seguridad (15 segundos) - más largo para evitar falsos positivos
  const timeoutId = setTimeout(() => {
    if (isLoading) {
      console.error('⏰ Timeout de carga de comentarios');
      isLoading = false;
      // Solo mostrar error si realmente no se pudieron cargar comentarios
      if (comments.length === 0) {
        showError('Timeout al cargar comentarios');
      }
    }
  }, 15000);
  
  try {
    await loadComments();
    retryCount = 0; // Reset retry count on success
    clearTimeout(timeoutId); // Limpiar timeout si fue exitoso
    console.log('✅ Comentarios cargados exitosamente');
  } catch (error) {
    console.error('❌ Error cargando comentarios:', error);
    clearTimeout(timeoutId); // Limpiar timeout en caso de error
    
    if (retryCount < MAX_RETRIES && isNetworkError(error)) {
      retryCount++;
      console.log(`🔄 Reintentando carga de comentarios (${retryCount}/${MAX_RETRIES}) en ${RETRY_DELAY}ms...`);
      
      // No mostrar loading state en retries, solo en consola
      setTimeout(() => {
        isLoading = false;
        loadCommentsWithRetry();
      }, RETRY_DELAY); // Delay fijo, no exponencial
    } else {
      console.error('❌ Error no recuperable o máximo de reintentos alcanzado');
      // Solo mostrar error si realmente no se pudieron cargar comentarios
      if (comments.length === 0) {
        showError('Error al cargar comentarios');
      }
      isLoading = false;
      
      // Mostrar mensaje de "sin comentarios" si no se pudieron cargar
      if (comments.length === 0) {
        showNoCommentsMessage();
      }
    }
  }
}

// Cargar comentarios del video
async function loadComments() {
  try {
    console.log('📡 Cargando comentarios para video:', currentVideoId);
    
    const response = await getComments(currentVideoId);
    
    if (!response || !Array.isArray(response)) {
      throw new Error('Respuesta inválida del servidor');
    }
    
    // Filtrar comentarios para asegurar que solo sean del video actual
    comments = response.filter(comment => {
      const commentVideoId = parseInt(comment.id_video);
      const currentVideoIdInt = parseInt(currentVideoId);
      return commentVideoId === currentVideoIdInt;
    });
    
    console.log(`✅ ${comments.length} comentarios cargados exitosamente`);
    
    renderComments();
    
  } catch (error) {
    console.error('❌ Error cargando comentarios:', error);
    throw error; // Re-throw para que loadCommentsWithRetry lo maneje
  } finally {
    isLoading = false;
  }
}

// Mostrar comentarios en el DOM
function renderComments() {
  const listaComentarios = document.getElementById('listaComentarios');
  if (!listaComentarios) {
    console.warn('⚠️ Elemento listaComentarios no encontrado, reintentando en 100ms...');
    setTimeout(renderComments, 100);
    return;
  }
  
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
  
  // Mostrar solo los primeros 3 comentarios inicialmente
  const initialComments = comments.slice(0, 3);
  const hasMoreComments = comments.length > 3;
  
  // Renderizar comentarios iniciales
  initialComments.forEach(comment => {
    const commentElement = createCommentElement(comment);
    listaComentarios.appendChild(commentElement);
  });
  

}

// Mostrar indicador de carga
function showLoadingState() {
  const listaComentarios = document.getElementById('listaComentarios');
  if (listaComentarios) {
    listaComentarios.innerHTML = `
      <div class="text-center text-muted py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando comentarios...</span>
        </div>
        <p class="mt-2">Cargando comentarios...</p>
      </div>
    `;
  }
}

// Detectar si un error es de red (recuperable)
function isNetworkError(error) {
  // Errores de red que vale la pena reintentar
  return error.name === 'TypeError' || // Network error
         error.message.includes('fetch') || // Fetch error
         error.message.includes('network') || // Network error
         error.message.includes('timeout'); // Timeout
}

// Mostrar mensaje cuando no hay comentarios (por error o porque realmente no hay)
function showNoCommentsMessage() {
  const listaComentarios = document.getElementById('listaComentarios');
  if (listaComentarios) {
    listaComentarios.innerHTML = `
      <div class="text-center text-muted py-4">
        <i class="bi bi-exclamation-triangle text-warning display-4"></i>
        <p class="mt-2">No se pudieron cargar los comentarios</p>
        <button class="btn btn-outline-primary btn-sm mt-2" onclick="retryLoadComments()">
          <i class="bi bi-arrow-clockwise me-1"></i>Reintentar
        </button>
      </div>
    `;
  }
}

// Crear elemento HTML de un comentario
function createCommentElement(comment) {
  const div = document.createElement('div');
  div.className = 'comentario border-bottom pb-3 mb-3';
  div.innerHTML = `
    <div class="d-flex align-items-start gap-3">
      <div class="flex-shrink-0">
        <div class="avatar rounded-circle d-flex align-items-center justify-content-center text-white" style="width: 40px; height: 40px; background: teal;">
          ${comment.nickname ? comment.nickname.charAt(0).toUpperCase() : 'U'}
        </div>
      </div>
      <div class="flex-grow-1">
        <div class="d-flex align-items-center gap-2 mb-1">
          <strong class="nombre">${comment.nickname || 'Usuario'}</strong>
          <small class="text-muted">${formatDate(comment.comment_date)}</small>
        </div>
        <p class="texto mb-2" id="comment-text-${comment.id_comment}">${comment.comments}</p>
        <div class="d-flex align-items-center gap-3">
          <button class="btn btn-sm btn-like ${comment.userLiked ? 'liked' : ''}" data-comment-id="${comment.id_comment}" onclick="handleLike(${comment.id_comment}, ${currentUserId})">
            <i class="bi bi-hand-thumbs-up${comment.userLiked ? '-fill' : ''}"></i>
            <span id="like-count-${comment.id_comment}">${comment.likes_count || 0}</span>
          </button>
          <button class="btn btn-sm btn-reply" onclick="replyToComment(${comment.id_comment}, '${comment.nickname || 'Usuario'}')">
            <i class="bi bi-reply"></i> Reply
          </button>
          ${comment.id_user == currentUserId ? `
            <button class="btn btn-sm btn-outline-secondary" onclick="editComment(${comment.id_comment}, this)" title="Editar">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteComment(${comment.id_comment}, this)" title="Eliminar">
              <i class="bi bi-trash"></i>
            </button>
          ` : ''}
        </div>
      </div>
    </div>
  `;

  return div;
}

// --- GLOBAL HANDLERS FOR INLINE ONCLICK ---
window.handleLike = async function(id_comment, id_user) {
  try {
    const result = await toggleLike(id_comment, id_user);
    const btn = document.querySelector(`[data-comment-id="${id_comment}"]`);
    const icon = btn?.querySelector('i');
    const countSpan = document.getElementById(`like-count-${id_comment}`);
    if (result.liked) {
      btn?.classList.add('liked');
      if (icon) icon.className = 'bi bi-hand-thumbs-up-fill';
      if (countSpan) countSpan.textContent = parseInt(countSpan.textContent) + 1;
    } else {
      btn?.classList.remove('liked');
      if (icon) icon.className = 'bi bi-hand-thumbs-up';
      if (countSpan) countSpan.textContent = Math.max(0, parseInt(countSpan.textContent) - 1);
    }
  } catch (error) {
    console.error('Error toggling like:', error);
  }
};

window.replyToComment = function(id_comment, nickname) {
  const textarea = document.getElementById('nuevoComentario');
  if (textarea) {
    textarea.value = `@${nickname} `;
    textarea.focus();
  }
};

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
  
  try {
    const result = await createComment({
      id_user: currentUserId,
      id_video: currentVideoId,
      comments: text
    });
    
    // Limpiar textarea
    textarea.value = '';
    
    // Recargar comentarios
    await loadComments();
    
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
  button.innerHTML = '<i class="bi bi-check-lg"></i>';
  button.className = 'btn btn-sm btn-success';
  button.title = 'Guardar cambios';
  
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
    button.innerHTML = '<i class="bi bi-pencil"></i>';
    button.className = 'btn btn-sm btn-outline-secondary';
    button.title = 'Editar comentario';
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
    button.innerHTML = '<i class="bi bi-pencil"></i>';
    button.className = 'btn btn-sm btn-outline-secondary';
    button.title = 'Editar comentario';
    button.onclick = () => editComment(commentId, button);
  }
};

// Eliminar comentario (función global)
window.deleteComment = async function(commentId, button) {
  if (!confirm('¿Seguro que quieres eliminar este comentario?')) {
    return;
  }
  
  try {
    await deleteComment(commentId, currentUserId);
    
    // Remover del DOM
    const commentDiv = button.closest('.comentario');
    commentDiv.remove();
    
  } catch (error) {
    console.error('❌ Error eliminando comentario:', error);
    showError('Error al eliminar comentario');
  }
};



// Función simple para mostrar errores
function showError(message) {
  // Solo mostrar error si realmente no hay comentarios cargados
  if (comments.length > 0) {
    console.log('⚠️ No se muestra error porque ya hay comentarios cargados');
    return;
  }
  
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

// Función global para reintentar carga manualmente
window.retryLoadComments = function() {
  console.log('🔄 Reintentando carga manual de comentarios...');
  retryCount = 0;
  isInitialized = false;
  initComments();
};


