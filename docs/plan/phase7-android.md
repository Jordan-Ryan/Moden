## Phase 7 — Android Support (Google Fit)

### Goals
- Port UI/behavior to Android; integrate Google Fit for data parity

### Dependencies
- Google Fit client (`react-native-google-fit`) or Expo module if available

### Workstream
- Styling and gesture checks (Reanimated, tab bar)
- Android-specific permission prompts and setup
- Fit readers and adapter parity with HealthKit

### Checklist
- [ ] Resolve platform UI differences (status bar, typography, ripple)
- [ ] Configure Google Fit and request scopes
- [ ] Implement Fit readers and adapters
- [ ] Validate performance and battery
