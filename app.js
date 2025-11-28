// Data
const genresData = [
  { number: 1, name: "Adventure", correct: "C" },
  { number: 2, name: "Animation", correct: "D" },
  { number: 3, name: "Comedy", correct: "G" },
  { number: 4, name: "Crime drama", correct: "H" },
  { number: 5, name: "Historical", correct: "J" },
  { number: 6, name: "Musical", correct: "B" },
  { number: 7, name: "Mystery", correct: "I" },
  { number: 8, name: "Science fiction", correct: "A" },
  { number: 9, name: "Thriller", correct: "F" },
  { number: 10, name: "Western", correct: "E" }
];

const definitionsData = [
  { letter: "A", text: "includes book, films, or cartoons about an imagined future, especially about space travel or other planets" },
  { letter: "B", text: "A musical is a play or film in which part of the story is sung to music" },
  { letter: "C", text: "is a type of story in which the characters have unusual, exciting, and possibly dangerous activities" },
  { letter: "D", text: "normally includes series or films in which all the action is drawn, painted or created with a computer" },
  { letter: "E", text: "includes films based on stories about life of cowboys in the west of the US in the past" },
  { letter: "F", text: "is a book, play, or film that has an exciting story, often about solving a crime" },
  { letter: "G", text: "is a (type of) film, play, or book that is intentionally funny either in its characters or its action" },
  { letter: "H", text: "is a type of show in which the principal characters have to investigate, punish or commit crimes" },
  { letter: "I", text: "is a type of book, film, or play, especially about a crime or a murder, with a surprise ending" },
  { letter: "J", text: "movies and novels are invented or real stories that happened in the past" }
];

// Game state
let gameState = {
  correctMatches: 0,
  placedGenres: {}
};

// Initialize the app
function init() {
  renderGenres();
  renderDefinitions();
  updateProgress();
}

// Show section
function showSection(sectionId) {
  const sections = document.querySelectorAll('.section');
  sections.forEach(section => section.classList.remove('active'));
  document.getElementById(sectionId).classList.add('active');
}

// Show main menu from landing page
function showMainMenu() {
  const landing = document.getElementById('landing');
  const menu = document.getElementById('menu');
  const footer = document.getElementById('credits-footer');
  
  if (landing) landing.classList.remove('active');
  if (menu) menu.classList.add('active');
  if (footer) footer.style.display = 'block';
  
  document.body.classList.add('menu-active');
  
  window.scrollTo(0, 0);
}

// Render genre cards
function renderGenres() {
  const genresList = document.getElementById('genres-list');
  genresList.innerHTML = '';

  genresData.forEach(genre => {
    if (!gameState.placedGenres[genre.correct]) {
      const card = createGenreCard(genre);
      genresList.appendChild(card);
    }
  });
}

// Create genre card
function createGenreCard(genre) {
  const card = document.createElement('div');
  card.className = 'genre-card';
  card.textContent = genre.name;
  card.draggable = true;
  card.dataset.genre = genre.name;
  card.dataset.correct = genre.correct;

  card.addEventListener('dragstart', handleDragStart);
  card.addEventListener('dragend', handleDragEnd);

  return card;
}

// Render definition boxes
function renderDefinitions() {
  const definitionsList = document.getElementById('definitions-list');
  definitionsList.innerHTML = '';

  definitionsData.forEach(def => {
    const box = createDefinitionBox(def);
    definitionsList.appendChild(box);
  });
}

// Create definition box
function createDefinitionBox(def) {
  const box = document.createElement('div');
  box.className = 'definition-box';
  box.dataset.letter = def.letter;

  const letter = document.createElement('div');
  letter.className = 'definition-letter';
  letter.textContent = `${def.letter}.`;

  const text = document.createElement('div');
  text.className = 'definition-text';
  text.textContent = def.text;

  box.appendChild(letter);
  box.appendChild(text);

  // Check if already filled
  if (gameState.placedGenres[def.letter]) {
    box.classList.add('filled');
    const placedGenre = document.createElement('div');
    placedGenre.className = 'placed-genre';
    placedGenre.innerHTML = `<span style="color: #22c55e; font-size: 20px;">✓</span> <span style="color: #000000;">${gameState.placedGenres[def.letter]}</span>`;
    box.appendChild(placedGenre);
  }

  box.addEventListener('dragover', handleDragOver);
  box.addEventListener('dragleave', handleDragLeave);
  box.addEventListener('drop', handleDrop);

  return box;
}

// Drag handlers
function handleDragStart(e) {
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', JSON.stringify({
    genre: e.target.dataset.genre,
    correct: e.target.dataset.correct
  }));
  e.target.classList.add('dragging');
}

function handleDragEnd(e) {
  e.target.classList.remove('dragging');
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  e.dataTransfer.dropEffect = 'move';
  e.currentTarget.classList.add('drag-over');
  return false;
}

function handleDragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }
  e.preventDefault();

  const box = e.currentTarget;
  box.classList.remove('drag-over');

  // Don't allow dropping on already filled boxes
  if (box.classList.contains('filled')) {
    return false;
  }

  const data = JSON.parse(e.dataTransfer.getData('text/plain'));
  const droppedLetter = box.dataset.letter;

  // Check if correct
  if (data.correct === droppedLetter) {
    handleCorrectMatch(data.genre, droppedLetter);
  } else {
    handleIncorrectMatch(data.genre, data.correct, droppedLetter);
  }

  return false;
}

// Handle correct match
function handleCorrectMatch(genreName, letter) {
  gameState.placedGenres[letter] = genreName;
  gameState.correctMatches++;

  // Show feedback
  showFeedback('✓ ¡Correcto!', 'correct');

  // Update UI
  renderGenres();
  renderDefinitions();
  updateProgress();

  // Check if game is complete
  if (gameState.correctMatches === 10) {
    setTimeout(() => {
      showFeedback('🎉 ¡Felicidades! ¡Completaste todos los géneros!', 'correct');
      markActivityComplete(3);
    }, 500);
  }
}

// Handle incorrect match
function handleIncorrectMatch(genreName, correctLetter, droppedLetter) {
  // Find the correct definition text
  const correctDef = definitionsData.find(d => d.letter === correctLetter);
  const correctText = correctDef ? `La respuesta correcta es ${correctLetter}` : '';

  // Show feedback
  showFeedback(`✗ Incorrecto. ${correctText}`, 'incorrect');

  // Find the genre card and animate it
  setTimeout(() => {
    renderGenres();
  }, 600);
}

// Show feedback message
function showFeedback(message, type) {
  // Remove existing feedback
  const existing = document.querySelector('.feedback-message');
  if (existing) {
    existing.remove();
  }

  const feedback = document.createElement('div');
  feedback.className = `feedback-message ${type}`;
  feedback.textContent = message;
  document.body.appendChild(feedback);

  setTimeout(() => {
    feedback.remove();
  }, 2000);
}

// Update progress bar
function updateProgress() {
  const count = gameState.correctMatches;
  document.getElementById('correct-count').textContent = count;
  document.getElementById('progress-fill').style.width = `${(count / 10) * 100}%`;
}

// Reset game
function resetGame() {
  gameState = {
    correctMatches: 0,
    placedGenres: {}
  };

  renderGenres();
  renderDefinitions();
  updateProgress();

  showFeedback('🔄 Juego reiniciado', 'correct');
}

