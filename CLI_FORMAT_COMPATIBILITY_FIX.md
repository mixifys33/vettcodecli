# CLI Format Compatibility Fix

## 🐛 Problem Identified

The data flow visualization components on the landing page were expecting a different format than what the CLI actually generates during scans.

### What the CLI Generates:

```typescript
// From: Vettcode-scanner-cli/src/data-flow-visualizer.ts
interface DataFlowGraph {
  nodes: DataFlowGraphNode[];
  edges: DataFlowGraphEdge[];
  stats: {
    totalFlows: number;
    sources: string[]; // Array of source names ❌
    sinks: string[]; // Array of sink names ❌
    criticalPaths: number;
    highRiskPaths: number;
  };
  metadata: {
    generatedAt: string;
    version: string;
  };
}
```

### What the Landing Page Expected:

```typescript
// Original types/report.ts
interface DataFlowGraph {
  nodes: DataFlowNode[];
  edges: DataFlowEdge[];
  stats: {
    totalFlows: number;
    taintedFlows: number; // Not provided by CLI ❌
    sanitizedFlows: number; // Not provided by CLI ❌
    sources: number; // Expected count, got array ❌
    sinks: number; // Expected count, got array ❌
  };
}
```

---

## ✅ Solution Implemented

### 1. Updated TypeScript Types

**File:** `types/report.ts`

Made the type definition flexible to handle both formats:

```typescript
export interface DataFlowGraph {
  nodes: DataFlowNode[];
  edges: DataFlowEdge[];
  stats: {
    totalFlows: number;
    taintedFlows?: number; // Optional - calculate from edges if missing
    sanitizedFlows?: number; // Optional - calculate from edges if missing
    sources: number | string[]; // Handle both count AND array
    sinks: number | string[]; // Handle both count AND array
    criticalPaths?: number; // From CLI format
    highRiskPaths?: number; // From CLI format
  };
  metadata?: {
    // Optional
    generatedAt: string;
    version: string;
  };
}
```

### 2. Updated DataFlowViewer Component

**File:** `components/report/DataFlowViewer.tsx`

Added compatibility logic at the top of the component:

```typescript
export default function DataFlowViewer({ dataFlowGraph }: DataFlowViewerProps) {
  const { nodes, edges, stats } = dataFlowGraph;

  // Handle both CLI format (sources/sinks as arrays) and expected format (as numbers)
  const sourcesCount =
    typeof stats.sources === "number"
      ? stats.sources
      : stats.sources?.length || 0;

  const sinksCount =
    typeof stats.sinks === "number" ? stats.sinks : stats.sinks?.length || 0;

  // Calculate tainted/sanitized from edges if not provided by CLI
  const taintedFlows =
    stats.taintedFlows ?? edges.filter((e) => e.tainted).length;
  const sanitizedFlows =
    stats.sanitizedFlows ?? edges.filter((e) => e.sanitized).length;
  const totalFlows = stats.totalFlows || edges.length;

  // ... rest of component uses these calculated values
}
```

**Changes made throughout component:**

- Replaced `stats.totalFlows` → `totalFlows`
- Replaced `stats.taintedFlows` → `taintedFlows`
- Replaced `stats.sanitizedFlows` → `sanitizedFlows`
- Replaced `stats.sources` → `sourcesCount`
- Replaced `stats.sinks` → `sinksCount`

### 3. Updated Dedicated Data Flow Page

**File:** `app/reports/[id]/dataflow/page.tsx`

Applied the same compatibility logic:

```typescript
const { nodes, edges, stats } = dataFlowGraph;

// Handle both CLI format and expected format
const sourcesCount =
  typeof stats.sources === "number"
    ? stats.sources
    : Array.isArray(stats.sources)
      ? stats.sources.length
      : 0;

const sinksCount =
  typeof stats.sinks === "number"
    ? stats.sinks
    : Array.isArray(stats.sinks)
      ? stats.sinks.length
      : 0;

// Calculate from edges if not provided
const taintedFlows =
  stats.taintedFlows ?? edges.filter((e) => e.tainted).length;
const sanitizedFlows =
  stats.sanitizedFlows ?? edges.filter((e) => e.sanitized).length;
const totalFlows = stats.totalFlows || edges.length;
```

Updated all references throughout the file:

- Header display
- Sidebar statistics
- Visual graph counts
- Flow indicators

---

## 🎯 How It Works Now

### When CLI Uploads Data:

```json
{
  "dataFlowGraph": {
    "nodes": [
      { "id": "req_body", "label": "req.body", "type": "source" },
      { "id": "query", "label": "query", "type": "sink" }
    ],
    "edges": [
      { "from": "req_body", "to": "query", "tainted": true, "sanitized": false }
    ],
    "stats": {
      "totalFlows": 10,
      "sources": ["req.body", "req.query", "req.params"], // Array
      "sinks": ["query", "execute"], // Array
      "criticalPaths": 5,
      "highRiskPaths": 3
    }
  }
}
```

