#!/bin/bash
# Screenshot Capture Guide for TribeFIND App Store Submission
#
# Prerequisites:
#   - Xcode with iPhone 14 Pro Max simulator installed
#   - Android Studio with Pixel 7 Pro emulator
#   - TribeFIND app built and running on simulators
#   - Demo accounts set up in Supabase (run create-demo-accounts.sql)
#
# iOS Screenshot Sizes (required):
#   iPhone 6.7" (iPhone 14 Pro Max): 1290 x 2796 px
#   iPhone 6.5" (iPhone 14 Plus):    1284 x 2778 px
#   iPhone 5.5" (iPhone 8 Plus):     1242 x 2208 px
#   iPad Pro 12.9" (3rd gen):        2048 x 2732 px
#
# Android Screenshot Sizes (required):
#   Phone:  min 320px, max 3840px, 16:9 aspect ratio
#   Tablet: 7" and 10" (if supporting tablets)
#
# Required Screenshots (minimum 3, recommended 5-8):
#   1. Sign-in screen          — "Secure sign-in with Google, Twitter, or email"
#   2. Profile & interests     — "Create your profile and choose your interests"
#   3. Map discovery           — "Discover like-minded people nearby"
#   4. Chat/messaging          — "Connect and chat with your tribe"
#   5. Activities selection    — "Find people who share your passions"
#   6. Stories view            — "Share moments with your tribe"
#   7. Privacy settings        — "Your privacy, your control"
#
# How to Capture:
#
# iOS (Simulator):
#   1. Open Simulator with iPhone 14 Pro Max
#   2. Run: xcrun simctl io booted screenshot screenshot-name.png
#   3. Or press Cmd+S in Simulator to save to Desktop
#   4. Save to: fastlane/screenshots/en-US/
#
# iOS (Device):
#   1. Press Side Button + Volume Up simultaneously
#   2. Transfer via AirDrop or USB
#
# Android (Emulator):
#   1. Click camera icon in emulator toolbar
#   2. Or run: adb exec-out screencap -p > screenshot-name.png
#   3. Save to: fastlane/metadata/android/en-US/images/phoneScreenshots/
#
# File naming convention:
#   iOS:     01_sign_in.png, 02_profile.png, 03_map.png, etc.
#   Android: 1_en-US.png, 2_en-US.png, 3_en-US.png, etc.

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

IOS_SCREENSHOTS_DIR="$PROJECT_DIR/fastlane/screenshots/en-US"
ANDROID_SCREENSHOTS_DIR="$PROJECT_DIR/fastlane/metadata/android/en-US/images/phoneScreenshots"

mkdir -p "$IOS_SCREENSHOTS_DIR"
mkdir -p "$ANDROID_SCREENSHOTS_DIR"

echo "=== TribeFIND Screenshot Capture ==="
echo ""
echo "Screenshot directories created:"
echo "  iOS:     $IOS_SCREENSHOTS_DIR"
echo "  Android: $ANDROID_SCREENSHOTS_DIR"
echo ""

# Check if iOS simulator is running
if xcrun simctl list devices booted 2>/dev/null | grep -q "iPhone"; then
    DEVICE_ID=$(xcrun simctl list devices booted -j | python3 -c "
import json, sys
data = json.load(sys.stdin)
for runtime, devices in data['devices'].items():
    for d in devices:
        if d['state'] == 'Booted' and 'iPhone' in d['name']:
            print(d['udid'])
            sys.exit(0)
" 2>/dev/null || echo "")

    if [ -n "$DEVICE_ID" ]; then
        echo "Found booted iPhone simulator: $DEVICE_ID"
        echo ""
        echo "To capture a screenshot, navigate to the screen in the app and run:"
        echo "  xcrun simctl io $DEVICE_ID screenshot $IOS_SCREENSHOTS_DIR/01_sign_in.png"
        echo ""
        echo "Suggested capture sequence:"
        echo "  1. Navigate to Sign In screen"
        echo "     xcrun simctl io $DEVICE_ID screenshot $IOS_SCREENSHOTS_DIR/01_sign_in.png"
        echo "  2. Sign in and go to Profile setup"
        echo "     xcrun simctl io $DEVICE_ID screenshot $IOS_SCREENSHOTS_DIR/02_profile.png"
        echo "  3. Navigate to Map view"
        echo "     xcrun simctl io $DEVICE_ID screenshot $IOS_SCREENSHOTS_DIR/03_map.png"
        echo "  4. Open a chat conversation"
        echo "     xcrun simctl io $DEVICE_ID screenshot $IOS_SCREENSHOTS_DIR/04_chat.png"
        echo "  5. Go to Activities/Interests screen"
        echo "     xcrun simctl io $DEVICE_ID screenshot $IOS_SCREENSHOTS_DIR/05_activities.png"
        echo "  6. Open Stories viewer"
        echo "     xcrun simctl io $DEVICE_ID screenshot $IOS_SCREENSHOTS_DIR/06_stories.png"
        echo "  7. Open Privacy settings"
        echo "     xcrun simctl io $DEVICE_ID screenshot $IOS_SCREENSHOTS_DIR/07_privacy.png"
    fi
else
    echo "No booted iPhone simulator found."
    echo "Start one with: open -a Simulator"
    echo "Then boot a device: xcrun simctl boot 'iPhone 14 Pro Max'"
fi

echo ""
echo "After capturing screenshots, verify sizes match App Store requirements."
echo "Use ImageMagick to check: identify -verbose screenshot.png | grep Geometry"
echo ""
echo "Done. Screenshots should be captured manually by navigating the app."