// SECTION 2: SECOND CONDITIONAL WITH DROPDOWNS
const conditionalsData = [
  { num: 1, sentence: "If I ___ you, I ___ a new job.", options1: ["were", "was", "would be"], correct1: "were", options2: ["get", "would get", "getting"], correct2: "would get" },
  { num: 2, sentence: "If he ___ younger, he ___ more.", options1: ["were", "was", "would be"], correct1: "were", options2: ["travel", "would travel", "traveling"], correct2: "would travel" },
  { num: 3, sentence: "If we ___ friends, I ___ angry with you.", options1: ["were", "were not", "was not"], correct1: "were not", options2: ["be", "would be", "am"], correct2: "would be" },
  { num: 4, sentence: "If I ___ enough money, I ___ a big house.", options1: ["have", "had", "would have"], correct1: "had", options2: ["buy", "would buy", "buying"], correct2: "would buy" },
  { num: 5, sentence: "If she ___ always so late, she ___ promoted.", options1: ["were", "were not", "was not"], correct1: "were not", options2: ["be", "would be", "is"], correct2: "would be" },
  { num: 6, sentence: "If we ___ the lottery, we ___ around the world.", options1: ["win", "won", "would win"], correct1: "won", options2: ["travel", "would travel", "traveling"], correct2: "would travel" },
  { num: 7, sentence: "If you ___ a better job, you ___ a new car.", options1: ["have", "had", "would have"], correct1: "had", options2: ["buy", "would buy", "buying"], correct2: "would buy" },
  { num: 8, sentence: "If I ___ perfect English, I ___ a good job.", options1: ["speak", "spoke", "would speak"], correct1: "spoke", options2: ["have", "would have", "having"], correct2: "would have" },
  { num: 9, sentence: "If we ___ in Mexico, I ___ Spanish.", options1: ["live", "lived", "would live"], correct1: "lived", options2: ["speak", "would speak", "speaking"], correct2: "would speak" },
  { num: 10, sentence: "If she ___ the exam, she ___ able to enter university.", options1: ["pass", "passed", "would pass"], correct1: "passed", options2: ["be", "would be", "is"], correct2: "would be" },
  { num: 11, sentence: "She ___ happier if she ___ more friends.", options1: ["be", "would be", "is"], correct1: "would be", options2: ["have", "had", "having"], correct2: "had" },
  { num: 12, sentence: "We ___ a house if we ___ to stay here.", options1: ["buy", "would buy", "buying"], correct1: "would buy", options2: ["decide", "decided", "will decide"], correct2: "decided" },
  { num: 13, sentence: "They ___ more money if they ___ so many clothes.", options1: ["have", "would have", "having"], correct1: "would have", options2: ["not buy", "did not buy", "don't buy"], correct2: "did not buy" },
  { num: 14, sentence: "We ___ to dinner if we ___ time.", options1: ["come", "would come", "coming"], correct1: "would come", options2: ["have", "had", "having"], correct2: "had" },
  { num: 15, sentence: "She ___ him if she ___ his number.", options1: ["call", "would call", "calling"], correct1: "would call", options2: ["know", "knew", "knowing"], correct2: "knew" },
  { num: 16, sentence: "They ___ to Spain if they ___ hot weather.", options1: ["go", "would go", "going"], correct1: "would go", options2: ["like", "liked", "liking"], correct2: "liked" },
  { num: 17, sentence: "She ___ the exam if she ___ more.", options1: ["pass", "would pass", "passing"], correct1: "would pass", options2: ["study", "studied", "studying"], correct2: "studied" },
  { num: 18, sentence: "I ___ someone famous if I ___ a movie star.", options1: ["marry", "would marry", "marrying"], correct1: "would marry", options2: ["were", "was", "am"], correct2: "were" }
];

let conditionalState = { correct: 0, checked: {} };

function initConditional() {
  const sentencesContainer = document.getElementById('conditional-sentences');
  if (!sentencesContainer) return;
  
  sentencesContainer.innerHTML = '';

  conditionalsData.forEach(item => {
    const sentenceDiv = document.createElement('div');
    sentenceDiv.className = 'conditional-sentence-box';
    sentenceDiv.dataset.num = item.num;
    
    const parts = item.sentence.split('___');
    const p = document.createElement('p');
    p.innerHTML = `<strong>${item.num}.</strong> ${parts[0]}`;
    
    const select1 = createDropdown(item.num, 1, item.options1, item.correct1);
    p.appendChild(select1);
    p.innerHTML += parts[1];
    const select2 = createDropdown(item.num, 2, item.options2, item.correct2);
    p.appendChild(select2);
    p.innerHTML += parts[2] || '';
    
    sentenceDiv.appendChild(p);
    
    const checkBtn = document.createElement('button');
    checkBtn.className = 'check-btn';
    checkBtn.textContent = 'Check Answer';
    checkBtn.type = 'button';
    checkBtn.onclick = () => checkConditionalSentence(item.num);
    sentenceDiv.appendChild(checkBtn);
    
    sentencesContainer.appendChild(sentenceDiv);
  });
  
  updateConditionalProgress();
}

function createDropdown(sentenceNum, blankNum, options, correctAnswer) {
  const select = document.createElement('select');
  select.className = 'conditional-dropdown';
  select.dataset.sentence = sentenceNum;
  select.dataset.blank = blankNum;
  select.dataset.correct = correctAnswer;
  
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = '---';
  select.appendChild(defaultOption);
  
  options.forEach(opt => {
    const option = document.createElement('option');
    option.value = opt;
    option.textContent = opt;
    select.appendChild(option);
  });
  
  const key = `${sentenceNum}-${blankNum}`;
  if (conditionalState.checked[key]) {
    select.value = conditionalState.checked[key].value;
    select.classList.add(conditionalState.checked[key].isCorrect ? 'correct' : 'incorrect');
    select.disabled = conditionalState.checked[key].isCorrect;
  }
  
  return select;
}

function checkConditionalSentence(sentenceNum) {
  const select1 = document.querySelector(`.conditional-dropdown[data-sentence="${sentenceNum}"][data-blank="1"]`);
  const select2 = document.querySelector(`.conditional-dropdown[data-sentence="${sentenceNum}"][data-blank="2"]`);
  const sentenceDiv = document.querySelector(`.conditional-sentence-box[data-num="${sentenceNum}"]`);
  
  if (!select1.value || !select2.value) {
    showFeedback('Please select both options first', 'incorrect');
    return;
  }
  
  const correct1 = select1.value === select1.dataset.correct;
  const correct2 = select2.value === select2.dataset.correct;
  
  const key1 = `${sentenceNum}-1`;
  const key2 = `${sentenceNum}-2`;
  
  select1.classList.remove('correct', 'incorrect');
  select2.classList.remove('correct', 'incorrect');
  
  select1.classList.add(correct1 ? 'correct' : 'incorrect');
  select2.classList.add(correct2 ? 'correct' : 'incorrect');
  
  conditionalState.checked[key1] = { value: select1.value, isCorrect: correct1 };
  conditionalState.checked[key2] = { value: select2.value, isCorrect: correct2 };
  
  let existingFeedback = sentenceDiv.querySelector('.conditional-feedback');
  if (existingFeedback) {
    existingFeedback.remove();
  }
  
  const feedback = document.createElement('div');
  feedback.className = 'conditional-feedback';
  
  if (correct1 && correct2) {
    feedback.classList.add('correct');
    feedback.innerHTML = '✓ Correct! Both verbs are right.';
    sentenceDiv.classList.add('checked-correct');
    sentenceDiv.classList.remove('checked-incorrect');
    select1.disabled = true;
    select2.disabled = true;
    
    if (!conditionalState.checked[`completed-${sentenceNum}`]) {
      conditionalState.correct++;
      conditionalState.checked[`completed-${sentenceNum}`] = true;
      updateConditionalProgress();
      
      if (conditionalState.correct === 18) {
        setTimeout(() => {
          showFeedback('🎉 Perfect! All 18 sentences completed!', 'correct');
          markActivityComplete(6);
        }, 300);
      }
    }
  } else {
    feedback.classList.add('incorrect');
    const incorrectParts = [];
    if (!correct1) incorrectParts.push(`First blank should be "${select1.dataset.correct}"`);
    if (!correct2) incorrectParts.push(`Second blank should be "${select2.dataset.correct}"`);
    feedback.innerHTML = `✗ Incorrect. ${incorrectParts.join('. ')}.`;
    sentenceDiv.classList.add('checked-incorrect');
    sentenceDiv.classList.remove('checked-correct');
  }
  
  sentenceDiv.appendChild(feedback);
}

function updateConditionalProgress() {
  document.getElementById('conditional-correct').textContent = conditionalState.correct;
  document.getElementById('conditional-progress').style.width = `${(conditionalState.correct / 18) * 100}%`;
}

function resetConditional() {
  conditionalState = { correct: 0, checked: {} };
  document.getElementById('conditional-correct').textContent = '0';
  initConditional();
  showFeedback('🔄 Reset complete', 'correct');
}

// PAGE 7: LISTENING - Beauty Activity
const listening7Data = [
  {
    num: 1,
    question: "Frank thinks Hollywood actresses",
    options: ["a) are very different", "b) look the same", "c) are very beautiful"],
    correct: "b"
  },
  {
    num: 2,
    question: "Frank believes western ideas of beauty",
    options: ["a) are varied", "b) are restrictive", "c) are changing"],
    correct: "b"
  },
  {
    num: 3,
    question: "'jolie laide' is used to describe",
    options: ["a) a beautiful woman", "b) an ugly woman", "c) a kind of imperfect beauty"],
    correct: "c"
  },
  {
    num: 4,
    question: "Jane believes",
    options: ["a) people aren't always as beautiful as they seem", "b) everyone is beautiful", "c) beauty doesn't matter"],
    correct: "a"
  },
  {
    num: 5,
    question: "Frances believes being beautiful",
    options: ["a) can improve your life", "b) doesn't change anything", "c) makes life harder"],
    correct: "a"
  }
];

let listening7State = { checked: false, answers: {} };

