/* 
=========================
    All Quiz Data
=========================
 */
const quizData = [
    {
      question: "After a long and exhausting day, what music do you reach for first?",
      answers: [
        "High-energy bass ⚡️",
        "Laid-back music ☕️",
        "Moody vibes 🌧️",
        "Feel-good beats 🌈"
      ],
      cssFile: "var-purple.css"
    },
    {
      question: "What’s your go-to playlist when you’re working or studying?",
      answers: [
        "Instrumental or classical music 🎻",
        "Chill tunes! 🎧",
        "Upbeat music with screamable lyrics 🎤",
        "Silence— I prefer no music... 🤫"
      ],
      cssFile: "var-green.css"
    },
    {
      question: "What’s your ideal music for a road trip?",
      answers: [
        "Loud and fast tracks to drive to 🚗💨",
        "Mellow songs to match the scenery 🌅",
        "Emotional ballads for a dramatic effect 🖋️",
        "Upbeat anthems to sing along to 🎶"
      ],
      cssFile: "var-yellow.css"
    },
    {
      question: "How do you usually discover new music?",
      answers: [
        "Curated playlists or algorithms 📻",
        "Recommendations from friends 🫂",
        "Exploring niche genres 🔍",
        "Radio or top charts 📈"
      ],
      cssFile: "var-red.css"
    }
];

let index = 0;
let answers = [];

function loadQuestion() {
  const data = quizData[index];
  
  document.getElementById("prompt").innerHTML = `<p>${data.question}</p>`;
  
  const answerContainer = document.getElementById("answer-container");
  answerContainer.innerHTML = "";
  
  data.answers.forEach((answer, index) => {
    const button = document.createElement("button");
    button.className = "answer";
    button.innerHTML = `<p>${answer}</p>`;
    button.onclick = () => saveAnswer(index);
    answerContainer.appendChild(button);
  });

  loadCSS(data.cssFile);
}

function loadCSS(fileName) {
    let existingLink = document.querySelector("#theme");
    existingLink.href = fileName;
}

function saveAnswer(answerIndex) {
    answers[index] = answerIndex;
    goToNextQuestion();
}

function goToNextQuestion() {
    index++;
    if (index < quizData.length) {
      loadQuestion();
    } else {
      displayLoading();
    }
}

loadQuestion();

function displayLoading() {
    const resultIndex = calculateResult();
    // store result, but show loading page first
    localStorage.setItem("quizResultIdx", resultIndex); 
    const resultPage = `results-loading.html`;
    window.location.href = resultPage;
  }
  
function calculateResult() {
    const counts = new Array(quizData[0].answers.length).fill(0);
    
    answers.forEach(answerIndex => {
      counts[answerIndex]++;
    });
    
    // return idx of most common answer
    return counts.indexOf(Math.max(...counts));
}