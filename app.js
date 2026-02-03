// 3F System - Frontend Logic Demo

const formInput = document.getElementById('form-input');
const functionInput = document.getElementById('function-input');
const feelingInput = document.getElementById('feeling-input');
const suggestionsList = document.getElementById('suggestions-list');

// Mock AI Suggestions logic
const mockSuggestions = [
    {
        trigger: 'meeting',
        text: 'You mentioned a "meeting". To help the Weaver identify patterns, could you specify which meeting it was?',
        applied: false
    },
    {
        trigger: 'deployment',
        text: 'In Function, you noted "deployment". Was this the production push or a staging test?',
        applied: false
    },
    {
        trigger: 'frustrated',
        text: 'You captured a feeling of frustration. Is this related to the tool (Form) or the process (Function)?',
        applied: false
    }
];

function addSuggestion(suggestion) {
    const card = document.createElement('div');
    card.className = 'suggestion-card';
    card.innerHTML = `
        <p>${suggestion.text}</p>
        <div class="suggestion-actions">
            <button class="btn primary">Add Detail</button>
            <button class="btn dismiss">Dismiss</button>
        </div>
    `;
    
    card.querySelector('.dismiss').addEventListener('click', () => {
        card.style.opacity = '0';
        setTimeout(() => card.remove(), 300);
    });

    suggestionsList.prepend(card);
}

// Simple trigger listener
[formInput, functionInput, feelingInput].forEach(el => {
    el.addEventListener('input', (e) => {
        const val = e.target.value.toLowerCase();
        
        mockSuggestions.forEach(s => {
            if (val.includes(s.trigger) && !s.applied) {
                addSuggestion(s);
                s.applied = true; // Only suggest once in this demo
            }
        });
    });
});

// Auto-save indicator mock
console.log('3F System: Workspace initialized. Privacy-by-design active.');