function initListening7() {
  const container = document.getElementById('listening7-container');
  if (!container) return;
  
  container.innerHTML = '';
  listening7Data.forEach(q => {
    const div = document.createElement('div');
    div.className = 'listening-question';
    div.dataset.num = q.num;
    
    const title = document.createElement('h4');
    title.textContent = `${q.num}. ${q.question}`;
    div.appendChild(title);
    
    q.options.forEach(opt => {
      const optionDiv = document.createElement('div');
      optionDiv.className = 'radio-option';
      
      const letter = opt.charAt(0);
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = `listening7-q${q.num}`;
      radio.value = letter;
      radio.id = `listening7-q${q.num}-${letter}`;
      
      const label = document.createElement('label');
      label.htmlFor = radio.id;
      label.textContent = opt;
      label.style.cursor = 'pointer';
      label.style.flex = '1';
      
      optionDiv.appendChild(radio);
      optionDiv.appendChild(label);
      div.appendChild(optionDiv);
    });
    
    container.appendChild(div);
  });
  
  updateListening7Progress();
}

function checkListening7() {
  let correct = 0;
  
  listening7Data.forEach(q => {
    const selected = document.querySelector(`input[name="listening7-q${q.num}"]:checked`);
    const questionDiv = document.querySelector(`.listening-question[data-num="${q.num}"]`);
    const options = questionDiv.querySelectorAll('.radio-option');
    
    if (selected) {
      listening7State.answers[q.num] = selected.value;
      
      if (selected.value === q.correct) {
        questionDiv.classList.add('correct');
        questionDiv.classList.remove('incorrect');
        options.forEach(opt => {
          const radio = opt.querySelector('input');
          if (radio.value === q.correct) {
            opt.classList.add('correct');
          }
        });
        correct++;
      } else {
        questionDiv.classList.add('incorrect');
        questionDiv.classList.remove('correct');
        options.forEach(opt => {
          const radio = opt.querySelector('input');
          if (radio.value === selected.value) {
            opt.classList.add('incorrect');
          } else if (radio.value === q.correct) {
            opt.classList.add('correct');
          }
        });
      }
    }
  });
  
  listening7State.checked = true;
  document.getElementById('listening7-correct').textContent = correct;
  updateListening7Progress();
  
  if (correct === 5) {
    showFeedback('🎉 Perfect! All answers correct!', 'correct');
    markActivityComplete(7);
  } else {
    showFeedback(`${correct}/5 correct. Red shows your answer, green shows correct answers.`, 'incorrect');
  }
}

function updateListening7Progress() {
  const correct = parseInt(document.getElementById('listening7-correct').textContent) || 0;
  document.getElementById('listening7-progress').style.width = `${(correct / 5) * 100}%`;
}

function resetListening7() {
  listening7State = { checked: false, answers: {} };
  document.getElementById('listening7-correct').textContent = '0';
  initListening7();
  showFeedback('🔄 Reset complete', 'correct');
}

// PAGE 9: LISTENING - Films Activity
const listening9Data = [
  { film: "Ratatouille", rosy: true, jon: true },
  { film: "Tomb Raider", rosy: false, jon: true },
  { film: "Hancock", rosy: false, jon: true },
  { film: "Pirates of the Caribbean", rosy: true, jon: false },
  { film: "Quantum of Solace", rosy: false, jon: true }
];

let listening9State = { checked: false };

function initListening9() {
  const container = document.getElementById('listening9-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  const headerRow = document.createElement('div');
  headerRow.className = 'film-checkbox-row header';
  headerRow.innerHTML = '<div><strong>Film</strong></div><div><strong>Rosy</strong></div><div><strong>Jon</strong></div>';
  container.appendChild(headerRow);
  
  listening9Data.forEach((item, index) => {
    const row = document.createElement('div');
    row.className = 'film-checkbox-row';
    row.dataset.index = index;
    
    const filmName = document.createElement('div');
    filmName.textContent = item.film;
    row.appendChild(filmName);
    
    const rosyLabel = document.createElement('label');
    const rosyCheck = document.createElement('input');
    rosyCheck.type = 'checkbox';
    rosyCheck.name = `film${index}-rosy`;
    rosyLabel.appendChild(rosyCheck);
    row.appendChild(rosyLabel);
    
    const jonLabel = document.createElement('label');
    const jonCheck = document.createElement('input');
    jonCheck.type = 'checkbox';
    jonCheck.name = `film${index}-jon`;
    jonLabel.appendChild(jonCheck);
    row.appendChild(jonLabel);
    
    container.appendChild(row);
  });
}

function checkListening9() {
  let correct = 0;
  
  listening9Data.forEach((item, index) => {
    const rosyCheck = document.querySelector(`input[name="film${index}-rosy"]`);
    const jonCheck = document.querySelector(`input[name="film${index}-jon"]`);
    const row = document.querySelector(`.film-checkbox-row[data-index="${index}"]`);
    
    const rosyCorrect = rosyCheck.checked === item.rosy;
    const jonCorrect = jonCheck.checked === item.jon;
    
    if (rosyCorrect && jonCorrect) {
      row.style.borderColor = 'var(--color-success)';
      row.style.background = 'rgba(var(--color-success-rgb), 0.1)';
      correct += 2;
    } else {
      row.style.borderColor = 'var(--color-error)';
      row.style.background = 'rgba(var(--color-error-rgb), 0.1)';
      if (rosyCorrect) correct++;
      if (jonCorrect) correct++;
    }
  });
  
  listening9State.checked = true;
  document.getElementById('listening9-correct').textContent = correct;
  updateListening9Progress();
  
  if (correct === 10) {
    showFeedback('🎉 Perfect! All film choices correct!', 'correct');
    markActivityComplete(9);
  } else {
    showFeedback(`${correct}/10 correct in Activity 9.`, 'incorrect');
  }
}

// PAGE 9: SPEAKING Activity 10
const speaking10Data = [
  { num: 1, text: "I thought the film was [brilliant/crazy].", correct: "brilliant", options: ["brilliant", "crazy"] },
  { num: 2, text: "The special effects were [very good/bad].", correct: "very good", options: ["very good", "bad"] },
  { num: 3, text: "I think [Will Smith/Orlando Bloom] was the best actor.", correct: "Will Smith", options: ["Will Smith", "Orlando Bloom"] },
  { num: 4, text: "I've seen it [twice/three times].", correct: "twice", options: ["twice", "three times"] },
  { num: 5, text: "The plot was [bad/very good].", correct: "bad", options: ["bad", "very good"] },
  { num: 6, text: "The ending was [very good/bad].", correct: "very good", options: ["very good", "bad"] }
];

let speaking10State = { checked: false, correct: 0 };

function initSpeaking10() {
  const container = document.getElementById('speaking10-container');
  if (!container) return;
  
  container.innerHTML = '';
  speaking10Data.forEach(q => {
    const div = document.createElement('div');
    div.className = 'speaking-choice';
    div.dataset.num = q.num;
    
    const p = document.createElement('p');
    const parts = q.text.split('[');
    const choices = parts[1].split(']')[0].split('/');
    
    p.innerHTML = `<strong>${q.num}.</strong> ${parts[0]}`;
    
    const wordChoice = document.createElement('span');
    wordChoice.className = 'word-choice';
    
    choices.forEach(choice => {
      const label = document.createElement('label');
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = `speaking10-q${q.num}`;
      radio.value = choice;
      label.appendChild(radio);
      label.appendChild(document.createTextNode(` ${choice}`));
      wordChoice.appendChild(label);
    });
    
    p.appendChild(wordChoice);
    p.innerHTML += parts[1].split(']')[1];
    div.appendChild(p);
    
    container.appendChild(div);
  });
}

function checkSpeaking10() {
  let correct = 0;
  
  speaking10Data.forEach(q => {
    const selected = document.querySelector(`input[name="speaking10-q${q.num}"]:checked`);
    const questionDiv = document.querySelector(`.speaking-choice[data-num="${q.num}"]`);
    
    if (selected) {
      if (selected.value === q.correct) {
        questionDiv.classList.add('correct');
        questionDiv.classList.remove('incorrect');
        correct++;
      } else {
        questionDiv.classList.add('incorrect');
        questionDiv.classList.remove('correct');
      }
    }
  });
  
  speaking10State.checked = true;
  speaking10State.correct = correct;
  const listening9Correct = listening9State.checked ? parseInt(document.querySelector('.film-checkbox-row:not(.header)')?.parentElement.querySelectorAll('.film-checkbox-row').length) * 2 || 0 : 0;
  const totalCorrect = (listening9State.checked ? 10 : 0) + correct;
  document.getElementById('listening9-correct').textContent = totalCorrect;
  updateListening9Progress();
  
  if (correct === 6) {
    showFeedback('🎉 Perfect! All speaking choices correct!', 'correct');
  } else {
    showFeedback(`${correct}/6 correct in Activity 10.`, 'incorrect');
  }
}

function updateListening9Progress() {
  const correct = parseInt(document.getElementById('listening9-correct').textContent) || 0;
  document.getElementById('listening9-progress').style.width = `${(correct / 10) * 100}%`;
}

function resetListening9() {
  listening9State = { checked: false };
  document.getElementById('listening9-correct').textContent = '0';
  initListening9();
  updateListening9Progress();
  showFeedback('🔄 Reset complete', 'correct');
}

// SECTION 3: PEOPLE IN FILMS
const peopleData = [
  { num: 1, role: "an actor/actress", correct: "e" },
  { num: 2, role: "a film director", correct: "c" },
  { num: 3, role: "a composer", correct: "d" },
  { num: 4, role: "a critic", correct: "b" },
  { num: 5, role: "a character", correct: "a" }
];

const peopleDefs = [
  { letter: "a", text: "a person in a film, book or story" },
  { letter: "b", text: "a person who gives a professional opinion about a film" },
  { letter: "c", text: "a person who tells the actors in a film what to do" },
  { letter: "d", text: "a person who writes music" },
  { letter: "e", text: "someone who stars in a film" }
];

const peopleSentences = [
  { num: 1, text: "An ___ is someone who stars in a film.", correct: "actor/actress" },
  { num: 2, text: "A ___ is a person who tells the actors in a film what to do.", correct: "film director" },
  { num: 3, text: "A ___ is a person who writes music.", correct: "composer" },
  { num: 4, text: "A ___ is a person who gives a professional opinion about a film.", correct: "critic" },
  { num: 5, text: "A ___ is a person in a film, book or story.", correct: "character" }
];

let peopleState = { matches: {}, sentencesCorrect: 0 };

function initPeople() {
  const rolesList = document.getElementById('roles-list');
  const defsList = document.getElementById('definitions-people-list');
  const sentencesList = document.getElementById('people-sentences-list');
  
  rolesList.innerHTML = '<h4 style="margin-bottom: 12px;">Match these:</h4>';
  defsList.innerHTML = '<h4 style="margin-bottom: 12px;">With these:</h4>';
  sentencesList.innerHTML = '';
  
  peopleData.forEach(p => {
    const card = document.createElement('div');
    card.className = 'role-card';
    card.textContent = `${p.num}. ${p.role}`;
    card.dataset.role = p.role;
    card.dataset.correct = p.correct;
    if (peopleState.matches[p.role]) {
      card.classList.add('matched');
      card.textContent += ` → ${peopleState.matches[p.role]}`;
    }
    card.onclick = () => selectRole(p.role, p.correct);
    rolesList.appendChild(card);
  });
  
  peopleDefs.forEach(d => {
    const card = document.createElement('div');
    card.className = 'def-card';
    card.textContent = `${d.letter}. ${d.text}`;
    card.dataset.letter = d.letter;
    if (Object.values(peopleState.matches).includes(d.letter)) {
      card.classList.add('matched');
    }
    card.onclick = () => selectDef(d.letter);
    defsList.appendChild(card);
  });
  
  peopleSentences.forEach(s => {
    const box = document.createElement('div');
    box.className = 'people-sentence-box';
    box.innerHTML = `<p>${s.num}. ${s.text.replace('___', '<strong>___</strong>')}</p>`;
    
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Type your answer...';
    input.dataset.correct = s.correct;
    input.dataset.num = s.num;
    input.onblur = () => checkPeopleSentence(s.num, input.value.trim(), s.correct, box);
    box.appendChild(input);
    
    sentencesList.appendChild(box);
  });
  
  updatePeopleProgress();
}

let selectedRole = null;
let selectedCorrect = null;

function selectRole(role, correct) {
  if (peopleState.matches[role]) return;
  selectedRole = role;
  selectedCorrect = correct;
}

function selectDef(letter) {
  if (!selectedRole) {
    showFeedback('Select a role first', 'incorrect');
    return;
  }
  
  if (Object.values(peopleState.matches).includes(letter)) {
    showFeedback('This definition is already matched', 'incorrect');
    return;
  }
  
  if (letter === selectedCorrect) {
    peopleState.matches[selectedRole] = letter;
    showFeedback('✓ Correct match!', 'correct');
    initPeople();
  } else {
    showFeedback('✗ Incorrect. Try again!', 'incorrect');
  }
  
  selectedRole = null;
  selectedCorrect = null;
}

function checkPeopleSentence(num, answer, correct, box) {
  const normalizedAnswer = answer.toLowerCase().trim();
  const normalizedCorrect = correct.toLowerCase().trim();
  
  if (normalizedAnswer === normalizedCorrect) {
    box.classList.add('correct');
    box.classList.remove('incorrect');
    peopleState.sentencesCorrect++;
    updatePeopleProgress();
    showFeedback('✓ Correct!', 'correct');
  } else if (normalizedAnswer !== '') {
    box.classList.add('incorrect');
    box.classList.remove('correct');
    showFeedback(`✗ Incorrect. The correct answer is: ${correct}`, 'incorrect');
  }
}

function updatePeopleProgress() {
  const total = Object.keys(peopleState.matches).length + peopleState.sentencesCorrect;
  document.getElementById('people-correct').textContent = total;
  document.getElementById('people-progress').style.width = `${(total / 10) * 100}%`;
  if (total === 10) {
    markActivityComplete(8);
  }
}

function resetPeople() {
  peopleState = { matches: {}, sentencesCorrect: 0 };
  selectedRole = null;
  selectedCorrect = null;
  initPeople();
  showFeedback('🔄 Reset complete', 'correct');
}

// PAGE 11: HARRY POTTER with Image Upload
function initImageUpload() {
  const imageInput = document.getElementById('potter-image');
  const imagePreview = document.getElementById('image-preview');
  
  if (!imageInput || !imagePreview) return;
  
  // Image is pre-loaded in HTML, so we don't add 'empty' class
  // Just set up the change handler for optional new upload
  
  imageInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = function(event) {
        imagePreview.classList.remove('empty');
        imagePreview.innerHTML = `<img src="${event.target.result}" alt="Movie poster" style="max-width: 100%; max-height: 400px; object-fit: contain;">`;
      };
      reader.readAsDataURL(file);
    }
  });
}

