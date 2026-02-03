// 3F System - Frontend Logic with dynamic inputs and Gemini AI Integration

// UI Elements
const formInputsContainer = document.getElementById('form-inputs');
const functionInputsContainer = document.getElementById('function-inputs');
const feelingInputsContainer = document.getElementById('feeling-inputs');
const suggestionsList = document.getElementById('suggestions-list');

// State
let apiKey = 'AIzaSyAcPZs9Wv1sldRUq33LE_pgY9mvWPqRE6c';
let isThinking = false;
let lastAnalysisTime = 0;
const ANALYSIS_DEBOUNCE = 3000; // 3 seconds

const placeholders = {
    form: "What tangible objects, meetings, or tools are involved?",
    function: "What process or goal was being attempted?",
    feeling: "What was the emotional state of the participants?"
};

// --- UI Logic ---

// Function to add a new input box
function addInput(section) {
    const container = document.getElementById(`${section}-inputs`);
    const textarea = document.createElement('textarea');
    textarea.className = 'dimension-input';
    textarea.placeholder = placeholders[section];

    // Add event listener to new textarea
    textarea.addEventListener('input', () => analyzeSignal());

    container.appendChild(textarea);
    textarea.focus();
}

// Initial event listeners for existing inputs
document.querySelectorAll('.dimension-input').forEach(el => {
    el.addEventListener('input', () => analyzeSignal());
});

// Add button listeners
document.querySelectorAll('.add-btn').forEach(btn => {
    btn.onclick = () => addInput(btn.dataset.section);
});

// --- AI Logic ---

function getAllInputsText(container) {
    return Array.from(container.querySelectorAll('.dimension-input'))
        .map(input => input.value.trim())
        .filter(text => text.length > 0)
        .join('\n- ');
}

async function analyzeSignal() {
    if (!apiKey || isThinking) return;

    const now = Date.now();
    if (now - lastAnalysisTime < ANALYSIS_DEBOUNCE) return;

    const formData = getAllInputsText(formInputsContainer);
    const functionData = getAllInputsText(functionInputsContainer);
    const feelingData = getAllInputsText(feelingInputsContainer);
    const anchorText = document.getElementById('anchor-select').value;

    // Only analyze if there's enough content across all inputs
    if (formData.length < 3 && functionData.length < 3 && feelingData.length < 3) return;

    isThinking = true;
    lastAnalysisTime = now;

    // UI Feedback: Show thinking state
    const loader = document.createElement('div');
    loader.className = 'suggestion-card thinking';
    loader.innerHTML = '<p>The Polisher is thinking...</p>';
    suggestionsList.prepend(loader);

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
                    `}]
                },
                contents: [{
                    parts: [{
                        text: `
                        Current Signal State:
                        Form Items:
                        - ${formData || 'None provided'}
                        
                        Function Items:
                        - ${functionData || 'None provided'}
                        
                        Feeling Items:
                        - ${feelingData || 'None provided'}

                        Provide ONE Socratic question to clarify these inputs.
                    `}]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 100,
                }
            })
        });

        const data = await response.json();
        loader.remove(); // Remove thinking state

        if (data.candidates && data.candidates[0].content.parts[0].text) {
            const suggestion = data.candidates[0].content.parts[0].text;
            addSuggestion(suggestion);
        }
    } catch (error) {
        console.error('3F Polisher Error:', error);
        loader.remove();
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

console.log('3F System: Dynamic Workspace initialized.');
