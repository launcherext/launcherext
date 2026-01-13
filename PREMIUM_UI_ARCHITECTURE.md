# Premium Token Foundry UI - Architecture Documentation

## Overview
This document describes the **Modal Overlay + Live Preview** architecture implemented for the Launch Ext Token Launchpad.

---

## Design Philosophy

### From "Bootstrap Form" to "Premium Foundry"
- **Before:** Standard dropdowns, text areas, multi-step wizard
- **After:** Modal overlay with visual selectors, live preview, real-time validation

### Key Principles
1. **Tactile & Visual:** Users select styles from thumbnail grids, not dropdowns
2. **Real-Time Feedback:** Preview updates as user types (debounced)
3. **Glassmorphism:** Dark surfaces with subtle glows and borders
4. **Active Loading States:** Neural network animations instead of boring spinners

---

## Component Architecture

### 1. Modal Overlay Pattern

**File:** `extension/popup/components/CreateTokenModal.tsx`

**Features:**
- Slides up from bottom (iOS/Phantom wallet style)
- 85vh height, leaves header visible
- Glassmorphic backdrop with blur
- ESC key and backdrop click to dismiss
- Drag handle for visual affordance

**Why Modal vs Full-Page:**
- Keeps wallet info visible in background
- Users feel less "locked in" (reduces anxiety)
- Better for Chrome extension constraints (limited viewport)

---

### 2. Visual Style Selector

**File:** `extension/popup/components/ui/VisualStyleSelector.tsx`

**Replaces:** Standard `<select>` dropdown

**8 Visual Styles:**
- Degen 🐸 (Pepe-core meme energy)
- Cosmic 🌌 (Interstellar vibes)
- Retro 📼 (80s synthwave)
- Anime ⚡ (Kawaii energy)
- Cyberpunk 🤖 (Neon dystopia)
- Minimal ⚪ (Clean & modern)
- Vaporwave 🌴 (A E S T H E T I C)
- Pixel Art 🎮 (8-bit nostalgia)

**UX Details:**
- Grid of 4x2 clickable thumbnails
- Each card shows gradient preview + emoji + description on hover
- Selected card gets green ring + checkmark
- Instant visual feedback (no form submission needed)

---

### 3. Live Preview Pane

**File:** `extension/popup/components/ui/LivePreviewPane.tsx`

**Features:**
- Sticky positioning (follows scroll on left panel)
- Real-time token card rendering
- Shows exactly how token will appear on pump.fun
- Validation feedback (red border + error list)
- "Ready to Launch" success state (green glow)

**Preview States:**
1. **Idle:** Placeholder with style-specific gradient
2. **Generating:** AI thinking animation (neural network with pulsing nodes)
3. **Ready:** Generated image + validation passed (green glow)
4. **Error:** Validation issues listed below card

**AI Thinking Animation:**
- 6 random nodes pulsing at different intervals
- Center glow effect with brain emoji
- "AI is cooking..." text
- **Why:** Feels active/alive vs passive spinner

---

### 4. Token Creation Form

**File:** `extension/popup/components/TokenCreationForm.tsx`

**Split-View Layout:**
- **Left Panel (60%):** Form inputs
- **Right Panel (40%):** Live preview

**Form Sections:**
1. **Token Identity** 🎯
   - Name + Symbol (with character count)
   - Description textarea
   
2. **Visual Design** 🎨
   - Style selector (visual grid)
   - "Generate PFP too" checkbox
   - Prompt textarea with debouncing
   - Upload fallback button

3. **Social Links** 🔗
   - Twitter, Telegram, Website (optional)

**Real-Time Features:**
- ✅ Auto-validation as user types
- ✅ Debounced preview updates (2s for typing, 800ms for style changes)
- ✅ Character counters with color feedback
- ✅ "Auto-regenerates when you stop typing..." hint

---

## State Machine Flow

```
InputIdle
  ↓ (user types)
UserTyping → DebouncePending (2s timer)
  ↓
PreviewQueued → RequestingGeneration
  ↓
AIThinking (Neural network animation)
  ↓
FinalImageReady
  ↓
FinalReview (validation feedback)
  ↓
LaunchReady (if all valid)
```

---

## Debouncing Strategy

### Why Debounce?
- Prevents API spam as user types
- Better UX (wait for thought completion)
- Reduces costs

### Implementation:
```typescript
// Prompt changes: 2 second debounce
handlePromptChange → clearTimeout → setTimeout(2000ms) → regenerate

// Style changes: 800ms debounce (faster, less typing involved)
handleStyleSelect → clearTimeout → setTimeout(800ms) → regenerate
```

### Cleanup:
- Timer cleared on unmount to prevent memory leaks

---

## Navigation Updates

### Before:
- 3 tabs: Create | Dashboard | History

### After:
- 2 tabs: Dashboard | History
- "Create Token" button in header (opens modal)

