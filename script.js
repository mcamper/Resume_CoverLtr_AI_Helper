// ---------- ELEMENTS ----------
const darkToggle = document.getElementById('darkModeToggle');
const spinner = document.getElementById('spinner');
const matchBar = document.getElementById('matchScore');
const matchPercent = document.getElementById('matchPercent');
const resultsPanel = document.getElementById('highlightedResume');
const highlightedKeywords = document.getElementById('highlightedKeywords');
const aiSuggestions = document.getElementById('aiSuggestions');

const resumeInput = document.getElementById('resumeText');
const jobDescInput = document.getElementById('jobDescText');
const coverLetterInput = document.getElementById('coverLetterText');

const optimizeBtn = document.getElementById('optimizeResumeBtn');
const coverLetterBtn = document.getElementById('generateCoverLetterBtn');
const improveBtn = document.getElementById('suggestImprovementsBtn');
const clearBtn = document.getElementById('clearAllBtn');

const exportWordBtn = document.getElementById('exportWord');

// ---------- DARK MODE ----------
darkToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

// ---------- CLEAR ALL ----------
clearBtn.addEventListener('click', () => {
  resumeInput.value = '';
  jobDescInput.value = '';
  coverLetterInput.value = '';
  resultsPanel.innerHTML = '';
  highlightedKeywords.innerHTML = '';
  matchBar.style.width = '0%';
  matchPercent.textContent = '0%';
  aiSuggestions.innerText = '';
});

// ---------- UTILITY ----------
function extractKeywords(resumeText, jobText) {
  const resumeWords = resumeText.match(/\b\w+\b/g) || [];
  const jobWords = jobText.match(/\b\w+\b/g) || [];
  const combined = Array.from(new Set([...resumeWords, ...jobWords]));

  const stopWords = [
    "and","the","for","with","your","will","this","that","from","are",
    "use","all","can","you","has","have","including","require
