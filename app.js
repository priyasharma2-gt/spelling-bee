let words = [];
let currentWord = null;
let wordDeck = [];
let deckIndex = 0;

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function resetDeck() {
    wordDeck = shuffleArray([...words]);
    deckIndex = 0;
}


// Elements
const playBtn = document.getElementById("playBtn");
const nextBtn = document.getElementById("nextBtn");
const checkBtn = document.getElementById("checkBtn");
const answerInput = document.getElementById("answerInput");
const resultDiv = document.getElementById("result");
const hintBtn = document.getElementById("hintBtn");

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

    resetDeck();
    updateTotalWords();
    pickNextWord();
  })
  .catch((err) => {
    resultDiv.textContent = "Error loading words list";
    resultDiv.style.color = "red";
    console.error(err);
  });

function pickNextWord() {
    if (words.length === 0) return;

    if (wordDeck.length === 0 || deckIndex >= wordDeck.length) {
        resetDeck(); // finished all words, reshuffle and start over
    }

    currentWord = wordDeck[deckIndex];
    deckIndex++;

    answerInput.value = "";
    resultDiv.textContent = "";
}


function speakWord() {
  if (!currentWord) return;

  const utterance = new SpeechSynthesisUtterance(currentWord);
  utterance.rate = 0.25;

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
    scoreDiv.innerHTML =
      `Total words: <strong>${words.length}</strong><br>Correct words: <strong>${correctCount}</strong>`;

    // Success animation
    resultDiv.classList.add("success");

    setTimeout(() => {
      resultDiv.classList.remove("success");
      pickNextWord();
      speakWord();
    }, 2000);
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

document.addEventListener("DOMContentLoaded", () => {
  // Events
  playBtn.addEventListener("click", speakWord);
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

  hintBtn.addEventListener("click", () => {
    if (!currentWord) return;
    alert(`Hint: ${currentWord}`);
  });

});

function updateTotalWords() {
  scoreDiv.innerHTML =
    `Total words: <strong>${words.length}</strong><br>Correct words: <strong>0</strong>`;
}