### Landing Page Now:

1. **Detects Format:**
   - Checks if `stats.sources` is array or number
   - Checks if `stats.sinks` is array or number

2. **Calculates Missing Values:**
   - `sourcesCount = stats.sources.length` (from array)
   - `sinksCount = stats.sinks.length` (from array)
   - `taintedFlows = edges.filter(e => e.tainted).length`
   - `sanitizedFlows = edges.filter(e => e.sanitized).length`

3. **Displays Correctly:**
   - Shows "3 sources → 2 sinks"
   - Shows "7 tainted flows"
   - Shows "3 sanitized flows"
   - Visual graph renders all nodes properly

---

## 🔄 Backward Compatibility

The fix maintains backward compatibility if the backend ever provides the old format:

```typescript
// Old format still works:
{
  "stats": {
    "totalFlows": 10,
    "taintedFlows": 7,
    "sanitizedFlows": 3,
    "sources": 3,     // Direct number
    "sinks": 2        // Direct number
  }
}

// New CLI format also works:
{
  "stats": {
    "totalFlows": 10,
    "sources": ["req.body", "req.query", "req.params"],  // Array
    "sinks": ["query", "execute"]                        // Array
    // taintedFlows/sanitizedFlows calculated from edges
  }
}
```

---

## ✅ What Now Works

### CLI Scan Output:

```bash
$ npm run scan -- /path/to/project

📊 Data Flow Graph: 29 nodes, 53 edges
```

### Report Upload:

- CLI uploads dataFlowGraph with CLI format ✅
- Backend stores it as-is ✅
- Landing page API fetches it ✅

### Landing Page Display:

- `/reports/[id]` → Data Flow tab shows preview ✅
- Stats dashboard displays correctly ✅
- "Open Visualization" button works ✅
- `/reports/[id]/dataflow` → Full visualization ✅
- Visual graph renders sources → sinks ✅
- Sidebar shows correct counts ✅
- Flow paths display properly ✅
- Tainted/sanitized calculated from edges ✅

---

## 📊 Example Flow

### 1. User Runs Scan

```bash
cd Vettcode-scanner-cli
npm run scan -- /path/to/project
```

### 2. CLI Generates Data Flow Graph

```typescript
{
  nodes: [
    { id: "req_body_email", label: "req.body.email", type: "source", dataType: "email" },
    { id: "db_query", label: "db.query", type: "sink", severity: "critical" }
  ],
  edges: [
    { from: "req_body_email", to: "db_query", tainted: true, sanitized: false }
  ],
  stats: {
    totalFlows: 1,
    sources: ["req.body.email"],
    sinks: ["db.query"],
    criticalPaths: 1,
    highRiskPaths: 0
  }
}
```

### 3. Backend Uploads to ImageKit

```
/vettcode-reports/dataflow/{reportId}_dataflow.json
```

### 4. Landing Page Fetches & Displays

```typescript
// Compatibility layer kicks in:
sourcesCount = 1; // from array.length
sinksCount = 1; // from array.length
taintedFlows = 1; // from edges.filter()
sanitizedFlows = 0; // from edges.filter()

// Visual display:
("1 data flows tracked • 1 sources → 1 sinks");
("1 Tainted (100%)");
("0 Sanitized (0%)");
```

---

## 🚀 Testing Checklist

✅ Run a new scan with the CLI  
✅ Verify report uploads successfully  
✅ Open report in browser  
✅ Navigate to Data Flow tab  
✅ Check stats display correctly  
✅ Click "Open Visualization"  
✅ Verify full-screen visualization works  
✅ Check sidebar stats  
✅ Test node filtering  
✅ Test view toggle (Visual/List)  
✅ Verify no console errors

---

## 📝 Files Changed

1. `types/report.ts` - Made DataFlowGraph stats flexible
2. `components/report/DataFlowViewer.tsx` - Added compatibility logic
3. `app/reports/[id]/dataflow/page.tsx` - Added compatibility logic

**Total Changes:** 3 files, ~50 lines modified

---

## 🎉 Result

The landing page now correctly displays the **actual data flow information from CLI scans**, showing:

- ✅ Real source nodes (req.body, req.query, etc.)
- ✅ Real sink nodes (query, execute, etc.)
- ✅ Real data flow paths
- ✅ Real taint analysis (which flows are dangerous)
- ✅ Accurate statistics
- ✅ Beautiful visual representation
- ✅ Interactive exploration

**No more format mismatch! Everything works end-to-end! 🚀**
