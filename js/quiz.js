export default class Quiz {
  constructor(category, difficulty, numberOfQuestions, playerName) {
    this.category = category;
    this.difficulty = difficulty;
    this.numberOfQuestions = numberOfQuestions;
    this.playerName = playerName;




    this.score = 0;
    this.questions = [];
    this.currentQuestionIndex = 0;
  }

  
  buildApiUrl() {
    const params = new URLSearchParams();
    params.set("amount", this.numberOfQuestions);


    if (this.category) params.set("category", this.category);
    if (this.difficulty) params.set("difficulty", this.difficulty);



    return `https://opentdb.com/api.php?${params.toString()}`;
  }

  
  async getQuestions() {
    const url = this.buildApiUrl();
    const response = await fetch(url);



    if (!response.ok) {
      throw new Error("Failed to fetch questions from the server.");
    }

    const data = await response.json();

   
    if (data.response_code !== 0) {
      const errorMessages = {
        1: "This category/difficulty doesn't have enough questions for that amount. Try a lower number or a different category.",
        2: "Invalid options were sent to the API. Please check your selections.",
        5: "Too many requests — please wait a few seconds and try again.",
      };

      throw new Error(
        errorMessages[data.response_code] ||
          "No questions available for this combination. Try different options."
      );
    }

    this.questions = data.results;
    return this.questions;
  }

  incrementScore() {
    this.score += 1;
  }

  getCurrentQuestion() {
    if (this.currentQuestionIndex >= this.questions.length) return null;
    return this.questions[this.currentQuestionIndex];
  }

  
  nextQuestion() {
    this.currentQuestionIndex += 1;
    return !this.isComplete();
  }

  isComplete() {
    return this.currentQuestionIndex >= this.questions.length;
  }

  getScorePercentage() {
    if (this.numberOfQuestions === 0) return 0;
    return Math.round((this.score / this.numberOfQuestions) * 100);
  }

  getHighScores() {
    try {
      const raw = localStorage.getItem("quizHighScores");
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      return [];
    }
  }

  isHighScore() {
    const highScores = this.getHighScores();
    if (highScores.length < 10) return true;

    const lowest = highScores[highScores.length - 1];
    return this.getScorePercentage() > lowest.percentage;
  }

  saveHighScore() {
    const highScores = this.getHighScores();

    const newScore = {
      name: this.playerName,
      score: this.score,
      total: this.numberOfQuestions,
      percentage: this.getScorePercentage(),
      difficulty: this.difficulty,
      date: new Date().toISOString(),
    };

    highScores.push(newScore);
    highScores.sort((a, b) => b.percentage - a.percentage);
    const top10 = highScores.slice(0, 10);

    localStorage.setItem("quizHighScores", JSON.stringify(top10));
    return top10;
  }

  
  endQuiz() {
    const percentage = this.getScorePercentage();
    const gotHighScore = this.isHighScore();
    const highScores = gotHighScore ? this.saveHighScore() : this.getHighScores();
    const medalClass = (i) => (i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : "");
    const leaderboardItems = highScores
      .map(
        (entry, i) => `
        <li class="leaderboard-item ${medalClass(i)}">
          <span class="leaderboard-rank">#${i + 1}</span>
          <span class="leaderboard-name">${entry.name}</span>
          <span class="leaderboard-score">${entry.percentage}%</span>
        </li>`
      )
      .join("");

    return `
      <div class="game-card results-card">
        <h2 class="results-title">Quiz Complete!</h2>
        <p class="results-score-display">${this.score}/${this.numberOfQuestions}</p>
        <p class="results-percentage">${percentage}% Accuracy</p>

        ${gotHighScore ? `<div class="new-record-badge"><i class="fa-solid fa-star"></i> New High Score!</div>` : ""}

        <div class="leaderboard">
          <h4 class="leaderboard-title">
            <i class="fa-solid fa-trophy"></i> Leaderboard
          </h4>
          <ul class="leaderboard-list">
            ${leaderboardItems || `<li class="leaderboard-item">No scores yet</li>`}
          </ul>
        </div>

        <div class="action-buttons">
          <button class="btn-restart" id="playAgainBtn">
            <i class="fa-solid fa-rotate-right"></i> Play Again
          </button>
        </div>
      </div>
    `;
  }
}