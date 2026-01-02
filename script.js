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

// ---------- CALL NETLIFY FUNCTION ----------
async function callHuggingFace(prompt) {
  try {
    spinner.style.display = 'block';

    const response = await fetch("/.netlify/functions/hf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt })
    });

    const data = await response.json();
    spinner.style.display = 'none';

    if (data.error) {
      aiSuggestions.innerText = `❌ API Error: ${data.error}`;
    } else if (Array.isArray(data)) {
      aiSuggestions.innerText = data[0].generated_text || JSON.stringify(data);
    } else {
      aiSuggestions.innerText = data.generated_text || JSON.stringify(data);
    }

  } catch (err) {
    spinner.style.display = 'none';
    aiSuggestions.innerText = `❌ Network/Error: ${err.message}`;
  }
}

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

// ---------- UTILITY FUNCTIONS ----------
function extractKeywords(resumeText, jobText) {
  const resumeWords = resumeText.match(/\b\w+\b/g) || [];
  const jobWords = jobText.match(/\b\w+\b/g) || [];
  const combined = Array.from(new Set([...resumeWords, ...jobWords]));

  const stopWords = [
    "and","the","for","with","your","will","this","that","from","are",
    "use","all","can","you","has","have","including","required","experience",
    "position","job","responsible","duties","skills","activities","perform","performing",
    "functions","general","statement","essential","physical"
  ];

  return combined.filter(word => 
    word.length > 2 && 
    /^[a-zA-Z\-]+$/.test(word) &&
    !stopWords.includes(word.toLowerCase())
  );
}

function highlightResumeDynamic(resumeText, suggestedKeywords) {
  if (!resumeText) return "";
  suggestedKeywords.sort((a,b) => b.length - a.length);
  const escaped = suggestedKeywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
  const regex = new RegExp(`\\b(${escaped.join("|")})\\b(?=[.,;:]?\\s|$)`, "gi");

  return resumeText.split('\n').map(line => {
    const highlighted = line.replace(regex, '<span class="keyword">$1</span>');
    return `<p>${highlighted}</p>`;
  }).join('');
}

// ---------- OPTIMIZE RESUME ----------
function optimizeResume() {
  spinner.style.display = 'block';
  resultsPanel.innerHTML = '';
  highlightedKeywords.innerHTML = '';
  matchBar.style.width = '0%';
  matchPercent.textContent = '0%';
  aiSuggestions.innerText = '';

  setTimeout(() => {
    spinner.style.display = 'none';
    const resumeText = resumeInput.value || "";
    const jobText = jobDescInput.value || "";

    const allKeywords = extractKeywords(resumeText, jobText);
    const missingKeywords = allKeywords.filter(k => !resumeText.toLowerCase().includes(k.toLowerCase()));

    resultsPanel.innerHTML = highlightResumeDynamic(resumeText, missingKeywords);

    highlightedKeywords.innerHTML = missingKeywords.length
      ? missingKeywords.map(k => `<span class="keyword">${k}</span>`).join(" ")
      : "<em>All key skills and terms are present in your resume.</em>";

    let total = allKeywords.length || 1;
    let matched = total - missingKeywords.length;
    let score = Math.round((matched / total) * 100);
    matchBar.style.width = score + '%';
    matchPercent.textContent = score + '%';

    aiSuggestions.innerText = "✅ Resume optimized. Keywords aligned with job description.";
  }, 1200);
}

// ---------- AI BUTTON FUNCTIONS ----------
function generateCoverLetter() {
  const resumeText = resumeInput.value || "";
  const jobText = jobDescInput.value || "";

  if (!resumeText || !jobText) return alert("Please paste both your resume and job description first.");

  const prompt = `
You are an expert career coach. 
Generate a professional cover letter based on the following Resume and Job Description.

Resume:
${resumeText}

Job Description:
${jobText}

Cover Letter:
`;
  callHuggingFace(prompt);
}

function suggestResumeImprovements() {
  const resumeText = resumeInput.value || "";
  const jobText = jobDescInput.value || "";

  if (!resumeText || !jobText) return alert("Please paste both your resume and job description first.");

  const prompt = `
You are an expert career coach. 
Analyze the following Resume and Job Description. Suggest specific improvements to make the resume more aligned with the job. 
Focus on missing keywords, structure, quantified achievements, and clarity.

Resume:
${resumeText}

Job Description:
${jobText}

Suggestions:
`;
  callHuggingFace(prompt);
}

// ---------- BUTTON EVENTS ----------
optimizeBtn.onclick = optimizeResume;
coverLetterBtn.onclick = generateCoverLetter;
improveBtn.onclick = suggestResumeImprovements;

// ---------- EXPORT TO WORD WITH FORMATTING ----------
exportWordBtn.addEventListener('click', () => {
  const text = resumeInput.value;
  if (!text) return alert("Paste your resume first.");

  const lines = text.split('\n');
  let htmlContent = '';
  let inList = false;

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) {
      if (inList) { htmlContent += '</ul>'; inList = false; }
      htmlContent += '<p>&nbsp;</p>';
    } 
    else if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
      if (!inList) { htmlContent += '<ul>'; inList = true; }
      htmlContent += `<li>${trimmed.replace(/^•\s?/, '').replace(/^-/, '')}</li>`;
    } 
    else if (/^[A-Z\s]{3,}$/.test(trimmed)) {
      if (inList) { htmlContent += '</ul>'; inList = false; }
      htmlContent += `<h2>${trimmed}</h2>`;
    } 
    else {
      if (inList) { htmlContent += '</ul>'; inList = false; }
      htmlContent += `<p>${trimmed}</p>`;
    }
  });

  if (inList) htmlContent += '</ul>';

  const preHtml = `
    <html>
      <head>
        <meta charset='utf-8'>
        <title>Resume</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.3; }
          h2 { font-size: 16pt; margin: 15px 0 5px 0; }
          p { margin: 5px 0; }
          ul { margin: 5px 0 5px 20px; }
          li { margin-bottom: 3px; }
        </style>
      </head>
      <body>
  `;
  const postHtml = '</body></html>';

  const blob = new Blob(['\ufeff', preHtml + htmlContent + postHtml], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Resume.doc';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});
