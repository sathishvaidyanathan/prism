# PRISM Architecture: The 3+ Layer Design

PRISM is built on a sophisticated **multi-layer architecture** that goes beyond the simple "3-layer" model. Here's the complete breakdown:

## 🏗️ The Core Insight

PRISM separates **three distinct concerns**:
1. **What to ask** (Prompt Engineering)
2. **What structure to expect** (JSON Schema Contract)
3. **How to display it** (Rendering Logic)

But in reality, it's a **5-layer system** with additional layers for configuration, orchestration, and network abstraction.

---

## 📊 Complete Architecture Layers

### Layer 1: **Configuration & State Management**
**Location**: Top of `index.html` (`CONFIG` object)

```javascript
const CONFIG = {
    api: {
        baseUrl: 'http://localhost:3000/api/messages',
        model: 'claude-opus-4-0',
        version: '2023-06-01',
        maxTokensVisualization: 4096,
        maxTokensVisualizationLarge: 8192,
        urlFetchEndpoint: 'http://localhost:3000/api/fetch'
    }
};
```

**Responsibilities**:
- Centralized configuration for all API calls
- Model selection and versioning
- Token limits (dynamic scaling logic)
- Endpoint management
- Easy to swap LLM providers without code changes

---

### Layer 2: **Prompt Engineering & Contract Definition**
**Location**: `PROMPTS` object in `index.html`

```javascript
const PROMPTS = {
    recommendation: { system, user },
    visualization: {
        base: "You are a visualization expert...",
        clarityPlus: "Return JSON: { hero: {...}, insights: [...] }",
        mindMap: "Return JSON: { root: string, branches: [] }",
        techArchDiagram: "Return nodes with CRITICAL POSITIONING RULES...",
        // ... 15+ visualization-specific prompts
    }
};
```

**Responsibilities**:
- **Explicit JSON schema definition** in natural language within prompts
- Visualization-specific instructions (what fields to include, how to structure data)
- Business logic embedded as instructions (e.g., "spacing must be 40px minimum")
- Tone, style, and content guidelines per visualization type
- CRITICAL: Claude reads these prompts and **knows the expected output format**

**Key Examples**:

**For Tech Architecture Diagram**:
```
Return a JSON object with:
{
  "nodes": [
    {
      "id": "unique-id",
      "label": "Component Name",
      "description": "...",
      "x": 100,
      "y": 200,
      "type": "database|api|service|frontend"
    }
  ],
  "connections": [
    {
      "from": "node-id",
      "to": "node-id",
      "type": "sync|async",
      "label": "description"
    }
  ]
}

CRITICAL POSITIONING RULES:
- Minimum 40px between nodes
- 200px between different groups
- Grid alignment at 20px intervals
- No overlapping boxes
```

**For Timeline View**:
```
Return a JSON object with:
{
  "timeline": {
    "start_date": "YYYY-MM-DD",
    "end_date": "YYYY-MM-DD",
    "workstreams": [
      {
        "name": "string",
        "bars": [
          {
            "start": "YYYY-MM-DD",
            "end": "YYYY-MM-DD",
            "status": "complete|in-progress|planned",
            "label": "string"
          }
        ]
      }
    ]
  }
}
```

---

### Layer 3: **Network & Proxy Layer**
**Location**: `proxy.js` (Node.js middleware)

```javascript
// proxy.js routes:
POST /api/messages  → LLM Gateway → /anthropic/v1/messages
POST /api/fetch     → URL Content Fetcher
```

