const optimizeBtn = document.getElementById("optimizeBtn");
const coverLetterBtn = document.getElementById("coverLetterBtn");
const suggestBtn = document.getElementById("suggestBtn");

const resumeInput = document.getElementById("resumeInput");
const jobInput = document.getElementById("jobInput");

const resumePreview = document.getElementById("resumePreview");
const resultsBox = document.getElementById("resultsBox");

// ------------------ OPTIMIZE RESUME ------------------

optimizeBtn.addEventListener("click", async () => {

  const resume = resumeInput.value.trim();
  const job = jobInput.value.trim();

  if (!resume || !job) {
    alert("Please paste both resume and job description.");
    return;
  }

  resumePreview.innerHTML = "Optimizing resume using AI...";

  try {
    const response = await fetch("/api/hf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content:
              "You are an expert resume writer. Rewrite resumes to match job descriptions while remaining truthful. Keep ATS formatting clean. Preserve bullet formatting and section structure."
          },
          {
            role: "user",
            content:
              `Here is my resume:\n${resume}\n\nHere is the job description:\n${job}\n\nRewrite my resume to strongly match the job while remaining honest.`
          }
        ]
      })
    });

    const data = await response.json();

    const optimized =
      data?.choices?.[0]?.message?.content ||
      "No AI response was returned.";

    resumePreview.innerText = optimized;

  } catch (error) {
    console.error(error);
    resumePreview.innerText = "Error optimizing resume.";
  }
});


// ------------------ GENERATE COVER LETTER ------------------

coverLetterBtn.addEventListener("click", async () => {

  const optimizedResume = resumePreview.innerText.trim();
  const job = jobInput.value.trim();

  if (!optimizedResume || !job) {
    alert("First optimize your resume, then try again.");
    return;
  }

  resultsBox.innerHTML = "Generating cover letter...";

  try {
    const response = await fetch("/api/hf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content:
              "You write concise, professional, compelling cover letters tailored to job descriptions."
          },
          {
            role: "user",
            content:
              `Here is my resume:\n${optimizedResume}\n\nHere is the job description:\n${job}\n\nWrite me a targeted cover letter.`
          }
        ]
      })
    });

    const data = await response.json();

    const letter =
      data?.choices?.[0]?.message?.content ||
      "No AI response was returned.";

    resultsBox.innerText = letter;

  } catch (error) {
    console.error(error);
    resultsBox.innerText = "Error generating cover letter.";
  }
});


// ------------------ SUGGEST IMPROVEMENTS ------------------

suggestBtn.addEventListener("click", async () => {

  const optimizedResume = resumePreview.innerText.trim();
  const job = jobInput.value.trim();

  if (!optimizedResume || !job) {
    alert("First optimize your resume, then try again.");
    return;
  }

  resultsBox.innerHTML = "Analyzing resume for improvements...";

  try {
    const response = await fetch("/api/hf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content:
              "You are a resume optimization expert. Provide actionable edits, missing keywords, and rewrite weak bullets."
          },
          {
            role: "user",
            content:
              `Resume:\n${optimizedResume}\n\nJob Description:\n${job}\n\nSuggest concrete improvements and missing keywords. Rewrite weak sections.`
          }
        ]
      })
    });

    const data = await response.json();

    const suggestions =
      data?.choices?.[0]?.message?.content ||
      "No AI response was returned.";

    resultsBox.innerText = suggestions;

  } catch (error) {
    console.error(error);
    resultsBox.innerText = "Error generating suggestions.";
  }
});