// SECTION 4: HARRY POTTER
const potterQuestions = [
  { id: 'title', label: 'Title', type: 'text', correct: 'Harry Potter and the Chamber of Secrets', factual: true },
  { id: 'genre', label: 'Genre', type: 'text', correct: 'Fantasy/Adventure', factual: true },
  { id: 'actors', label: 'Main actors', type: 'text', correct: 'Daniel Radcliffe, Emma Watson, Rupert Grint', factual: true },
  { id: 'release', label: 'Release date', type: 'text', correct: '2002', factual: true },
  { id: 'setting', label: 'Setting (Where does it take place?)', type: 'textarea', correct: 'Hogwarts School of Witchcraft and Wizardry', factual: true },
  { id: 'based', label: 'Based on', type: 'text', correct: 'J.K. Rowling novel', factual: true },
  { id: 'opinion', label: 'Your opinion about the film', type: 'textarea', correct: '', factual: false },
  { id: 'recommendation', label: 'Would you recommend it? Why?', type: 'textarea', correct: '', factual: false }
];

function initPotter() {
  const form = document.getElementById('potter-form');
  form.innerHTML = '<h3 style="margin-bottom: 20px;">Complete the Harry Potter Review</h3>';
  
  potterQuestions.forEach(q => {
    const field = document.createElement('div');
    field.className = 'form-field';
    field.dataset.id = q.id;
    
    const label = document.createElement('label');
    label.textContent = q.label;
    field.appendChild(label);
    
    let input;
    if (q.type === 'textarea') {
      input = document.createElement('textarea');
    } else {
      input = document.createElement('input');
      input.type = 'text';
    }
    input.name = q.id;
    input.placeholder = q.factual ? 'Type your answer...' : 'Share your thoughts...';
    input.dataset.correct = q.correct;
    input.dataset.factual = q.factual;
    field.appendChild(input);
    
    form.appendChild(field);
  });
  
  const submitBtn = document.createElement('button');
  submitBtn.className = 'submit-btn';
  submitBtn.type = 'button';
  submitBtn.textContent = 'Submit Review';
  submitBtn.onclick = checkPotter;
  form.appendChild(submitBtn);
}

function checkPotter() {
  const form = document.getElementById('potter-form');
  let allCorrect = true;
  
  potterQuestions.forEach(q => {
    const field = form.querySelector(`.form-field[data-id="${q.id}"]`);
    const input = field.querySelector('input, textarea');
    const answer = input.value.trim();
    
    if (q.factual) {
      const normalizedAnswer = answer.toLowerCase();
      const normalizedCorrect = q.correct.toLowerCase();
      
      if (normalizedAnswer.includes(normalizedCorrect.split('/')[0].toLowerCase()) || 
          (normalizedCorrect.includes('/') && normalizedAnswer.includes(normalizedCorrect.split('/')[1].toLowerCase()))) {
        field.classList.add('correct');
        field.classList.remove('incorrect');
      } else {
        field.classList.add('incorrect');
        field.classList.remove('correct');
        allCorrect = false;
      }
    } else {
      if (answer.length > 10) {
        field.classList.add('correct');
        field.classList.remove('incorrect');
      } else {
        field.classList.add('incorrect');
        field.classList.remove('correct');
        allCorrect = false;
      }
    }
  });
  
  if (allCorrect) {
    showFeedback('🎉 Great review! All correct!', 'correct');
    markActivityComplete(11);
  } else {
    showFeedback('Some answers need correction. Check the highlighted fields.', 'incorrect');
  }
}

