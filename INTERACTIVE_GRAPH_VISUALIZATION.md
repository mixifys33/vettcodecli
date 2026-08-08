# Interactive Data Flow Graph Visualization

## 🎉 What Was Created

I've created a **proper interactive graph visualization** using ReactFlow that shows actual flowing connections between nodes with arrows, making it easy to understand how data flows through your codebase and where vulnerabilities exist.

---

## 📦 New Dependencies Added to package.json

```json
{
  "dependencies": {
    "reactflow": "^11.11.0", // Interactive graph visualization library
    "dagre": "^0.8.5" // Automatic graph layout algorithm
  },
  "devDependencies": {
    "@types/dagre": "^0.7.52" // TypeScript types for dagre
  }
}
```

### Installation Required

Run this command to install the new packages:

```bash
cd vettcode-cli-landing
npm install
```

---

## 🎨 New Features

### 1. Interactive Flow Graph Component

**File:** `components/report/InteractiveFlowGraph.tsx`

A professional graph visualization with:

- ✅ **Visual flowing arrows** showing data movement
- ✅ **Animated red arrows** for dangerous/tainted paths
- ✅ **Color-coded nodes** by type (source, sink, function, variable)
- ✅ **Custom node designs** with icons and vulnerability warnings
- ✅ **Automatic layout** using Dagre algorithm (left-to-right flow)
- ✅ **Interactive controls** (zoom, pan, minimap)
- ✅ **Click nodes** to see details
- ✅ **Pulsing animations** for vulnerable nodes

**Node Types:**

- 🔵 **Sources** (Blue) - Entry points where attacker-controlled data enters
- 🔴 **Sinks** (Red) - Danger zones where vulnerabilities can be exploited
- 🟣 **Functions** (Purple) - Processing points in the flow
- 🟡 **Variables** (Yellow) - Data storage points

**Arrow Types:**

- **Solid Red (Animated)** - Tainted/Vulnerable data flow
- **Dashed Green** - Sanitized/Safe data flow
- **Gray** - Neutral flow

### 2. Comprehensive Data Flow Page

**File:** `app/reports/[id]/dataflow-new/page.tsx`

A full-featured visualization page with:

#### Left Sidebar:

1. **Security Status Card**
   - Risk level percentage
   - Critical/Moderate/Secure indicator
   - Statistics grid (entry points, danger zones, vulnerable, protected)

2. **Vulnerable Paths List**
   - Shows all dangerous data flows
   - Click to highlight on graph
   - Shows source → sink with data type
   - Displays vulnerability type

3. **Selected Node Details**
   - Node type and identifier
   - Sensitive data type (passwords, emails, etc.)
   - File location and line number
   - Click any node on graph to see details

4. **Legend**
   - Node type color guide
   - Arrow type meanings

#### Main Area:

- **Full-screen interactive graph**
- Zoom and pan controls
- Minimap for navigation
- Click nodes to inspect
- Visual representation of all data flows

---

## 🚀 How to Use

### Access the New Visualization

**Option 1: Direct URL**

```
https://vettcodecli.vercel.app/reports/{reportId}/dataflow-new
```

**Option 2: Update Navigation**
Update the "Open Visualization" button in `StructuredReportViewer.tsx` to point to the new page:

```typescript
<a href={`/reports/${report.id}/dataflow-new`}>
  Open Visualization
</a>
```

### What Users Will See

1. **Header** - Shows overview stats (flows, entry points, danger zones)
2. **Security Status** - Color-coded risk level (red=critical, yellow=moderate, green=secure)
3. **Interactive Graph** - Visual representation with:
   - Nodes positioned left-to-right (sources → intermediates → sinks)
   - Arrows showing data flow direction
   - Red animated arrows for vulnerable paths
   - Green dashed arrows for safe paths
4. **Vulnerable Paths** - List of security issues found
5. **Node Details** - Click any node to see:
   - What it is (source/sink/function/variable)
   - What data it handles (passwords, emails, etc.)
   - Where it's located in code (file:line)

---

## 🎯 User Experience Benefits

### For Developers:

- **Visual Understanding**: See exactly how data flows through code
- **Quick Identification**: Red arrows instantly show vulnerable paths
- **Context**: Click nodes to see file locations and jump to code
- **Interactive**: Zoom, pan, and explore the graph freely

### For Security Analysts:

- **Attack Path Visualization**: See how attacker data reaches dangerous functions
- **Data Type Tracking**: Know what sensitive data flows where (passwords, emails, etc.)
- **Priority Identification**: Vulnerable paths listed with severity
- **Complete Analysis**: Combines data flow + vulnerability detection

### For Managers:

