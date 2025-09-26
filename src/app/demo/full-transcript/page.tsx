import { FullTranscriptDemo } from '~/components/interview/FullTranscriptDemo';
import { env } from '~/env';

export default function FullTranscriptDemoPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Gemini Live Full Transcript Demo</h1>
        <p className="text-gray-600 mt-2">
          Test the new bidirectional transcription and screen recording capabilities
        </p>
      </div>

      <FullTranscriptDemo apiKey={env.GOOGLE_GENERATIVE_AI_API_KEY} />
    </div>
  );
}