function resetPotter() {
  initPotter();
  showFeedback('🔄 Reset complete', 'correct');
}

// SECTION 5: REVIEWS & SKYFALL
function initReviews() {
  const container = document.getElementById('reviews-container');
  container.innerHTML = `
    <h3>Skyfall Review - Fill in the gaps</h3>
    <p class="review-text">
      Skyfall is the ${createGapSpan(1, 'twenty-third')} James Bond film. In the film, Bond investigates an attack on MI6; 
      the attack is part of a ${createGapSpan(2, 'plot')} by Raoul Silva to ${createGapSpan(3, 'kill')} M. The film is the 
      ${createGapSpan(4, 'third')} to star Daniel Craig as Bond and features Javier Bardem as Silva. The film was ${createGapSpan(5, 'directed')} 
      by Sam Mendes and written by Neal Purvis. Skyfall was the ${createGapSpan(6, 'first')} Bond film to be shot in digital 
      ${createGapSpan(7, 'format')}, and premiered on 23 October 2012. The film's ${createGapSpan(8, 'release')} coincided with the 
      50th anniversary of the Bond ${createGapSpan(9, 'series')}. Skyfall received ${createGapSpan(10, 'positive')} reviews with praise for Mendes' 
      ${createGapSpan(11, 'direction')} and the ${createGapSpan(12, 'performances')} of the cast.
    </p>
    <button class="check-btn" onclick="checkReviews()" style="width: 100%; margin-top: 20px;">Check Answers</button>
  `;
  updateReviewsProgress();
}

function createGapSpan(num, correct) {
  return `<span class="gap-input" data-num="${num}" data-correct="${correct}" contenteditable="true"></span>`;
}

function checkReviews() {
  let correct = 0;
  for (let i = 1; i <= 12; i++) {
    const gap = document.querySelector(`.gap-input[data-num="${i}"]`);
    const answer = gap.textContent.trim().toLowerCase();
    const correctAnswer = gap.dataset.correct.toLowerCase();
    
    if (answer === correctAnswer) {
      gap.classList.add('correct');
      gap.classList.remove('incorrect');
      correct++;
    } else {
      gap.classList.add('incorrect');
      gap.classList.remove('correct');
    }
  }
  
  document.getElementById('reviews-correct').textContent = correct;
  updateReviewsProgress();
  
  if (correct === 12) {
    showFeedback('🎉 Perfect! All answers correct!', 'correct');
  } else {
    showFeedback(`${correct}/12 correct. Keep trying!`, 'incorrect');
  }
}

function updateReviewsProgress() {
  const correct = parseInt(document.getElementById('reviews-correct').textContent) || 0;
  document.getElementById('reviews-progress').style.width = `${(correct / 22) * 100}%`;
}

function resetReviews() {
  document.getElementById('reviews-correct').textContent = '0';
  initReviews();
  showFeedback('🔄 Reset complete', 'correct');
}

// SECTION 6: POLLUTION
function initPollution() {
  const container = document.getElementById('pollution-container');
  container.innerHTML = `
    <h3 style="margin-bottom: 20px;">Pollution &amp; Environment Activities</h3>
    
    <div class="pollution-question">
      <h3>1. What is pollution?</h3>
      <textarea placeholder="Write your definition..." rows="3"></textarea>
    </div>
    
    <div class="pollution-question">
      <h3>2. Types of pollution (list at least 3)</h3>
      <textarea placeholder="Air, Water, Soil..." rows="3"></textarea>
    </div>
    
    <div class="pollution-question">
      <h3>3. Main causes of air pollution</h3>
      <label><input type="checkbox" value="vehicles"> Vehicle emissions</label>
      <label><input type="checkbox" value="factories"> Industrial factories</label>
      <label><input type="checkbox" value="burning"> Burning fossil fuels</label>
      <label><input type="checkbox" value="deforestation"> Deforestation</label>
    </div>
    
    <div class="pollution-question">
      <h3>4. Effects of pollution on health</h3>
      <textarea placeholder="Respiratory problems, diseases..." rows="3"></textarea>
    </div>
    
    <div class="pollution-question">
      <h3>5. Ways to reduce pollution (list at least 3)</h3>
      <textarea placeholder="Use public transport, recycle, plant trees..." rows="4"></textarea>
    </div>
    
    <div class="pollution-question">
      <h3>6. Active or Passive Voice?</h3>
      <p><strong>a)</strong> People pollute the environment. <select><option value="">Select</option><option value="active">Active</option><option value="passive">Passive</option></select></p>
      <p><strong>b)</strong> The environment is polluted by people. <select><option value="">Select</option><option value="active">Active</option><option value="passive">Passive</option></select></p>
      <p><strong>c)</strong> Factories produce toxic waste. <select><option value="">Select</option><option value="active">Active</option><option value="passive">Passive</option></select></p>
      <p><strong>d)</strong> Toxic waste is produced by factories. <select><option value="">Select</option><option value="active">Active</option><option value="passive">Passive</option></select></p>
    </div>
    
    <button class="submit-btn" onclick="checkPollution()">Submit Answers</button>
  `;
}

function checkPollution() {
  showFeedback('✓ Great work! Your answers have been recorded.', 'correct');
}

function resetPollution() {
  initPollution();
  showFeedback('🔄 Reset complete', 'correct');
}

// ACTIVITY 4: Describe a Film
const activity4Data = [
  { id: 1, question: "What kind of film is it?", answer: "b. It's an action film.", correct: "b" },
  { id: 2, question: "Where is it set?", answer: "c. It's set in Mexico and London.", correct: "c" },
  { id: 3, question: "Who's in it?", answer: "d. It stars Daniel Craig.", correct: "d" },
  { id: 4, question: "When did it come out?", answer: "a. It came out in October 2015.", correct: "a" }
];

let activity4State = { selected: null, matched: [], correct: 0 };

function initActivity4() {
  const qContainer = document.getElementById('act4-questions');
  const aContainer = document.getElementById('act4-answers');
  
  if (!qContainer || !aContainer) return;
  
  qContainer.innerHTML = '';
  aContainer.innerHTML = '';
  
  activity4Data.forEach(item => {
    const qDiv = document.createElement('div');
    qDiv.className = 'role-card';
    qDiv.textContent = `${item.id}. ${item.question}`;
    qDiv.dataset.id = item.id;
    if (activity4State.matched.includes(item.id)) {
      qDiv.classList.add('matched');
    }
    qDiv.onclick = () => selectQuestion4(item.id);
    qContainer.appendChild(qDiv);
    
    const aDiv = document.createElement('div');
    aDiv.className = 'def-card';
    aDiv.textContent = item.answer;
    aDiv.dataset.correct = item.correct;
    if (activity4State.matched.includes(item.id)) {
      aDiv.classList.add('matched');
    }
    aDiv.onclick = () => selectAnswer4(item.id, item.correct);
    aContainer.appendChild(aDiv);
  });
  
  updateActivity4Progress();
}

let selected4Question = null;

function selectQuestion4(id) {
  if (activity4State.matched.includes(id)) return;
  selected4Question = id;
}

function selectAnswer4(id, correct) {
  if (!selected4Question) {
    showFeedback('Select a question first', 'incorrect');
    return;
  }
  
  if (activity4State.matched.includes(id)) {
    showFeedback('Already matched', 'incorrect');
    return;
  }
  
  if (selected4Question === id) {
    activity4State.matched.push(id);
    activity4State.correct++;
    showFeedback('✓ Correct!', 'correct');
    initActivity4();
    if (activity4State.correct === 4) {
      markActivityComplete(4);
    }
  } else {
    showFeedback('✗ Incorrect. Try again!', 'incorrect');
  }
  
  selected4Question = null;
}

function updateActivity4Progress() {
  const el = document.getElementById('act4-correct');
  const bar = document.getElementById('act4-progress');
  if (el) el.textContent = activity4State.correct;
  if (bar) bar.style.width = `${(activity4State.correct / 4) * 100}%`;
}

function resetActivity4() {
  activity4State = { selected: null, matched: [], correct: 0 };
  selected4Question = null;
  initActivity4();
  showFeedback('🔄 Reset', 'correct');
}



// ACTIVITY 10: Speaking Circle Correct (standalone)
let activity10State = { answered: 0, correct: 0 };

