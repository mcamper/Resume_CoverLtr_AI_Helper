# Resume & Cover Letter AI Helper

[![Vercel](https://img.shields.io/badge/Deploy-Vercel-blue?logo=vercel&logoColor=white)](https://vercel.com)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?logo=github&logoColor=white)](https://github.com)
[![HTML5](https://img.shields.io/badge/HTML5-orange?logo=html5&logoColor=white)]()
[![CSS3](https://img.shields.io/badge/CSS3-blue?logo=css3&logoColor=white)]()
[![JavaScript](https://img.shields.io/badge/JavaScript-yellow?logo=javascript&logoColor=black)]()
![License](https://img.shields.io/badge/license-MIT-lightgrey)

A web tool to **optimize resumes**, **generate cover letters**, and **suggest improvements** using Hugging Face AI models. Built with **HTML, CSS, JavaScript**, and **Vercel serverless functions**.

---

## Features

- Paste your resume and job description
- **Optimize resume**: highlights missing keywords & calculates match score
- **Generate cover letters** using Hugging Face AI
- **Suggest improvements** for better alignment with job description
- Export your resume to **Word** with formatting intact
- Dark mode toggle
- AI-powered suggestions without exposing API key

---

## Deployment

This project uses **Vercel serverless functions**:

- API function: `/api/hf.js`
- Model: `google/flan-t5-large`
- Environment variable: `HUGGINGFACE_API_KEY`

---

## Usage

1. Clone the repo and push to GitHub
2. Connect repo to Vercel
3. Add environment variable `HUGGINGFACE_API_KEY` in Vercel
4. Deploy and test buttons:
   - Optimize Resume
   - Generate Cover Letter
   - Suggest Improvements

---



