# ResumeAI Analyzer 🚀

Smart, free resume analysis tool designed to optimize your job application by comparing your resume against job descriptions using simple heuristics and keyword matching.

Live Web Version: [https://vijaymahes9080.github.io/resume-analyzer_extension/](https://vijaymahes9080.github.io/resume-analyzer_extension/)

---

## Features ✨

- **ATS Match Score**: Computes a percentage score based on structural elements and keyword matching.
- **Keyword Analysis**: Identifies missing keywords from the job description.
- **Structure Check**: Verifies essential resume sections (Contact Info, Experience, Education, Skills).
- **Auto-load**: Dynamically extracts page text when opened on supported web pages (Chrome Extension mode).
- **Modern UI**: Clean design with dynamic glassmorphism and light/dark theme support.

---

## Installation & Setup 🛠️

### 1. Host or Clone the Repository

To initialize the repository locally and push it to GitHub, use the following commands:

```bash
git init
git remote add origin https://github.com/vijaymahes9080/resume-analyzer_extension.git
git branch -M main
git add .
git commit -m "Initial commit with LICENSE and .gitignore"
git push -u origin main
```

### 2. Run as a Chrome Extension

1. Clone or download this repository to your local machine.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** in the top-right corner.
4. Click **Load unpacked** in the top-left corner.
5. Select the `resume anal` folder containing the extension files.

---

## Project Structure 📁

- `manifest.json`: Configuration and metadata for the Chrome Extension.
- `index.html` / `popup.html`: The user interface layout.
- `style.css`: The responsive CSS design.
- `popup.js`: Analysis logic and UI handlers.
- `icons/`: Extension icons.

---

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