function initActivity10() {
  const container = document.getElementById('act10-container');
  if (!container) return;
  
  const questions = [
    { q: "Remy was", options: ["brilliant", "crazy"], correct: "brilliant" },
    { q: "Effects in Tomb Raider were", options: ["very good", "bad"], correct: "very good" },
    { q: "Jon's favorite actor is", options: ["Orlando Bloom", "Will Smith"], correct: "Will Smith" },
    { q: "Rosy seen Pirates", options: ["three times", "twice"], correct: "twice" },
    { q: "Rosy thinks Bond films are", options: ["good", "bad"], correct: "bad" },
    { q: "Jon thinks Bond films are", options: ["very good", "bad"], correct: "very good" }
  ];
  
  container.innerHTML = '';
  
  questions.forEach((item, idx) => {
    const div = document.createElement('div');
    div.className = 'speaking-choice';
    div.dataset.num = idx + 1;
    div.innerHTML = `<p><strong>${idx + 1}. ${item.q}:</strong></p>`;
    
    const btnGroup = document.createElement('div');
    btnGroup.style.display = 'flex';
    btnGroup.style.gap = '12px';
    btnGroup.style.marginTop = '8px';
    
    item.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'check-btn';
      btn.textContent = opt;
      btn.dataset.answer = opt;
      btn.dataset.correct = item.correct;
      btn.dataset.qnum = idx;
      btn.onclick = function() {
        if (this.disabled) return;
        const isCorrect = this.dataset.answer === this.dataset.correct;
        div.classList.add(isCorrect ? 'correct' : 'incorrect');
        if (isCorrect) {
          activity10State.correct++;
          document.getElementById('act10-correct').textContent = activity10State.correct;
          updateActivity10Progress();
          showFeedback('✓ Correct!', 'correct');
          if (activity10State.correct === 6) markActivityComplete(10);
        } else {
          showFeedback(`✗ Incorrect. Correct: ${this.dataset.correct}`, 'incorrect');
        }
        btnGroup.querySelectorAll('button').forEach(b => b.disabled = true);
      };
      btnGroup.appendChild(btn);
    });
    
    div.appendChild(btnGroup);
    container.appendChild(div);
  });
}

function updateActivity10Progress() {
  const bar = document.getElementById('act10-progress');
  const count = parseInt(document.getElementById('act10-correct').textContent);
  if (bar) bar.style.width = `${(count / 6) * 100}%`;
}

function resetActivity10() {
  activity10State = { answered: 0, correct: 0 };
  document.getElementById('act10-correct').textContent = '0';
  initActivity10();
  updateActivity10Progress();
  showFeedback('🔄 Reset', 'correct');
}

function checkActivity10() {
  showFeedback('Check each question individually', 'correct');
}

// ACTIVITY 12: Cinema Vocabulary
const activity12Data = [
  { id: 1, label: "a box office", placeholder: "box office" },
  { id: 2, label: "a projector", placeholder: "projector" },
  { id: 3, label: "a screen", placeholder: "screen" },
  { id: 4, label: "a seat", placeholder: "seat" },
  { id: 5, label: "a ticket", placeholder: "ticket" },
  { id: 6, label: "popcorn", placeholder: "popcorn" }
];

let activity12State = { correct: 0 };

function initActivity12() {
  const container = document.getElementById('act12-container');
  if (!container) return;
  
  container.innerHTML = '<h3>Label the cinema items (type the word):</h3>';
  
  activity12Data.forEach(item => {
    const div = document.createElement('div');
    div.className = 'form-field';
    div.innerHTML = `
      <label>${item.id}. Type the label:</label>
      <input type="text" placeholder="${item.placeholder}" data-correct="${item.placeholder}" data-id="${item.id}">
    `;
    
    const input = div.querySelector('input');
    input.onblur = function() {
      if (this.value.trim().toLowerCase() === this.dataset.correct.toLowerCase()) {
        div.classList.add('correct');
        div.classList.remove('incorrect');
        activity12State.correct++;
        showFeedback('✓ Correct!', 'correct');
        if (activity12State.correct === 6) {
          markActivityComplete(12);
        }
      } else if (this.value.trim() !== '') {
        div.classList.add('incorrect');
        div.classList.remove('correct');
        showFeedback(`✗ Try again. Hint: ${this.dataset.correct}`, 'incorrect');
      }
    };
    
    container.appendChild(div);
  });
}

function resetActivity12() {
  activity12State = { correct: 0 };
  initActivity12();
  showFeedback('🔄 Reset', 'correct');
}

// ACTIVITY 13: Create Film List
function initActivity13() {
  const container = document.getElementById('act13-container');
  if (!container) return;
  
  const genres = ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Science Fiction'];
  
  container.innerHTML = '<p style="margin-bottom: 20px;">Write one film example for each genre:</p>';
  
  genres.forEach((genre, idx) => {
    const div = document.createElement('div');
    div.className = 'form-field';
    div.innerHTML = `
      <label>${idx + 1}. ${genre} film:</label>
      <input type="text" placeholder="e.g., The Expendables is an action film">
    `;
    container.appendChild(div);
  });
}

function checkActivity13() {
  const inputs = document.querySelectorAll('#act13-container input');
  let allFilled = true;

  inputs.forEach(input => {
    if (input.value.trim().split(' ').length >= 4) {
      input.parentElement.classList.add('correct');
      input.parentElement.classList.remove('incorrect');
    } else {
      allFilled = false;
      input.parentElement.classList.add('incorrect');
      input.parentElement.classList.remove('correct');
    }
  });

  if (allFilled) {
    showFeedback('✓ Great list!', 'correct');
    markActivityComplete(13);
  } else {
    showFeedback('Please write a full sentence for each genre.', 'incorrect');
  }
}

function resetActivity13() {
  initActivity13();
  showFeedback('🔄 Reset', 'correct');
}

// ACTIVITY 14: Electric Cars
const activity14Data = [
  { q: "Today, most cars are powered by:", options: ["Gasoline", "Electricity", "Solar"], correct: "Gasoline" },
  { q: "Electric cars are:", options: ["a new invention", "an old invention"], correct: "an old invention" },
  { q: "It's better for the environment to have:", options: ["electric cars", "gasoline cars"], correct: "electric cars" }
];

let activity14State = { correct: 0 };

function initActivity14() {
  const container = document.getElementById('act14-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  activity14Data.forEach((item, idx) => {
    const div = document.createElement('div');
    div.className = 'listening-question';
    div.innerHTML = `<h4>${idx + 1}. ${item.q}</h4>`;
    
    item.options.forEach(opt => {
      const optDiv = document.createElement('div');
      optDiv.className = 'radio-option';
      optDiv.innerHTML = `
        <input type="radio" name="act14-q${idx}" value="${opt}" id="act14-q${idx}-${opt}">
        <label for="act14-q${idx}-${opt}">${opt}</label>
      `;
      div.appendChild(optDiv);
    });
    
    container.appendChild(div);
  });
  
  updateActivity14Progress();
}

function checkActivity14() {
  let correct = 0;
  
  activity14Data.forEach((item, idx) => {
    const selected = document.querySelector(`input[name="act14-q${idx}"]:checked`);
    const div = document.querySelectorAll('.listening-question')[idx];
    
    if (selected && selected.value === item.correct) {
      div.classList.add('correct');
      correct++;
    } else if (selected) {
      div.classList.add('incorrect');
    }
  });
  
  activity14State.correct = correct;
  document.getElementById('act14-correct').textContent = correct;
  updateActivity14Progress();
  
  if (correct === 3) {
    showFeedback('🎉 Perfect!', 'correct');
    markActivityComplete(14);
  } else {
    showFeedback(`${correct}/3 correct`, 'incorrect');
  }
}

function updateActivity14Progress() {
  const bar = document.getElementById('act14-progress');
  if (bar) bar.style.width = `${(activity14State.correct / 3) * 100}%`;
}

function resetActivity14() {
  activity14State = { correct: 0 };
  document.getElementById('act14-correct').textContent = '0';
  initActivity14();
  showFeedback('🔄 Reset', 'correct');
}

// ACTIVITY 15: Reading Match Topics
const activity15Data = [
  { id: 'b', text: "In recent years there has been a lot of discussion about the future of cars which use oil products.", para: 1 },
  { id: 'd', text: "Electric cars are vehicles that are powered by an electric motor.", para: 2 },
  { id: 'a', text: "Electric cars are mechanically simpler compared to gasoline cars.", para: 3 }
];

let activity15State = { matched: [], correct: 0 };