**Responsibilities**:
- CORS proxy (browser can't directly call external APIs)
- Authentication tunneling (headers, tokens)
- Request/response transformation
- Error handling and timeout management
- Logging and debugging
- URL fetching from public links

**Why it exists**:
- Browser security (CORS restrictions)
- Hide LLM gateway details from frontend
- Centralize authentication
- Can swap backend without changing frontend

---

### Layer 4: **API Client & Orchestration Layer**
**Location**: `API` object in `index.html` (lines ~1987-2100)

```javascript
const API = {
    fetchRecommendations(text),      // What viz types to suggest
    fetchVisualizations(text, type), // Generate visualization
    fetchURLContent(url),             // Get URL content
    buildPrompt(vizType),             // Select right prompt
    parseResponse(text),              // Parse JSON response
    validateResponse(data, vizType)   // Schema validation
};
```

**Responsibilities**:
- Abstract API communication details
- Handle request/response lifecycle
- Select appropriate prompt based on viz type
- Dynamic token allocation logic:
  ```javascript
  if (text.length > 5000) {
      maxTokens = 8192;  // Large inputs
  } else if (text.length > 2000) {
      maxTokens = 4096 + Math.floor(text.length / 10);  // Medium
  } else {
      maxTokens = 4096;  // Small
  }
  ```
- Error handling and retry logic
- **Bridges prompt layer to render layer**

---

### Layer 5: **JSON Schema Contract & Validation**
**Location**: Implicit in `API.parseResponse()` and `API.validateResponse()`

```javascript
parseResponse(text) {
    try {
        const parsed = JSON.parse(text);
        // At this point, we've verified JSON is valid
        // But we trust the schema from the PROMPT layer
        return parsed;
    } catch (e) {
        // Show detailed error with context
        const context = text.substring(Math.max(0, pos - 50), pos + 50);
        throw new Error(`JSON parsing failed at position ${pos}: "${context}..."`);
    }
}
```

**Responsibilities**:
- **Verify LLM response is valid JSON** (contract validation)
- Parse string response to JavaScript object
- Provide detailed error messages if schema is violated
- Graceful fallbacks for malformed responses
- Browser console logging for debugging

**The Contract**: PRISM doesn't explicitly validate schema; it **trusts the prompt**:
- Prompt says "return { nodes: [], connections: [] }" 
- PRISM receives that structure
- If it doesn't match, error is caught and reported

---

### Layer 6: **Rendering Engine Layer**
**Location**: `render*()` functions in `index.html` (~50 functions)

```javascript
renderOutput(data) {
    const vizType = getVisualizationType();
    
    if (vizType === 'tech-arch-diagram')
        return renderTechArchDiagram(data);
    else if (vizType === 'timeline-view')
        return renderTimelineView(data);
    // ... 15+ specific renderers
}
```

**Rendering Strategies** (varies per visualization):

#### **Strategy A: SVG Canvas** (Tech Architecture, Flowchart)
```javascript
function renderTechArchDiagram(data) {
    // 1. Calculate canvas size from node positions
    const bounds = calculateBounds(data.nodes);
    const svg = createSVG(bounds.width, bounds.height);
    
    // 2. Draw connections (lines with arrows)
    data.connections.forEach(conn => {
        const arrow = getArrowMarker(conn.type);  // sync=solid, async=dashed
        svg.appendChild(createLine(conn.from, conn.to, arrow));
    });
    
    // 3. Draw nodes (foreignObject with HTML)
    data.nodes.forEach(node => {
        const foreignObject = createForeignObject(node.x, node.y, node.width, node.height);
        const div = createStyledDiv(node.label, node.type);
        foreignObject.appendChild(div);
        svg.appendChild(foreignObject);
    });
    
    // 4. Legend
    svg.appendChild(createLegend(data.node_types));
    
    return svg;
}
```

#### **Strategy B: Flexbox Cards** (Clarity View, Lean Canvas)
```javascript
function renderClarityView(data) {
    let html = '<div class="success-output">';
    
    // Expandable sections
    data.structure.forEach((section, idx) => {
        html += `<div onclick="toggleSection('${contentId}', '${sectionId}')">
            <span>${section.heading}</span>
            <span>+</span>
        </div>`;
        html += `<div id="${contentId}" style="display: none;">
            ${section.items.map(item => `<li>${item}</li>`).join('')}
        </div>`;
    });
    
    outputDiv.innerHTML = html;
}
```

#### **Strategy C: Gantt Chart** (Timeline View)
```javascript
function renderTimelineView(data) {
    // 1. Time scale header
    const header = createTimeHeader(data.timeline.start_date, data.timeline.end_date);
    
    // 2. Workstream rows
    data.workstreams.forEach(ws => {
        const row = createWorkstreamRow(ws.name);
        ws.bars.forEach(bar => {
            const barElement = createGanttBar(
                bar.start,
                bar.end,
                bar.status,  // CSS class: complete (green), in-progress (yellow), etc.
                bar.label
            );
            row.appendChild(barElement);
        });
        container.appendChild(row);
    });
    
    // 3. Risks panel
    container.appendChild(createRisksPanel(data.critical_risks));
    
    outputDiv.appendChild(container);
}
```

**Key Insight**: Each renderer knows:
- What fields the JSON contains
- How to translate those fields to HTML/SVG
- Styling rules per status, type, or category
- Error handling if data is missing

---

## 🔄 Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ LAYER 1: USER INPUT                                             │
├─────────────────────────────────────────────────────────────────┤
│ Text Input → Text Area → Parse (validate min 500 chars)        │
│ URL Input  → Fetch via /api/fetch → Extract content            │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ LAYER 2: PROMPT ENGINEERING & ORCHESTRATION                     │
├─────────────────────────────────────────────────────────────────┤
│ getVisualizationType() → Find in VIZ_TYPES                      │
│ API.buildPrompt(type) → Select from PROMPTS.visualization      │
│ Calculate maxTokens based on text.length (dynamic scaling)      │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ LAYER 3: REQUEST CONSTRUCTION                                   │
├─────────────────────────────────────────────────────────────────┤
│ Build JSON payload:                                             │
│ {                                                               │
│   "model": "claude-opus-4-0",                                   │
│   "max_tokens": 4096|6000|8192,  // Dynamic                     │
│   "system": "[selected prompt with JSON schema]",               │
│   "messages": [{ "role": "user", "content": "[text]" }]        │
│ }                                                               │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ LAYER 4: NETWORK LAYER (proxy.js)                              │
├─────────────────────────────────────────────────────────────────┤
│ Browser → POST /api/messages                                    │
│ proxy.js → HTTPS → LLM Gateway → /anthropic/v1/messages        │
│ Response → back through proxy.js → back to browser             │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ LAYER 5: RESPONSE PARSING & VALIDATION                         │
├─────────────────────────────────────────────────────────────────┤
│ LLM returns:                                                    │
│ {                                                               │
│   "content": [                                                  │
│     { "type": "text", "text": "```json\n{...}\n```" }          │
│   ]                                                             │
│ }                                                               │
│                                                                 │
│ API.parseResponse():                                            │
│ 1. Extract text from content[0].text                           │
│ 2. Strip markdown code fence (```json ... ```)                 │
│ 3. JSON.parse() → Validate is valid JSON                       │
│ 4. Return { nodes, connections } or similar                    │
│                                                                 │
│ If error: Show detailed error with context snippet             │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ LAYER 6: RENDERING                                              │
├─────────────────────────────────────────────────────────────────┤
│ renderOutput(data) {                                            │
│     if (vizType === 'tech-arch-diagram')                       │
│         return renderTechArchDiagram(data);  // SVG strategy    │
│     else if (vizType === 'timeline-view')                       │
│         return renderTimelineView(data);     // Gantt strategy  │
│     else                                                        │
│         return renderClarityView(data);      // Cards strategy  │
│ }                                                               │
│                                                                 │
│ Rendering calls:                                               │
│ - HTML/CSS for cards, sections, lists                         │
│ - SVG for diagrams with calculated positions                  │
│ - Flexbox for responsive layouts                              │
│ - Custom CSS classes for theming (Business vs Geek)           │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ LAYER 7: DISPLAY & INTERACTION                                 │
├─────────────────────────────────────────────────────────────────┤
│ Show in #output div                                             │
│ Add click handlers (expandable sections, info popups)          │
│ Theme switching (Business ↔ Geek)                             │
│ Export to PDF (html2pdf library)                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 The "Three Pillars" Concept Explained

### **Pillar 1: PROMPT CONTRACT**
```javascript
// This prompt tells Claude the EXACT structure to return
PROMPTS.visualization.techArchDiagram = `
You are a technical architect. Convert the provided text into a system architecture diagram.

Return ONLY a valid JSON object with NO additional text:
{
  "nodes": [
    {
      "id": "unique-identifier",
      "label": "Component Name",
      "type": "database|api|service|frontend",
      "description": "What this component does"
    }
  ],
  "connections": [
    {
      "from": "source-node-id",
      "to": "target-node-id",
      "type": "sync|async",
      "label": "relationship description"
    }
  ]
}

CRITICAL POSITIONING RULES:
- Separate groups by at least 200px
- Place nodes on 20px grid
- Minimum 40px spacing between nodes
`;
```

**What happens**: Claude reads this, understands "I need to return JSON with nodes and connections", and generates exactly that.

### **Pillar 2: JSON SCHEMA**
```javascript
// This is the contract between LLM and renderer
// LLM guarantees this structure
// Renderer expects this structure

interface TechArchResponse {
  nodes: {
    id: string;
    label: string;
    type: "database" | "api" | "service" | "frontend";
    description: string;
  }[];
  connections: {
    from: string;
    to: string;
    type: "sync" | "async";
    label: string;
  }[];
}
```

**What happens**: No explicit validation, but if JSON doesn't match, rendering fails with clear error. This is **implicit validation through rendering**.

### **Pillar 3: RENDERER**
```javascript
function renderTechArchDiagram(data) {
    // This function ASSUMES the JSON structure from Pillar 2
    // It takes data.nodes and data.connections
    // Converts them to SVG with HTML styling
    
    const svg = createSVG();
    
    // For each node: create circle + label
    data.nodes.forEach(node => {
        const g = createNodeGroup(node.x, node.y, node.label);
        svg.appendChild(g);
    });
    
    // For each connection: create arrow line
    data.connections.forEach(conn => {
        const line = createArrow(conn.from, conn.to, conn.type);
        svg.appendChild(line);
    });
    
    return svg;
}
```

**What happens**: Takes the JSON structure and visualizes it. This layer doesn't care about the business logic—it just renders what it's given.

---

## 🔗 How the Layers Connect

| Layer | Input | Output | Technology | Purpose |
|-------|-------|--------|-----------|---------|
| 1 | Text/URL | Normalized text | DOM, Fetch API | User interaction |
| 2 | Viz type + text | Prompt + tokens | JavaScript objects | Decide what to ask LLM |
| 3 | Prompt + tokens | HTTP request | Fetch API | Prepare API call |
| 4 | HTTP request | HTTP response | Node.js proxy | Network abstraction |
| 5 | HTML response | JSON object | JSON.parse() | Parse LLM response |
| 6 | JSON object | HTML/SVG | Template strings, SVG APIs | Visualize data |
| 7 | HTML/SVG | User sees visual | CSS + JavaScript | Display & interact |

---

## 💡 Why This Design?

### **Separation of Concerns**
- **Layer 2** (Prompts) can be changed without touching **Layer 6** (Renderers)
- Add new visualization type: modify only Layer 2 and Layer 6
- Change LLM provider: modify only Layer 3 & Layer 4
- Update styling: modify only Layer 7

### **Flexibility**
- **Different rendering strategies per viz type**:
  - SVG for diagrams (tech-arch, flowchart)
  - Flexbox cards for summaries (clarity, lean-canvas)
  - Gantt bars for timelines (timeline-view)
- **Dynamic token allocation** respects LLM constraints
- **Graceful degradation** if JSON parsing fails

### **Extensibility**
- Add new visualization: 
  1. Write prompt in Layer 2
  2. Write renderer function in Layer 6
  3. Wire up in Layer 6 dispatcher (`renderOutput()`)
  4. Add tile in HTML UI
  5. Done!

### **Debugging**
- Each layer has clear inputs/outputs
- Browser console logs at each stage
- Full LLM response available for debugging
- Error messages pinpoint exactly where it failed

---

## 🚀 Real Example: Adding "Risk Matrix" Visualization

To add a new visualization:

**Step 1: Write Prompt (Layer 2)**
```javascript
PROMPTS.visualization.riskMatrix = `
Return JSON:
{
  "risks": [
    {
      "name": "string",
      "likelihood": 1-5,  // 1=rare, 5=certain
      "impact": 1-5,       // 1=minor, 5=catastrophic
      "mitigation": "string"
    }
  ]
}
`;
```

**Step 2: Add to VIZ_TYPES**
```javascript
const VIZ_TYPES = {
    // ... existing
    'risk-matrix': 'Risk Matrix'
};
```

**Step 3: Write Renderer (Layer 6)**
```javascript
function renderRiskMatrix(data) {
    const svg = createSVG(500, 500);
    
    // Create 5x5 grid
    // Plot risks as circles at (likelihood, impact)
    // Color by severity: green (low) → red (high)
    
    data.risks.forEach(risk => {
        const circle = createCircle(
            risk.likelihood * 100,
            risk.impact * 100,
            risk.name
        );
        svg.appendChild(circle);
    });
    
    return svg;
}
```

**Step 4: Wire up (Layer 6 dispatcher)**
```javascript
function renderOutput(data) {
    // ... existing cases
    else if (vizType === 'risk-matrix') {
        renderRiskMatrix(data);
    }
}
```

**Step 5: Add HTML tile**
```html
<div class="viz-card" data-value="risk-matrix" data-category="Planning">
    <svg class="viz-card-icon"><!-- icon --></svg>
    <div class="viz-card-title">Risk Matrix</div>
</div>
```

**Done!** The visualization now works end-to-end.

---

## 📈 Conclusion: 3 Layers or 7?

**Simple answer**: Yes, it's a **3-pillar design**:
1. **Prompt Engineering** (what to ask)
2. **JSON Schema** (what structure to expect)
3. **Rendering** (how to display)

**Complete answer**: It's a **7-layer architecture** that supports the 3-pillar design:
1. User Input
2. Prompt Engineering & Orchestration
3. Request Construction
4. Network Layer
5. Response Parsing & Validation
6. Rendering Engine
7. Display & Interaction

The layers provide **clean separation of concerns**, making PRISM **extensible, maintainable, and flexible** across visualization types and LLM providers.