**Why:**
- Create flow is now a "heavy" experience (deserves modal treatment)
- Dashboard becomes the default landing
- Reduces tab clutter

---

## Animation Details

### 1. Modal Slide-Up
```css
@keyframes slideUp {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
```
- Cubic bezier: `(0.16, 1, 0.3, 1)` for spring effect

### 2. Backdrop Fade
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

### 3. AI Thinking (Neural Network)
- 6 random positioned nodes
- Staggered animation delays (0.15s increments)
- Center ping glow effect
- Brain emoji pulsing

---

## Validation Feedback

### Real-Time:
- Input fields show green checkmark when valid
- Character counters update live
- Preview pane shows errors immediately

### Validation Rules:
- **Name:** Required, ≤32 chars
- **Symbol:** Required, ≤10 chars, auto-uppercase
- **Description:** Required, ≤500 chars
- **Image:** Required before launch

### Visual Feedback:
- ❌ Error state: Red border on preview card + error list
- ✓ Ready state: Green glow on preview card + "Ready to Launch" badge

---

## Technical Stack

### React Patterns:
- `useState` for form state
- `useEffect` for side effects (debounce cleanup, preview status)
- `useRef` for debounce timer
- `useCallback` for validation memoization

### TypeScript:
- Strict typing on all props
- `BannerStyle` union type for style options
- `PreviewStatus` type for state machine

### Styling:
- Tailwind CSS utility classes
- Custom animations in `animations.css`
- CSS variables for theme consistency

---

## File Structure

```
extension/popup/
├── App.tsx (updated: modal trigger, 2-tab nav)
├── components/
│   ├── CreateTokenModal.tsx (NEW)
│   ├── TokenCreationForm.tsx (NEW - replaces BannerGenerator)
│   ├── ui/
│   │   ├── VisualStyleSelector.tsx (NEW)
│   │   ├── LivePreviewPane.tsx (NEW)
│   │   ├── TabNavigation.tsx (updated: removed 'create' tab)
│   │   └── [existing UI components...]
│   └── [other components...]
└── styles/
    ├── animations.css (updated: slideUp, slideDown)
    └── globals.css (updated: custom-scrollbar)
```

---

## Key UX Improvements

### Before → After:
1. **Style Selection:** Dropdown → Visual thumbnail grid
2. **Preview:** None → Live real-time preview
3. **Loading:** Generic spinner → AI thinking animation
4. **Validation:** Submit-time errors → Real-time feedback
5. **Navigation:** Tab-based → Modal overlay
6. **Auto-regeneration:** Manual only → Debounced auto-update

---

## Future Enhancements

### Phase 2 (if streaming support added):
- Progressive image loading (chunked)
- Polaroid-style fade-in effect
- "Developing photo" animation

### Phase 3 (advanced mode):
- Negative prompt input
- Guidance scale slider
- Seed input for reproducibility
- "Basic/Advanced" mode toggle

---

## Usage Example

### User Flow:
1. User lands on Dashboard
2. Clicks "✨ Create Token" button in header
3. Modal slides up from bottom
4. User types token name → preview updates instantly
5. User selects "Cyberpunk" style → preview shows gradient hint
6. User types prompt → after 2s of no typing, image generates
7. AI thinking animation plays during generation
8. Image appears in preview with live validation
9. User fills metadata → validation feedback in real-time
10. "Ready to Launch" state appears when all valid
11. User clicks "🚀 Launch Token"

---

## Performance Considerations

### Optimization:
- Debouncing prevents API spam
- Preview status prevents unnecessary re-renders
- `useCallback` memoizes validation function
- Image data stored as base64 (no external requests after generation)

### Memory Management:
- Debounce timer cleanup on unmount
- Modal unmounts when closed (no hidden DOM)

---

## Accessibility

### Keyboard Support:
- ESC key closes modal
- Tab navigation through form fields
- Enter key submits form

### Visual Feedback:
- Clear focus states on all interactive elements
- High contrast colors for text
- Loading states communicate progress

---

## Testing Checklist

- [ ] Modal opens/closes smoothly
- [ ] ESC key dismisses modal
- [ ] Backdrop click dismisses modal
- [ ] Style selector shows all 8 options
- [ ] Clicking style updates preview
- [ ] Typing prompt triggers debounced regeneration
- [ ] Validation errors show in real-time
- [ ] AI thinking animation plays during generation
- [ ] Preview updates when metadata changes
- [ ] Launch button disabled until valid
- [ ] Success state closes modal and shows dashboard

---

## Design Credits

**Inspiration:**
- Phantom Wallet (modal pattern)
- Figma (split-view form + preview)
- Midjourney (AI thinking animations)
- Jupiter DEX (glassmorphism, green accents)

**Key Design Decision:**
> "Make users feel like they're building a masterpiece, not filling out a tax form."

---

*Last Updated: January 2026*
*Version: 2.0 (Premium Foundry Update)*
