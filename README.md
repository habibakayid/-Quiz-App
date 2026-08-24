#  QuizMaster — The Ultimate Trivia Challenge

A dynamic, OOP-based trivia quiz app built with **vanilla JavaScript (ES6 Modules)**. Pick a category, difficulty, and number of questions, then race against a per-question timer to score as high as you can — complete with sound effects and a local leaderboard.



![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)

---

##  Features

-  **Setup form** — choose player name, category, difficulty (Easy / Medium / Hard), and number of questions (1–50)
-  **Loading state** while questions are fetched from the API
-  **True/False & Multiple Choice** questions, answered by mouse click **or** keyboard (press `1`–`4`)
-  **15-second countdown timer** per question, with a visual "warning" state and a ticking sound in the last 5 seconds
-  **Sound effects** for correct answers, wrong answers, and time-up — generated live with the Web Audio API (no external audio files)
-  **Live score tracking** and progress bar across the quiz
-  **Local leaderboard** (top 10 scores) saved in `localStorage`
-  **Error handling** with automatic retry on network failure, and a friendly "Try Again" screen
-  Fully responsive, dark neon-themed UI

---

##  Tech Stack

- **Vanilla JavaScript (ES6+)** — Classes, Modules, `async/await`, `fetch`
- **HTML5 / CSS3** — custom design system, no frameworks
- **[Open Trivia DB](https://opentdb.com/)** — free trivia question API
- **Web Audio API** — synthesized sound effects
- **Font Awesome** — icons

---

##  Project Structure

```
quiz-master/
├── index.html          # Main HTML structure & design reference comments
├── CSS/
│   └── style.css        # All styling (theme, animations, responsive layout)
├── images/
│   └── favicon.png
└── js/
    ├── index.js          # Entry point — form handling, loading/error states
    ├── quiz.js            # Quiz class — game state, API calls, scoring, high scores
    ├── question.js        # Question class — rendering, timer, answer checking
    ├── sounds.js           # SoundManager — correct/wrong/tick/time-up sound effects
    └── ui-controls.js      # Custom select dropdowns & number input controls
```

---

##  Architecture (OOP)

The app is built around two main classes:

### `Quiz`
Manages the overall game state:
- Builds the API request URL (`category`, `difficulty`, `amount`)
- Fetches questions from Open Trivia DB (with automatic retry on network failure)
- Tracks score & current question index
- Handles high-score persistence via `localStorage`
- Generates the results screen HTML

### `Question`
Manages a single question's lifecycle:
- Decodes HTML entities returned by the API
- Shuffles answers (Fisher–Yates algorithm)
- Renders the question card and starts a 15-second timer
- Listens for click **and** keyboard (`1`–`4`) input
- Checks the answer, triggers sound effects, and transitions to the next question

A lightweight `SoundManager` class (`sounds.js`) generates all sound effects on the fly using the Web Audio API — no external audio files, so nothing breaks on deployment.

---

##  Getting Started

1. Clone the repo:
   ```bash
   git clone https://github.com/<your-username>/quiz-master.git
   cd quiz-master
   ```
2. Since the JS files use ES6 Modules (`import`/`export`), you need to serve the project over `http://` rather than opening `index.html` directly (`file://`) — for example with the **Live Server** extension in VS Code, or:
   ```bash
   npx serve .
   ```
3. Open the served URL in your browser and start playing 

---

## 🌐 API Reference

Questions are fetched from the [Open Trivia DB API](https://opentdb.com/api_config.php):

```
https://opentdb.com/api.php?amount=10&category=9&difficulty=easy
```

| Response Code | Meaning |
|---|---|
| `0` | Success |
| `1` | Not enough questions for that category/amount |
| `2` | Invalid parameter |
| `5` | Rate limit (1 request per 5 seconds per IP) |

---
