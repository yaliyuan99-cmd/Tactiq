Tactiq API Design
1. Core Purpose
The API should allow the website/app to manage:
User accounts
Ring pairing and device status
Gesture customisation
Command profiles
Accessibility setup
Emergency gestures
Voice-guided onboarding
Sync between rings, phone, and cloud
Support, feedback, and diagnostics
Base URL:
https://api.tactiq.com/v1

2. Authentication
Register user
POST /auth/register
Request
{
 "fullName": "Young Yuan",
 "email": "young@example.com",
 "password": "securePassword123",
 "userType": "blind_user"
}
Response
{
 "success": true,
 "message": "Account created successfully.",
 "user": {
   "id": "usr_001",
   "fullName": "Young Yuan",
   "email": "young@example.com",
   "userType": "blind_user"
 },
 "token": "jwt_token_here"
}
userType options
blind_user
low_vision_user
elderly_user
general_user
developer
carer

Login
POST /auth/login
Request
{
 "email": "young@example.com",
 "password": "securePassword123"
}
Response
{
 "success": true,
 "token": "jwt_token_here",
 "user": {
   "id": "usr_001",
   "fullName": "Young Yuan",
   "email": "young@example.com"
 }
}

3. User Profile API
Get current user
GET /users/me
Response
{
 "id": "usr_001",
 "fullName": "Young Yuan",
 "email": "young@example.com",
 "userType": "blind_user",
 "accessibilityNeeds": {
   "voiceGuidedSetup": true,
   "largeText": false,
   "screenReaderOptimised": true,
   "hapticFeedback": true
 },
 "createdAt": "2026-05-27T10:30:00Z"
}

Update accessibility preferences
PATCH /users/me/accessibility
Request
{
 "voiceGuidedSetup": true,
 "screenReaderOptimised": true,
 "hapticFeedback": true,
 "audioConfirmation": true,
 "gestureConfirmationDelay": 300
}
Response
{
 "success": true,
 "message": "Accessibility preferences updated."
}

4. Device and Ring Pairing API
Tactiq uses two smart rings, one on each hand. The API should track whether the user has paired a left ring, right ring, or both.
Pair a ring
POST /devices/pair
Request
{
 "deviceSerial": "TQ-RING-839201",
 "hand": "right",
 "bluetoothId": "BT_2938_TAC_RIGHT"
}
Response
{
 "success": true,
 "message": "Right-hand ring paired successfully.",
 "device": {
   "id": "dev_001",
   "deviceSerial": "TQ-RING-839201",
   "hand": "right",
   "batteryLevel": 92,
   "firmwareVersion": "1.0.3",
   "connectionStatus": "connected"
 }
}

Get all paired devices
GET /devices
Response
{
 "devices": [
   {
     "id": "dev_001",
     "hand": "right",
     "batteryLevel": 92,
     "connectionStatus": "connected",
     "firmwareVersion": "1.0.3"
   },
   {
     "id": "dev_002",
     "hand": "left",
     "batteryLevel": 88,
     "connectionStatus": "connected",
     "firmwareVersion": "1.0.3"
   }
 ]
}

Update firmware
POST /devices/{deviceId}/firmware/update
Request
{
 "targetVersion": "1.1.0"
}
Response
{
 "success": true,
 "message": "Firmware update started.",
 "updateStatus": "in_progress"
}

5. Gesture Mapping API
Each hand has fingers and knuckle positions. The API needs to allow users to map gestures to phone commands.
Gesture structure
A gesture should be represented like this:
{
 "hand": "right",
 "finger": "middle",
 "knuckle": "top",
 "tapCount": 1,
 "modifier": false
}
Hand options
left
right
Finger options
thumb
index
middle
ring
pinky
Knuckle options
top
middle
bottom
Tap count options
1
2
3
hold

Create a gesture command
POST /gestures
Request
{
 "profileId": "prof_001",
 "gesture": {
   "hand": "right",
   "finger": "index",
   "knuckle": "top",
   "tapCount": 1,
   "modifier": false
 },
 "command": {
   "type": "media",
   "action": "skip_forward",
   "parameters": {
     "seconds": 10
   }
 }
}
Response
{
 "success": true,
 "message": "Gesture assigned successfully.",
 "gestureCommand": {
   "id": "gc_001",
   "profileId": "prof_001",
   "gesture": {
     "hand": "right",
     "finger": "index",
     "knuckle": "top",
     "tapCount": 1,
     "modifier": false
   },
   "command": {
     "type": "media",
     "action": "skip_forward",
     "parameters": {
       "seconds": 10
     }
   }
 }
}

