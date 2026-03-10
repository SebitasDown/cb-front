// Lógica para abrir/cerrar el modal y manejar el formulario de subida de video

document.addEventListener('DOMContentLoaded', function () {
  const openModalBtn = document.getElementById('buttonupload');
  const uploadModal = document.getElementById('uploadModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const uploadVideoForm = document.getElementById('uploadVideoForm');
  const categorySelect = document.getElementById('category');
  const userSelect = document.getElementById('user');

  // Cargar categorías y speakers al abrir el modal
  openModalBtn.addEventListener('click', function () {
    uploadModal.style.display = 'block';
    loadCategories();
    loadSpeakers();
  });

  // Cerrar el modal
  closeModalBtn.addEventListener('click', function () {
    uploadModal.style.display = 'none';
    uploadVideoForm.reset();
  });

  // Cerrar el modal si se hace click fuera del contenido
  window.addEventListener('click', function (event) {
    if (event.target === uploadModal) {
      uploadModal.style.display = 'none';
      uploadVideoForm.reset();
    }
  });

  // Función para cargar categorías desde la API
  async function loadCategories() {
    try {
      const response = await fetch('https://cb-back-prueba.vercel.app/categories');
      if (!response.ok) {
        throw new Error('Error loading categories');
      }

      const categories = await response.json();

      // Limpiar opciones existentes
      categorySelect.innerHTML = '<option value=""></option>';

      // Agregar opciones dinámicamente
      categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id_category;
        option.textContent = category.category_name;
        categorySelect.appendChild(option);
      });

    } catch (error) {
      console.error('Error loading categories:', error);
      categorySelect.innerHTML = '<option value="">Error loading categories</option>';
    }
  }

  // Función para cargar speakers desde la API
  async function loadSpeakers() {
    try {
      const response = await fetch('https://cb-back-prueba.vercel.app/speakers');
      if (!response.ok) {
        throw new Error('Error loading speakers');
      }

      const speakers = await response.json();

      // Limpiar opciones existentes
      userSelect.innerHTML = '<option value=""></option>';

      // Agregar opciones dinámicamente
      speakers.forEach(speaker => {
        const option = document.createElement('option');
        option.value = speaker.id_user;
        option.textContent = speaker.full_name;
        userSelect.appendChild(option);
      });

    } catch (error) {
      console.error('Error loading speakers:', error);
      userSelect.innerHTML = '<option value="">Error loading speakers</option>';
    }
  }


  // Manejar el envío del formulario
  uploadVideoForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    const formData = new FormData();

    // Archivo bajo el campo 'file' (como espera el backend)
    const fileInput = document.getElementById('videoFile');
    formData.append('file', fileInput.files[0]);

    // Título
    formData.append('title', document.getElementById('title').value);

    // IDs de usuario y categoría (números reales de la BD)
    const userId = document.getElementById('user').value;
    const categoryId = document.getElementById('category').value;

    if (!userId || !categoryId) {
      alert('Please select both a category and a speaker');
      return;
    }

    formData.append('id_user', userId);
    formData.append('id_category', categoryId);

    try {
      console.log('Enviando video...');
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      // Mostrar indicador de carga
      const submitButton = document.querySelector('#uploadVideoForm button[type="submit"]');
      const originalText = submitButton.textContent;
      submitButton.textContent = '⏳ Uploading...';
      submitButton.disabled = true;

      // Crear AbortController para timeout personalizado
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutos

      const response = await fetch('https://cb-back-prueba.vercel.app/videos/create', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        alert('Error al subir el video: ' + errorText);
        return;
      }

      // Intentar parsear la respuesta como JSON
      let result;
      try {
        result = await response.json();
        console.log('Success response:', result);
      } catch (jsonError) {
        console.warn('Response is not JSON, but upload was successful');
        result = { message: 'Upload successful' };
      }

      alert('¡Video subido exitosamente! 🎉');
      uploadModal.style.display = 'none';
      uploadVideoForm.reset();

      // Restaurar botón
      submitButton.textContent = originalText;
      submitButton.disabled = false;

      // Recargar las opciones para futuras subidas
      loadCategories();
      loadSpeakers();

    } catch (err) {
      console.error('Network or other error:', err);

      // Restaurar botón en caso de error
      const submitButton = document.querySelector('#uploadVideoForm button[type="submit"]');
      submitButton.textContent = 'Submit';
      submitButton.disabled = false;

      if (err.name === 'AbortError') {
        alert('⏰ La subida está tomando más tiempo del esperado. El video puede seguir procesándose. Por favor verifica la base de datos en unos minutos.');
      } else if (err.message.includes('fetch')) {
        alert('🔄 Error de conexión durante la subida. El video puede haberse subido correctamente. Verifica la base de datos antes de intentar de nuevo.');
      } else {
        alert('❌ Error inesperado: ' + err.message);
      }
    }
  });
});