- **Executive View**: Risk percentage and security status at a glance
- **Visual Reports**: Professional graph visualization for presentations
- **Clear Metrics**: Number of vulnerabilities, entry points, danger zones

---

## 📊 Technical Details

### Dagre Layout Algorithm

The graph uses Dagre for automatic positioning:

```typescript
{
  rankdir: 'LR',     // Left to Right layout
  nodesep: 100,      // Space between nodes
  ranksep: 200,      // Space between ranks/columns
  edgesep: 50        // Space between edges
}
```

This creates a clean left-to-right flow:

```
Sources → Intermediate Nodes → Sinks
(Entry)      (Processing)       (Danger)
```

### ReactFlow Features Used

- **Custom Node Types**: Styled source, sink, function, variable nodes
- **Custom Edges**: Colored, animated, with markers
- **Background Grid**: Visual reference
- **Controls**: Zoom in/out, fit view, fullscreen
- **MiniMap**: Overview navigation
- **Interactive**: Click, drag, zoom, pan

### Data Flow

```
CLI Scan → Generates DataFlowGraph → Uploads to ImageKit
            ↓
Landing Page Fetches → Converts to ReactFlow Format → Renders Graph
                        ↓
                     User Interacts (click, zoom, explore)
```

---

## 🔄 Migration Path

### Current Page vs New Page

| Feature                    | Old (`/dataflow`) | New (`/dataflow-new`) |
| -------------------------- | ----------------- | --------------------- |
| Layout                     | Column boxes      | Interactive graph     |
| Connections                | None              | Visual arrows         |
| Animation                  | Static            | Animated flows        |
| Interactivity              | Basic             | Full zoom/pan         |
| Vulnerability Highlighting | Limited           | Clear red arrows      |
| Node Details               | Sidebar only      | Click any node        |
| Layout                     | Manual columns    | Auto-generated        |

### Recommended Approach

1. **Keep Both Pages Initially**
   - Old: `/reports/[id]/dataflow` (current simple view)
   - New: `/reports/[id]/dataflow-new` (interactive graph)

2. **Add Toggle or Replace**
   - Option A: Add view toggle button (Simple / Graph)
   - Option B: Replace old page entirely with new one

3. **User Testing**
   - Get feedback on which view users prefer
   - Consider offering both as different view modes

---

## 🎨 Visual Design

### Color Scheme

- **Blue (#3b82f6)**: Sources (entry points)
- **Red (#ef4444)**: Sinks (danger zones) + vulnerable flows
- **Purple (#a855f7)**: Functions (processing)
- **Yellow (#eab308)**: Variables (storage)
- **Green (#10b981)**: Sanitized/safe flows

### Animations

- **Pulse**: Vulnerable sinks and risky nodes
- **Flow Animation**: Red arrows animate along path
- **Smooth Transitions**: When clicking nodes

### Dark Theme

- Background: `#0f172a` (darker)
- Cards: `#1e293b` (dark)
- Borders: `#374151` (gray-800)

---

## 📝 Example Flow

### Vulnerable SQL Injection Path:

```
[req.body.email] ──(red animated arrow)──> [db.query]
    (Blue Box)                              (Red Box - Pulsing)
    Source                                   Sink

Sidebar shows:
✗ Vulnerable Path #1
  From: req.body.email (email data type)
  To: db.query
  Risk: SQL Injection
```

When user clicks `req.body.email` node:

```
Node Details Panel:
- Type: SOURCE
- Identifier: req.body.email
- Data Type: email (sensitive)
- Location: routes/auth.js:45
```

---

## ✅ Next Steps

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Test Locally**

   ```bash
   npm run dev
   ```

   Navigate to: `http://localhost:3000/reports/{reportId}/dataflow-new`

3. **Update Navigation**
   - Change "Open Visualization" button to use `/dataflow-new`
   - Or add a toggle for Simple/Graph views

4. **Deploy**

   ```bash
   git push origin main
   ```

   Vercel will auto-deploy

5. **User Feedback**
   - Test with real scan results
   - Gather feedback on usability
   - Iterate on design

---

## 🎉 Result

You now have a **professional-grade interactive data flow visualization** that:

- ✅ Shows actual graph with flowing connections
- ✅ Highlights vulnerabilities with animated red arrows
- ✅ Provides detailed information on click
- ✅ Helps developers understand security issues
- ✅ Makes your scanner look like a professional security tool
- ✅ Combines data flow analysis + vulnerability detection

The visualization answers:

- **What data flows?** (passwords, emails, tokens)
- **Where does it flow?** (visual arrows showing path)
- **Where are the errors?** (red arrows = vulnerable paths)
- **How to fix it?** (click node to see location in code)

This is a **massive upgrade** from simple column lists! 🚀
