// 3F System - Frontend Logic with dynamic inputs and Gemini AI Integration

// UI Elements
const formInputsContainer = document.getElementById('form-inputs');
const functionInputsContainer = document.getElementById('function-inputs');
const feelingInputsContainer = document.getElementById('feeling-inputs');
const suggestionsList = document.getElementById('suggestions-list');
const polishBtn = document.getElementById('polish-btn');
const auditBtn = document.getElementById('audit-btn');
const auditStatus = document.getElementById('audit-status');
const auditStatusText = auditStatus.querySelector('span');
const saveBtn = document.getElementById('save-btn');

// State
let apiKey = 'YOUR_API_KEY_HERE';
let isThinking = false;
let isAuditPassed = false;

const placeholders = {
    form: "What tangible objects, meetings, or tools are involved?",
    function: "What process or goal was being attempted?",
    feeling: "What was the emotional state of the participants?"
};

// --- UI Logic ---

// Function to add a new input box
function addInput(section) {
    const container = document.getElementById(`${section}-inputs`);

    // Limit to 3 input boxes
    if (container.children.length >= 3) return;

    const textarea = document.createElement('textarea');
    textarea.className = 'dimension-input';
    textarea.placeholder = placeholders[section];

    // Add event listener to new textarea
    textarea.addEventListener('input', resetAuditStatus);

    container.appendChild(textarea);

    // Add Handles
    wrapInputWithHandles(textarea, section);

    textarea.focus();
}

// Function to reset audit status when content changes
function resetAuditStatus() {
    isAuditPassed = false;
    auditStatus.className = 'audit-status pending';
    auditStatusText.innerText = 'Not Audited';
    saveBtn.disabled = true;
    saveBtn.innerText = "Submit Signal (Audit Required)";
}

// Initial event listeners for existing inputs
document.querySelectorAll('.dimension-input').forEach(el => {
    el.addEventListener('input', resetAuditStatus);
});

// Add button listeners
document.querySelectorAll('.add-btn').forEach(btn => {
    btn.onclick = () => addInput(btn.dataset.section);
});

polishBtn.addEventListener('click', polishSignal);
auditBtn.addEventListener('click', auditSignal);
saveBtn.addEventListener('click', saveSession);

// --- AI Logic ---

function getAllInputsText(container) {
    return Array.from(container.querySelectorAll('.dimension-input'))
        .map(input => input.value.trim())
        .filter(text => text.length > 0)
        .join('\n- ');
}

