## Packages
framer-motion | For smooth animations and transitions
recharts | For visualizing feedback scores
lucide-react | Icon set (already in base, but listing for clarity)
react-webcam | For the user's webcam feed in the interview room
react-speech-recognition | For speech-to-text functionality (simulated or real)

## Notes
- The app uses a dark theme by default.
- Streaming responses for the interview are handled via SSE or simulated via strict polling if SSE is not ready.
- Audio playback expects base64 chunks or URLs.
- Resume upload is text-based for MVP.
