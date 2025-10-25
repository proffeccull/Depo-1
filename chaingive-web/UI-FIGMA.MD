## **ChainGive: High-Fidelity UI Design Blueprint**

### **1. Foundation: The Design System**

This is the source of truth for all visual elements.

*   **Tool:** Figma
*   **Grid & Layout:** 8pt grid system. Standard screen width of 375px (iPhone 11 Pro/X). Default padding of 16px on the left and right edges of the screen.
*   **Color Palette:**
    *   `background-primary`: `#121212` (Deep Charcoal)
    *   `background-secondary`: `#1E1E1E` (Dark Grey - for cards)
    *   `accent-primary`: `#2E8B57` (Growth Green - for buttons, highlights)
    *   `accent-secondary`: `#007AFF` (Trust Blue - for links, secondary icons)
    *   `text-primary`: `#FFFFFF` (White)
    *   `text-secondary`: `#8E8E93` (Light Grey)
    *   `semantic-error`: `#FF3B30` (Bright Red)
*   **Typography (Inter font):**
    *   **Display:** 34px, Medium
    *   **H1:** 28px, Bold
    *   **H2:** 20px, SemiBold
    *   **Body:** 16px, Regular
    *   **Sub-headline:** 14px, SemiBold
    *   **Caption:** 12px, Regular
*   **Core Components:**
    *   **Primary Button:** Height: 50px, BG: `accent-primary`, Text: `text-primary` (16px, SemiBold), Corner Radius: 12px.
    *   **Card:** BG: `background-secondary`, Corner Radius: 16px, Padding: 16px, Border: 1px solid `#2D2D2E`.
    *   **Icons:** Use the Feather Icons library for a clean, consistent look. Default color `text-secondary`, size 24x24px.

---

### **2. Screen-by-Screen UI Blueprint**

#### **Screen 1: Onboarding Flow (3 Screens)**

**Screen 1.1: Welcome**
*   **Background:** `background-primary` (`#121212`).
*   **Content:**
    *   **Logo:** ChainGive logo (simple, clean version) centered at the top.
    *   **Illustration:** A large, abstract, friendly illustration below the logo, using gentle gradients of `accent-primary` and `accent-secondary`.
    *   **H1 Title:** Text: "Welcome to ChainGive.", Centered. Color: `text-primary`.
    *   **Body Text:** Text: "The community where we support each other. Give help, get help, and pay it forward.", Centered. Color: `text-secondary`.
    *   **Primary Button:** Sticked to the bottom (40px from bottom edge). Text: "Get Started".

**Screen 1.2: Phone Number Entry**
*   **Background:** `background-primary`.
*   **Content:**
    *   **Header:** "Enter your phone number" (H1, `text-primary`).
    *   **Sub-header:** "We'll send you a confirmation code." (Body, `text-secondary`).
    *   **Phone Input Field:**
        *   A card (`background-secondary`) containing two elements side-by-side.
        *   **Flag/Country Code:** Nigerian flag icon 🇳🇬 with "+234".
        *   **Input:** Text field for the phone number. Text color `text-primary`.
    *   **Primary Button:** Sticked to the bottom. Text: "Continue". Disabled state until a valid number length is entered.

**Screen 1.3: OTP Verification**
*   **Background:** `background-primary`.
*   **Content:**
    *   **Header:** "We sent you a code" (H1, `text-primary`).
    *   **Sub-header:** "Enter the 6-digit code below." (Body, `text-secondary`).
    *   **OTP Input:** Six individual input boxes in a row. When a box is active, its border color changes to `accent-primary`.
    *   **Resend Text:** "Didn't get a code? **Resend**" (Body text, `text-secondary`, with "Resend" in `accent-primary`).

---

#### **Screen 2: Home Dashboard**

