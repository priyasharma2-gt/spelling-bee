let words = [];
let currentWord = null;

// Elements
const playBtn = document.getElementById("playBtn");
const nextBtn = document.getElementById("nextBtn");
const checkBtn = document.getElementById("checkBtn");
const answerInput = document.getElementById("answerInput");
const resultDiv = document.getElementById("result");

// Speech synthesis
const synth = window.speechSynthesis;

let correctCount = 0;

const scoreDiv = document.getElementById("score");

// Load words from words.txt
fetch("./words.txt")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Failed to load words.txt");
    }
    return response.text();
  })
  .then((text) => {
    words = text
      .split("\n")
      .map((w) => w.trim())
      .filter((w) => w.length > 0);

    pickRandomWord();
  })
  .catch((err) => {
    resultDiv.textContent = "Error loading words list";
    resultDiv.style.color = "red";
    console.error(err);
  });

function pickRandomWord() {
  if (words.length === 0) return;

  const index = Math.floor(Math.random() * words.length);
  currentWord = words[index];

  answerInput.value = "";
  resultDiv.textContent = "";

  //disableNextButton();
}

function speakWord() {
  if (!currentWord) return;

  const utterance = new SpeechSynthesisUtterance(currentWord);
  utterance.rate = 0.5;

  playBtn.classList.add("playing");

  utterance.onend = () => {
    playBtn.classList.remove("playing");
  };

  synth.cancel();
  synth.speak(utterance);
}

function checkAnswer() {
  if (!currentWord) return;

  const userAnswer = answerInput.value.trim().toLowerCase();
  const correct = currentWord.toLowerCase();

  if (userAnswer === correct) {
    resultDiv.innerHTML = `
        <span class="text-success">
            <i class="bi bi-check-circle-fill me-1"></i>
            OK
        </span>
    `;
    speakText("Correct");

    correctCount++;
    scoreDiv.innerHTML = `Correct words: <strong>${correctCount}</strong>`;
  } else {
    resultDiv.innerHTML = `
            <span class="text-danger">
                <i class="bi bi-x-circle-fill me-1"></i>
                WRONG
            </span>
        `;
    speakText("Wrong");
  }
}

function speakText(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.5;
  synth.cancel();
  synth.speak(utterance);
}

function enableNextButton() {
  nextBtn.disabled = false;
  nextBtn.classList.remove("btn-secondary");
  nextBtn.classList.add("btn-success");
}

function disableNextButton() {
  nextBtn.disabled = true;
  nextBtn.classList.remove("btn-success");
  nextBtn.classList.add("btn-secondary");
}

// Events
playBtn.addEventListener("click", speakWord);
nextBtn.addEventListener("click", () => {
  pickRandomWord();
  speakWord();
});
checkBtn.addEventListener("click", checkAnswer);

document.querySelectorAll(".key").forEach((btn) => {
  btn.addEventListener("click", () => {
    answerInput.value += btn.textContent.toLowerCase();
  });
});

document.getElementById("backspaceBtn").addEventListener("click", () => {
  answerInput.value = answerInput.value.slice(0, -1);
});

document.getElementById("clearBtn").addEventListener("click", () => {
  answerInput.value = "";
});
