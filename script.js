let currentQuestionIndex = 0;
let score = 0;
let userAnswers = [];
let questions = [];
let selectedAnswerIndex = null;

// DOM elements
const questionNumberEl = document.getElementById('question-number');
const questionTextEl = document.getElementById('question-text');
const optionsContainerEl = document.getElementById('options-container');
const submitButton = document.getElementById('submit-button');
const feedbackArea = document.getElementById('feedback-area');
const quizArea = document.getElementById('question-area');
const resultsArea = document.getElementById('results-area');
const scoreTextEl = document.getElementById('score-text');
const reviewButton = document.getElementById('review-button');
const reviewArea = document.getElementById('review-area');
const restartButton = document.getElementById('restart-button');

// Fetch quiz data and initialize quiz
fetch('./quiz_data.json')
  .then(response => response.json())
  .then(data => {
    questions = data.questions.slice(0, 65); // 65問に限定

    // イベントリスナーの設定
    const submitButtonClickHandler = () => submitAnswer();
    submitButton.onclick = submitButtonClickHandler;
    reviewButton.onclick = showReview;
    restartButton.onclick = restartQuiz;

    // 初期ロード
    loadQuestion();
  })
  .catch(error => {
    console.error('Failed to load quiz data:', error);
    questionTextEl.textContent = 'クイズデータの読み込みに失敗しました。';
  });

  function loadQuestion() {
    if (currentQuestionIndex >= questions.length) {
        showResults();
        return;
    }

    const q = questions[currentQuestionIndex];
    questionNumberEl.textContent = `質問 ${currentQuestionIndex + 1} / ${questions.length}`;
    questionTextEl.textContent = q.question;

    optionsContainerEl.innerHTML = '';
    selectedAnswerIndex = null;
    feedbackArea.innerHTML = '';
    submitButton.disabled = true;

    q.options.forEach((optionText, index) => {
        const optionEl = document.createElement('div');
        optionEl.classList.add('option');
        optionEl.textContent = `${index + 1}. ${optionText}`;
        optionEl.dataset.index = index + 1;
        optionEl.addEventListener('click', () => selectOption(optionEl, index + 1));
        optionsContainerEl.appendChild(optionEl);
    });
}

function selectOption(selectedEl, index) {
    // 既に選択されているものを解除
    optionsContainerEl.querySelectorAll('.option').forEach(el => {
        el.classList.remove('selected');
    });

    // 新しいものを選択
    selectedEl.classList.add('selected');
    selectedAnswerIndex = index;
    submitButton.disabled = false;
}

function submitAnswer() {
    if (selectedAnswerIndex === null) return;

    const q = questions[currentQuestionIndex];
    const isCorrect = (selectedAnswerIndex === q.answer);
    
    // 複数選択 (配列) の場合はここで処理を分岐させますが、今回は単一選択のみと仮定
    
    if (isCorrect) {
        score++;
    }

    userAnswers.push({
        question: q.question,
        userAnswerIndex: selectedAnswerIndex,
        correctAnswerIndex: q.answer,
        isCorrect: isCorrect,
        rationale: q.rationale,
        options: q.options
    });

    // 選択肢のクリックを無効化
    optionsContainerEl.querySelectorAll('.option').forEach(el => {
        el.style.pointerEvents = 'none';
        // 正解の選択肢をハイライト
        if (parseInt(el.dataset.index) === q.answer) {
            el.classList.add('correct');
        }
        // 不正解の場合、ユーザーの回答を赤くハイライト
        if (!isCorrect && parseInt(el.dataset.index) === selectedAnswerIndex) {
            el.classList.add('incorrect');
        }
    });

    // フィードバック表示
    feedbackArea.className = isCorrect ? 'correct' : 'incorrect';
    feedbackArea.innerHTML = `
        <p><strong>${isCorrect ? '✅ 正解です！' : '❌ 不正解です！'}</strong></p>
        <p><strong>解説:</strong> ${q.rationale}</p>
    `;

    submitButton.textContent = '次の質問へ';
    submitButton.onclick = nextQuestion;
}

function nextQuestion() {
    currentQuestionIndex++;
    submitButton.textContent = '回答を送信';
    submitButton.onclick = submitButtonClickHandler; // submitAnswer()に戻す
    loadQuestion();
}

function showResults() {
    quizArea.classList.add('hidden');
    resultsArea.classList.remove('hidden');
    
    const percentage = (score / questions.length) * 100;
    scoreTextEl.innerHTML = `
        <p>正答数: ${score} / ${questions.length} 問</p>
        <p>正答率: <strong>${percentage.toFixed(2)}%</strong></p>
    `;
}

function showReview() {
    resultsArea.classList.add('hidden');
    reviewArea.classList.remove('hidden');
    
    reviewArea.innerHTML = '<h2>回答レビュー</h2>';
    
    userAnswers.forEach((item, index) => {
        const reviewItemEl = document.createElement('div');
        reviewItemEl.classList.add('review-item');
        
        const isCorrectClass = item.isCorrect ? 'correct' : 'incorrect';
        
        reviewItemEl.innerHTML = `
            <h3>質問 ${index + 1}: ${item.question}</h3>
            <p><strong>あなたの回答:</strong> ${item.userAnswerIndex}. ${item.options[item.userAnswerIndex - 1]}</p>
            <p><strong>正解:</strong> ${item.correctAnswerIndex}. ${item.options[item.correctAnswerIndex - 1]}</p>
            <p class="rationale"><strong>解説:</strong> ${item.rationale}</p>
            <p class="${isCorrectClass}"><strong>判定:</strong> ${item.isCorrect ? '✅ 正解' : '❌ 不正解'}</p>
        `;
        reviewArea.appendChild(reviewItemEl);
    });
    
    const restartBtn = document.createElement('button');
    restartBtn.id = 'restart-button-bottom';
    restartBtn.textContent = 'テストを再開';
    restartBtn.onclick = restartQuiz;
    reviewArea.appendChild(restartBtn);
}

function restartQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = [];
    selectedAnswerIndex = null;

    reviewArea.classList.add('hidden');
    resultsArea.classList.add('hidden');
    quizArea.classList.remove('hidden');

    loadQuestion();
}

// イベントリスナーの設定
const submitButtonClickHandler = () => submitAnswer(); // デフォルトのクリックハンドラ
submitButton.onclick = submitButtonClickHandler;

reviewButton.onclick = showReview;
restartButton.onclick = restartQuiz;
