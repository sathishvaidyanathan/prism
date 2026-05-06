# PRISM - Text to Visual Insights

Transform any text into structured, visual insights with PRISM. Paste text or provide a URL, select a visualization type, and let AI generate polished diagrams, frameworks, and strategic analysis.

## 🎯 What is PRISM?

PRISM is an intelligent visualization engine that converts unstructured text into 15+ structured visual formats. Whether you're analyzing business strategies, documenting system architecture, planning projects, or learning from experiences, PRISM helps you see the patterns, relationships, and insights hidden in text.

**Key Idea**: Give PRISM text + visualization type → Get a beautiful, actionable visual in seconds.

## ✨ Core Features

### 📊 15+ Visualization Types

**Business & Strategy**
- **Clarity View** - High-level summaries with key points and takeaways
- **Clarity Plus** - Consultant-style reports with metrics and recommendations
- **Golden Circle** - Simon Sinek's Why-What-How framework for purpose and messaging
- **Reflective Model** - What-So What-Now What for learning and continuous improvement
- **Lean Canvas** - One-page business model (9-block canvas)
- **Earnings Snapshot** - Investor-friendly financial analysis and trends

**Technical & Planning**
- **Technology Architecture Diagram** - System components, connections, and dependencies
- **Flowchart** - Process flows, decision trees, and sequential logic
- **UML Sequence** - Actor interactions and message timing over time
- **Tech Architecture Diagram** - Technical system design and integration patterns

**Analysis & Learning**
- **Blameless Postmortem** - Incident analysis with timeline, 5 Whys, and action items
- **Mind Map** - Hierarchical concept relationships and idea connections
- **Timeline View** - PMO-grade Gantt charts with workstreams, milestones, and risks
- **Matrix View (2x2)** - Quadrant analysis for prioritization and comparison
- **Node View** - Custom node-and-link diagrams for complex relationships

**Planning & Task Management**
- **To-Do List** - Structured action items with priorities and dependencies

### 🎨 Smart Rendering
- **SVG-based diagrams** - Crisp, scalable visuals that look professional
- **Responsive layouts** - Works beautifully on desktop and mobile
- **Theme support** - Toggle between Business (default) and Geek (retro terminal) themes
- **Interactive cards** - Click to copy, expand details, and interact with visualizations

### 🚀 Flexible Input
- **Paste text directly** - Copy-paste any article, email, or documentation
- **URL support** - Provide a public link and PRISM fetches and visualizes the content
- **Real-time preview** - See character counts and input validation
- **Clear formatting** - Remove excess whitespace and normalize input

### 🧠 AI-Powered Analysis
- Integrates with any LLM provider (Claude, GPT, Llama, etc.)
- Claude generates both semantic understanding AND visual structure
- Dynamic token allocation for optimal analysis depth
- Intelligent scaling based on input size

## 🛠️ How It Works

1. **Paste or provide text** - Copy content or paste a URL
2. **Choose visualization type** - Select from 15+ visualization formats
3. **Click Render** - PRISM sends text to LLM with detailed instructions
4. **Get visual insights** - Claude returns JSON-formatted visual data
5. **Interactive display** - Frontend renders SVG, cards, and formatted layouts

### Architecture
```
User Input (Text/URL)
    ↓
Text Processing & Normalization
    ↓
LLM Prompt Engineering (with specific visualization instructions)
    ↓
LLM Response (JSON-formatted visual data)
    ↓
JSON Parsing & Validation
    ↓
Frontend Rendering (SVG, HTML/CSS, Interactive Components)
    ↓
Beautiful Visual Output
```

## 🎮 User Experience

### Visualization Selection
Click any tile to select a visualization type:
- Visual preview of what the diagram will contain
- Description and use cases
- Category badge (Business, Tech, Planning, etc.)
- Works with or without a "Render" button

### Output Display
- **Success state**: Displays rendered visualization with interactive elements
- **Loading state**: Shows processing status while LLM analyzes
- **Error state**: Clear error messages with troubleshooting suggestions
- **Empty state**: Instructions for getting started

### Theme Switching
Toggle between Business (professional purple/blue) and Geek (retro terminal green) themes for different moods.

## 🔧 Technical Highlights

### Frontend Stack
- **Vanilla HTML/CSS/JavaScript** - No frameworks, minimal dependencies
- **SVG rendering** - Professional, scalable diagrams
- **Flexbox layouts** - Responsive, adaptive design
- **Local processing** - All rendering happens in the browser

### Visualization Rendering
- **SVG viewBox** - Infinite canvas with dynamic sizing
- **HTML/CSS nodes** - Styled components within SVG using foreignObject
- **Responsive scaling** - Diagrams adjust to content size
- **Arrow connections** - SVG markers for elegant flow indicators

### Dynamic Token Management
- **Smart scaling** - Token allocation adapts to input size
  - Small inputs (< 2KB): 4096 tokens
  - Medium inputs (2-5KB): Scales proportionally up to 6000 tokens
  - Large inputs (> 5KB): 8192 tokens
- **Prevents truncation** - Ensures complete, valid JSON responses
- **Graceful error handling** - Detailed error messages with context

## 📝 Visualization Examples

### Technology Architecture Diagram
Converts technical descriptions into visual system diagrams:
- Component nodes with emojis
- Connection lines with direction arrows
- Legend showing component types
- Fully interactive and zoomable

