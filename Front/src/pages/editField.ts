document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll<HTMLButtonElement>('.edit-btn');

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const inputId = btn.dataset.id;
      if (!inputId) return;

      const input = document.getElementById(inputId) as HTMLInputElement;
      if (!input) return;

      const isDisabled = input.disabled;

      input.disabled = !isDisabled;

      btn.textContent = ''; // Limpa conteúdo atual do botão

      if (!isDisabled) {
        // Salvando o novo valor
        console.log(`Novo valor de ${inputId}: ${input.value}`);

        // Adiciona o ícone do lápis de volta
        const img = document.createElement('img');
        img.src = '../../assets/lapis.png';
        img.alt = 'Editar';
        img.className = 'w-6 h-6';
        btn.appendChild(img);
      } else {
        // Coloca texto "Save"
        btn.textContent = 'Save';
      }
    });

    // Inicializa o botão com o ícone do lápis
    btn.textContent = '';
    const img = document.createElement('img');
    img.src = '../../assets/lapis.png';
    img.alt = 'Editar';
    img.className = 'w-6 h-6';
    btn.appendChild(img);
  });
});


document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  const changePicBtn = document.getElementById('change-pic-btn') as HTMLButtonElement;
  const profilePic = document.getElementById('profile-pic') as HTMLImageElement;

  changePicBtn.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        profilePic.src = reader.result;
      }
    };
    reader.readAsDataURL(file);
  });
});
