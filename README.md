# AI Resume Helper

![Status](https://img.shields.io/badge/status-active-success)
![HTML](https://img.shields.io/badge/HTML-5-orange)
![CSS](https://img.shields.io/badge/CSS-3-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow)
![Netlify](https://img.shields.io/badge/Hosting-Netlify-brightgreen)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

A web application that helps job seekers optimize resumes and generate tailored cover letters using AI. It highlights missing keywords, shows a match score, and integrates Hugging Face securely through Netlify Functions.

---

## ✨ Features

- 🔍 Resume vs Job Description keyword matching  
- 📊 Match score progress bar  
- 🟡 Highlighted missing keywords  
- 🤖 AI-generated cover letters  
- 🛠 AI resume improvement suggestions  
- 🌓 Dark Mode toggle  
- 🌀 Animated loading spinner  
- 📝 Export resume to Word (keeps bullets + formatting)  
- 🔐 Hugging Face API secured via Netlify Functions  

---

## 🧠 Tech Stack

- HTML / CSS / JavaScript
- Netlify Serverless Functions
- Hugging Face Inference API
- Secure environment variables

---

## 📁 Project Structure
project-root/
│ index.html
│ style.css
│ script.js
│
└─ netlify/
└─ functions/
└─ hf.js

---

## 🚀 Deployment (Netlify + GitHub)

1. Upload repository files to GitHub
2. Create a new site in Netlify → **Deploy from GitHub**
3. Set environment variable:
   HUGGINGFACE_API_KEY = your_key_here

4. Set **Functions directory**:
   netlify/functions

5. Redeploy site

---

## 🛡 Security

- No API keys in browser
- All AI calls route through Netlify function
- Safe for public hosting

---

## ✔ Status

Project is under active development




