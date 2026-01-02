document.addEventListener("DOMContentLoaded", () => {

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

  // ---------- SAFE HELPERS ----------
  const safe = el => Boolean(el);

  const hideSpinner = () => spinner && (spinner.style.display = "none");
  const showSpinner = () => spinner && (spinner.style.display = "block");

  // ---------- DARK MODE ----------
  if (safe(darkToggle)) {
    darkToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark');
    });
  }

  // ---------- CLEAR ALL ----------
  if (safe(clearBtn)) {
    clearBtn.addEventListener('click', () => {
      if (resumeInput) resumeInput.value = '';
      if (jobDescInput) jobDescInput.value = '';
      if (coverLetterInput) coverLetterInput.value = '';

      if (resultsPanel) resultsPanel.innerHTML = '';
      if (highlightedKeywords) highlightedKeywords.innerHTML = '';
      if (aiSuggestions) aiSuggestions.innerText = '';

      if (matchBar) matchBar.style.width = '0%';
      if (matchPercent) matchPercent.textContent = '0%';
    });
  }

  // ---------- KEYWORD EXTRACTION ----------
  function extractKeywords(resumeText, jobText) {
    const resumeWords = resumeText.match(/\b\w+\b/g) || [];
    const jobWords = jobText.match(/\b\w+\b/g) || [];

    const combined = Array.from(new Set([...resumeWords, ...jobWords]));

    const stopWords = [
      "and","the","for","with","your","will","this","that","from","are",
      "use","all","can","you","has","have","including","required","experience",
      "position","job","responsible","duties","skills","activities","perform",
      "functions","general","statement","essential","physical"
    ];

    return combined.filter(word =>
      word.length > 2 &&
      /^[a-zA-Z\-]+$/.test(word) &&
      !stopWords.includes(word.toLowerCase())
    );
  }

  // ---------- HIGHLIGHT ----------
  function highlightResumeDynamic(resumeText, suggestedKeywords = []) {

    if (!resumeText || suggestedKeywords.length === 0) {
      return resumeText
        .split('\n')
        .map(line => `<p>${line}</p>`)
        .join('');
    }

    suggestedKeywords.sort((a, b) => b.length - a.length);

    const escaped = suggestedKeywords.map(k =>
      k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    );

    const regex = new RegExp(`\\b(${escaped.join("|")})\\b`, "gi");

    return resumeText
      .split('\n')
      .map(line => `<p>${line.replace(regex, '<span class="keyword">$1</span>')}</p>`)
      .join('');
  }

  // ---------- OPTIMIZE ----------
  function optimizeResume() {

    showSpinner();

    setTimeout(() => {

      hideSpinner();

      const resumeText = resumeInput?.value || "";
      const jobText = jobDescInput?.value || "";

      const allKeywords = extractKeywords(resumeText, jobText);
      const missingKeywords = allKeywords.filter(
        k => !resumeText.toLowerCase().includes(k.toLowerCase())
      );

      if (resultsPanel) {
        resultsPanel.innerHTML = highlightResumeDynamic(resumeText, missingKeywords);
      }

      if (highlightedKeywords) {
        highlightedKeywords.innerHTML = missingKeywords.length
          ? missingKeywords.map(k => `<span class="keyword">${k}</span>`).join(" ")
          : "<em>All key skills and terms are present.</em>";
      }

      const total = allKeywords.length || 1;
      const matched = total - missingKeywords.length;
      const score = Math.round((matched / total) * 100);

      if (matchBar) matchBar.style.width = score + "%";
      if (matchPercent) matchPercent.textContent = score + "%";

      if (aiSuggestions) aiSuggestions.innerText =
        "✅ Resume optimized and aligned with keywords.";

    }, 1000);
  }

  if (safe(optimizeBtn)) {
    optimizeBtn.addEventListener("click", optimizeResume);
  }

  // ---------- HF API ----------
  async function callHFApi(prompt) {

    showSpinner();

    try {
      const response = await fetch("/api/hf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });

      const text = await response.text();

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Server returned non-JSON response:\n" + text);
      }

      if (data.error) {
        aiSuggestions.innerText = "❌ " + data.error;
      } else {
        aiSuggestions.innerText = data.text || data.result || "(no text)";
      }

    } catch (err) {
      if (aiSuggestions) {
        aiSuggestions.innerText = "❌ " + err.message;
      }

    } finally {
      hideSpinner();
    }
  }

  // ---------- COVER LETTER ----------
  if (safe(coverLetterBtn)) {
    coverLetterBtn.onclick = () => {
      callHFApi(
        `Generate a cover letter based on this resume:\n${resumeInput?.value}\n\nJob description:\n${jobDescInput?.value}`
      );
    };
  }

  // ---------- SUGGEST IMPROVEMENTS ----------
  if (safe(improveBtn)) {
    improveBtn.onclick = () => {
      callHFApi(
        `Suggest ATS-focused improvements.\nResume:\n${resumeInput?.value}\n\nJob description:\n${jobDescInput?.value}`
      );
    };
  }

  // ---------- EXPORT WORD ----------
  if (safe(exportWordBtn)) {
    exportWordBtn.addEventListener("click", () => {

      const text = resumeInput?.value;

      if (!text) {
        alert("Paste your resume first.");
        return;
      }

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
          <meta charset="utf-8">
          <title>Resume</title>
          <style>
            body { font-family: Arial; line-height: 1.3; }
            h2 { font-size: 16pt; margin: 12px 0 6px 0; }
            p { margin: 4px 0; }
            ul { margin: 4px 0 4px 18px; }
            li { margin: 2px 0; }
          </style>
        </head>
        <body>
      `;

      const postHtml = `</body></html>`;

      const blob = new Blob(
        ['\ufeff', preHtml + htmlContent + postHtml],
        { type: 'application/msword' }
      );

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = "Resume.doc";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

});