### Timeline View
PMO-grade project visualization:
- Workstream rows with Gantt bars
- Color-coded status (complete=green, in-progress=yellow, planned=gray, risk=red)
- Critical risks panel
- Milestone markers

### Clarity Plus
Consultant-style strategic documents:
- Hero section with accent color
- Structured insights with key points
- Metrics and data visualizations
- Color-coded recommendations
- Professional footer notes

## 🔌 LLM Integration

PRISM is designed to work with any LLM that supports:
- Function calling / structured output
- JSON response generation
- Long-context processing (4K-8K tokens)
- Multi-turn conversations

### Supported Providers
- OpenAI (GPT-4, GPT-4 Turbo)
- Anthropic (Claude series)
- Open source (Llama, Mistral, etc.)
- Any LLM with API access

### Configuration
Edit `proxy.js` or your LLM gateway config to:
- Set API endpoint
- Configure authentication
- Adjust token limits per visualization type
- Add custom LLM models

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ or modern browser with fetch API
- LLM API key (OpenAI, Anthropic, etc.)
- Public internet connection (for URL-based inputs)

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/prism.git
cd prism

# Install dependencies (if any)
npm install

# Start the application
npm start
# PRISM runs at http://localhost:3000
```

### Configuration

1. **Set up your LLM provider**:
   - Get API key from your LLM provider
   - Add to environment variables or config file
   - Test connectivity

2. **Configure PRISM**:
   - Edit `proxy.js` to connect to your LLM gateway
   - Set token limits in configuration
   - Adjust prompts if needed

3. **Test**:
   - Paste sample text
   - Try different visualization types
   - Verify SVG rendering and interactions

## 🧪 Testing Visualizations

### Quick Test
```
Input: "We have a database, API server, and frontend. The frontend calls the API, which queries the database."

Visualization Type: Technology Architecture Diagram

Expected Output: Visual diagram with 3 nodes (Database, API, Frontend) and connection arrows showing data flow.
```

### Full Test Suite
Try each visualization with relevant content:
- **Mind Map**: Complex topics with many subtopics
- **Timeline View**: Project plans with dates and milestones
- **Flowchart**: Business processes or algorithms
- **UML Sequence**: API interactions or system protocols
- **Blameless Postmortem**: Incident or failure analysis

## 📦 Browser Extension (PRISM Edge)

Capture text from any webpage and visualize it instantly with PRISM Edge:
- **Right-click any text** → "Visualize with PRISM"
- **Click extension icon** → See selected text
- **One-click visualization** → Opens PRISM with your text

Included in `prism_edge/` folder. See [PRISM Edge README](./prism_edge/README.md) for setup.

## 🎨 Customization

### Add New Visualization Types
1. Create `renderNewVisualization()` function in index.html
2. Add visualization to `VIZ_TYPES` object
3. Create tile card with icon and description
4. Add LLM prompt in `PROMPTS.visualization`
5. Wire up in `buildPrompt()` and `renderOutput()`

### Modify Styling
- Edit CSS variables in `<style>` section
- Adjust colors, spacing, and typography
- Create new themes with `--primary-color`, `--secondary-color`, etc.

### Customize Prompts
Edit `PROMPTS` object to adjust how Claude analyzes text for each visualization type. Each prompt includes:
- Specific instructions for the visualization format
- JSON schema expectations
- Styling guidelines
- Content focus areas

## 🐛 Troubleshooting

### JSON Parsing Errors
- **Cause**: LLM response was truncated due to low token limit
- **Fix**: Increase `maxTokensVisualization` in config
- **Check**: Browser console (F12) for full response

### Visualization Not Rendering
- **Cause**: Invalid JSON structure or missing required fields
- **Fix**: Check LLM prompt alignment with expected JSON schema
- **Check**: Inspect network tab to see LLM response

### LLM API Failures
- **Cause**: Authentication, rate limits, or network issues
- **Fix**: Verify API key, check rate limits, try again
- **Check**: Test LLM provider directly with simple request

### URL Content Not Loading
- **Cause**: CORS restrictions, private URLs, or invalid links
- **Fix**: Use text input instead, check URL is publicly accessible
- **Check**: Browser console for fetch errors

## 📊 Performance

- **Rendering**: < 100ms for most visualizations
- **LLM processing**: 2-5 seconds (varies by provider and token count)
- **Input processing**: Instant (< 50ms)
- **Total time**: ~3-6 seconds from paste to visual

## 🔒 Privacy & Security

- **Client-side rendering**: All visuals render in your browser
- **Text transmission**: Only sent to your configured LLM provider
- **No tracking**: PRISM doesn't track usage or store inputs
- **Local-first**: Works fully in your local environment

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Test your changes thoroughly
4. Submit a pull request with description

## 💡 Ideas & Feedback

Have suggestions for new visualization types? Found a bug? Want to improve PRISM?
- Open an issue on GitHub
- Submit a feature request
- Share how you're using PRISM

## 🎯 Roadmap

- [ ] Export visualizations (PNG, SVG, PDF)
- [ ] Save visualization history
- [ ] Custom color schemes per visualization
- [ ] Keyboard shortcuts for common actions
- [ ] Batch processing multiple texts
- [ ] Plugin system for custom visualizations
- [ ] Mobile app version
- [ ] Real-time collaboration features

---

**Made with LOVE for people who think in pictures**

Transform text. See insights. Take action.
