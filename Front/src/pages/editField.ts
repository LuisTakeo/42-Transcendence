import { userService } from '../services/user.service.ts';
import { isRequired, minLength, maxLength, isSafeName, isSafeUsername, sanitizeInput } from './validateInput.ts';
import { showErrorMessage } from './notification.ts';

export function initializeEditField() {
  // Inicializa botões de edição de campos
  const buttons = document.querySelectorAll<HTMLButtonElement>('.edit-btn');

  buttons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const inputId = btn.dataset.id;
      if (!inputId) return;

      const input = document.getElementById(inputId) as HTMLInputElement;
      if (!input) return;

      const isDisabled = input.disabled;

      if (isDisabled) {
        // Entering edit mode
        input.disabled = false;
        input.focus();
        input.select(); // Select all text for easy editing

        // Change button to "Save"
        btn.innerHTML = 'Save';
        btn.classList.add('bg-green-600', 'hover:bg-green-700');
        btn.classList.remove('bg-[#4A4580]', 'hover:bg-[#5C5599]');
      } else {
        // Saving the new value
        const newValue = input.value.trim();
        const originalValue = input.dataset.originalValue || '';

        if (newValue === originalValue) {
          // No changes, just exit edit mode
          exitEditMode(btn, input);
          return;
        }
        // Input validation
        if (!isRequired(newValue)) {
          showFieldErrorMessage(inputId);
          showErrorMessage('This field is required.');
          return;
        }
        if (inputId === 'usernameInput') {
          if (!minLength(newValue, 3)) {
            showFieldErrorMessage(inputId);
            showErrorMessage('Username must be at least 3 characters.');
            return;
          }
          if (!maxLength(newValue, 16)) {
            showFieldErrorMessage(inputId);
            showErrorMessage('Username must be at most 16 characters.');
            return;
          }
          if (!isSafeUsername(newValue)) {
            showFieldErrorMessage(inputId);
            showErrorMessage('Username can only contain letters, numbers, dots and underscores.');
            return;
          }
        }
        if (inputId === 'nameInput') {
          if (!minLength(newValue, 2)) {
            showFieldErrorMessage(inputId);
            showErrorMessage('Name must be at least 2 characters.');
            return;
          }
          if (!maxLength(newValue, 32)) {
            showFieldErrorMessage(inputId);
            showErrorMessage('Name must be at most 32 characters.');
            return;
          }
          if (!isSafeName(newValue)) {
            showFieldErrorMessage(inputId);
            showErrorMessage('Name can only contain letters, spaces, accents, hyphens, and apostrophes.');
            return;
          }
        }

        if (!newValue) {
          // Empty value, restore original
          input.value = originalValue;
          exitEditMode(btn, input);
          return;
        }

        // Sanitize input before sending to backend
        const safeValue = sanitizeInput(newValue);

        // Show loading state
        btn.innerHTML = 'Saving...';
        btn.disabled = true;
        try {
          // Get the field to update
          const updateData: any = {};

          // Map input IDs to user fields
          if (inputId === 'nameInput' || inputId === 'usernameInput') {
            updateData[inputId === 'nameInput' ? 'name' : 'username'] = safeValue;
          }
          const updatedUser = await userService.updateProfile(updateData);
          if (updatedUser) {
            // Update the original value
            input.dataset.originalValue = safeValue;
            input.value = safeValue;

            // Show success feedback
            showFieldSuccessMessage(inputId);

            // Exit edit mode
            exitEditMode(btn, input);
          } else {
            throw new Error('Failed to update user');
          }
        } catch (error) {
          // Restore original value
          input.value = originalValue;

          // Show error feedback
          showFieldErrorMessage(inputId);
          showErrorMessage('Failed to update user. Please try again.');

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

  // (Legacy profile image upload removed. Avatar upload is now handled in settings.ts)
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
