document.body.innerHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Umi</title>
    
    <!-- Font -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap" rel="stylesheet">

    <!-- Favicon -->
    <link rel="icon" href="../images/face.png" type="image/png">

    <!-- Navigation Bar CSS -->
    <link rel="stylesheet" href="../../navBar.css">

    <!-- Global CSS Page -->
    <link rel="stylesheet" href="../../global.css">

    <!-- Settings CSS -->
    <link rel="stylesheet" href="settings.css">
</head>
<body>
    <header>
        <!-- Navigation Bar -->
        <nav>
            <ul>
                <li><a href="../../landing-page/home.html">Home</a></li>
                <li><a href="../music-page/music.html">Music</a></li>
                <li><a href="../task-page/taskPage.html">Umi</a></li>
                <li><a href="../faq-page/faq.html">FAQ</a></li>
                <li><a href="settings.html" class="active">Settings</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <div class="settings-container">
            <div class="container">
                <div>
                    <button onclick="toggleSettings('general')">General</button>
                </div>
                <div>   
                    <button onclick="toggleSettings('notifications')">Notifications</button>
                </div>
                <div>
                    <button onclick="toggleSettings('appearance')">Appearance</button>
                </div>
                <div>
                    <button onclick="toggleSettings('accounts')">Accounts</button>
                </div>
                <div>
                    <a href="/src/main-pages/faq-page/faq.html">
                        <button>FAQ</button>
                    </a>
                </div>
                <div>
                    <!-- Need to Implement. -->
                     <a href="/src/redirect/redirect.html">
                         <button>Delete All Data</button>
                     </a>
                </div>
            </div>

            <div id="general" style="display: block;">
                <div><p>Change Name</p></div>
                <div><p>Retake Quiz</p></div>
                <div><p>Retake Spotify Quiz</p></div>
            </div>

            <div id="notifications" style="display: none;">
                <div><p>Enable Notifications</p></div>
                <div><p>Mute Sounds</p></div>
            </div>

            <div id="appearance" style="display: none;">
                <div><p>Theme</p></div>
                <div><p>Accent Colour</p></div>
                <div><p>Toggle Mascot</p></div>
            </div>

            <div id="accounts" style="display: none;">
                <div><p>Account 1</p></div>
                <div><p>Account 2</p></div>
                <div><p>Account 3</p></div>
            </div>
        </div>
    </main>
    <script src="settings.js"></script>
</body>
</html>`;
require('@testing-library/jest-dom');

describe('Settings Page', () => {
    test('should have the correct title', () => {
      const title = document.querySelector('title');
      expect(title.textContent).toBe('Umi');
    });
  
    test('should contain the correct favicon', () => {
      const favicon = document.querySelector('link[rel="icon"]');
      expect(favicon).toBeTruthy();
      expect(favicon.href).toContain('face.png');
    });
  
    test('should have a navigation bar with the correct links', () => {
      const navLinks = document.querySelectorAll('nav a');
      expect(navLinks.length).toBe(5);
  
      expect(navLinks[0].href).toContain('home.html');
      expect(navLinks[1].href).toContain('music.html');
      expect(navLinks[2].href).toContain('taskPage.html');
      expect(navLinks[3].href).toContain('faq.html');
      expect(navLinks[4].href).toContain('settings.html');
    });
  
    test('should have buttons for each settings section', () => {
      const buttons = document.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThanOrEqual(5); // At least 5 buttons
  
      expect(buttons[0].textContent).toBe('General');
      expect(buttons[1].textContent).toBe('Notifications');
      expect(buttons[2].textContent).toBe('Appearance');
      expect(buttons[3].textContent).toBe('Accounts');
      expect(buttons[4].textContent).toBe('FAQ');
    });
  
    test('should have the correct sections in settings', () => {
      const generalSection = document.querySelector('#general');
      const notificationsSection = document.querySelector('#notifications');
      const appearanceSection = document.querySelector('#appearance');
      const accountsSection = document.querySelector('#accounts');
  
      expect(generalSection).toBeTruthy();
      expect(notificationsSection).toBeTruthy();
      expect(appearanceSection).toBeTruthy();
      expect(accountsSection).toBeTruthy();
    });
  
    test('should display the "General" section by default', () => {
      const generalSection = document.querySelector('#general');
      expect(generalSection.style.display).toBe('block');
    });
  
    test('should hide other sections initially', () => {
      const notificationsSection = document.querySelector('#notifications');
      const appearanceSection = document.querySelector('#appearance');
      const accountsSection = document.querySelector('#accounts');
  
      expect(notificationsSection.style.display).toBe('none');
      expect(appearanceSection.style.display).toBe('none');
      expect(accountsSection.style.display).toBe('none');
    });
  });