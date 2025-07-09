// Notification utility for success and error messages

export function injectNotificationHTML() {
  if (!document.getElementById('success-message')) {
    const successDiv = document.createElement('div');
    successDiv.innerHTML = `
      <div id="success-message" class="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg opacity-0 invisible transition-all duration-300 z-50 flex items-center gap-3">
        <span id="success-text">Success!</span>
        <button id="close-success" class="text-white hover:text-gray-200 text-xl font-bold leading-none">&times;</button>
      </div>
    `;
    document.body.appendChild(successDiv.firstElementChild!);
  }
  if (!document.getElementById('error-message')) {
    const errorDiv = document.createElement('div');
    errorDiv.innerHTML = `
      <div id="error-message" class="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg opacity-0 invisible transition-all duration-300 z-50 flex items-center gap-3">
        <span id="error-text">Something went wrong!</span>
        <button id="close-error" class="text-white hover:text-gray-200 text-xl font-bold leading-none">&times;</button>
      </div>
    `;
    document.body.appendChild(errorDiv.firstElementChild!);
  }
}

// Helper function to hide all notifications
function hideAllNotifications(): void {
  hideSuccessMessage();
  hideErrorMessage();
}

export function showSuccessMessage(message: string): void {
  injectNotificationHTML();

  // Hide any existing notifications first
  hideAllNotifications();

  const successMessage = document.getElementById('success-message');
  const successText = document.getElementById('success-text');
  const closeSuccessBtn = document.getElementById('close-success');

  if (successMessage && successText) {
    successText.textContent = message;

    // Clear any existing timeout
    if (successMessage.dataset.timeoutId) {
      clearTimeout(parseInt(successMessage.dataset.timeoutId));
    }

    // Remove any existing event listeners
    const newCloseBtn = closeSuccessBtn?.cloneNode(true) as HTMLButtonElement;
    if (closeSuccessBtn && newCloseBtn) {
      closeSuccessBtn.parentNode?.replaceChild(newCloseBtn, closeSuccessBtn);
    }

    // Show the notification
    successMessage.classList.remove('opacity-0', 'invisible');
    successMessage.classList.add('opacity-100', 'visible');

    // Add new close handler
    if (newCloseBtn) {
      newCloseBtn.addEventListener('click', hideSuccessMessage);
    }

    // Set timeout to auto-hide (reduced to 3 seconds)
    const timeoutId = setTimeout(() => {
      hideSuccessMessage();
    }, 3000);
    successMessage.dataset.timeoutId = timeoutId.toString();
  }
}

export function hideSuccessMessage(): void {
  const successMessage = document.getElementById('success-message');
  if (successMessage) {
    // Clear timeout
    if (successMessage.dataset.timeoutId) {
      clearTimeout(parseInt(successMessage.dataset.timeoutId));
      delete successMessage.dataset.timeoutId;
    }

    // Hide notification
    successMessage.classList.remove('opacity-100', 'visible');
    successMessage.classList.add('opacity-0', 'invisible');
  }
}

export function showErrorMessage(message: string): void {
  injectNotificationHTML();

  // Hide any existing notifications first
  hideAllNotifications();

  const errorMessage = document.getElementById('error-message');
  const errorText = document.getElementById('error-text');
  const closeErrorBtn = document.getElementById('close-error');

  if (errorMessage && errorText) {
    errorText.textContent = message;

    // Clear any existing timeout
    if (errorMessage.dataset.timeoutId) {
      clearTimeout(parseInt(errorMessage.dataset.timeoutId));
    }

    // Remove any existing event listeners
    const newCloseBtn = closeErrorBtn?.cloneNode(true) as HTMLButtonElement;
    if (closeErrorBtn && newCloseBtn) {
      closeErrorBtn.parentNode?.replaceChild(newCloseBtn, closeErrorBtn);
    }

    // Show the notification
    errorMessage.classList.remove('opacity-0', 'invisible');
    errorMessage.classList.add('opacity-100', 'visible');

    // Add new close handler
    if (newCloseBtn) {
      newCloseBtn.addEventListener('click', hideErrorMessage);
    }

    // Set timeout to auto-hide (reduced to 3 seconds)
    const timeoutId = setTimeout(() => {
      hideErrorMessage();
    }, 3000);
    errorMessage.dataset.timeoutId = timeoutId.toString();
  }
}

export function hideErrorMessage(): void {
  const errorMessage = document.getElementById('error-message');
  if (errorMessage) {
    // Clear timeout
    if (errorMessage.dataset.timeoutId) {
      clearTimeout(parseInt(errorMessage.dataset.timeoutId));
      delete errorMessage.dataset.timeoutId;
    }

    // Hide notification
    errorMessage.classList.remove('opacity-100', 'visible');
    errorMessage.classList.add('opacity-0', 'invisible');
  }
}
