// Set up the HTML content
document.body.innerHTML = `
  <header>
    <nav>
      <ul>
        <li><a href="../../landing-page/home.html">Home</a></li>
        <li><a href="../music-page/music.html">Music</a></li>
        <li><a href="../task-page/taskPage.html">Umi</a></li>
        <li><a href="faq.html" class="active">FAQ</a></li>
        <li><a href="../settings-page/settings.html">Settings</a></li>
      </ul>
    </nav>
  </header>
  <main>
    <h1>Frequently Asked Questions</h1>
    <div class="faq-container">
      <div class="question-container">
        <div>
          <p>How do I create a new tasks? <br> Easy! Navigate to the Task Page (Umi) and find the + button. Add your task name, dates, and steps and Umi will handle the rest for you!</p>
        </div>
        <div>
          <p>How do I update tasks? <br> You can edit tasks through the Task Page (Umi) by clicking the edit button. From there, feel free to change your task or step names and any dates to better fit your schedule!</p>
        </div>
        <div>
          <p>How do I delete tasks? <br> You can delete tasks through the Task Page (Umi) by clicking the delete button. From there feel free to delete any tasks you are done with!</p>
        </div>
      </div>
      <div class="question-container">
        <div><p>How do I set up a timer?</p></div>
        <div><p>How do I connect to Spotify music?</p></div>
        <div><p>How do I find my Music Personality?</p></div>
      </div>
    </div>

    <section id="email">
      <h2>Have more questions? Reach out to us.</h2>
      <form action="mailto:umisayshi@gmail.com" method="post" enctype="text/plain">
        <input type="email" id="email" name="email" placeholder="Your email" required><br><br>
        <textarea id="message" name="message" rows="10" cols="60" placeholder="Dear Umi... " required style="text-align: center;"></textarea><br><br>
        <button type="submit">Send to Umi!</button>
      </form>
    </section>
  </main>

  <!-- Footer -->
  <footer class="footer-container" id="privacy-policy">
    <div id="footer-logo">
      <img src="../../images/logo.png" alt="umi-logo">
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
      <p>motto</p>
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
          <img src="../../images/socials-logos/spotify-logo.png" alt="spotify-logo" class="socials-logos">
        </a>
      </div>
      <div>
        <a href="https://www.instagram.com/umisays_helloworld/" target=”_blank”>
          <img src="../../images/socials-logos/instagram-logo.png" alt="instagram-logo" class="socials-logos">
        </a>
      </div>
    </div>
  </footer>
`;
require('@testing-library/jest-dom');


// Test cases
describe('FAQ Page', () => {
  test('should render FAQ questions and answers', () => {
    // Check if FAQ title is displayed
    const title = document.querySelector('h1');
    expect(title.textContent).toBe('Frequently Asked Questions');

    // Check if the first question is present
    const question1 = document.querySelectorAll('.faq-container .question-container p')[0];
    expect(question1.textContent).toContain('How do I create a new tasks?');

    // Check if the second question is present
    const question2 = document.querySelectorAll('.faq-container .question-container p')[1];
    expect(question2.textContent).toContain('How do I update tasks?');

    // Check if the third question is present
    const question3 = document.querySelectorAll('.faq-container .question-container p')[2];
    expect(question3.textContent).toContain('How do I delete tasks?');
  });

  test('should display the email form', () => {
    const form = document.querySelector('form');
    const emailInput = form.querySelector('input[type="email"]');
    const messageTextArea = form.querySelector('textarea');
    const submitButton = form.querySelector('button[type="submit"]');

    expect(emailInput).toBeInTheDocument();
    expect(messageTextArea).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toHaveTextContent('Send to Umi!');
  });

  it('should link to the privacy policy and terms of use', () => {
    const privacyPolicyLink = document.querySelector('a[href="http://umi-privacy-policy.notion.site"]');
    const termsOfUseLink = document.querySelector('a[href="https://umi-privacy-policy.notion.site/Terms-of-Use-1489b65cf77380748b68cdefe087260c?pvs=4"]');
  
    // Ensure both links are found
    expect(privacyPolicyLink).toHaveAttribute('href', 'http://umi-privacy-policy.notion.site');
    expect(termsOfUseLink).toHaveAttribute('href', 'https://umi-privacy-policy.notion.site/Terms-of-Use-1489b65cf77380748b68cdefe087260c?pvs=4');
  });
  

  test('should render footer creators', () => {
    const creators = document.querySelectorAll('#creators p');
    expect(creators.length).toBe(4);
    expect(creators[0].textContent).toBe('Jennifer Huang');
    expect(creators[1].textContent).toBe('Jeel Patel');
    expect(creators[2].textContent).toBe('Mouryan Puri');
    expect(creators[3].textContent).toBe('Jaycie Say');
  });
});
