HIERARCHICAL REPORT VIEWER SYSTEM
==================================

Overview:
---------
A professional, scalable, and performant vulnerability report UI that displays thousands of security findings in a hierarchical, collapsible structure with progressive disclosure.

Architecture:
-------------
The system uses a 4-level hierarchy:
1. Severity (Critical → High → Medium → Low)
2. Category (SQL Injection, XSS, etc.)
3. File (Individual files with issues)
4. Issues (Individual vulnerability findings)

Components:
-----------

1. HierarchicalReportViewer.tsx (Main Component)
   - Orchestrates the entire report display
   - Handles data transformation from flat findings to hierarchy
   - Manages global state (search, filters, expansions)
   - Implements lazy rendering (only expanded sections render children)
   - Features:
     * Smart search across all levels
     * Severity filtering
     * Expand/collapse all functionality
     * Active filter display
     * Performance optimized with useMemo and useCallback

2. ReportSummary.tsx (Sticky Header)
   - Fixed/sticky summary at top of report
   - Displays overall score and grade
   - Severity count cards (clickable for filtering)
   - Visual feedback for active filters
   - Animated cards with hover effects

3. SeverityGroup.tsx (Level 1)
   - Top-level grouping by severity
   - Color-coded (red, orange, yellow, blue)
   - Shows total categories, files, and issues
   - Collapsible with smooth animations
   - Only renders CategoryGroups when expanded

4. CategoryGroup.tsx (Level 2)
   - Groups by vulnerability category
   - Icon-based visual identification
   - Shows file count and issue count
   - Only renders FileGroups when expanded

5. FileGroup.tsx (Level 3)
   - Groups by file path
   - Shows issue count per file
   - Pagination (first 5 issues, "show more" button)
   - Only renders IssueItems when expanded

6. IssueItem.tsx (Level 4)
   - Individual vulnerability display
   - Two states: collapsed and expanded
   - Collapsed: severity badge, title, file location
   - Expanded: full details (description, code, mitigation, prevention)
   - Memoized for performance

Data Flow:
----------
1. Flat findings array received from API
2. transformFindings() converts to hierarchy: severity → category → file → issues
3. Filtering applied (search + severity filter)
4. Hierarchy rebuilt with filtered data
5. Only expanded sections render their children
6. User interactions trigger state updates and re-renders only affected sections

Performance Features:
---------------------
1. Lazy Rendering
   - Children only render when parent is expanded
   - Prevents rendering 1000+ DOM nodes at once

2. React.memo
   - All subcomponents are memoized
   - Prevents unnecessary re-renders

3. useMemo & useCallback
   - Expensive calculations cached
   - Event handlers stable across renders

4. Conditional Rendering
   - AnimatePresence for smooth mount/unmount
   - Height animations for visual feedback

5. Pagination
   - FileGroup shows max 5 issues initially
   - "Show more" button loads remaining issues
   - Prevents overwhelming DOM with 100+ issues per file

Search System:
--------------
- Real-time search across:
  * Issue titles
  * Descriptions
  * File names
  * Categories
- Case-insensitive
- Updates filtered findings and rebuilds hierarchy
- Shows match count

Filter System:
--------------
1. Severity Filter
   - Click severity card in summary to filter
   - Auto-expands filtered severity
   - Click again to clear

2. Search Filter
   - Text-based search
   - Highlights active filters
   - Shows result count

3. Clear Filters
   - One-click reset to default view

UI/UX Features:
---------------
1. Progressive Disclosure
   - Everything collapsed by default
   - User clicks to reveal details
   - Prevents information overload

2. Visual Hierarchy
   - Clear indentation at each level
   - Color coding by severity
   - Icon-based category identification

3. Smooth Animations
   - Framer Motion for all transitions
   - Rotation animations for chevrons
   - Fade in/out for content
   - Height animations for expansion

4. Responsive Design
   - Works on mobile, tablet, desktop
   - Grid layouts adapt to screen size
   - Touch-friendly click targets

5. Keyboard Navigation Ready
   - Structure supports keyboard nav (can be added)
   - Focus states on interactive elements

Usage:
------
Import the main component in your report page:

  import HierarchicalReportViewer from "@/components/HierarchicalReportViewer";
  
  <HierarchicalReportViewer report={report} />

Expected report structure:
  {
    projectName: string,
    score: number,
    grade: string,
    summary: string,
    findings: [
      {
        severity: "critical" | "high" | "medium" | "low",
        category: string,
        file: string,
        line: number,
        title: string,
        description: string,
        evidence: string,
        mitigation: string,
        prevention: string
      }
    ],
    createdAt: string,
    metadata: object
  }

Testing with Large Datasets:
-----------------------------
Tested and optimized for:
- 1000+ total findings
- 100+ issues per file
- 50+ files per category
- 10+ categories per severity

Performance remains smooth due to lazy rendering and pagination.

Future Enhancements:
--------------------
1. Keyboard navigation (arrow keys, Enter, Escape)
2. Jump to issue functionality
3. Export filtered results
4. Persist expansion state in localStorage
5. Dark/light mode toggle
6. Virtual scrolling for files with 1000+ issues
7. Copy issue details to clipboard
8. Share filtered view via URL params
