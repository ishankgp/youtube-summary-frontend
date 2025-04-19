# YouTube Transcript Processor

A web application to process and summarize YouTube video transcripts.

## Features

- Process one or multiple YouTube videos
- Extract and display transcripts
- Generate AI summaries of video content
- Refine summaries with feedback

## Tech Stack

- Next.js for the frontend
- React for UI components
- TailwindCSS for styling
- Python backend with FastAPI (separate repository)

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Backend API running (see main repository)

### Installation

1. Install dependencies:

```bash
npm install
# or
yarn install
```

2. Run the development server:

```bash
npm run dev
# or
yarn dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Enter one or more YouTube URLs in the input field
2. Click "Process Videos" to extract transcripts and generate summaries
3. View the extracted transcript and AI-generated summary
4. Provide feedback to refine the summary if needed

## Backend API

The frontend communicates with a Python backend API for:
- Fetching video transcripts
- Generating summaries
- Refining summaries based on feedback

Make sure the backend is running on `http://localhost:5000` or update the `next.config.js` file to point to the correct API URL.

## License

See the LICENSE file in the root directory.

## Acknowledgments

This project uses several open-source packages and tools:
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Radix UI](https://www.radix-ui.com/) - Accessible UI primitives
- [Lucide Icons](https://lucide.dev/) - Beautiful icons