*   **Background:** `background-primary`.
*   **Layout:** A vertical scroll view with 16px padding on left/right.
*   **Components (Top to Bottom):**
    1.  **Header (Height: 60px):**
        *   **Left:** A circular User Avatar (40x40px). Next to it, a vertical stack of text: "Hello," (Caption, `text-secondary`) and "Amaka" (H2, `text-primary`).
        *   **Right:** A notification bell icon (Feather: 'bell'). Color: `text-secondary`.
    2.  **Balance Card (Margin-top: 24px):**
        *   A large `Card` component with a subtle green gradient (`#2E8B57` to `#256F45`).
        *   **Title:** "Your Charity Coin Balance" (Sub-headline, `text-primary` with 60% opacity).
        *   **Balance:** "🪙 1,250" (Display font, `text-primary`). The coin emoji is part of the text.
    3.  **Primary Actions (Margin-top: 24px):**
        *   A horizontal `HStack` containing two large buttons with 16px spacing between them.
        *   **Button 1:** A `Card` component. Inside, a vertical stack of an Icon (Feather: 'arrow-down-left', `accent-primary`) and Text ("Request Help", Body, `text-primary`).
        *   **Button 2:** A `Card` component. Inside, a vertical stack of an Icon (Feather: 'arrow-up-right', `accent-primary`) and Text ("Give Help", Body, `text-primary`).
    4.  **Recent Activity (Margin-top: 32px):**
        *   **Section Header:** A horizontal `HStack` with a Title "Recent Activity" (H2, `text-primary`) on the left and a "See all" button (Sub-headline, `accent-secondary`) on the right.
        *   **Transaction List:** A vertical stack of list items with 12px spacing. Each item is a row inside a `Card`.
            *   **List Item Example (Donation Sent):**
                *   **Left:** A circular icon with a green background showing an 'arrow-up-right' icon.
                *   **Middle:** Vertical stack of "Donation Sent" (Sub-headline, `text-primary`) and "To Tunde A." (Caption, `text-secondary`).
                *   **Right:** Vertical stack of "- ₦5,000" (Sub-headline, `text-primary`) and "Oct 24" (Caption, `text-secondary`).
    5.  **Bottom Navigation Bar (Height: 80px, sticked to bottom):**
        *   Background: `background-secondary` with a top border.
        *   **Four Icons:** 'Home', 'Repeat' (for Give/Request), 'Bar-chart-2' (for Impact), 'User' (for Profile). The active icon ("Home") is `accent-primary`. Others are `text-secondary`.

---

#### **Screen 3: "My Impact" (Analytics)**

*   **Background:** `background-primary`.
*   **Components (Top to Bottom):**
    1.  **Header:** "My Impact" (H1, `text-primary`).
    2.  **Period Selector (Margin-top: 16px):** Segmented control with options: "Weekly" | "**Monthly**" | "All Time". Selected state has a `background-secondary` fill.
    3.  **Donut Chart Card (Margin-top: 24px):**
        *   A large `Card`.
        *   **Inside:** A large, animated donut chart taking up most of the space.
        *   **Chart Center:** A vertical stack of text: "Total Given" (Caption, `text-secondary`) and "₦42,500" (H1, `text-primary`).
        *   **Legend:** Below the chart, colored dots and labels for categories (e.g., 🟢 Education, 🔵 Medical, 🟣 Emergency).
    4.  **Impact Breakdown Card (Margin-top: 16px):**
        *   A `Card` component.
        *   **Title:** "Category Breakdown" (H2, `text-primary`).
        *   **List Items:** A vertical stack of category breakdowns.
            *   **List Item Example:**
                *   **Top Row:** "Education" on the left, "₦20,000" on the right. Both are Sub-headline, `text-primary`.
                *   **Bottom Row:** A slim progress bar showing the percentage (e.g., 47%). The bar color matches the category color in the donut chart.

---

#### **Screen 4: Community Feed (New in v2.2)**

*   **Background:** `background-primary`.
*   **Layout:** Social-media-inspired feed with pull-to-refresh and infinite scroll.
*   **Components (Top to Bottom):**
    1.  **Header (Height: 60px):**
        *   **Left:** "Community Feed" (H1, `text-primary`).
        *   **Right:** Search icon and filter button (Feather: 'search', 'filter').
    2.  **Filter Bar (Margin-top: 16px):** Horizontal scrollable chips for categories: "All", "Success Stories", "Events", "Announcements", "Testimonials".
    3.  **Feed Content (Margin-top: 16px):**
        *   **Post Cards:** Vertical stack of cards with 16px spacing.
        *   **Post Card Structure:**
            *   **Header:** User avatar (32x32px), name (Sub-headline, `text-primary`), timestamp (Caption, `text-secondary`), post type badge.
            *   **Content:** Post title (H2, `text-primary`), description text (Body, `text-primary`), optional media/images.
            *   **Actions:** Like button, share button, comment count, engagement metrics.
            *   **Event Link (if applicable):** "Join Event" button for event announcements.
        *   **Empty State:** Illustration with "No posts yet" message and "Create First Post" CTA.
    4.  **Create Post FAB:** Floating action button (bottom-right) with plus icon for creating new posts.

