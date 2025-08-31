import{g as N,p as I,u as L,d as $}from"./main-Dn_sQZ6A.js";const f="https://cb-back-prueba.vercel.app/comment";async function k(e){const t=`${f}?id_video=${e}`;return await N(t)}async function S({id_user:e,id_video:t,comments:o}){console.log("🔍 createComment llamado con:",{id_user:e,id_video:t,comments:o});const n={id_user:e,id_video:t,comments:o};console.log("📤 Enviando POST a:",f),console.log("📤 Body:",n);const r=await I(f,n);return console.log("📥 Respuesta del POST:",r),r}async function M(e,{id_user:t,comments:o}){const n=`${f}/${e}`;return await L(n,{id_user:t,comments:o})}async function _(e){const t=`${f}/${e}`;return await $(t)}let i=null,g=null,s=[],u=!1,p=null,l=!1,m=0;const y=2,h=2e3;function b(){if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",()=>E());return}if(!document.getElementById("listaComentarios")){console.log("🔄 Elementos del DOM no listos, reintentando en 100ms..."),setTimeout(b,100);return}E()}function E(){if(g=D(),i=B(),!g){console.error("❌ Usuario no logueado");return}if(!i){console.error("❌ No hay video seleccionado");return}if(p!==i&&(console.log(`🔄 Video cambiado de ${p} a ${i}, reinicializando...`),u=!1,p=i,m=0),u){console.log("⚠️ Sistema de comentarios ya inicializado para este video, saltando...");return}console.log("🎯 Inicializando sistema de comentarios para video:",i),x(),A(),u=!0}function D(){try{return JSON.parse(localStorage.getItem("user"))?.id_user}catch{return null}}function B(){try{return JSON.parse(localStorage.getItem("currentVideo"))?.id_video}catch{return null}}async function x(){if(l){console.log("⚠️ Ya se están cargando comentarios, saltando...");return}l=!0,m===0&&R();const e=setTimeout(()=>{l&&(console.error("⏰ Timeout de carga de comentarios"),l=!1,s.length===0&&d("Timeout al cargar comentarios"))},15e3);try{await w(),m=0,clearTimeout(e),console.log("✅ Comentarios cargados exitosamente")}catch(t){console.error("❌ Error cargando comentarios:",t),clearTimeout(e),m<y&&H(t)?(m++,console.log(`🔄 Reintentando carga de comentarios (${m}/${y}) en ${h}ms...`),setTimeout(()=>{l=!1,x()},h)):(console.error("❌ Error no recuperable o máximo de reintentos alcanzado"),s.length===0&&d("Error al cargar comentarios"),l=!1,s.length===0&&U())}}async function w(){try{console.log("📡 Cargando comentarios para video:",i);const e=await k(i);if(!e||!Array.isArray(e))throw new Error("Respuesta inválida del servidor");s=e.filter(t=>{const o=parseInt(t.id_video),n=parseInt(i);return o===n}),console.log(`✅ ${s.length} comentarios cargados exitosamente`),T()}catch(e){throw console.error("❌ Error cargando comentarios:",e),e}finally{l=!1}}function T(){const e=document.getElementById("listaComentarios");if(!e){console.warn("⚠️ Elemento listaComentarios no encontrado, reintentando en 100ms..."),setTimeout(T,100);return}if(e.innerHTML="",s.length===0){e.innerHTML=`
      <div class="text-center text-muted py-4">
        <i class="bi bi-chat-dots display-4"></i>
        <p class="mt-2">No hay comentarios para este video</p>
      </div>
    `;return}const t=s.slice(0,3),o=s.length>3;if(t.forEach(n=>{const r=V(n);e.appendChild(r)}),o){const n=createShowMoreButton();e.appendChild(n)}}function R(){const e=document.getElementById("listaComentarios");e&&(e.innerHTML=`
      <div class="text-center text-muted py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando comentarios...</span>
        </div>
        <p class="mt-2">Cargando comentarios...</p>
      </div>
    `)}function H(e){return e.name==="TypeError"||e.message.includes("fetch")||e.message.includes("network")||e.message.includes("timeout")}function U(){const e=document.getElementById("listaComentarios");e&&(e.innerHTML=`
      <div class="text-center text-muted py-4">
        <i class="bi bi-exclamation-triangle text-warning display-4"></i>
        <p class="mt-2">No se pudieron cargar los comentarios</p>
        <button class="btn btn-outline-primary btn-sm mt-2" onclick="retryLoadComments()">
          <i class="bi bi-arrow-clockwise me-1"></i>Reintentar
        </button>
      </div>
    `)}function V(e){const t=document.createElement("div");return t.className="comentario border-bottom pb-3 mb-3",t.innerHTML=`
    <div class="d-flex align-items-start gap-3">
      <div class="flex-shrink-0">
        <div class="avatar bg-primary rounded-circle d-flex align-items-center justify-content-center text-white" style="width: 40px; height: 40px;">
          ${e.nickname?e.nickname.charAt(0).toUpperCase():"U"}
        </div>
      </div>
      <div class="flex-grow-1">
        <div class="d-flex align-items-center gap-2 mb-1">
          <strong class="nombre">${e.nickname||"Usuario"}</strong>
          <small class="text-muted">${z(e.timestamp||e.comment_date||e.created_at)}</small>
        </div>
        <p class="texto mb-2">${e.comments}</p>
        ${e.id_user==g?`
          <div class="comment-actions">
            <button class="btn btn-edit" onclick="editComment(${e.id_comment}, this)" title="Editar comentario">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-delete" onclick="deleteComment(${e.id_comment}, this)" title="Eliminar comentario">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        `:""}
      </div>
    </div>
  `,t}function z(e){if(!e)return"Fecha no disponible";try{const t=new Date(e);return isNaN(t.getTime())?"Fecha inválida":t.toLocaleDateString("es-ES",{year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}catch{return"Error en fecha"}}function A(){const e=document.getElementById("btnPublicar"),t=document.getElementById("nuevoComentario");e&&(e.removeEventListener("click",v),e.addEventListener("click",v)),t&&(t.removeEventListener("keypress",C),t.addEventListener("keypress",C))}function C(e){e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),v())}async function v(){const e=document.getElementById("nuevoComentario"),t=e.value.trim();if(!t){d("El comentario no puede estar vacío");return}try{const o=await S({id_user:g,id_video:i,comments:t});e.value="",await w()}catch(o){console.error("❌ Error creando comentario:",o),d("Error al crear comentario")}}window.editComment=function(e,t){const n=t.closest(".comentario").querySelector(".texto"),r=n.textContent,a=document.createElement("textarea");a.value=r,a.className="form-control mt-2",a.rows=2,n.parentNode.replaceChild(a,n),t.innerHTML='<i class="fas fa-save"></i>',t.className="btn btn-edit",t.title="Guardar cambios",a.focus(),a.select(),t.onclick=()=>saveCommentEdit(e,t,a,r)};window.saveCommentEdit=async function(e,t,o,n){const r=o.value.trim();if(!r){d("El comentario no puede estar vacío");return}try{await M(e,{id_user:g,comments:r});const a=t.closest(".comentario"),c=document.createElement("p");c.className="texto mb-2",c.textContent=r,o.parentNode.replaceChild(c,o),t.innerHTML='<i class="fas fa-edit"></i>',t.className="btn btn-edit",t.title="Editar comentario",t.onclick=()=>editComment(e,t)}catch(a){console.error("❌ Error editando comentario:",a),d("Error al editar comentario"),t.closest(".comentario");const c=document.createElement("p");c.className="texto mb-2",c.textContent=n,o.parentNode.replaceChild(c,o),t.innerHTML='<i class="fas fa-edit"></i>',t.className="btn btn-edit",t.title="Editar comentario",t.onclick=()=>editComment(e,t)}};window.deleteComment=async function(e,t){if(confirm("¿Seguro que quieres eliminar este comentario?"))try{await _(e),t.closest(".comentario").remove()}catch(o){console.error("❌ Error eliminando comentario:",o),d("Error al eliminar comentario")}};function d(e){if(s.length>0){console.log("⚠️ No se muestra error porque ya hay comentarios cargados");return}const t=document.createElement("div");t.className="alert alert-danger alert-dismissible fade show position-fixed",t.style.cssText="top: 20px; right: 20px; z-index: 9999; min-width: 300px;",t.innerHTML=`
    <i class="bi bi-exclamation-triangle"></i>
    ${e}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `,document.body.appendChild(t),setTimeout(()=>{t.parentNode&&t.remove()},5e3)}function P(){u=!1,p=null,s=[],console.log("🔄 Sistema de comentarios reseteado")}window.retryLoadComments=function(){console.log("🔄 Reintentando carga manual de comentarios..."),m=0,u=!1,b()};export{b as initComments,P as resetCommentsSystem};
