# Allium.so — Comprehensive Design Document
**Source:** allium.so homepage  
**Current State:** Light Mode / Professional Enterprise Aesthetic

---

## 1. Brand Identity & Positioning
### What Allium Is
Allium is the **"System of Record for Onchain Finance."** The brand positions itself as a critical infrastructure layer, providing historical and real-time data from **150+ blockchains** (updated from 130+).

### Overall Aesthetic
Contrary to previous versions, the current site uses a **Light/Neutral aesthetic**. It feels like a high-end financial terminal or a modern "clean-tech" SaaS. It utilizes a soft-grey canvas with high-contrast typography.
* **Key qualities:** Minimalist, airy, and "Swiss-style" grid structure.
* **Hero Visual:** Features a dual-pane product interface showing a SQL editor on top and a data results table below.

---

## 2. Color System
The color palette has moved from charcoal/black to a sophisticated palette of greys and "Allium Purple."

### Core Colors
| Role | Hex Value | Description |
| :--- | :--- | :--- |
| **Primary Background** | `#F7F7F7` | A very light, warm grey that serves as the page canvas. |
| **Secondary Background** | `#FFFFFF` | Pure white used for the main content "stage" or card containers. |
| **Primary Accent** | `#B66AD1` | A vibrant medium-purple used for primary CTAs and highlights. |
| **Announcement Bar** | `#E9D5FF` | A pale lavender used at the very top of the page. |
| **Borders** | `#D1D1D1` | Thin, light-grey strokes defining containers and buttons. |

---

## 3. Typography
The site uses a clean, professional **Sans-Serif** stack.
* **Headings:** Bold, uppercase, tight tracking. The hero text "BLOCKCHAIN DATA FOR" is high-impact and set in a heavy weight (Black or ExtraBold).
* **Body:** Highly readable, medium-grey text (`#555555`).
* **Monospace:** Used within the SQL editor UI to denote technical functionality.

---

## 4. Logo & Wordmark
* **The Icon:** A series of concentric circles (resembling an onion cross-section or a target), rendered in black.
* **The Wordmark:** "Allium" in a geometric sans-serif, positioned to the right of the icon.
* **Placement:** Top-left of the header, strictly black-on-white.

---

## 5. Layout & Grid
The layout uses a **framed-in-frame** approach:
1.  **Outer Frame:** The light grey (`#F7F7F7`) page background.
2.  **Inner Stage:** A large, rounded-corner white container that houses the main hero content.
3.  **Product UI:** A "dotted-border" container on the right side of the hero section that showcases the platform's interface.

---

## 6. Component Library

### Buttons
* **Primary CTA ("Book a Demo"):**
    * Solid purple background (`#B66AD1`).
    * White text, uppercase.
    * Rounded corners (~6px).
* **Secondary CTA ("Explore Terminal"):**
    * White background with a 1px grey border.
    * Black text + Arrow icon (`→`).
    * Subtle "lift" shadow.

### The "Terminal" Mockup
The visual on the right is a core component:
* **Top Pane:** SQL Editor with syntax highlighting (green and red text).
* **Bottom Pane:** Data table showing token supplies and dates.
* **Sidebar:** A list of blockchain icons (Ethereum, Solana, Bitcoin, etc.).

---

## 7. Content Hierarchy & Tone
The messaging is tiered to emphasize scale and utility:
1.  **The Hook:** "BLOCKCHAIN DATA FOR [Dynamic Text]"
2.  **The Scale:** "150+ blockchains" (highlighted in purple).
3.  **The Mission:** "The System of Record for Onchain Finance."

---

## 8. Page Sections Breakdown (As per Image)

### 1. Global Announcement Bar
A thin lavender strip at the very top: *"See who is driving onchain finance → Explore Allium Terminal"*.

### 2. Header / Navigation
* **Links:** PRODUCTS, SOLUTIONS, COMPANY, DOCS (all-caps, light grey).
* **Actions:** "Book a Demo" (Purple) and "Login" (Text-only).

### 3. Hero Section
* **Left Side:** Large typography and the primary value proposition.
* **Right Side:** A high-fidelity "Explorer Terminal" preview wrapped in a dotted-line decorative border.


### 4. Secondary Heading
Directly below the hero container: **"THE SYSTEM OF RECORD FOR ONCHAIN FINANCE"** in bold, centered black text.

---

## 9. Key Inaccuracy Fixes (Compared to Previous Version)
* **Theme:** Changed from "Dark-mode-first" to **"Light-mode/Neutral."**
* **Blockchain Count:** Updated from "130+" to **"150+."**
* **Primary Purple:** Shifted from a deep indigo-purple to a **brighter, more floral violet.**
* **Design Structure:** Added the "Dotted-border" container for product previews.
* **Case:** Navigation and primary headings are now predominantly **Uppercase**.