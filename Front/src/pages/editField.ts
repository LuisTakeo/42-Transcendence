import { usersService } from '../services/users.service.ts';

export function initializeEditField() {
  console.log('🔧 Initializing edit field...');

  // Inicializa botões de edição de campos
  const buttons = document.querySelectorAll<HTMLButtonElement>('.edit-btn');
  console.log('📋 Found edit buttons:', buttons.length);

  buttons.forEach((btn, index) => {
    console.log(`🔘 Setting up button ${index}:`, btn);
    console.log('🔘 Button data-id:', btn.dataset.id);

    btn.addEventListener('click', async (e) => {
      console.log('🖱️ Button clicked!', e);

      const inputId = btn.dataset.id;
      console.log('📝 Input ID:', inputId);

      if (!inputId) {
        console.log('❌ No input ID found');
        return;
      }

      const input = document.getElementById(inputId) as HTMLInputElement;
      console.log('📝 Input element:', input);

      if (!input) {
        console.log('❌ Input element not found');
        return;
      }

      const isDisabled = input.disabled;
      console.log('🔒 Input disabled:', isDisabled);

      if (isDisabled) {
        console.log('✏️ Entering edit mode...');
        // Entering edit mode
        input.disabled = false;
        input.focus();
        input.select(); // Select all text for easy editing

        // Change button to "Save"
        btn.innerHTML = 'Save';
        btn.classList.add('bg-green-600', 'hover:bg-green-700');
        btn.classList.remove('bg-[#4A4580]', 'hover:bg-[#5C5599]');
        console.log('✅ Edit mode activated');
      } else {
        // Saving the new value
        const newValue = input.value.trim();
        const originalValue = input.dataset.originalValue || '';

        if (newValue === originalValue) {
          // No changes, just exit edit mode
          exitEditMode(btn, input);
          return;
        }

        if (!newValue) {
          // Empty value, restore original
          input.value = originalValue;
          exitEditMode(btn, input);
          return;
        }

        // Show loading state
        btn.innerHTML = 'Saving...';
        btn.disabled = true;

        try {
          // For now, we'll use user ID 1 as the current user
          // In a real app, you'd get this from authentication context
          const currentUserId = 1;

          const updateData: any = {};

          // Map input IDs to user fields
          if (inputId === 'nameInput') {
            updateData.name = newValue;
          } else if (inputId === 'usernameInput') {
            updateData.username = newValue;
          }

          const response = await usersService.updateUser(currentUserId, updateData);

          if (response.success) {
            // Update the original value
            input.dataset.originalValue = newValue;

            // Show success feedback
            showFieldSuccessMessage(inputId);

            // Exit edit mode
            exitEditMode(btn, input);
          } else {
            throw new Error('Failed to update user');
          }
        } catch (error) {
          console.error('Error updating user:', error);

          // Restore original value
          input.value = originalValue;

          // Show error feedback
          showFieldErrorMessage(inputId);

          // Exit edit mode
          exitEditMode(btn, input);
        }
      }
    });
  });

  // Handle Enter key to save
  document.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      const activeElement = document.activeElement as HTMLInputElement;
      if (activeElement && (activeElement.id === 'nameInput' || activeElement.id === 'usernameInput')) {
        const btn = activeElement.nextElementSibling as HTMLButtonElement;
        if (btn && btn.classList.contains('edit-btn')) {
          btn.click();
        }
      }
    }
  });

  // Handle Escape key to cancel
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeElement = document.activeElement as HTMLInputElement;
      if (activeElement && (activeElement.id === 'nameInput' || activeElement.id === 'usernameInput')) {
        const btn = activeElement.nextElementSibling as HTMLButtonElement;
        if (btn && btn.classList.contains('edit-btn')) {
          // Restore original value and exit edit mode
          const originalValue = activeElement.dataset.originalValue || '';
          activeElement.value = originalValue;
          exitEditMode(btn, activeElement);
        }
      }
    }
  });

  // Inicializa upload de foto de perfil
  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  const changePicBtn = document.getElementById('change-pic-btn') as HTMLButtonElement;
  const profilePic = document.getElementById('profile-pic') as HTMLImageElement;

  if (!fileInput || !changePicBtn || !profilePic) {
    console.warn('Elementos de edição de perfil não encontrados');
    return;
  }

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
}

function exitEditMode(btn: HTMLButtonElement, input: HTMLInputElement) {
  input.disabled = true;

  // Reset button to pencil icon
  btn.innerHTML = '<img src="../../assets/lapis.png" alt="Editar" class="w-6 h-6" />';
  btn.disabled = false;
  btn.classList.remove('bg-green-600', 'hover:bg-green-700');
  btn.classList.add('bg-[#4A4580]', 'hover:bg-[#5C5599]');
}

function showFieldSuccessMessage(fieldId: string) {
  // Create a temporary success indicator
  const input = document.getElementById(fieldId) as HTMLInputElement;
  if (!input) return;

  const originalBorder = input.style.border;
  input.style.border = '2px solid #10B981'; // Green border

  setTimeout(() => {
    input.style.border = originalBorder;
  }, 2000);
}

function showFieldErrorMessage(fieldId: string) {
  // Create a temporary error indicator
  const input = document.getElementById(fieldId) as HTMLInputElement;
  if (!input) return;

  const originalBorder = input.style.border;
  input.style.border = '2px solid #EF4444'; // Red border

  setTimeout(() => {
    input.style.border = originalBorder;
  }, 2000);
}
