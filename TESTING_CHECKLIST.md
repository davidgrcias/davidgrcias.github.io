# 🧪 Testing Checklist - Admin Panel & Frontend Sync

## ✅ Pre-Testing Setup
- [ ] Dev server running: `npm run dev`
- [ ] Firebase credentials in `.env.local`
- [ ] Logged in to admin panel at `http://localhost:5175/admin`
- [ ] User: `davidgarciasaragih7@gmail.com` (Google Sign-in)

---

## 🎯 Admin Panel CRUD Testing

### 1️⃣ Projects (`/admin/projects`)
- [ ] **Read**: Dashboard shows project count
- [ ] **Create**: Add new project → Save → Verify in list
- [ ] **Update**: Edit existing → Change name/description → Save
- [ ] **Delete**: Delete a project → Confirm removal
- [ ] **Publish Toggle**: Toggle isPublished → Check frontend visibility
- [ ] **Search**: Search by name/tech/tier → Verify filtering
- [ ] **Order**: Drag to reorder → Verify order persists

### 2️⃣ Experiences (`/admin/experiences`)
- [ ] **Read**: Load all experiences with correct dates
- [ ] **Create**: Add new experience → Fill all fields → Save
- [ ] **Update**: Edit role/company/dates → Save
- [ ] **Delete**: Remove experience → Confirm
- [ ] **Search**: Filter by role/company/skills
- [ ] **Media Upload**: Add PDF/image → ImgBB upload works

### 3️⃣ Education (`/admin/education`)
- [ ] **Read**: Display all education entries
- [ ] **Create**: Add new degree → Save
- [ ] **Update**: Edit institution/grade → Save
- [ ] **Delete**: Remove entry
- [ ] **Order**: Reorder entries

### 4️⃣ Certifications (`/admin/certifications`)
- [ ] **Read**: Load certifications
- [ ] **Create**: Add certification → Select icon → Save
- [ ] **Update**: Edit name/provider/date
- [ ] **Delete**: Remove certification
- [ ] **Icon Selection**: Dropdown works with preview

### 5️⃣ Skills (`/admin/skills`)
- [ ] **Read**: Load technical + soft skills
- [ ] **Update Technical**: Add/remove skills from category
- [ ] **Add Category**: Create new technical category
- [ ] **Delete Category**: Remove category
- [ ] **Update Soft**: Add/remove soft skills
- [ ] **Save**: Persist all changes

### 6️⃣ Profile (`/admin/profile`)
- [ ] **Read**: Load user profile data
- [ ] **Update Basic**: Edit name/headline/about
- [ ] **Update Contact**: Edit email/location/phone/whatsapp
- [ ] **Update Socials**: Edit all social links (YouTube, TikTok, GitHub, LinkedIn, Instagram)
- [ ] **Photo Upload**: Change profile photo → ImgBB upload
- [ ] **Save**: All changes persist

### 7️⃣ Content - Fun Facts (`/admin/content`)
- [ ] **Read**: Display fun facts
- [ ] **Create**: Add new fun fact → Select icon → Save
- [ ] **Update**: Edit title/text
- [ ] **Delete**: Remove fun fact
- [ ] **Order**: Reorder facts

### 8️⃣ Content - Insights (`/admin/content`)
- [ ] **Read**: Display insights
- [ ] **Create**: Add insight → Save
- [ ] **Update**: Edit content
- [ ] **Delete**: Remove insight
- [ ] **Order**: Reorder insights

---

## 🌐 Frontend Synchronization Testing

### Homepage (`http://localhost:5175`)

