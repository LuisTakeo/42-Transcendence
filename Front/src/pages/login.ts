import { authService } from '../services/auth.service.ts';
import { userService } from '../services/user.service.ts';
import { show2FAModal } from './twofa-modal.ts';
import { showErrorMessage, showSuccessMessage } from './notification.ts';

// Declare Google types
declare global {
  interface Window {
    google: any;
  }
}

export default function LoginPage(): string {
	return `
	<div class="flex flex-col md:flex-row items-center h-screen bg-[#1E1B4B]
					justify-center md:justify-between overflow-hidden">

		<!-- Lado esquerdo -->
		<div class="w-full md:w-1/2 p-8 flex flex-col justify-center items-center">
			<div class="text-center mb-6">
			<h1 class="text-3xl text-white font-bold font-spartan mb-4">
				Can you hang the pong?
			</h1>
			<p class="text-xl text-white font-spartan mb-8">
				Let's have some fun
			</p>
			</div>

			<button
			id="google-login-btn"
			class="w-[300px] flex items-center justify-center gap-2 px-6 py-3
					bg-[#383568] text-xl text-white border-2 border-transparent
					rounded-[5px] shadow-md transition duration-200 ease-in-out
					hover:scale-105 hover:border-white mb-4">
			Sign&nbsp;In&nbsp;with&nbsp;Google
			<img src="../../assets/google-logo.png" alt="Google icon" class="w-5 h-5" />
			</button>
		</div>

		<!-- Lado direito – imagem -->
		<div class="hidden md:flex flex-1 h-full">
			<img src="../../assets/player-female.png"
				alt="Jogadora de Pong"
				class="w-full h-full object-cover" />
		</div>
	</div>
	`;
}

// Initialize Google Sign-In and event handlers after the page loads
export async function initializeLoginPage(): Promise<void> {
  // Check if user is already authenticated by actually fetching user data
  try {
    const currentUser = await userService.getCurrentUser();
    if (currentUser) {
      // User is truly authenticated, redirect to home
      window.history.pushState({}, '', '/home');
      window.dispatchEvent(new Event('popstate'));
      return;
    }
  } catch (error) {
    // User is not authenticated, continue with login page
    console.log('User not authenticated, showing login page');
  }

  // Handle Google Sign-In response
  async function handleGoogleSignIn(response: any): Promise<void> {
    try {
      const idToken = response.credential;

      if (!idToken) {
        throw new Error('No credential received from Google');
      }

      // Call backend login endpoint
      const loginResponse = await authService.loginWithGoogle(idToken);

      if (loginResponse.needTwoFactorCode) {
        // User already has 2FA set up, show code input modal
        show2FAModal(null, idToken, true); // true indicates this is for code input, not setup
      } else if (loginResponse.token) {
        // Direct login successful (user doesn't have 2FA enabled)
        authService.setAuthToken(loginResponse.token);
        showSuccessMessage('Login successful! Redirecting...');

        setTimeout(() => {
          window.history.pushState({}, '', '/home');
          window.dispatchEvent(new Event('popstate'));
        }, 1000);
      } else {
        // Unexpected response
        showErrorMessage('Login failed. Please try again.');
      }

    } catch (error) {
      console.error('Google Sign-In error:', error);
      showErrorMessage('Login failed. Please try again.');
    }
  }

  // Initialize Google Sign-In
  const initializeGoogle = () => {
    if (window.google && window.google.accounts && window.google.accounts.id) {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '37535858373-lu8vc124lg3mfcs0j2e36ubg7l4as8ff.apps.googleusercontent.com';

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleSignIn,
        auto_select: false,
        cancel_on_tap_outside: true
      });
    }
  };

  // Set up event listeners (only once)
  const setupEventListeners = () => {
    const googleBtn = document.getElementById('google-login-btn');
    const intraBtn = document.getElementById('intra-login-btn');

    if (googleBtn && !googleBtn.dataset.listenerAdded) {
      googleBtn.dataset.listenerAdded = 'true';
      googleBtn.addEventListener('click', (e) => {
        e.preventDefault();

        if (window.google && window.google.accounts && window.google.accounts.id) {
          // Use the legacy popup approach which bypasses FedCM
          try {
            // Create a hidden div for the Google button
            const hiddenDiv = document.createElement('div');
            hiddenDiv.style.position = 'absolute';
            hiddenDiv.style.left = '-9999px';
            hiddenDiv.style.opacity = '0';
            document.body.appendChild(hiddenDiv);

            // Render the Google button in the hidden div
            window.google.accounts.id.renderButton(hiddenDiv, {
              theme: 'outline',
              size: 'large',
              type: 'standard'
            });

            // Find the Google button that was just created and click it
            setTimeout(() => {
              const googleButton = hiddenDiv.querySelector('div[role="button"]') as HTMLElement;
              if (googleButton) {
                googleButton.click();
              }
              // Clean up the hidden div after a delay
              setTimeout(() => {
                if (document.body.contains(hiddenDiv)) {
                  document.body.removeChild(hiddenDiv);
                }
              }, 1000);
            }, 100);

          } catch (error) {
            console.error('Error with Google Sign-In:', error);
            showErrorMessage('Error with Google Sign-In: ' + error);
          }
        } else {
          showErrorMessage('Google Sign-In is not loaded. Please refresh the page.');
        }
      });
    }

    if (intraBtn && !intraBtn.dataset.listenerAdded) {
      intraBtn.dataset.listenerAdded = 'true';
      intraBtn.addEventListener('click', () => {
        showErrorMessage('42 Intra login is not implemented yet.');
      });
    }
  };

  // Wait for Google API and DOM to be ready
  const init = () => {
    if (window.google && document.getElementById('google-login-btn')) {
      initializeGoogle();
      setupEventListeners();
    } else {
      setTimeout(init, 100);
    }
  };

  init();
}
