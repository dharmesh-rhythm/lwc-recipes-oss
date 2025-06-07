/* eslint-disable @lwc/lwc/no-document-query */
/* eslint-disable @lwc/lwc/no-async-operation */
/**
 * PWA Installation Helper
 * Handles the logic for prompting users to install the app
 * This is a standalone script outside of the LWC framework
 */

let deferredPrompt;
const installButton = document.createElement('button');
installButton.classList.add('pwa-install-button');
installButton.textContent = 'Install App';
installButton.style.display = 'none';

// Add the button to the DOM when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    document.body.appendChild(installButton);
});

// Listen for the beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 76+ from automatically showing the prompt
    e.preventDefault();

    // Stash the event so it can be triggered later
    deferredPrompt = e;

    // Show the install button
    installButton.style.display = 'block';

    // Show a snackbar notification
    showInstallSnackbar();
});

// Handle the install button click
installButton.addEventListener('click', async () => {
    if (!deferredPrompt) return;

    // Show the installation prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);

    // Clear the saved prompt since it can't be used again
    deferredPrompt = null;

    // Hide the install button
    installButton.style.display = 'none';

    // Hide the snackbar if it's visible
    hideInstallSnackbar();
});

// Listen for the appinstalled event
window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');

    // Hide the install button and snackbar
    installButton.style.display = 'none';
    hideInstallSnackbar();

    // Track the installation if analytics are available
    if (window.gtag) {
        window.gtag('event', 'pwa_install', {
            event_category: 'engagement',
            event_label: 'PWA Installation'
        });
    }
});

// Create and show the install snackbar
function showInstallSnackbar() {
    // Create snackbar if it doesn't exist
    let snackbar = document.querySelector('#pwa-install-snackbar');

    if (!snackbar) {
        snackbar = document.createElement('div');
        snackbar.id = 'pwa-install-snackbar';

        // Create content using DOM methods instead of innerHTML
        const content = document.createElement('div');
        content.className = 'snackbar-content';

        const message = document.createElement('span');
        message.textContent = 'Install this app on your device for offline use';

        const installBtn = document.createElement('button');
        installBtn.id = 'snackbar-install-button';
        installBtn.textContent = 'Install';

        const closeBtn = document.createElement('button');
        closeBtn.id = 'snackbar-close-button';
        closeBtn.textContent = '✕';

        content.appendChild(message);
        content.appendChild(installBtn);
        content.appendChild(closeBtn);
        snackbar.appendChild(content);

        // Style the snackbar
        snackbar.style.position = 'fixed';
        snackbar.style.bottom = '20px';
        snackbar.style.left = '50%';
        snackbar.style.transform = 'translateX(-50%)';
        snackbar.style.backgroundColor = '#0070d2';
        snackbar.style.color = 'white';
        snackbar.style.padding = '10px 16px';
        snackbar.style.borderRadius = '4px';
        snackbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
        snackbar.style.zIndex = '1000';
        snackbar.style.display = 'none';

        // Style the content
        content.style.display = 'flex';
        content.style.alignItems = 'center';
        content.style.gap = '16px';

        // Style the buttons
        installBtn.style.backgroundColor = 'white';
        installBtn.style.color = '#0070d2';
        installBtn.style.border = 'none';
        installBtn.style.padding = '6px 12px';
        installBtn.style.borderRadius = '4px';
        installBtn.style.cursor = 'pointer';
        installBtn.style.fontWeight = 'bold';

        closeBtn.style.backgroundColor = 'transparent';
        closeBtn.style.color = 'white';
        closeBtn.style.border = 'none';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.marginLeft = 'auto';

        // Add event listeners
        installBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                await deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                console.log(`User response to the install prompt: ${outcome}`);
                deferredPrompt = null;
            }
            hideInstallSnackbar();
        });

        closeBtn.addEventListener('click', () => {
            hideInstallSnackbar();

            // Don't show again for this session
            sessionStorage.setItem('pwaInstallPromptDismissed', 'true');
        });

        document.body.appendChild(snackbar);
    }

    // Don't show if user has dismissed it in this session
    if (sessionStorage.getItem('pwaInstallPromptDismissed') === 'true') {
        return;
    }

    // Show the snackbar
    snackbar.style.display = 'block';

    // Auto-hide after 10 seconds using requestAnimationFrame for LWC compliance
    const startTime = Date.now();
    const hideAfterDelay = () => {
        if (Date.now() - startTime >= 10000) {
            hideInstallSnackbar();
        } else {
            requestAnimationFrame(hideAfterDelay);
        }
    };
    requestAnimationFrame(hideAfterDelay);
}

// Hide the install snackbar
function hideInstallSnackbar() {
    const snackbar = document.querySelector('#pwa-install-snackbar');
    if (snackbar) {
        snackbar.style.display = 'none';
    }
}