// 1. Polish Function (Socratic Suggestions)
async function polishSignal() {
    console.log("Polish button clicked");
    if (!apiKey || isThinking) {
        console.log("Polish blocked: apiKey missing or isThinking");
        return;
    }

    const formData = getAllInputsText(formInputsContainer);
    const functionData = getAllInputsText(functionInputsContainer);
    const feelingData = getAllInputsText(feelingInputsContainer);
    const anchorText = document.getElementById('anchor-select').value;

    console.log("Inputs:", { formData, functionData, feelingData });

    if (!formData && !functionData && !feelingData) {
        alert("Please enter some text before using Polish.");
        return;
    }

    isThinking = true;
    polishBtn.disabled = true;

    // UI Feedback: Show thinking state
    const loader = document.createElement('div');
    loader.className = 'suggestion-card thinking';
    loader.innerHTML = '<p>The Polisher is thinking...</p>';
    suggestionsList.prepend(loader);

    try {
        console.log("Sending request to Gemini...");
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
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

        if (!response.ok) {
            let errorBody;
            try {
                errorBody = await response.text();
            } catch (e) {
                errorBody = "Could not read error body";
            }
            console.error("API Error Details:", errorBody);
            throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorBody}`);
        }

        const data = await response.json();
        console.log("Gemini Response:", data);
        loader.remove();

        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
            const suggestion = data.candidates[0].content.parts[0].text;
            addSuggestion(suggestion);
        } else {
            console.warn("No content in response", data);
            alert("The AI had no suggestions (Response was empty or filtered).");
        }
    } catch (error) {
        console.error('3F Polisher Error:', error);
        loader.remove();
        alert(`AI Service Error: ${error.message}`);
    } finally {
        isThinking = false;
        polishBtn.disabled = false;
    }
}

// 2. Audit Function (Quality Gate)
async function auditSignal() {
    if (!apiKey || isThinking) return;

    const formData = getAllInputsText(formInputsContainer);
    const functionData = getAllInputsText(functionInputsContainer);
    const feelingData = getAllInputsText(feelingInputsContainer);

    if (!formData || !functionData || !feelingData) {
        alert("To pass the audit, you need to provide input for ALL three dimensions (Form, Function, Feeling).");
        return;
    }

    isThinking = true;
    auditBtn.disabled = true;
    auditStatus.className = 'audit-status pending';
    auditStatusText.innerText = 'Auditing...';

    // Clear previous feedback
    suggestionsList.innerHTML = '';

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: {
                    parts: [{
                        text: `
                        You are the "Audit Bot" for the 3F System.
                        Your job is to strictly evaluate the quality of the user's reflection.
                        
                        CRITERIA FOR PASSING:
                        1. COMPLETENESS: All three dimensions (Form, Function, Feeling) must have meaningful content.
                        2. CLARITY: The text should be understandable and well-structured.
                        3. SPECIFICITY: Avoid vague statements.
                        4. EMOTIONAL HONESTY: The 'Feeling' section must contain actual emotional words (e.g., frustrated, happy, anxious) not just status updates.

                        OUTPUT FORMAT:
                        Return a pure JSON object with:
                        {
                            "pass": boolean,
                            "reason": "Short summary of why it passed or failed",
                            "improvements": ["bullet point 1", "bullet point 2"]
                        }
                        Do not wrap in markdown code blocks. Just the JSON.
                    `}]
                },
                contents: [{
                    parts: [{
                        text: `
                        Audit this signal:
                        
                        [FORM]
                        ${formData}
                        
                        [FUNCTION]
                        ${functionData}
                        
                        [FEELING]
                        ${feelingData}
                    `}]
                }],
                generationConfig: {
                    temperature: 0.2, // Lower temp for more strict deterministic evaluation
                    response_mime_type: "application/json"
                }
            })
        });

        const data = await response.json();

        let result;
        try {
            const text = data.candidates[0].content.parts[0].text;
            result = JSON.parse(text);
        } catch (e) {
            console.error("Failed to parse JSON", e);
            result = { pass: false, reason: "AI Error", improvements: ["Please try again."] };
        }

        if (result.pass) {
            isAuditPassed = true;
            auditStatus.className = 'audit-status passed';
            auditStatusText.innerText = 'Passed ✅';
            saveBtn.disabled = false;
            saveBtn.innerText = "Submit Signal";
            addSuggestion("Audit Passed! " + result.reason);
        } else {
            isAuditPassed = false;
            auditStatus.className = 'audit-status failed';
            auditStatusText.innerText = 'Issues Found ⚠️';
            saveBtn.disabled = true;
            saveBtn.innerText = "Submit Signal (Audit Required)";

            // Show constructive feedback
            addSuggestion(`<strong>Audit Failed:</strong> ${result.reason}`);
            result.improvements.forEach(tip => addSuggestion("💡 " + tip));
        }

    } catch (error) {
        console.error('Audit Error:', error);
        auditStatusText.innerText = 'Error';
        alert('Audit Service Unavailable');
    } finally {
        isThinking = false;
        auditBtn.disabled = false;
    }
}

function addSuggestion(text) {
    const card = document.createElement('div');
    card.className = 'suggestion-card';
    card.innerHTML = `
        <p>${text}</p>
        <div class="suggestion-actions">
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

// --- Database Logic ---

async function saveSession() {
    const originalText = saveBtn.innerText;

    // Prevent submission if audit failed or submitting
    if (saveBtn.disabled || !isAuditPassed) return;

    saveBtn.disabled = true;
    saveBtn.innerText = "Processing...";

    const formData = getAllInputsText(formInputsContainer);
    const functionData = getAllInputsText(functionInputsContainer);
    const feelingData = getAllInputsText(feelingInputsContainer);
    const anchorText = document.getElementById('anchor-select').value;

    // Generate Connection Summary
    const connectionSummary = connections.map((c, i) => {
        const fromText = c.fromInput.value.substring(0, 20).replace(/\n/g, ' ') + (c.fromInput.value.length > 20 ? '...' : '');
        const toText = c.toInput.value.substring(0, 20).replace(/\n/g, ' ') + (c.toInput.value.length > 20 ? '...' : '');
        const fromType = getSection(c.fromInput);
        const toType = getSection(c.toInput);
        return `   ${i + 1}. [${fromType}] "${fromText}" ➔ [${toType}] "${toText}"`;
    }).join('\n');

    // Mock Database Submission with Delay
    setTimeout(() => {
        const message = `
CONFIDENTIAL SIGNAL SUBMITTED
----------------------------
Anchor: ${anchorText.substring(0, 30)}...

Dimensions:
- Form: ${formData ? 'Provided' : 'Empty'}
- Function: ${functionData ? 'Provided' : 'Empty'}
- Feeling: ${feelingData ? 'Provided' : 'Empty'}

Connections Identified:
${connectionSummary || 'None'}

(This data would be sent to the aggregator in a live system)
        `.trim();

        alert(message);

        // Reset
        saveBtn.disabled = false;
        saveBtn.innerText = originalText;
        location.reload(); // Reloads to reset state completely
    }, 1000);
}

function resetWorkspace() {
    // Clear all inputs
    document.querySelectorAll('.dimension-input').forEach(input => input.value = '');

    // Remove extra inputs (keep first one)
    [formInputsContainer, functionInputsContainer, feelingInputsContainer].forEach(container => {
        while (container.children.length > 1) {
            container.removeChild(container.lastChild);
        }
    });

    // Clear suggestions and reset audit
    suggestionsList.innerHTML = '';
    resetAuditStatus();

    // Clear Connections
    connections.forEach(c => c.pathElement.remove());
    connections = [];
}
// --- Connection Logic ---

const svgLayer = document.getElementById('connections-layer');
let connections = []; // { id, fromInput, toInput, pathElement }
let isDragging = false;
let currentPath = null;
let startHandle = null;

// Initialize Handles for start
document.querySelectorAll('.dimension-input').forEach(input => {
    const section = input.closest('.canvas-section').id.replace('-section', '');
    wrapInputWithHandles(input, section);
});

// Helper: Wrap textarea with handles
function wrapInputWithHandles(textarea, section) {
    // If already wrapped, skip
    if (textarea.parentElement.classList.contains('input-wrapper')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'input-wrapper';
    textarea.parentNode.insertBefore(wrapper, textarea);
    wrapper.appendChild(textarea);

    // Add Handles based on section
    if (section === 'form') addHandle(wrapper, 'right', textarea);
    if (section === 'function') {
        addHandle(wrapper, 'left', textarea);
        addHandle(wrapper, 'right', textarea);
    }
    if (section === 'feeling') addHandle(wrapper, 'left', textarea);
}

function addHandle(wrapper, position, textarea) {
    const handle = document.createElement('div');
    handle.className = `conn-handle ${position}`;
    handle.dataset.position = position;

    // Bind events
    handle.addEventListener('mousedown', (e) => startDrag(e, handle, textarea));
    handle.addEventListener('mouseup', (e) => endDrag(e, handle, textarea));

    wrapper.appendChild(handle);
}

function startDrag(e, handle, textarea) {
    e.preventDefault();
    e.stopPropagation();

    startHandle = { handle, textarea, position: handle.dataset.position };
    isDragging = true;

    // Create temp path
    currentPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    currentPath.classList.add('connector-temp');
    svgLayer.appendChild(currentPath);

    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', cancelDrag);
}

function onDrag(e) {
    if (!isDragging) return;

    const startRect = startHandle.handle.getBoundingClientRect();
    const svgRect = svgLayer.getBoundingClientRect();

    const startX = startRect.left + startRect.width / 2 - svgRect.left;
    const startY = startRect.top + startRect.height / 2 - svgRect.top;

    // Mouse relative to SVG
    const endX = e.clientX - svgRect.left;
    const endY = e.clientY - svgRect.top;

    updatePath(currentPath, startX, startY, endX, endY);
}

function endDrag(e, endHandle, endTextarea) {
    // Stop propagation so cancelDrag doesn't fire immediately
    e.stopPropagation();

    if (!isDragging) return;

    // Validate Connection
    if (isValidConnection(startHandle, { handle: endHandle, textarea: endTextarea, position: endHandle.dataset.position })) {
        createConnection(startHandle.textarea, endTextarea);
    }

    cleanupDrag();
}

function cancelDrag() {
    cleanupDrag();
}

function cleanupDrag() {
    isDragging = false;
    startHandle = null;
    if (currentPath) {
        currentPath.remove();
        currentPath = null;
    }
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', cancelDrag);
}

function isValidConnection(start, end) {
    // 1. Must be different inputs
    if (start.textarea === end.textarea) return false;

    // 2. Direction: Right handle -> Left handle
    if (start.position !== 'right' || end.position !== 'left') return false;

    // 3. Section Flow: Form->Function or Function->Feeling
    const startSection = getSection(start.textarea);
    const endSection = getSection(end.textarea);

    if (startSection === 'form' && endSection === 'function') return true;
    if (startSection === 'function' && endSection === 'feeling') return true;

    return false;
}

function getSection(textarea) {
    return textarea.closest('.canvas-section').id.replace('-section', '');
}

function createConnection(fromInput, toInput) {
    // Avoid duplicates
    if (connections.find(c => c.fromInput === fromInput && c.toInput === toInput)) return;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.classList.add('connector');

    // Add delete on click
    path.addEventListener('click', (e) => {
        if (confirm('Delete connection?')) {
            path.remove();
            connections = connections.filter(c => c.pathElement !== path);
        }
    });

    svgLayer.appendChild(path);

    const connection = {
        id: Date.now(),
        fromInput,
        toInput,
        pathElement: path
    };
    connections.push(connection);

    updateThisConnection(connection);
}

function updatePath(path, x1, y1, x2, y2) {
    // Bezier control points
    const dx = Math.abs(x2 - x1) * 0.5;
    const cp1x = x1 + dx;
    const cp2x = x2 - dx;

    const d = `M ${x1} ${y1} C ${cp1x} ${y1}, ${cp2x} ${y2}, ${x2} ${y2}`;
    path.setAttribute('d', d);
}

function updateThisConnection(conn) {
    const svgRect = svgLayer.getBoundingClientRect();

    // Find handles dynamically
    const fromHandle = conn.fromInput.parentElement.querySelector('.conn-handle.right');
    const toHandle = conn.toInput.parentElement.querySelector('.conn-handle.left');

    if (!fromHandle || !toHandle) {
        // One element might have been deleted? Remove connection
        conn.pathElement.remove();
        return;
    }

    const r1 = fromHandle.getBoundingClientRect();
    const r2 = toHandle.getBoundingClientRect();

    const x1 = r1.left + r1.width / 2 - svgRect.left;
    const y1 = r1.top + r1.height / 2 - svgRect.top;
    const x2 = r2.left + r2.width / 2 - svgRect.left;
    const y2 = r2.top + r2.height / 2 - svgRect.top;

    updatePath(conn.pathElement, x1, y1, x2, y2);
}

function updateAllConnections() {
    // Filter out dead connections
    connections = connections.filter(c => document.contains(c.fromInput) && document.contains(c.toInput));

    connections.forEach(updateThisConnection);
}

// Update on resize or scroll
window.addEventListener('resize', updateAllConnections);
// Ideally observe mutations or scroll, but simplistic for now:
setInterval(updateAllConnections, 100); // Poll for layout changes (simple robust solution)
