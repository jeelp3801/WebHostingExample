require('@testing-library/jest-dom');
const { screen } = require('@testing-library/react');

document.body.innerHTML = `<!--landing page-->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=<device-width>, initial-scale=1.0">
    <title>Umi</title>

    <!-- Font -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap" rel="stylesheet">

    <!-- Favicon -->
    <link rel="icon" href="../images/face.png" type="image/png">

    <!-- Global CSS -->
    <link rel="stylesheet" href="../global.css">
    <!-- Navigation Bar CSS -->
     <link rel="stylesheet" href="../navBar.css">
    <!-- Main: Loading Page CSS -->
    <link rel="stylesheet" href="home.css">
    <!-- Footer CSS -->
    <link rel="stylesheet" href="../footer.css">
</head>
<body>
    <header>
        <!-- Navigation Bar -->
        <nav>
            <ul>
                <li><a href="home.html" class="active">Home</a></li>
                <li><a href="../main-pages/music-page/music.html">Music</a></li>
                <li><a href="../main-pages/task-page/taskPage.html">Umi</a></li>
                <li><a href="../main-pages/faq-page/faq.html">FAQ</a></li>
                <li><a href="../main-pages/settings-page/settings.html">Settings</a></li>
            </ul>
        </nav>
        <div id="main-header">
            <img src="../images/mascot-combined.png" alt="mascot" id="mascot">
        </div>
    </header>
    <main>
        <section id="section-bio">
            <h3>About us</h3>
            <p>
                Welcome to Umi! Umi is designed to help students manage their tasks effectively while making studying more enjoyable with 
                music and a simple way to plan and organize tasks. In Japanese, "Umi" means "ocean," symbolizing the calm and clarity we aim 
                to bring to your academic life. Inspired by Marie Kondo's philosophy of tidying and organizing your life, Umi combines structure 
                and creativity to help you achieve your goals effortlessly.
            </p>
        </section>
        <article id="article-container">
            <div class="left-desc">
                <h4>Need help organizing your tasks?</h4>
                <p>
                    Ever felt like you have a bajillion assignments and don't know where to start!? Well 
                    welcome to Umi! With Umi, we make organizing yourt task and schedules easy. All you have to
                    do is enter your task, enter a few dates and steps related to the task, and BAM!! 
                    Umi will plan out your schedule for that task for you! What's even better? Umi is flexible
                    and you have the power to add, edit and delete tasks at any time. So try it out and let us make
                    your life a little less hectic one task at a time.
                </p>
            </div>
            <div class="right-desc">
                <h4>Want to find your Study Personality?</h4>
                <p>
                    Come take a quiz and find your perfect study persona! After a series of fun
                    and colourful questions, you can aim to study better with a personalized playlist! It doesn't
                    matter if you're studying, gardening, or baking- you can always find groovy tunes with us!
                </p>
            </div>
        </article>
    
        <hr style="width: 90%;">

        <!-- Navigation to the main questionnaire -->
        <section id="options-sections">
            <h2>Begin your journey with us!</h2>

            <ul id="options-list">
                <li><input type="button" class="option" value="Start Now!" onclick="location.href='../main-pages/task-page/notion-features/notion-feature-1.html'"/></li> <!--navigate to task page-->
                <li><input type="button" class="option" value="Music" onclick="location.href='../main-pages/music-page/music.html'"/></li> <!--navigate to spotify login??-->
            </ul>
        </section>
    </main>


    <!-- Footer -->
    <footer class="footer-container" id="privacy-policy">
        <div id="footer-logo">
            <img src="../images/logo.png" alt="umi-logo">
        </div>

        <div class="footer-content">
            <h3>Privacy Policy</h3>
            <p>
                <a href="http://umi-privacy-policy.notion.site">Privacy Policy</a> <br>
                <a href="https://umi-privacy-policy.notion.site/Terms-of-Use-1489b65cf77380748b68cdefe087260c?pvs=4">Terms of Use</a>
            </p>
        </div>
        <div class="footer-content" id="footer-center">
            <h3>Umi</h3>
            <p>
                ~go with the flow~
            </p>
        </div>
        <div class="footer-content" id="creators">
            <h3>Creators</h3>
            <p>Jennifer Huang</p>
            <p>Jeel Patel</p>
            <p>Mouryan Puri</p>
            <p>Jaycie Say</p>
        </div>
        
        <div class="socials-container">
            <div>
                <a href="https://open.spotify.com/user/31cowsjai4uwaq3jyd2mcnuxl3km" target=”_blank”>
                    <img src="../images/socials-logos/spotify-logo.png" alt="spotify-logo" class="socials-logos">
                </a>
            </div>
            <div>
                <a href="https://www.instagram.com/umisays_helloworld/" target=”_blank”>
                    <img src="../images/socials-logos/instagram-logo.png" alt="instagram-logo" class="socials-logos">
                </a>
            </div>
        </div>
    </footer>
</body>
</html>

`;


describe('Home Page Tests', () => {
  test('renders home page title correctly', () => {
    expect(document.title).toBe('Umi');
  });

  test('renders navigation bar with correct links', () => {
    const navLinks = screen.getAllByRole('link');
    expect(navLinks).toHaveLength(9);
    expect(navLinks[0].textContent).toBe('Home');
    expect(navLinks[1].textContent).toBe('Music');
  });


  test('renders footer with Privacy Policy links and social media icons', () => {
    const privacyLinks = screen.getAllByRole('link');
    expect(privacyLinks).toHaveLength(9);
    expect(privacyLinks[0].textContent).toBe('Home');
    expect(privacyLinks[1].textContent).toBe('Music');
  });

  test('renders "About Us" section correctly', () => {
    const aboutUs = screen.getByText(/Welcome to Umi!/);
    expect(aboutUs).toBeInTheDocument();
  });

  test('renders "Need help organizing your tasks?" text in the article', () => {
    const taskText = screen.getByText(/Need help organizing your tasks?/);
    expect(taskText).toBeInTheDocument();
  });

  test('renders "Want to find your Study Personality?" text in the article', () => {
    const quizText = screen.getByText(/Want to find your Study Personality?/);
    expect(quizText).toBeInTheDocument();
  });
});
