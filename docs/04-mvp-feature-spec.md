# MarketAxis AI — MVP Feature Specification

## MVP Philosophy

> **Ship the smallest thing that delivers "holy shit" value.**

The user signs up → inputs their app → gets a full marketing strategy + 10+ ready-to-post content pieces → in under 3 minutes.

That's the MVP. No more, no less.

---

## What's IN the MVP

### ✅ 1. User Authentication (Better Auth + Convex)
- Sign up / sign in via Better Auth (email + OAuth)
- GitHub OAuth for repo connection
- User profile basics

### ✅ 2. App Profile (Onboarding)
User inputs once, everything else flows from here:

| Field | Type | Required |
|-------|------|----------|
| App name | Text | ✅ |
| What it does | Textarea (1–3 sentences) | ✅ |
| Target audience | Text | ✅ |
| Platform | Multi-select (iOS / Android / Web) | ✅ |
| Region | Select | ✅ |
| Current stage | Select (Idea / MVP / Beta / Launched) | ✅ |
| Monetization | Select (Free / Freemium / Paid / SaaS) | ✅ |
| App URL | URL | Optional |
| Competitor URLs | URL list | Optional |

### ✅ 3. Strategy Agent
**Input:** App profile
**Output:**
- Positioning statement
- Brand voice (tone, personality, do/don't)
- 30-day content calendar (title + type + platform + date)
- Launch roadmap (4 weeks, step-by-step)
- Target communities (subreddits, Discord servers, Slack groups)
- Key differentiators
- Suggested pricing positioning

**Display:** Full strategy page, editable sections, regenerate buttons.

### ✅ 4. Content Agent
**From strategy context, generates:**

| Content Type | Output | Editable |
|-------------|--------|----------|
| X/Twitter thread | 5–10 tweet thread | ✅ |
| LinkedIn post | Professional long-form | ✅ |
| Reddit post | Community-style | ✅ |
| App Store description | ASO-optimized | ✅ |
| Play Store description | ASO-optimized | ✅ |
| Landing page copy | Hero + features + CTA | ✅ |
| Product Hunt description | Structured pitch | ✅ |
| Email (launch) | Announcement email | ✅ |

**Features:**
- One-click generation per type
- "Generate all" — batch all types
- Edit inline with rich text
- Copy to clipboard
- Regenerate with different tone
- 2–3 variants per generation

### ✅ 5. Launch Kit
Pre-packaged launch assets:

| Asset | What it includes |
|-------|-----------------|
| Product Hunt page copy | Tagline, description, first comment |
| Hacker News post | Title + comment |
| IndieHackers post | Launch story |
| BetaList submission | Form-ready text |
| Press email template | Personalized pitch email |
| Twitter launch thread | Announcement |
| LinkedIn launch post | Professional announcement |
| Launch email | Waitlist blast |

### ✅ 6. GitHub Connection + Codebase Analysis
- Connect GitHub via Composio OAuth
- Select repository to analyze
- Agent reads: README, package.json, file structure, source code
- Extracts: features, tech stack, dependencies, endpoints
- Show analysis results in dashboard
- Context feeds into Strategy, Content, and Legal agents

### ✅ 7. Legal Agent + Resources
- Analyzes codebase + app profile to detect needed legal docs
- Generates: Privacy Policy, Terms of Service, Cookie Policy, GDPR compliance, Refund Policy, EULA
- Shows recommendations with severity (required / recommended / optional)
- One-click generation of any document
- All documents stored in **Resources** vault
- Resources page: view, edit, download (PDF/MD), manage all generated docs

### ✅ 8. Dashboard
Single-page layout with sidebar navigation:
- **Overview** — status cards, recent activity, quick actions
- **Strategy** — full strategy view, editable
- **Content Studio** — content generation and management
- **Launch Kit** — launch assets
- **Codebase** — GitHub repo analysis and insights
- **Resources** — legal docs and generated documents vault
- **Settings** — app profile, account, connected accounts

### ✅ 9. Mode Toggle
Global toggle between Assist and Autopilot:
- Visible in header/top bar
- Clear explanation of what each mode does
- Default: Assist Mode

### ✅ 10. Social Account Connection (Basic)
- Connect Twitter/X account via Composio
- Connect LinkedIn account via Composio
- Connect GitHub account via Composio
- Show connected status
- Post content directly from Content Studio (Assist: click to post, Autopilot: auto-post)

---

## What's NOT in the MVP

| Feature | Why Not |
|---------|---------|
| ❌ Social Reply Agent | Complex, needs monitoring infra |
| ❌ Outreach Agent | Email automation is Phase 2 |
| ❌ Growth Agent | Needs data history first |
| ❌ Browser automation | Complex, unnecessary for v1 |
| ❌ Advanced analytics | Build after users exist |
| ❌ Team collaboration | Single-user first |
| ❌ Multiple projects | One app per account for v1 |
| ❌ Image generation | Text-first, images later |
| ❌ Video creation | Way too complex for v1 |
| ❌ Scheduling | Manual posting first |
| ❌ A/B testing automation | Need volume first |

---

## User Flows

### Flow 1: First-Time User

```
Landing Page → Sign Up → Onboarding Form (App Profile)
    → "Generate My Strategy" button
    → Loading (30–60 sec) with progress indicators
    → Strategy Page (positioning, voice, calendar, roadmap)
    → "This is amazing" moment ← THIS IS THE GOAL
    → Navigate to Content Studio
    → Generate first content piece
    → Copy / Post
```

### Flow 2: Returning User

```
Dashboard → Overview (recent activity, pending items)
    → Content Studio → Generate new content
    → Or: Strategy → Review / Edit
    → Or: Launch Kit → Prepare launch
```

### Flow 3: Posting Content

```
Content Studio → Select content type → Generate
    → Review in editor → Edit if needed
    → "Copy" or "Post to Twitter" (if connected)
    → Confirmation → Done
```

---

## MVP Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Time to first strategy | < 3 minutes | Analytics |
| Strategy generation completion | > 80% of signups | Funnel tracking |
| Content pieces generated per user | > 5 in first session | Feature analytics |
| User satisfaction (first session) | > 4/5 rating | In-app survey |
| 7-day return rate | > 30% | Cohort analysis |
| Social posts actually published | > 2 per user/week | Action tracking |

---

## MVP Development Timeline (Estimated)

| Week | Focus | Deliverable |
|------|-------|------------|
| 1 | Setup + Auth + App Profile | Working onboarding flow |
| 2 | Strategy Agent | Full strategy generation |
| 3 | Content Agent | All content types generating |
| 4 | Dashboard + Content Studio UI | Polished single-page dashboard |
| 5 | Composio + Social Posting | Twitter/LinkedIn posting works |
| 6 | Launch Kit + Polish + Testing | Feature-complete MVP |

**Total: ~6 weeks** for a focused solo developer.

---

## Technical Specifications

### API Structure (Convex)

```
// Mutations
createAppProfile(data) → profileId
updateAppProfile(profileId, data)
updateStrategy(profileId, strategyData)
saveContent(contentData) → contentId
updateContentStatus(contentId, status)
connectSocialAccount(platform, tokens)
toggleMode(mode) // "assist" | "autopilot"

// Queries
getAppProfile(profileId)
getStrategy(profileId)
getContents(profileId, filters)
getLaunchKit(profileId)
getSocialAccounts(userId)
getActivityFeed(userId)

// Actions (server-side)
generateStrategy(profileId) → calls LLM
generateContent(profileId, contentType) → calls LLM
generateLaunchKit(profileId) → calls LLM
postToSocial(contentId, platform) → calls Composio
```

### LLM Integration

- **Model:** GPT-4o-mini for speed and cost (upgrade path to GPT-4o for quality)
- **System prompts:** Specialized per agent (marketing expert, copywriter, etc.)
- **Context window:** App profile + strategy + recent content as context
- **Streaming:** Yes — show generation in real-time for user delight

### Error Handling

| Scenario | Handling |
|----------|---------|
| LLM timeout | Retry with backoff, show "still generating" |
| LLM bad output | Parse validation, auto-retry once |
| Composio auth expired | Prompt user to reconnect |
| Composio API error | Show error toast, retry option |
| Rate limit hit | Queue and show estimated time |