Get all gestures for a profile
GET /profiles/{profileId}/gestures
Response
{
 "profileId": "prof_001",
 "gestures": [
   {
     "id": "gc_001",
     "gesture": {
       "hand": "right",
       "finger": "index",
       "knuckle": "top",
       "tapCount": 1,
       "modifier": false
     },
     "command": {
       "type": "media",
       "action": "skip_forward",
       "parameters": {
         "seconds": 10
       }
     }
   },
   {
     "id": "gc_002",
     "gesture": {
       "hand": "right",
       "finger": "pinky",
       "knuckle": "top",
       "tapCount": 1,
       "modifier": false
     },
     "command": {
       "type": "text",
       "action": "delete_character"
     },
     "locked": true
   }
 ]
}

Update a gesture command
PATCH /gestures/{gestureCommandId}
Request
{
 "command": {
   "type": "app",
   "action": "open_app",
   "parameters": {
     "appName": "Maps"
   }
 }
}
Response
{
 "success": true,
 "message": "Gesture command updated."
}

Delete a custom gesture
DELETE /gestures/{gestureCommandId}
Response
{
 "success": true,
 "message": "Gesture removed."
}
Important: fixed gestures, such as the pinky delete cluster, should not be deletable.

6. Fixed System Gestures
Some gestures should be locked because they are part of Tactiq’s core accessibility design.
Get fixed gestures
GET /gestures/system
Response
{
 "fixedGestures": [
   {
     "gesture": {
       "hand": "right",
       "finger": "thumb",
       "knuckle": "top",
       "tapCount": 1
     },
     "command": {
       "type": "system",
       "action": "shift_or_capitalise"
     },
     "locked": true
   },
   {
     "gesture": {
       "hand": "right",
       "finger": "thumb",
       "knuckle": "bottom",
       "tapCount": 1
     },
     "command": {
       "type": "system",
       "action": "switch_language_or_input_mode"
     },
     "locked": true
   },
   {
     "gesture": {
       "hand": "right",
       "finger": "pinky",
       "knuckle": "top",
       "tapCount": 1
     },
     "command": {
       "type": "text",
       "action": "delete_character"
     },
     "locked": true
   },
   {
     "gesture": {
       "hand": "right",
       "finger": "pinky",
       "knuckle": "top",
       "tapCount": 2
     },
     "command": {
       "type": "text",
       "action": "delete_word"
     },
     "locked": true
   },
   {
     "gesture": {
       "hand": "right",
       "finger": "pinky",
       "knuckle": "top",
       "tapCount": 3
     },
     "command": {
       "type": "text",
       "action": "clear_field"
     },
     "locked": true
   }
 ]
}

7. Command Types
The API should support many command categories.
Supported command types
media
phone
text
app
navigation
accessibility
emergency
smart_home
custom_shortcut
system

Example command objects
Media command
{
 "type": "media",
 "action": "play_pause"
}
{
 "type": "media",
 "action": "skip_forward",
 "parameters": {
   "seconds": 10
 }
}

Phone command
{
 "type": "phone",
 "action": "call_contact",
 "parameters": {
   "contactId": "con_001"
 }
}

App command
{
 "type": "app",
 "action": "open_app",
 "parameters": {
   "appName": "Spotify"
 }
}

Navigation command
{
 "type": "navigation",
 "action": "start_route_home"
}

Accessibility command
{
 "type": "accessibility",
 "action": "toggle_screen_reader"
}

Emergency command
{
 "type": "emergency",
 "action": "call_emergency_contact",
 "parameters": {
   "contactId": "con_emergency_001"
 }
}

8. Profiles API
Users should be able to create different gesture profiles.
For example:
Daily Mode
School Mode
Gym Mode
Travel Mode
Navigation Mode
Typing Mode
Emergency Mode

Create profile
POST /profiles
Request
{
 "name": "Daily Mode",
 "description": "Main profile for everyday phone control.",
 "isDefault": true
}
Response
{
 "success": true,
 "profile": {
   "id": "prof_001",
   "name": "Daily Mode",
   "description": "Main profile for everyday phone control.",
   "isDefault": true,
   "createdAt": "2026-05-27T10:30:00Z"
 }
}

Get all profiles
GET /profiles
Response
{
 "profiles": [
   {
     "id": "prof_001",
     "name": "Daily Mode",
     "isDefault": true,
     "active": true
   },
   {
     "id": "prof_002",
     "name": "Gym Mode",
     "isDefault": false,
     "active": false
   }
 ]
}

Activate profile
POST /profiles/{profileId}/activate
Response
{
 "success": true,
 "message": "Profile activated.",
 "activeProfile": {
   "id": "prof_001",
   "name": "Daily Mode"
 }
}

