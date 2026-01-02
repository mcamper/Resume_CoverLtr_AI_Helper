// ---------- ELEMENTS ----------
const darkToggle = document.getElementById('darkModeToggle');
const spinner = document.getElementById('spinner');
const matchBar = document.getElementById('matchScore');
const matchPercent = document.getElementById('matchPercent');
const highlightedResume = document.getElementById('highlightedResume');
const highlightedKeywords = document.getElementById('highlightedKeywords');
const aiSuggestions = document.getElementById('aiSuggestions');

const resumeInput = document.getElementById('resumeText');
const jobDescInput = document.getElementById('jobDescText');
const resultsInput = document.getElementById('coverLetterText'); // now used as Results panel

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
  resultsInput.value = '';
  highlightedResume.innerHTML = '';
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

// ---------- CALL HUGGING FACE API ----------
async function callHFApi(messages) {
  spinner.style.display = 'block';
  aiSuggestions.innerText = '';

  try {
    const response = await fetch("/api/hf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages })
    });

    if (!response.ok) {
      const text = await response.text();
      aiSuggestions.innerText = `❌ Hugging Face request failed: ${text}`;
      spinner.style.display = 'none';
      return null;
    }

    const data = await response.json();
    const text = data.text || "✅ AI response received!";
    spinner.style.display = 'none';
    return text;

  } catch (err) {
    spinner.style.display = 'none';
    aiSuggestions.innerText = `❌ Network or server error: ${err.message}`;
    return null;
  }
}

// ---------- OPTIMIZE RESUME WITH AI ----------
async function optimizeResume() {
  const resumeText = resumeInput.value.trim();
  const jobText = jobDescInput.value.trim();

  if (!resumeText || !jobText) {
    alert("Please provide both resume and job description.");
    return;
  }

  spinner.style.display = 'block';
  highlightedResume.innerHTML = '';
  highlightedKeywords.innerHTML = '';
  matchBar.style.width = '0%';
  matchPercent.textContent = '0%';
  aiSuggestions.innerText = '';

  const messages = [
    {
      role: "system",
      content: "You are an expert resume writer. Rewrite resumes to match the job description while staying truthful. Preserve formatting, bullets, and ATS-friendly structure."
    },
    {
      role: "user",
      content: `Resume:\n${resumeText}\n\nJob Description:\n${jobText}\n\nRewrite the resume to maximize alignment with the job and professional tone.`
    }
  ];

  const optimizedText = await callHFApi(messages);
  if (!optimizedText) {
    spinner.style.display = 'none';
    return;
  }

  highlightedResume.contentEditable = "true";
  highlightedResume.innerText = optimizedText;

  // Optional keyword highlighting
  const allKeywords = extractKeywords(resumeText, jobText);
  const missingKeywords = allKeywords.filter(k => !optimizedText.toLowerCase().includes(k.toLowerCase()));

  highlightedKeywords.innerHTML = missingKeywords.length
    ? missingKeywords.map(k => `<span class="keyword">${k}</span>`).join(" ")
    : "<em>All key skills and terms are present in your resume.</em>";

  let total = allKeywords.length || 1;
  let matched = total - missingKeywords.length;
  let score = Math.round((matched / total) * 100);
  matchBar.style.width = score + '%';
  matchPercent.textContent = score + '%';

  aiSuggestions.innerText = "✅ Resume optimized using AI.";
}

// ---------- GENERATE COVER LETTER ----------
coverLetterBtn.addEventListener('click', async () => {
  const resumeText = highlightedResume.innerText.trim();
  const jobText = jobDescInput.value.trim();

  if (!resumeText || !jobText) {
    alert("Please optimize your resume first.");
    return;
  }

  const messages = [
    {
      role: "system",
      content: "You are a professional cover letter writer. Write concise, persuasive cover letters tailored to the job description."
    },
    {
      role: "user",
      content: `Resume:\n${resumeText}\n\nJob Description:\n${jobText}\n\nGenerate a targeted cover letter.`
    }
  ];

  const coverLetterText = await callHFApi(messages);
  if (coverLetterText) {
    resultsInput.value = coverLetterText;
  }
});

// ---------- SUGGEST IMPROVEMENTS ----------
improveBtn.addEventListener('click', async () => {
  const resumeText = highlightedResume.innerText.trim();
  const jobText = jobDescInput.value.trim();

  if (!resumeText || !jobText) {
    alert("Please optimize your resume first.");
    return;
  }

  const messages = [
    {
      role: "system",
      content: "You are a resume optimization expert. Suggest actionable improvements, highlight missing keywords, and rewrite weak bullets."
    },
    {
      role: "user",
      content: `Resume:\n${resumeText}\n\nJob Description:\n${jobText}\n\nProvide improvement suggestions.`
    }
  ];

  const suggestions = await callHFApi(messages);
  if (suggestions) {
    resultsInput.value = suggestions;
  }
});

// ---------- BUTTON EVENTS ----------
optimizeBtn.onclick = optimizeResume;

// ---------- EXPORT TO WORD ----------
exportWordBtn.addEventListener('click', () => {
  const text = highlightedResume.innerText || resumeInput.value;
  if (!text) return alert("No resume content to export.");

  const lines = text.split('\n');
  let htmlContent = '';
  let inList = false;

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) {
      if (inList) { htmlContent += '</ul>'; inList = false; }
      htmlContent += '<p>&nbsp;</p>';
    } else if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
      if (!inList) { htmlContent += '<ul>'; inList = true; }
      htmlContent += `<li>${trimmed.replace(/^•\s?/, '').replace(/^-/, '')}</li>`;
    } else if (/^[A-Z\s]{3,}$/.test(trimmed)) {
      if (inList) { htmlContent += '</ul>'; inList = false; }
      htmlContent += `<h2>${trimmed}</h2>`;
    } else {
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