function initActivity15() {
  const container = document.getElementById('act15-container');
  if (!container) return;
  
  container.innerHTML = '<p style="margin-bottom: 16px;">Match topic sentences to paragraphs (click to match):</p>';
  
  const sentences = [
    { id: 'a', text: "Electric cars are mechanically simpler compared to gasoline cars." },
    { id: 'b', text: "In recent years there has been a lot of discussion about the future of cars which use oil products." },
    { id: 'c', text: "One of the main problems with electric cars is that they cannot go very far before they need to be recharged." },
    { id: 'd', text: "Electric cars are vehicles that are powered by an electric motor." },
    { id: 'e', text: "Now it might appear that electric cars are the answer to all environment problems but that is far from the truth." }
  ];
  
  sentences.forEach(s => {
    const div = document.createElement('div');
    div.className = 'role-card';
    div.textContent = `${s.id}. ${s.text}`;
    div.dataset.id = s.id;
    
    if (activity15State.matched.includes(s.id)) {
      div.classList.add('matched');
    } else {
      div.onclick = () => {
        const correctMatch = activity15Data.find(item => item.id === s.id);
        if (correctMatch) {
          activity15State.matched.push(s.id);
          activity15State.correct++;
          showFeedback(`✓ Matches paragraph ${correctMatch.para}`, 'correct');
          initActivity15();
          if (activity15State.correct === 3) {
            markActivityComplete(15);
          }
        } else {
          showFeedback('This sentence is not used', 'incorrect');
        }
      };
    }
    
    container.appendChild(div);
  });
  
  updateActivity15Progress();
}

function updateActivity15Progress() {
  const el = document.getElementById('act15-correct');
  const bar = document.getElementById('act15-progress');
  if (el) el.textContent = activity15State.correct;
  if (bar) bar.style.width = `${(activity15State.correct / 3) * 100}%`;
}

function resetActivity15() {
  activity15State = { matched: [], correct: 0 };
  initActivity15();
  showFeedback('🔄 Reset', 'correct');
}

// ACTIVITY 16: Skyfall Review
const activity16Words = ['film', 'boring', 'script', 'actions', 'locations', 'acting', 'song', 'long', 'scenes', 'worst', 'last', 'recommend'];
const activity16Answers = ['film', 'script', 'acting', 'scenes', 'locations', 'actions', 'song', 'long', 'boring', 'worst', 'last', 'recommend'];

let activity16State = { correct: 0 };

function initActivity16() {
  const container = document.getElementById('act16-container');
  if (!container) return;
  
  container.innerHTML = `
    <p style="margin-bottom: 16px;">Fill the gaps with these words:</p>
    <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; padding: 12px; background: var(--color-bg-1); border-radius: 8px;">
      ${activity16Words.map(w => `<span style="padding: 4px 12px; background: var(--color-primary); color: #ffffff; border-radius: 4px; font-size: 13px;">${w}</span>`).join('')}
    </div>
    <div style="line-height: 2;">
      <p>I thought Skyfall was a great <input type="text" class="gap16" data-num="1" data-correct="film" placeholder="___" style="width: 100px;">. 
      The <input type="text" class="gap16" data-num="2" data-correct="script" placeholder="___" style="width: 100px;"> was well written and the 
      <input type="text" class="gap16" data-num="3" data-correct="acting" placeholder="___" style="width: 100px;"> was excellent. The action 
      <input type="text" class="gap16" data-num="4" data-correct="scenes" placeholder="___" style="width: 100px;"> were amazing and the 
      <input type="text" class="gap16" data-num="5" data-correct="locations" placeholder="___" style="width: 100px;"> were beautiful. The 
      <input type="text" class="gap16" data-num="6" data-correct="actions" placeholder="___" style="width: 100px;"> sequences were thrilling. The theme 
      <input type="text" class="gap16" data-num="7" data-correct="song" placeholder="___" style="width: 100px;"> was fantastic. The film wasn't too 
      <input type="text" class="gap16" data-num="8" data-correct="long" placeholder="___" style="width: 100px;"> and never 
      <input type="text" class="gap16" data-num="9" data-correct="boring" placeholder="___" style="width: 100px;">. It's one of the 
      <input type="text" class="gap16" data-num="10" data-correct="worst" placeholder="___" style="width: 100px;"> Bond films - just kidding, one of the 
      <input type="text" class="gap16" data-num="11" data-correct="last" placeholder="___" style="width: 100px;"> great ones. I highly 
      <input type="text" class="gap16" data-num="12" data-correct="recommend" placeholder="___" style="width: 100px;"> it!</p>
    </div>
  `;
  
  updateActivity16Progress();
}

function checkActivity16() {
  let correct = 0;
  const inputs = document.querySelectorAll('.gap16');
  
  inputs.forEach(input => {
    const answer = input.value.trim().toLowerCase();
    const correctAnswer = input.dataset.correct.toLowerCase();
    
    if (answer === correctAnswer) {
      input.style.borderColor = 'var(--color-success)';
      input.style.background = 'rgba(var(--color-success-rgb), 0.1)';
      correct++;
    } else if (answer !== '') {
      input.style.borderColor = 'var(--color-error)';
      input.style.background = 'rgba(var(--color-error-rgb), 0.1)';
    }
  });
  
  activity16State.correct = correct;
  document.getElementById('act16-correct').textContent = correct;
  updateActivity16Progress();
  
  if (correct === 12) {
    showFeedback('🎉 Perfect!', 'correct');
    markActivityComplete(16);
  } else {
    showFeedback(`${correct}/12 correct`, 'incorrect');
  }
}

function updateActivity16Progress() {
  const bar = document.getElementById('act16-progress');
  if (bar) bar.style.width = `${(activity16State.correct / 12) * 100}%`;
}

function resetActivity16() {
  activity16State = { correct: 0 };
  document.getElementById('act16-correct').textContent = '0';
  initActivity16();
  showFeedback('🔄 Reset', 'correct');
}

// ACTIVITY 17: Pollution Reading
const activity17Questions = [
  { q: "What is the biggest enemy of the environment?", a: "Pollution" },
  { q: "What are the causes of pollution?", a: "Emissions from industries, engines, aerosols" },
  { q: "What's wrong with aerosols?", a: "Bad effects on ozone layer" },
  { q: "What is the function of the Ozone Layer?", a: "Protects from UV radiation" },
  { q: "Why is water suffering from pollution?", a: "Domestic, municipal, industrial waste" },
  { q: "Why should we be environment friendly?", a: "" }
];

function initActivity17() {
  const container = document.getElementById('act17-container');
  if (!container) return;
  
  container.innerHTML = '<h3 style="margin-bottom: 20px;">Answer the pollution comprehension questions:</h3>';
  
  activity17Questions.forEach((item, idx) => {
    const div = document.createElement('div');
    div.className = 'form-field';
    div.innerHTML = `
      <label>${idx + 1}. ${item.q}</label>
      <textarea rows="2" placeholder="Your answer..." data-correct="${item.a}"></textarea>
    `;
    container.appendChild(div);
  });
}

function checkActivity17() {
  const textareas = document.querySelectorAll('#act17-container textarea');
  let correctCount = 0;
  
  textareas.forEach((ta, idx) => {
    const answer = ta.value.trim().toLowerCase();
    const correct = ta.dataset.correct.toLowerCase();
    
    if (idx === 5) {
      if (answer.length > 10) {
        ta.parentElement.classList.add('correct');
        ta.parentElement.classList.remove('incorrect');
        correctCount++;
      } else {
        ta.parentElement.classList.add('incorrect');
        ta.parentElement.classList.remove('correct');
      }
    } else {
      if (correct && answer.includes(correct.split(',')[0].toLowerCase())) {
        ta.parentElement.classList.add('correct');
        ta.parentElement.classList.remove('incorrect');
        correctCount++;
      } else if (answer !== '') {
        ta.parentElement.classList.add('incorrect');
        ta.parentElement.classList.remove('correct');
      }
    }
  });
  
  if (correctCount === 6) {
    showFeedback('✓ Perfect! All answers correct!', 'correct');
    markActivityComplete(17);
  } else {
    showFeedback(`${correctCount}/6 correct. Green = correct, Red = needs work.`, 'incorrect');
  }
}

function resetActivity17() {
  initActivity17();
  showFeedback('🔄 Reset', 'correct');
}

// ACTIVITY 18: Passive Voice Mastery
const activity18Part1 = [
  { sentence: "The key ___ (find) under the table yesterday.", answer: "was found" },
  { sentence: "They ___ (take) to the museum tomorrow.", answer: "will be taken" },
  { sentence: "Lessons ___ (attend) by the students every day.", answer: "are attended" },
  { sentence: "The park ___ (reconstruct) next year.", answer: "will be reconstructed" },
  { sentence: "This building ___ (design) last year.", answer: "was designed" },
  { sentence: "The mobile ___ (use) every day.", answer: "is used" },
  { sentence: "The cat ___ (feed) by my mum two hours ago.", answer: "was fed" },
  { sentence: "The chair ___ (repair) by my dad tomorrow.", answer: "will be repaired" },
  { sentence: "The apples ___ (buy) by Liz yesterday.", answer: "were bought" },
  { sentence: "The windows ___ (clean) tomorrow.", answer: "will be cleaned" }
];

