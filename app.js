// 3F System - Frontend Logic with Gemini AI Integration

// UI Elements
const formInput = document.getElementById('form-input');
const functionInput = document.getElementById('function-input');
const feelingInput = document.getElementById('feeling-input');
const suggestionsList = document.getElementById('suggestions-list');

// Settings Elements
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const saveSettingsBtn = document.getElementById('save-settings');
const closeSettingsBtn = document.getElementById('close-settings');
const apiKeyInput = document.getElementById('api-key-input');

// State
let apiKey = localStorage.getItem('3f_gemini_api_key') || 'AIzaSyAcPZs9Wv1sldRUq33LE_pgY9mvWPqRE6c';
let isThinking = false;
let lastAnalysisTime = 0;
const ANALYSIS_DEBOUNCE = 3000; // 3 seconds

// --- UI Logic ---

// Show/Hide Settings
settingsBtn.onclick = () => settingsModal.classList.add('active');
closeSettingsBtn.onclick = () => settingsModal.classList.remove('active');
apiKeyInput.value = apiKey;

saveSettingsBtn.onclick = () => {
    apiKey = apiKeyInput.value.trim();
    localStorage.setItem('3f_gemini_api_key', apiKey);
    settingsModal.classList.remove('active');
    if (apiKey) alert('API Key saved! The Polisher is now active.');
};

// --- AI Logic ---

async function analyzeSignal() {
    if (!apiKey || isThinking) return;

    const now = Date.now();
    if (now - lastAnalysisTime < ANALYSIS_DEBOUNCE) return;

    const formData = formInput.value.trim();
    const functionData = functionInput.value.trim();
    const feelingData = feelingInput.value.trim();
    const anchorText = document.getElementById('anchor-text').textContent;

    // Only analyze if there's enough content
    if (formData.length < 10 && functionData.length < 10 && feelingData.length < 10) return;

    isThinking = true;
    lastAnalysisTime = now;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: {
                    parts: [{
                        text: `
                        You are the "AI Polisher" for the 3F System (Form, Function, Feeling).
                        Your role is Socratic clarification to improve high-fidelity signals.
                        
                        CONTEXT ANCHOR (The manager's focus):
                        "${anchorText}"

                        - BE BRIEF: One or two sentences.
                        - BE SOCRATIC: Ask a question to help the pair clarify a specific point.
                        - USE THE ANCHOR: Relate your question to the manager's context anchor if relevant.
                        - FOCUS ON RESOLUTION: Help distinguish between a specific event vs a general pattern.
                        - AXES:
                            - Form: The tangible (meetings, tools, policies).
                            - Function: The process/goal (decision-making, deployment).
                            - Feeling: The emotional state.
                            
                        Example Question: "You mentioned 'the meeting' in Form—was that the Daily Standup or the Project Alpha Sync?"
                    `}]
                },
                contents: [{
                    parts: [{
                        text: `
                        Form Input: ${formData}
                        Function Input: ${functionData}
                        Feeling Input: ${feelingData}
                    `}]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 100,
                }
            })
        });

        const data = await response.json();
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            const suggestion = data.candidates[0].content.parts[0].text;
            addSuggestion(suggestion);
        }
    } catch (error) {
        console.error('3F Polisher Error:', error);
    } finally {
        isThinking = false;
    }
}

function addSuggestion(text) {
    const card = document.createElement('div');
    card.className = 'suggestion-card';
    card.innerHTML = `
        <p>${text}</p>
        <div class="suggestion-actions">
            <button class="btn primary add-detail">Use Suggestion</button>
            <button class="btn dismiss">Dismiss</button>
        </div>
    `;

    card.querySelector('.dismiss').addEventListener('click', () => {
        card.style.opacity = '0';
        setTimeout(() => card.remove(), 300);
    });

    suggestionsList.prepend(card);
}

// Listeners
[formInput, functionInput, feelingInput].forEach(el => {
    el.addEventListener('input', () => {
        analyzeSignal();
    });
});

console.log('3F System: Polisher initialized. Ready for API injection.');
