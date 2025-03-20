// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    console.log('Attempting to register service worker at: /service-worker.js');
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(err => {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
}

// Add to home screen functionality
let deferredPrompt;
const installButton = document.getElementById('install-app-btn');

// Function to show the install button in the header
const showInstallButton = () => {
  // Disabled to prevent showing install button on Windows
  return;
  
  // Original code below
  /*
  if (installButton) {
    installButton.style.display = 'inline-block';
    
    installButton.addEventListener('click', () => {
      if (deferredPrompt) {
        // Show the install prompt
        deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the installation prompt');
            installButton.style.display = 'none';
          } else {
            console.log('User dismissed the installation prompt');
          }
          deferredPrompt = null;
        });
      } else {
        createManualInstallButton();
        document.getElementById('manual-install-btn').click();
      }
    });
  }
  */
};

// Create install popup HTML
const createInstallPopup = () => {
  const popup = document.createElement('div');
  popup.className = 'pwa-install-popup';
  popup.innerHTML = `
    <div class="popup-content">
      <div class="popup-header">
        <img src="/static/images/icon-192x192.png" alt="App Icon" class="popup-icon">
        <button class="popup-close">&times;</button>
      </div>
      <div class="popup-body">
        <h3>Install Garuda</h3>
        <p>Install this app on your device for quick and easy access!</p>
      </div>
      <div class="popup-footer">
        <button class="popup-install-btn">Install</button>
        <button class="popup-later-btn">Maybe Later</button>
      </div>
    </div>
  `;
  document.body.appendChild(popup);
  
  // Add event listeners
  popup.querySelector('.popup-close').addEventListener('click', () => {
    popup.remove();
  });
  
  popup.querySelector('.popup-later-btn').addEventListener('click', () => {
    popup.remove();
  });
  
  popup.querySelector('.popup-install-btn').addEventListener('click', () => {
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the A2HS prompt');
      } else {
        console.log('User dismissed the A2HS prompt');
      }
      deferredPrompt = null;
      popup.remove();
    });
  });
  
  return popup;
};

// Create a manual trigger button
const createManualInstallButton = () => {
  // Disabled to prevent showing install button on Windows
  return null;
  
  // Original code below
  /*
  const button = document.createElement('button');
  button.id = 'manual-install-btn';
  button.innerHTML = '<i class="fas fa-download"></i> Install App';
  button.className = 'manual-install-btn';
  button.style.position = 'fixed';
  button.style.bottom = '20px';
  button.style.right = '20px';
  button.style.padding = '10px 15px';
  button.style.borderRadius = '50px';
  button.style.backgroundColor = '#7d4997';
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.boxShadow = '0 4px 10px rgba(0,0,0,0.2)';
  button.style.zIndex = '9999';
  button.style.cursor = 'pointer';
  
  document.body.appendChild(button);
  
  button.addEventListener('click', () => {
    if (deferredPrompt) {
      createInstallPopup();
    } else {
      // Help user understand why it's not installing
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const isHttps = window.location.protocol === 'https:';
      const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
      const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
      
      let message = 'This app cannot be installed right now. ';
      
      if (!isHttps) {
        message += 'PWAs require HTTPS. ';
      }
      
      if (isMobile) {
        if (isChrome) {
          message += 'Try using "Add to Home Screen" from the Chrome menu (three dots).';
        } else if (isSafari && /iPhone|iPad|iPod/.test(navigator.userAgent)) {
          message += 'Try using "Add to Home Screen" from the Safari share menu.';
        } else {
          message += 'Try using "Add to Home Screen" from your browser menu.';
        }
      } else {
        message += 'On desktop, use Chrome and look for the install icon in the address bar.';
      }
      
      // Show alert message
      alert(message);
    }
  });
  
  return button;
  */
};

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  
  // Debug: Log that we received the beforeinstallprompt event
  console.log('beforeinstallprompt event fired!', e);
  
  // Save the event for later use
  deferredPrompt = e;
  
  // Disable the install button functionality
  // showInstallButton();
});

// Add manual install button after page load
window.addEventListener('load', () => {
  /* 
  setTimeout(() => {
    // Only create manual button if browser could potentially install the PWA
    if ('serviceWorker' in navigator) {
      createManualInstallButton();
    }
  }, 3000);
  */
});

// Add event listeners for PWA installation events
window.addEventListener('appinstalled', (evt) => {
  console.log('App was installed!', evt);
  if (installButton) {
    installButton.style.display = 'none';
  }
  
  // Show success message
  const notification = document.createElement('div');
  notification.style.position = 'fixed';
  notification.style.top = '10px';
  notification.style.left = '50%';
  notification.style.transform = 'translateX(-50%)';
  notification.style.backgroundColor = '#28a745';
  notification.style.color = 'white';
  notification.style.padding = '10px 20px';
  notification.style.borderRadius = '5px';
  notification.style.zIndex = '10000';
  notification.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
  notification.textContent = '✅ App installed successfully!';
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 5000);
});

// Add iOS specific events
if (navigator.standalone) {
  console.log('Launched: Installed (iOS)');
  // App is launched in standalone mode (installed on iOS)
} else if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('Launched: Installed (display-mode)');
  // App is launched in standalone mode (installed on Android)
}

// Listen for display mode changes
window.matchMedia('(display-mode: standalone)').addEventListener('change', (evt) => {
  if (evt.matches) {
    console.log('App became standalone');
  } else {
    console.log('App became browser tab');
  }
}); 