Duplicate profile
POST /profiles/{profileId}/duplicate
Request
{
 "newName": "Travel Mode"
}
Response
{
 "success": true,
 "message": "Profile duplicated.",
 "profile": {
   "id": "prof_003",
   "name": "Travel Mode"
 }
}

9. Voice-Guided Setup API
Since your concept is accessibility-first, setup should work without requiring vision.
Start onboarding session
POST /onboarding/start
Request
{
 "mode": "voice_guided",
 "language": "en-AU"
}
Response
{
 "success": true,
 "sessionId": "onb_001",
 "currentStep": {
   "stepNumber": 1,
   "title": "Welcome to Tactiq",
   "voicePrompt": "Welcome to Tactiq. I will guide you through pairing your rings and setting up your first gestures."
 }
}

Get onboarding step
GET /onboarding/{sessionId}/step
Response
{
 "stepNumber": 2,
 "title": "Pair your right-hand ring",
 "voicePrompt": "Place the first ring on your right hand. Hold your thumb and index finger together for three seconds to begin pairing.",
 "expectedAction": "pair_right_ring"
}

Complete onboarding step
POST /onboarding/{sessionId}/step/complete
Request
{
 "stepNumber": 2,
 "result": "success"
}
Response
{
 "success": true,
 "nextStep": {
   "stepNumber": 3,
   "title": "Pair your left-hand ring",
   "voicePrompt": "Now place the second ring on your left hand. Tap your left index finger twice to begin pairing."
 }
}

10. Emergency Features API
Tactiq should include a fixed emergency command because the product is designed around safety and independence.
Add emergency contact
POST /emergency/contacts
Request
{
 "name": "Mum",
 "phoneNumber": "+61400111222",
 "relationship": "parent",
 "priority": 1
}
Response
{
 "success": true,
 "contact": {
   "id": "emg_001",
   "name": "Mum",
   "phoneNumber": "+61400111222",
   "priority": 1
 }
}

Trigger emergency action
POST /emergency/trigger
Request
{
 "triggerSource": "gesture",
 "gesture": {
   "hand": "left",
   "finger": "thumb",
   "knuckle": "top",
   "tapCount": 3
 },
 "locationSharing": true
}
Response
{
 "success": true,
 "message": "Emergency contact notified.",
 "actionsTaken": [
   "called_primary_emergency_contact",
   "shared_live_location"
 ]
}

11. Gesture Testing API
Users need a way to test whether the rings are detecting gestures correctly.
Start gesture test
POST /diagnostics/gesture-test/start
Request
{
 "hand": "right"
}
Response
{
 "success": true,
 "testId": "test_001",
 "message": "Gesture test started for right hand."
}

Record detected gesture
POST /diagnostics/gesture-test/{testId}/record
Request
{
 "detectedGesture": {
   "hand": "right",
   "finger": "middle",
   "knuckle": "top",
   "tapCount": 1,
   "pressure": 0.82,
   "confidence": 0.94
 }
}
Response
{
 "success": true,
 "message": "Gesture recorded.",
 "accuracy": "high"
}

Get gesture test results
GET /diagnostics/gesture-test/{testId}
Response
{
 "testId": "test_001",
 "overallAccuracy": 0.91,
 "results": [
   {
     "gesture": "right_middle_top_single_tap",
     "confidence": 0.94,
     "status": "accurate"
   },
   {
     "gesture": "right_ring_bottom_double_tap",
     "confidence": 0.71,
     "status": "needs_calibration"
   }
 ],
 "recommendation": "Recalibrate the right ring for lower knuckle detection."
}

12. Calibration API
Calibration is important because different users have different finger sizes, pressure strength, and motor ability.
Start calibration
POST /calibration/start
Request
{
 "deviceId": "dev_001",
 "hand": "right",
 "mode": "voice_guided"
}
Response
{
 "success": true,
 "calibrationId": "cal_001",
 "voicePrompt": "We will now calibrate your right-hand ring. Tap your index finger top knuckle three times."
}

Submit calibration sample
POST /calibration/{calibrationId}/sample
Request
{
 "gesture": {
   "hand": "right",
   "finger": "index",
   "knuckle": "top",
   "tapCount": 1
 },
 "sensorData": {
   "pressure": 0.78,
   "flexAngle": 23.5,
   "durationMs": 180
 }
}
Response
{
 "success": true,
 "message": "Calibration sample saved.",
 "nextPrompt": "Now tap your index finger middle knuckle three times."
}

Complete calibration
POST /calibration/{calibrationId}/complete
Response
{
 "success": true,
 "message": "Calibration completed successfully.",
 "calibrationQuality": "excellent"
}

