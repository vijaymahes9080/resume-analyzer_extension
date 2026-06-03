document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const views = {
        input: document.getElementById('inputSection'),
        results: document.getElementById('resultsSection')
    };

    const inputs = {
        resume: document.getElementById('resumeText'),
        job: document.getElementById('jobText')
    };

    const buttons = {
        analyze: document.getElementById('analyzeBtn'),
        back: document.getElementById('backBtn'),
        tabs: document.querySelectorAll('.tab-btn'),
        theme: document.getElementById('themeToggle')
    };

    const results = {
        scoreCircle: document.querySelector('.circular-chart'),
        scoreText: document.querySelector('.percentage'),
        scoreMsg: document.getElementById('scoreMessage'),
        missing: document.getElementById('missingKeywordsList'),
        structure: document.getElementById('structureList'),
        feedback: document.getElementById('feedbackText')
    };

    // State
    let currentTheme = 'dark';
    try {
        currentTheme = localStorage.getItem('theme') || 'dark';
    } catch (e) {
        console.warn("localStorage is not accessible in this context. Defaulting to dark theme.");
    }

    // --- Initialization ---
    if (currentTheme === 'light') {
        document.body.classList.add('light-theme');
    }

    // --- Logic ---
    const stopwords = new Set(['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'this', 'that', 'it', 'as', 'if', 'when', 'than', 'from', 'into', 'during', 'who', 'which', 'what', 'where', 'how', 'why', 'can', 'could', 'will', 'would', 'should', 'may', 'might', 'must', 'have', 'has', 'had', 'do', 'does', 'did', 'not', 'no', 'nor', 'we', 'you', 'they', 'he', 'she', 'i', 'my', 'your', 'their', 'his', 'her', 'our', 'us', 'me', 'him', 'them', 'about', 'some', 'any']);

    const actionVerbs = ['managed', 'led', 'developed', 'created', 'designed', 'implemented', 'orchestrated', 'engineered', 'built', 'achieved', 'improved', 'increased', 'decreased', 'optimized', 'negotiated', 'launched', 'spearheaded', 'coordinated', 'mentored', 'analyzed'];

    function cleanText(text) {
        return text.toLowerCase()
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
            .replace(/\s{2,}/g, " ");
    }

    function getUniqueWords(text) {
        return new Set(
            cleanText(text).split(' ').filter(w => w.length > 2 && !stopwords.has(w))
        );
    }

    function analyzeResume(resumeText, jobText) {
        let score = 0;
        let checks = [];
        let feedback = [];
        let missingKeywords = [];

        // 1. Structure Check
        const structuralElements = [
            { name: "Contact Info", regex: /(@|phone|tel|mobile|\d{3}[-.\s]\d{3}[-.\s]\d{4})/i },
            { name: "Experience", regex: /(experience|work history|employment)/i },
            { name: "Education", regex: /(education|university|college|degree)/i },
            { name: "Skills", regex: /(skills|technologies|proficiencies)/i }
        ];

        let structureScore = 0;
        structuralElements.forEach(el => {
            const found = el.regex.test(resumeText);
            checks.push({ name: el.name, found });
            if (found) structureScore += 25; // 4 items = 100% of structure portion
        });

        // 2. Keyword/Content Analysis
        const resumeWords = getUniqueWords(resumeText);
        let contentScore = 0;

        if (jobText.trim().length > 10) {
            // Compare against JD
            const jobWords = getUniqueWords(jobText);
            const totalJobWords = jobWords.size;
            let matchCount = 0;

            jobWords.forEach(word => {
                if (resumeWords.has(word)) {
                    matchCount++;
                } else {
                    missingKeywords.push(word);
                }
            });

            // Calculate overlap percentage
            const overlap = totalJobWords > 0 ? (matchCount / totalJobWords) : 0;
            contentScore = Math.round(overlap * 100);

            feedback.push(`Matched ${matchCount} out of ${totalJobWords} important keywords from the job description.`);
        } else {
            // General Analysis (No JD)
            // Check for action verbs frequency
            let verbCount = 0;
            const wordsArr = cleanText(resumeText).split(' ');
            wordsArr.forEach(w => {
                if (actionVerbs.includes(w)) verbCount++;
            });

            // Heuristic: Expect at least 1 action verb per ~30 words?
            // Or just check if we have a healthy amount.
            contentScore = Math.min(100, verbCount * 5);
            feedback.push(`Found ${verbCount} strong action verbs. content score calculated based on verb usage.`);
        }

        // Top 'missing' keywords limiter (only show top 10 relevant looking ones)
        missingKeywords = missingKeywords.slice(0, 8);

        // Final Score Calculation
        // Weight: 30% Structure, 70% Content
        score = Math.round((structureScore * 0.3) + (contentScore * 0.7));

        return { score, checks, missingKeywords, feedback };
    }

    // --- Auto-Fetch Content from Page ---
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
        try {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs && tabs[0]) {
                    chrome.scripting.executeScript({
                        target: { tabId: tabs[0].id },
                        func: () => document.body.innerText
                    }, (results) => {
                        if (chrome.runtime && chrome.runtime.lastError) return;
                        if (!results || !results[0]) return;

                        const pageText = results[0].result;
                        // If page has substantial text, assume it's the resume/content
                        if (pageText && pageText.length > 100) {
                            inputs.resume.value = pageText;
                            inputs.resume.style.borderColor = 'var(--success)';

                            // Optional: Create a small toast or label to indicate success
                            const label = document.querySelector('label[for="resumeText"]');
                            if (label) {
                                label.textContent = "Resume text loaded from current page ✓";
                                label.style.color = "var(--success)";
                            }

                            setTimeout(() => {
                                inputs.resume.style.borderColor = ''; // reset
                            }, 2000);
                        }
                    });
                }
            });
        } catch (e) {
            console.log("Cannot read page content", e);
        }
    }

    // --- UI Handlers ---

    // Switch Tabs
    buttons.tabs.forEach(btn => {
        btn.addEventListener('click', (e) => {
            buttons.tabs.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            // Hide all inputs
            document.querySelectorAll('.input-group').forEach(g => g.classList.remove('active'));

            // Show target
            const tabName = e.target.getAttribute('data-tab'); // 'resume' or 'job'
            document.getElementById(`${tabName}Input`).classList.add('active');
        });
    });

    // Theme Toggle
    buttons.theme.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        try {
            localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
        } catch (e) {
            console.warn("Could not save theme to localStorage:", e);
        }
    });

    // Analyze Click
    buttons.analyze.addEventListener('click', () => {
        const rText = inputs.resume.value;
        const jText = inputs.job.value;

        if (rText.trim().length < 50) {
            alert("Please paste a valid resume (at least 50 chars).");
            return;
        }

        const data = analyzeResume(rText, jText);
        showResults(data);
    });

    // Back Click
    buttons.back.addEventListener('click', () => {
        views.results.classList.remove('active-section'); // Helper logic or class switch
        views.results.classList.add('hidden-section');
        views.input.classList.remove('hidden-section');
        views.input.classList.add('active-section');
    });

    function showResults(data) {
        // Switch Views
        views.input.classList.add('hidden-section');
        views.input.classList.remove('active-section');
        views.results.classList.remove('hidden-section');
        views.results.classList.add('active-section');

        // Update Score
        results.scoreText.textContent = `${data.score}%`;

        let colorClass = 'score-low';
        let msg = "Needs Improvement";
        if (data.score > 50) { colorClass = 'score-mid'; msg = "Good Start"; }
        if (data.score > 75) { colorClass = 'score-high'; msg = "Excellent"; }

        results.scoreCircle.classList.remove('score-low', 'score-mid', 'score-high');
        results.scoreCircle.classList.add(colorClass);

        const circumference = 100; // 2 * pi * radius (approx for stroke-dasharray)
        // Note: stroke-dasharray="current, 100" where 100 is total. 
        // My SVG uses pathLength? No, standard DashArray.
        // Let's just set the first value.
        results.scoreCircle.querySelector('.circle').setAttribute('stroke-dasharray', `${data.score}, 100`);

        results.scoreMsg.textContent = msg;

        // Structure
        results.structure.innerHTML = '';
        data.checks.forEach(check => {
            const li = document.createElement('li');
            li.textContent = check.name;
            if (check.found) li.classList.add('checked');
            results.structure.appendChild(li);
        });

        // Missing Keywords
        results.missing.innerHTML = '';
        if (data.missingKeywords.length > 0) {
            data.missingKeywords.forEach(k => {
                const li = document.createElement('li');
                li.textContent = k;
                results.missing.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = "Great job! Strong keyword match.";
            li.style.background = "rgba(16, 185, 129, 0.1)";
            li.style.color = "var(--success)";
            results.missing.appendChild(li);
        }

        // Feedback
        results.feedback.innerHTML = '<p>' + data.feedback.join('</p><p>') + '</p>';
    }
});
