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

export function showSuccessMessage(message: string): void {
  injectNotificationHTML();
  const successMessage = document.getElementById('success-message');
  const successText = document.getElementById('success-text');
  const closeSuccessBtn = document.getElementById('close-success');

  if (successMessage && successText) {
    successText.textContent = message;
    if (successMessage.dataset.timeoutId) {
      clearTimeout(parseInt(successMessage.dataset.timeoutId));
    }
    successMessage.classList.remove('opacity-0', 'invisible');
    successMessage.classList.add('opacity-100', 'visible');
    if (closeSuccessBtn) {
      const closeHandler = () => {
        hideSuccessMessage();
        closeSuccessBtn.removeEventListener('click', closeHandler);
      };
      closeSuccessBtn.addEventListener('click', closeHandler);
    }
    const timeoutId = setTimeout(() => {
      hideSuccessMessage();
    }, 5000);
    successMessage.dataset.timeoutId = timeoutId.toString();
  }
}

export function hideSuccessMessage(): void {
  const successMessage = document.getElementById('success-message');
  if (successMessage) {
    successMessage.classList.remove('opacity-100', 'visible');
    successMessage.classList.add('opacity-0', 'invisible');
    delete successMessage.dataset.timeoutId;
  }
}

export function showErrorMessage(message: string): void {
  injectNotificationHTML();
  const errorMessage = document.getElementById('error-message');
  const errorText = document.getElementById('error-text');
  const closeErrorBtn = document.getElementById('close-error');

  if (errorMessage && errorText) {
    errorText.textContent = message;
    if (errorMessage.dataset.timeoutId) {
      clearTimeout(parseInt(errorMessage.dataset.timeoutId));
    }
    errorMessage.classList.remove('opacity-0', 'invisible');
    errorMessage.classList.add('opacity-100', 'visible');
    if (closeErrorBtn) {
      const closeHandler = () => {
        hideErrorMessage();
        closeErrorBtn.removeEventListener('click', closeHandler);
      };
      closeErrorBtn.addEventListener('click', closeHandler);
    }
    const timeoutId = setTimeout(() => {
      hideErrorMessage();
    }, 5000);
    errorMessage.dataset.timeoutId = timeoutId.toString();
  }
}

export function hideErrorMessage(): void {
  const errorMessage = document.getElementById('error-message');
  if (errorMessage) {
    errorMessage.classList.remove('opacity-100', 'visible');
    errorMessage.classList.add('opacity-0', 'invisible');
    delete errorMessage.dataset.timeoutId;
  }
}