13. Website Product API
For the public website, you also need product pages, pricing, FAQ, and waitlist.
Join waitlist
POST /website/waitlist
Request
{
 "fullName": "Young Yuan",
 "email": "young@example.com",
 "userCategory": "student",
 "interest": "blind_accessibility",
 "country": "Australia"
}
Response
{
 "success": true,
 "message": "You have joined the Tactiq waitlist."
}

Get product information
GET /website/product
Response
{
 "name": "Tactiq",
 "tagline": "Feel in control.",
 "description": "Tactiq turns the human hand into a phone controller through two smart rings and customisable gesture shortcuts.",
 "targetUsers": [
   "Blind and visually impaired users",
   "Older adults",
   "Commuters",
   "Students",
   "Workers",
   "Athletes"
 ],
 "keyFeatures": [
   "Two-ring gesture control",
   "Customisable knuckle grid",
   "Voice-guided setup",
   "Emergency shortcuts",
   "Screen-free phone control",
   "Profile-based command layouts"
 ]
}

Get pricing plans
GET /website/pricing
Response
{
 "plans": [
   {
     "id": "starter",
     "name": "Tactiq Essential",
     "priceAUD": 249,
     "includes": [
       "Two smart rings",
       "Basic gesture profiles",
       "Voice-guided setup",
       "Emergency contact gesture"
     ]
   },
   {
     "id": "pro",
     "name": "Tactiq Pro",
     "priceAUD": 349,
     "includes": [
       "Two smart rings",
       "Advanced gesture profiles",
       "Cloud sync",
       "Custom app shortcuts",
       "Priority support"
     ]
   }
 ]
}

14. Support API
Submit feedback
POST /support/feedback
Request
{
 "category": "accessibility",
 "message": "The voice-guided setup was clear, but I want more haptic feedback when switching profiles.",
 "rating": 4
}
Response
{
 "success": true,
 "message": "Feedback submitted. Thank you for helping improve Tactiq."
}

Create support ticket
POST /support/tickets
Request
{
 "subject": "Right ring not detecting pinky tap",
 "description": "My right-hand ring detects most gestures, but the pinky delete command does not always work.",
 "deviceId": "dev_001",
 "priority": "medium"
}
Response
{
 "success": true,
 "ticket": {
   "id": "ticket_001",
   "status": "open",
   "priority": "medium"
 }
}

15. Database Models
User
User {
 id: string,
 fullName: string,
 email: string,
 passwordHash: string,
 userType: string,
 accessibilityNeeds: object,
 createdAt: Date,
 updatedAt: Date
}
Device
Device {
 id: string,
 userId: string,
 deviceSerial: string,
 hand: "left" | "right",
 bluetoothId: string,
 batteryLevel: number,
 firmwareVersion: string,
 connectionStatus: "connected" | "disconnected" | "pairing",
 createdAt: Date
}
Profile
Profile {
 id: string,
 userId: string,
 name: string,
 description: string,
 isDefault: boolean,
 active: boolean,
 createdAt: Date
}
GestureCommand
GestureCommand {
 id: string,
 profileId: string,
 hand: "left" | "right",
 finger: "thumb" | "index" | "middle" | "ring" | "pinky",
 knuckle: "top" | "middle" | "bottom",
 tapCount: 1 | 2 | 3 | "hold",
 modifier: boolean,
 commandType: string,
 commandAction: string,
 commandParameters: object,
 locked: boolean
}
EmergencyContact
EmergencyContact {
 id: string,
 userId: string,
 name: string,
 phoneNumber: string,
 relationship: string,
 priority: number
}

16. Suggested MVP API
For your first version, do not build everything. Start with these essential endpoints:
POST /auth/register
POST /auth/login
GET /users/me
PATCH /users/me/accessibility

POST /devices/pair
GET /devices

POST /profiles
GET /profiles
POST /profiles/{profileId}/activate

POST /gestures
GET /profiles/{profileId}/gestures
PATCH /gestures/{gestureCommandId}
DELETE /gestures/{gestureCommandId}

POST /onboarding/start
GET /onboarding/{sessionId}/step
POST /onboarding/{sessionId}/step/complete

POST /website/waitlist
GET /website/product
POST /support/feedback
That is enough for a strong prototype website and companion app backend.

17. Strong Product Positioning for the Website
Use this on the homepage:
Tactiq turns your hands into a phone controller.
 Two smart rings let users control their phone through customisable finger gestures — no screen, no voice command, no friction.
And the API should support this promise:
User intention → finger gesture → ring detection → phone command → instant action
This gives your website a very clean technical story: Tactiq is not just accessibility hardware. It is a personal control layer for the phone.