---

#### **Screen 5: Enhanced "My Impact" (Analytics v2.2)**

*   **Background:** `background-primary`.
*   **Components (Top to Bottom):**
    1.  **Header:** "My Impact" (H1, `text-primary`) with date range picker.
    2.  **Period Selector:** Enhanced with custom date ranges and quick filters.
    3.  **Key Metrics Cards (Grid layout, 2x2):**
        *   **Total Given:** Large number with trend indicator (up/down arrow).
        *   **People Helped:** Count with growth percentage.
        *   **Coins Earned:** Balance with monthly earnings.
        *   **Impact Score:** Calculated metric with ranking.
    4.  **Advanced Charts Section:**
        *   **Interactive Donut Chart:** Category breakdown with hover details.
        *   **Trend Line Chart:** Giving activity over time with multiple periods.
        *   **Geographic Map:** Heatmap of donation locations (anonymized).
        *   **Progress Rings:** Goal completion for monthly/quarterly targets.
    5.  **Detailed Breakdown:**
        *   **Category Analysis:** Expandable sections with detailed metrics.
        *   **Recipient Stories:** Success stories from people helped.
        *   **Monthly Comparison:** Side-by-side period comparison.
    6.  **Achievements & Milestones:** Badges earned and progress toward next level.

---

### **3. Dark Theme Consistency Audit**

**Audit Results:**
*   ✅ **Background Colors:** All screens use `background-primary` (#121212) consistently.
*   ✅ **Card Components:** Uniform `background-secondary` (#1E1E1E) with proper borders.
*   ✅ **Text Hierarchy:** Consistent typography scale (Inter font) across all screens.
*   ✅ **Color Usage:** Primary (`accent-primary`), secondary (`accent-secondary`), semantic colors properly applied.
*   ✅ **Component Spacing:** 8pt grid system maintained throughout.
*   ⚠️ **Accessibility:** Need improved contrast ratios for text-secondary on background-primary.
*   ⚠️ **Interactive States:** Some buttons missing hover/press states in dark theme.

**Accessibility Improvements:**
*   **Contrast Ratios:** Minimum 4.5:1 for normal text, 3:1 for large text.
*   **Focus Indicators:** Clear focus rings for keyboard navigation.
*   **Color Blindness:** Use patterns and shapes in addition to colors for charts.
*   **Touch Targets:** Minimum 44x44px for all interactive elements.
*   **Text Scaling:** Support for dynamic type sizing.

---

### **4. Brief for the UI/UX Designer**

**Project:** ChainGive - Peer-to-Peer Giving App

**Objective:** Create a high-fidelity, interactive prototype in Figma based on the attached Product Requirement Document (v2.1) and this UI Design Blueprint.

**Core Aesthetic:**
*   **Modern & Secure:** Dark theme, clean lines, ample whitespace.
*   **Data-Rich & Empowering:** Use clear charts and data visualizations.
*   **Trustworthy & Empathetic:** The design should feel professional, secure, and friendly.

**Key Deliverables:**
1.  **A Complete Figma Design File:** Containing all user-facing screens for the MVP.
2.  **A Reusable Component Library:** All buttons, cards, input fields, and navigation elements should be built as reusable Figma components.
3.  **An Interactive Prototype:** All primary user flows (Onboarding, Requesting Help, Giving Help, Navigating the app) must be linked and clickable.
4.  **Design Handoff Assets:** The file should be organized for easy developer handoff, with clear naming conventions and assets marked for export.

**Final Note:** This blueprint provides the structure and specifications. You are encouraged to apply your expertise in micro-interactions, animations, and visual polish to bring the application to life, ensuring it feels both premium and accessible.