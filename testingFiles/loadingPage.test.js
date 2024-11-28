// Set up the HTML content
document.body.innerHTML = `
<!DOCTYPE html>
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
    <link rel="icon" href="../../images/face.png" type="image/png">

    <!-- Global CSS Page -->
    <link rel="stylesheet" href="/src/global.css">
    <!-- Light Mode -->
    <link rel="stylesheet" href="../loading-page/loadingPage.css">
</head>
<body>
    <div id="container">
        <table>
            <tr>
                <td rowspan="2" style="width: 50%;">
                    <img src="../../images/mascot-combined.png" id="mascot" alt="mascot">
                </td>
                <td style="width: 90%;">
                    <h3>welcome to</h3>
                    <h1>UMI</h1>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>

`;
require('@testing-library/jest-dom');

describe('Loading Page', () => {
  test('should have a title "Umi"', () => {
    const title = document.querySelector('title');
    expect(title.textContent).toBe('Umi');
  });

  test('should have a mascot image', () => {
    const mascotImage = document.querySelector('#mascot');
    expect(mascotImage).toBeTruthy(); // Check that the image exists
    expect(mascotImage.src).toContain('mascot-combined.png'); // Check the image source
  });

  test('should contain the welcome text "welcome to" and "UMI"', () => {
    const welcomeText = document.querySelector('h3');
    const umiText = document.querySelector('h1');
    expect(welcomeText.textContent).toBe('welcome to');
    expect(umiText.textContent).toBe('UMI');
  });

  test('should link to the favicon', () => {
    const favicon = document.querySelector('link[rel="icon"]');
    expect(favicon).toBeTruthy();
    expect(favicon.href).toContain('face.png'); // Check the href for the favicon
  });

  test('should have the correct CSS links', () => {
    const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
    expect(cssLinks.length).toBeGreaterThanOrEqual(2); // Check if there are at least two stylesheets
    
    // Filter the CSS links to only include local ones
    const localCssLinks = Array.from(cssLinks).filter(link =>
        link.href.includes('global.css') || link.href.includes('loadingPage.css')
    );

    // Check if the correct CSS links are present
    expect(localCssLinks.length).toBeGreaterThanOrEqual(2);
    expect(localCssLinks[0].href).toContain('global.css');
    expect(localCssLinks[1].href).toContain('loadingPage.css');
});

});
