import soundManager from "./sounds.js";

const QUESTION_TIME = 15;

export default class Question {
  constructor(quiz, container, onQuizEnd) {
    this.quiz = quiz;
    this.container = container;
    this.onQuizEnd = onQuizEnd;

    this.questionData = quiz.getCurrentQuestion();
    this.index = quiz.currentQuestionIndex;

    this.question = this.decodeHtml(this.questionData.question);
    this.correctAnswer = this.decodeHtml(this.questionData.correct_answer);
    this.category = this.decodeHtml(this.questionData.category);
    this.wrongAnswers = this.questionData.incorrect_answers.map((a) =>
      this.decodeHtml(a)
    );

    this.allAnswers = this.shuffleAnswers();

    this.answered = false;
    this.timerInterval = null;
    this.timeRemaining = QUESTION_TIME;
    this.handleKeydown = this.handleKeydown.bind(this);
  }

  decodeHtml(html) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.documentElement.textContent;
  }

  shuffleAnswers() {
    const answers = [...this.wrongAnswers, this.correctAnswer];

    for (let i = answers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [answers[i], answers[j]] = [answers[j], answers[i]];
    }

    return answers;
  }

  getProgress() {
    return Math.round(((this.index + 1) / this.quiz.numberOfQuestions) * 100);
  }

  displayQuestion() {
    const difficultyIcon =
      this.quiz.difficulty === "hard"
        ? "fa-skull"
        : this.quiz.difficulty === "medium"
        ? "fa-face-meh"
        : "fa-face-smile";

    const answersHtml = this.allAnswers
      .map(
        (answer, i) => `
        <button class="answer-btn" data-answer="${this.escapeAttr(answer)}">
          <span class="answer-key">${i + 1}</span>
          <span class="answer-text">${answer}</span>
        </button>`
      )
      .join("");

    this.container.innerHTML = `
      <div class="game-card question-card">
        <div class="xp-bar-container">
          <div class="xp-bar-header">
            <span class="xp-label"><i class="fa-solid fa-bolt"></i> Progress</span>
            <span class="xp-value">Question ${this.index + 1}/${this.quiz.numberOfQuestions}</span>
          </div>
          <div class="xp-bar">
            <div class="xp-bar-fill" style="width: ${this.getProgress()}%"></div>
          </div>
        </div>

        <div class="stats-row">
          <div class="stat-badge category">
            <i class="fa-solid fa-bookmark"></i>
            <span>${this.category}</span>
          </div>
          <div class="stat-badge difficulty ${this.quiz.difficulty}">
            <i class="fa-solid ${difficultyIcon}"></i>
            <span>${this.quiz.difficulty}</span>
          </div>
          <div class="stat-badge timer">
            <i class="fa-solid fa-stopwatch"></i>
            <span class="timer-value">${this.timeRemaining}</span>s
          </div>
          <div class="stat-badge counter">
            <i class="fa-solid fa-gamepad"></i>
            <span>${this.index + 1}/${this.quiz.numberOfQuestions}</span>
          </div>
        </div>

        <h2 class="question-text">${this.question}</h2>

        <div class="answers-grid">
          ${answersHtml}
        </div>

        <p class="keyboard-hint">
          <i class="fa-regular fa-keyboard"></i> Press 1-${this.allAnswers.length} to select
        </p>

        <div class="score-panel">
          <div class="score-item">
            <div class="score-item-label">Score</div>
            <div class="score-item-value">${this.quiz.score}</div>
          </div>
        </div>
      </div>
    `;

    this.addEventListeners();
    this.startTimer();
  }

 
  escapeAttr(str) {
    return str.replace(/"/g, "&quot;");
  }

  addEventListeners() {
    const buttons = this.container.querySelectorAll(".answer-btn");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => this.checkAnswer(btn));
    });

    document.addEventListener("keydown", this.handleKeydown);
  }

  handleKeydown(e) {
    const validKeys = ["1", "2", "3", "4"];
    if (!validKeys.includes(e.key)) return;

    const buttons = this.container.querySelectorAll(".answer-btn");
    const chosenIndex = parseInt(e.key, 10) - 1;

    if (buttons[chosenIndex]) {
      this.checkAnswer(buttons[chosenIndex]);
    }
  }

  removeEventListeners() {
    document.removeEventListener("keydown", this.handleKeydown);
  }

  startTimer() {
    const timerValueEl = this.container.querySelector(".timer-value");
    const timerBadge = this.container.querySelector(".stat-badge.timer");

    this.timerInterval = setInterval(() => {
      this.timeRemaining -= 1;

      if (timerValueEl) timerValueEl.textContent = this.timeRemaining;

      if (this.timeRemaining <= 10 && timerBadge) {
        timerBadge.classList.add("warning");
      }
      if (this.timeRemaining <= 5 && this.timeRemaining > 0) {
        soundManager.playTick(this.timeRemaining);
      }

      if (this.timeRemaining <= 0) {
        this.stopTimer();
        this.handleTimeUp();
      }
    }, 1000);
  }

  stopTimer() {
    clearInterval(this.timerInterval);
  }

  handleTimeUp() {
    if (this.answered) return;
    this.answered = true;
    this.removeEventListeners();

    soundManager.playTimeUp();

    this.highlightCorrectAnswer();

    const buttons = this.container.querySelectorAll(".answer-btn");
    buttons.forEach((btn) => btn.classList.add("disabled"));

    const questionCard = this.container.querySelector(".question-card");
    if (questionCard) {
      const timeUpMsg = document.createElement("div");
      timeUpMsg.className = "time-up-message";
      timeUpMsg.innerHTML = `<i class="fa-solid fa-clock"></i> TIME'S UP!`;
      questionCard.appendChild(timeUpMsg);
    }

    this.animateQuestion();
  }

  checkAnswer(choiceElement) {
    if (this.answered) return;

    this.answered = true;
    this.stopTimer();
    this.removeEventListeners();

    const selectedAnswer = choiceElement.dataset.answer;
    const isCorrect =
      selectedAnswer.trim().toLowerCase() ===
      this.correctAnswer.trim().toLowerCase();

    if (isCorrect) {
      choiceElement.classList.add("correct");
      this.quiz.incrementScore();
      soundManager.playCorrect();
    } else {
      choiceElement.classList.add("wrong");
      soundManager.playWrong();
      this.highlightCorrectAnswer();
    }

    const buttons = this.container.querySelectorAll(".answer-btn");
    buttons.forEach((btn) => {
      if (btn !== choiceElement) {
        btn.classList.add("disabled");
      }
    });

    this.animateQuestion();
  }

  highlightCorrectAnswer() {
    const buttons = this.container.querySelectorAll(".answer-btn");
    buttons.forEach((btn) => {
      if (
        btn.dataset.answer.trim().toLowerCase() ===
        this.correctAnswer.trim().toLowerCase()
      ) {
        btn.classList.add("correct-reveal");
      }
    });
  }

  getNextQuestion() {
    const hasMore = this.quiz.nextQuestion();

    if (hasMore) {
      const nextQuestion = new Question(this.quiz, this.container, this.onQuizEnd);
      nextQuestion.displayQuestion();
    } else {
      this.container.innerHTML = this.quiz.endQuiz();

      const playAgainBtn = this.container.querySelector("#playAgainBtn");
      if (playAgainBtn) {
        playAgainBtn.addEventListener("click", () => this.onQuizEnd());
      }
    }
  }

  animateQuestion(duration = 400) {
    setTimeout(() => {
      const questionCard = this.container.querySelector(".question-card");
      if (questionCard) questionCard.classList.add("exit");

      setTimeout(() => {
        this.getNextQuestion();
      }, duration);
    }, 1500);
  }
}