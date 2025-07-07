# Mac Code Signing & Trust Guide

## 🔐 **Current Status: Unsigned App**

Your GitHub Actions build creates a **functional but unsigned** Mac .dmg file:

- ✅ **Works perfectly** - all features functional
- ⚠️ **Shows security warnings** - "from unidentified developer"
- 🔄 **Requires user workaround** - right-click → Open → Open

## 🛡️ **Trust Levels Explained**

### **Level 1: Unsigned (Current)**
- **User Experience:** Security warnings, manual bypass required
- **Cost:** Free
- **Setup:** None (current GitHub Actions)
- **Distribution:** Works but requires user education

### **Level 2: Code Signed**
- **User Experience:** No warnings, trusted by macOS
- **Cost:** $99/year (Apple Developer Account)
- **Setup:** Certificates + GitHub secrets
- **Distribution:** Professional, seamless user experience

### **Level 3: Notarized**
- **User Experience:** Fully trusted, no warnings
- **Cost:** $99/year (Apple Developer Account)
- **Setup:** Code signing + Apple notarization
- **Distribution:** Enterprise-level trust

## 📋 **Option 1: Keep Unsigned (Simplest)**

### **Current User Experience:**
1. **Download .dmg** - "This file was downloaded from the internet"
2. **First open attempt** - "Cannot be opened because it's from unidentified developer"
3. **Workaround** - Right-click → Open → Open (works perfectly after this)

### **User Instructions to Include:**
```
Mac Installation Instructions:
1. Download Prayer-Slides-Mac.dmg
2. Double-click to mount the disk image
3. If you see "unidentified developer" warning:
   - Right-click on Prayer Slides.app
   - Select "Open" from the menu
   - Click "Open" in the dialog
4. The app will run normally from then on
```

### **Pros:**
- ✅ Free
- ✅ No additional setup
- ✅ App works perfectly once opened
- ✅ Ready to distribute now

### **Cons:**
- ⚠️ Initial security warning
- ⚠️ Requires user education
- ⚠️ May confuse non-technical users

## 🏢 **Option 2: Get Code Signing (Professional)**

### **Setup Process:**

#### **Step 1: Apple Developer Account**
1. **Sign up** at https://developer.apple.com
2. **Pay $99/year** for Developer Program
3. **Verify identity** (may take 1-2 days)

#### **Step 2: Create Certificates**
1. **Log into Apple Developer portal**
2. **Go to Certificates, Identifiers & Profiles**
3. **Create "Developer ID Application" certificate**
4. **Download certificate** (.cer file)
5. **Export as .p12** file with password

#### **Step 3: Configure GitHub Secrets**
Add these secrets to your GitHub repository:
```
APPLE_CERTIFICATE: [base64 encoded .p12 file]
APPLE_CERTIFICATE_PASSWORD: [password for .p12 file]
APPLE_ID: [your Apple ID email]
APPLE_ID_PASSWORD: [app-specific password]
APPLE_TEAM_ID: [your team ID from developer portal]
```

#### **Step 4: Updated Build**
The GitHub Actions workflow is already configured to use these secrets when available.

### **Result:**
- ✅ No security warnings
- ✅ Professional user experience
- ✅ Trusted by macOS
- ✅ Can distribute via any channel

## 🚀 **Option 3: Alternative Distribution**

### **Mac App Store**
- **Pros:** Maximum trust, built-in distribution
- **Cons:** App review process, additional requirements
- **Cost:** $99/year + 30% revenue share

### **Third-Party Signing Services**
- **Services:** SignPath, Azure Code Signing, etc.
- **Cost:** Varies ($10-50/month)
- **Setup:** Less complex than Apple Developer Account

## 📊 **Recommendation Matrix**

| Use Case | Recommendation | Cost | Setup Time |
|----------|---------------|------|------------|
| **Personal/Small Church** | Unsigned + User Instructions | Free | 0 minutes |
| **Multiple Churches** | Code Signing | $99/year | 2-3 hours |
| **Commercial Distribution** | Code Signing + Notarization | $99/year | 4-6 hours |
| **Enterprise** | Mac App Store | $99/year + 30% | 1-2 weeks |

## 🎯 **Recommended Approach**

### **For Most Users: Start Unsigned**
1. **Use current GitHub Actions** build (unsigned)
2. **Include clear user instructions** for bypassing warnings
3. **Test with real users** to see if warnings are problematic
4. **Upgrade to code signing** if needed

### **User Instructions Template:**
```markdown
# Prayer Slides for Mac - Installation

## Download & Install
1. Download Prayer-Slides-Mac.dmg
2. Double-click to open the disk image
3. Drag Prayer Slides.app to Applications folder

## First Time Opening (Important!)
If you see "Prayer Slides cannot be opened because it is from an unidentified developer":

1. Don't click "Move to Trash"
2. Instead, go to Applications folder
3. Right-click on Prayer Slides.app
4. Select "Open" from the menu
5. Click "Open" in the security dialog
6. The app will open and work normally from now on

This is a one-time security step required for apps not distributed through the Mac App Store.
```

## ✅ **Current Status Summary**

- **Windows .exe:** ✅ Ready, trusted, no warnings
- **Mac .dmg:** ✅ Functional, requires one-time user bypass
- **Code Signing:** 🔄 Optional upgrade ($99/year)
- **Distribution:** ✅ Ready for both platforms

## 🔄 **Next Steps**

### **Immediate (Free):**
1. Use current unsigned Mac build
2. Include user instructions
3. Test with real Mac users
4. Distribute both Windows and Mac versions

### **Future (Professional):**
1. Consider Apple Developer Account if user feedback indicates issues
2. Set up code signing for seamless experience
3. Add notarization for maximum trust

**The unsigned version is perfectly functional and ready for distribution!** Many successful apps start this way and upgrade to code signing as they grow. 🎉
