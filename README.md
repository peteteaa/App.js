# Speech Analysis & Script Generation Tool

A web application that provides real-time speech analysis, feedback, and script generation using AssemblyAI and OpenAI.

## Features
- Speech-to-text transcription in multiple languages
- Real-time speech analysis and feedback
- Script generation with customizable tone
- Audio recording and playback
- Detailed technical analysis

## Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)
- AssemblyAI API key
- OpenAI API key

## Installation

1. **Clone the repository**

bash
git clone [your-repo-url]
cd [repo-name]

2. **Install dependencies**

bash
npm install

3. **Create environment file**
Create a `.env` file in the root directory:
plaintext
ASSEMBLYAI_API_KEY=your_assemblyai_key_here
OPENAI_API_KEY=your_openai_key_here
NODE_ENV=development

## Running the Application

1. **Start the backend server**

bash
npm run server

The server will run on port 5000 by default.

2. **Start the frontend development server**
In a new terminal:

bash
npm start

The React app will run on port 3000 by default.

3. **Access the application**
Open your browser and navigate to:

http://localhost:3000


## Troubleshooting

### Port Already in Use
If you see `EADDRINUSE: address already in use :::5000`:

bash
Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
Mac/Linux
lsof -i :5000
kill -9 <PID>


### API Keys Not Working
- Verify your API keys are correctly set in the `.env` file
- Check the health endpoint: `http://localhost:5000/health`

## Project Structure

src/
├── backend/
│ ├── routes/
│ │ ├── analyzeSpeech.js # Speech analysis endpoints
│ │ ├── analyzeTone.js # Tone analysis endpoints
│ │ └── generateScript.js # Script generation endpoints
│ ├── services/
│ │ └── toneAnalyzer.js # Tone analysis service
│ └── server.js # Main server file
├── components/
│ └── Recorder.tsx # Main recording component
└── shared/
└── constants.ts # Shared constants


## API Endpoints

### Speech Analysis
- POST `/analyze-speech/process-recording`
  - Accepts audio file and language
  - Returns transcription and analysis

### Script Generation
- POST `/generate-script`
  - Accepts type (casual/formal) and topic
  - Returns generated script with metadata

### Health Check
- GET `/health`
  - Returns API service status

## Environment Variables
- `ASSEMBLYAI_API_KEY`: Your AssemblyAI API key
- `OPENAI_API_KEY`: Your OpenAI API key
- `NODE_ENV`: Development/production environment
- `PORT`: Server port (default: 5000)

## Development Notes
- Frontend runs on Create React App
- Backend uses Express.js
- TypeScript for frontend components
- Supports multiple languages via AssemblyAI

## Common Issues
1. **CORS errors**: Check CORS configuration in server.js
2. **Audio recording issues**: Verify browser permissions
3. **API rate limits**: Check API quotas and usage

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Create a Pull Request

## License
MIT License