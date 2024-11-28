/* 
=========================
    Page Navigation
=========================
 */
const pages = [
    'question-1.html',
    'question-2.html',
    'question-3.html',
    'question-4.html',
    'results-loading.html'
];

let current = parseInt(localStorage.getItem('current')) || 0;
const button = document.getElementById('next-button');

button.addEventListener('click', () => {
    current++;
    if (current >= pages.length) current = 0;

    localStorage.setItem('current', current);
    window.location.href = pages[current];
});

function goToPage(page){
    window.location.href = page;
}