#### Projects Section
- [ ] **Dynamic Stats**: 
  - Total Projects count matches database
  - Open Source count (non-# links)
  - Real-World count from tiers
  - Advanced count from tiers
- [ ] **Project List**: All published projects display
- [ ] **Filter by Tier**: Beginner/Intermediate/Advanced/Real-World/Capstone/Experimental
- [ ] **Sort**: Newest First ↔ Oldest First
- [ ] **Show More/Less**: Pagination works
- [ ] **Featured Carousel**: Shows Komilet + UMN Festival

#### About Section
- [ ] Profile name displays correctly
- [ ] Headline shows from database
- [ ] About text matches database
- [ ] Profile photo loads from database/ImgBB

#### Insights & Fun Facts
- [ ] All insights display with correct icons
- [ ] Fun facts show with proper formatting
- [ ] Order matches admin panel

#### Experience Timeline
- [ ] All experiences display
- [ ] Dates format correctly (MMM YYYY)
- [ ] Media (PDF/images) load correctly
- [ ] "Present" shows for current roles
- [ ] Sort by newest/oldest works

#### Education
- [ ] Degrees display in correct order
- [ ] GPA shows when available
- [ ] Icons render properly

#### Certifications
- [ ] All certifications visible
- [ ] Icons display correctly
- [ ] Dates format properly
- [ ] Grid layout responsive

#### Skills
- [ ] Technical skills grouped by category
- [ ] Category icons display
- [ ] Soft skills list complete
- [ ] No duplicates or missing items

#### Contact Links
- [ ] Email link works
- [ ] WhatsApp link correct
- [ ] All social links (YouTube, TikTok, GitHub, LinkedIn, Instagram) work
- [ ] Social handles display correctly

---

## 🔥 Real-Time Sync Testing

### Test 1: Create → View
1. Admin: Create new project
2. Frontend: Refresh → Project appears

### Test 2: Update → View
1. Admin: Edit project description
2. Frontend: Refresh → Changes visible

### Test 3: Delete → View
1. Admin: Delete experience
2. Frontend: Refresh → Item removed

### Test 4: Publish Toggle
1. Admin: Unpublish project (isPublished = false)
2. Frontend: Project hidden from public view
3. Admin: Republish (isPublished = true)
4. Frontend: Project reappears

### Test 5: Stats Recalculation
1. Admin: Add 3 new "Real-World" projects
2. Frontend: Refresh → "Real-World" stat +3

---

## 🚨 Error Handling

### Firestore Connection
- [ ] Offline: Frontend shows loading state → Fallback to static data
- [ ] Invalid credentials: Console shows error, doesn't crash
- [ ] Empty collection: Shows "No items" message

### Admin Panel
- [ ] Unauthorized user: Redirects to login
- [ ] Create with missing fields: Validation errors display
- [ ] Delete non-existent item: Graceful error message
- [ ] Network error during save: Retry or error alert

### Image Upload (ImgBB)
- [ ] Invalid API key: Clear error message
- [ ] File too large: Size validation
- [ ] Network error: Upload fails gracefully

---

## 🎨 UI/UX Checks

### Admin Panel
- [ ] Loading spinners during fetch
- [ ] Success alerts after save
- [ ] Confirm dialogs before delete
- [ ] Disabled buttons during async operations
- [ ] Form validation feedback
- [ ] Responsive on mobile/tablet

### Frontend
- [ ] Smooth loading transitions
- [ ] No layout shift during data load
- [ ] Dark mode works everywhere
- [ ] Animations don't lag
- [ ] Images lazy load properly

---

## 📊 Performance

### Admin Panel
- [ ] Dashboard loads < 2 seconds
- [ ] Large lists (50+ items) render smoothly
- [ ] Search/filter instant response
- [ ] No memory leaks on navigation

### Frontend
- [ ] Initial page load < 3 seconds
- [ ] Images optimized (WebP, compressed)
- [ ] Firestore cache reduces repeated reads
- [ ] Scroll performance smooth (60fps)

---

## ✅ Final Validation

### Database Structure
- [ ] Collections: `projects`, `experiences`, `education`, `certifications`, `funFacts`, `insights`
- [ ] Singleton Documents: `profile/main`, `skills/main`
- [ ] All documents have `order` field (where applicable)
- [ ] All documents have `createdAt` and `updatedAt` timestamps

### Code Quality
- [ ] No console errors in browser
- [ ] No ESLint warnings
- [ ] All components handle loading/error states
- [ ] No hardcoded data remaining in frontend

### Security
- [ ] `.env.local` not committed
- [ ] Firestore rules: public read, admin-only write
- [ ] Admin panel only accessible after Google auth
- [ ] ImgBB API key secure

---

## 🚀 Ready for Deployment?

- [ ] All tests passed
- [ ] No critical bugs
- [ ] Performance acceptable
- [ ] Security validated
- [ ] Code committed and pushed

**Date Tested**: ___________  
**Tested By**: ___________  
**Status**: ⬜ PASS | ⬜ FAIL  
**Notes**: ___________