const activity18Part2 = [
  { sentence: "The airplane was invented by Wright brothers", answer: "P" },
  { sentence: "Wright brothers invented the airplane", answer: "A" },
  { sentence: "Steve Jobs and Wozniak created Apple", answer: "A" },
  { sentence: "Apple was created by Jobs and Wozniak", answer: "P" },
  { sentence: "City council is improving transportation", answer: "A" },
  { sentence: "Transportation has been improved recently", answer: "P" },
  { sentence: "Bananas are exported by Ecuador", answer: "P" },
  { sentence: "America was discovered by Columbus", answer: "P" },
  { sentence: "The teacher corrected all exams", answer: "A" },
  { sentence: "The package will be delivered tomorrow", answer: "P" }
];

const activity18Part3 = [
  { sentence: "Organic food ___ (grow/present perfect) by many farmers.", answer: "has been grown" },
  { sentence: "Endangered animals ___ (save/future) by activists.", answer: "will be saved" },
  { sentence: "A lot of smog ___ (produce/present perfect) by cars.", answer: "has been produced" },
  { sentence: "By 2000, pesticides ___ (use/past perfect) for decades.", answer: "had been used" }
];

let activity18State = { correct: 0 };

function initActivity18() {
  const container = document.getElementById('act18-container');
  if (!container) return;
  
  container.innerHTML = '<h3>Part 1: Fill Passive Voice (10 sentences)</h3>';
  
  activity18Part1.forEach((item, idx) => {
    const div = document.createElement('div');
    div.className = 'form-field';
    div.innerHTML = `
      <label>${idx + 1}. ${item.sentence}</label>
      <input type="text" placeholder="Answer" data-correct="${item.answer}" data-part="1">
    `;
    container.appendChild(div);
  });
  
  const part2Title = document.createElement('h3');
  part2Title.textContent = 'Part 2: Label Active (A) or Passive (P) - 10 sentences';
  part2Title.style.marginTop = '32px';
  container.appendChild(part2Title);
  
  activity18Part2.forEach((item, idx) => {
    const div = document.createElement('div');
    div.className = 'speaking-choice';
    div.innerHTML = `<p>${idx + 1}. ${item.sentence}</p>`;
    
    const btnGroup = document.createElement('div');
    btnGroup.style.display = 'flex';
    btnGroup.style.gap = '8px';
    
    ['A', 'P'].forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'check-btn';
      btn.textContent = opt;
      btn.dataset.answer = opt;
      btn.dataset.correct = item.answer;
      btn.onclick = function() {
        if (this.dataset.answer === this.dataset.correct) {
          div.classList.add('correct');
          showFeedback('✓', 'correct');
        } else {
          div.classList.add('incorrect');
          showFeedback('✗', 'incorrect');
        }
        btnGroup.querySelectorAll('button').forEach(b => b.disabled = true);
      };
      btnGroup.appendChild(btn);
    });
    
    div.appendChild(btnGroup);
    container.appendChild(div);
  });
  
  const part3Title = document.createElement('h3');
  part3Title.textContent = 'Part 3: Complete Passive Sentences (4 sentences)';
  part3Title.style.marginTop = '32px';
  container.appendChild(part3Title);
  
  activity18Part3.forEach((item, idx) => {
    const div = document.createElement('div');
    div.className = 'form-field';
    div.innerHTML = `
      <label>${idx + 1}. ${item.sentence}</label>
      <input type="text" placeholder="Answer" data-correct="${item.answer}" data-part="3">
    `;
    container.appendChild(div);
  });
  
  updateActivity18Progress();
}

function checkActivity18() {
  let correct = 0;
  const inputs = document.querySelectorAll('#act18-container input[type="text"]');
  
  inputs.forEach(input => {
    const answer = input.value.trim().toLowerCase();
    const correctAnswer = input.dataset.correct.toLowerCase();
    
    if (answer === correctAnswer) {
      input.parentElement.classList.add('correct');
      correct++;
    } else if (answer !== '') {
      input.parentElement.classList.add('incorrect');
    }
  });
  
  activity18State.correct = correct;
  document.getElementById('act18-correct').textContent = correct;
  updateActivity18Progress();
  
  if (correct === 14) {
    showFeedback('🎉 Excellent work!', 'correct');
    markActivityComplete(18);
  } else {
    showFeedback(`${correct}/24 total progress`, 'incorrect');
  }
}

function updateActivity18Progress() {
  const bar = document.getElementById('act18-progress');
  if (bar) bar.style.width = `${(activity18State.correct / 24) * 100}%`;
}

function resetActivity18() {
  activity18State = { correct: 0 };
  document.getElementById('act18-correct').textContent = '0';
  initActivity18();
  showFeedback('🔄 Reset', 'correct');
}

// NAVIGATION SYSTEM
let currentActivity = 0;
const totalActivities = 15;
const activityIds = [3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
let completedActivities = {};

function goToActivity(activityNum) {
  // Hide menu
  const menu = document.getElementById('menu');
  if (menu) menu.classList.remove('active');
  
  // Hide all activity sections
  const allSections = document.querySelectorAll('.section');
  allSections.forEach(s => s.classList.remove('active'));
  
  // Show the selected activity
  const pageId = `page${activityNum}`;
  const activitySection = document.getElementById(pageId);
  if (activitySection) {
    activitySection.classList.add('active');
    currentActivity = activityIds.indexOf(activityNum);
    updateNavigation();
    
    // Scroll to top
    window.scrollTo(0, 0);
  }
}

function jumpToMenu() {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const menu = document.getElementById('menu');
  const footer = document.getElementById('credits-footer');
  if (menu) menu.classList.add('active');
  if (footer) footer.style.display = 'block';
  currentActivity = 0;
  updateOverallProgress();
  updateMenuButtons();
  window.scrollTo(0, 0);
}

function updateMenuButtons() {
  activityIds.forEach(actId => {
    const btn = document.querySelector(`.menu-btn[data-activity="${actId}"]`);
    if (btn && completedActivities[actId]) {
      if (!btn.querySelector('.completed-badge')) {
        const badge = document.createElement('span');
        badge.className = 'completed-badge';
        badge.textContent = '✓';
        badge.style.cssText = 'position: absolute; top: 8px; right: 8px; background: var(--color-success); color: #ffffff; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;';
        btn.style.position = 'relative';
        btn.appendChild(badge);
      }
    }
  });
}

function navigatePrevious() {
  if (currentActivity > 0) {
    goToActivity(activityIds[currentActivity - 1]);
  } else {
    jumpToMenu();
  }
}

function navigateNext() {
  if (currentActivity < totalActivities - 1) {
    goToActivity(activityIds[currentActivity + 1]);
  } else {
    jumpToMenu();
  }
}

function updateNavigation() {
  const navPrev = document.getElementById('nav-prev');
  const navNext = document.getElementById('nav-next');
  const indicator = document.getElementById('activity-indicator');
  const navMenu = document.getElementById('nav-menu');
  
  if (indicator) {
    indicator.textContent = `Activity ${currentActivity + 1} of ${totalActivities}`;
  }
  
  if (navPrev) {
    navPrev.style.display = currentActivity === 0 ? 'none' : 'inline-block';
  }
  
  if (navNext) {
    navNext.textContent = currentActivity === totalActivities - 1 ? '✓ Finish' : 'Next Activity →';
  }
  
  if (navMenu) {
    navMenu.onclick = jumpToMenu;
  }
}

function updateOverallProgress() {
  const progressCount = document.getElementById('overall-progress-count');
  const progressBar = document.getElementById('overall-progress-bar');
  const completedCount = Object.keys(completedActivities).length;
  
  if (progressCount) {
    progressCount.textContent = completedCount;
  }
  
  if (progressBar) {
    progressBar.style.width = `${(completedCount / totalActivities) * 100}%`;
  }
}

function markActivityComplete(activityNum) {
  if (!completedActivities[activityNum]) {
    completedActivities[activityNum] = true;
    updateOverallProgress();
    
    // Visual celebration for completing an activity
    if (Object.keys(completedActivities).length === totalActivities) {
      setTimeout(() => {
        showFeedback('🎉 CONGRATULATIONS! You completed all 16 activities! 🎉', 'correct');
      }, 500);
    }
  }
}

// Setup navigation listeners
function setupNavigation() {
  const navPrev = document.getElementById('nav-prev');
  const navNext = document.getElementById('nav-next');
  const navMenu = document.getElementById('nav-menu');
  
  if (navPrev) navPrev.onclick = navigatePrevious;
  if (navNext) navNext.onclick = navigateNext;
  if (navMenu) navMenu.onclick = jumpToMenu;
}

// Initialize all activities
function initializeAllActivities() {
  try {
    init();
    initConditional();
    initListening7();
    initPeople();
    initListening9();
    initPotter();
    initImageUpload();
    initActivity4();
    initActivity10();
    initActivity12();
    initActivity13();
    initActivity14();
    initActivity15();
    initActivity16();
    initActivity17();
    initActivity18();
    setupNavigation();
    updateOverallProgress();
  } catch (error) {
    console.error('Initialization error:', error);
  }
}

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAllActivities);
} else {
  initializeAllActivities();
}