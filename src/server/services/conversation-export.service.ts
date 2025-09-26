import type { ConversationSession } from "~/lib/gemini-live";

interface ExportedConversation {
  session: ConversationSession;
  fullTranscript: string;
  structuredData: {
    turns: Array<{
      speaker: "user" | "assistant";
      text: string;
      timestamp: string;
      duration?: number;
    }>;
    screenshots: Array<{
      timestamp: string;
      imageData: string;
      description?: string;
    }>;
  };
  analytics: {
    sessionDuration: number;
    totalTurns: number;
    userSpeakingPercentage: number;
    aiSpeakingPercentage: number;
    averageResponseTime: number;
    topicsDiscussed: string[];
  };
}

export class ConversationExportService {
  /**
   * Export conversation session to a structured format for AI analysis
   */
  static exportForAnalysis(session: ConversationSession): ExportedConversation {
    const fullTranscript = this.generateFullTranscript(session);
    const structuredData = this.generateStructuredData(session);
    const analytics = this.generateAnalytics(session);

    return {
      session,
      fullTranscript,
      structuredData,
      analytics
    };
  }

  /**
   * Generate a readable transcript with timestamps
   */
  private static generateFullTranscript(session: ConversationSession): string {
    let transcript = `Interview Session Transcript\n`;
    transcript += `Session ID: ${session.sessionId}\n`;
    transcript += `Duration: ${session.duration || 0} seconds\n`;
    transcript += `Model: ${session.model}\n`;
    transcript += `Started: ${new Date(session.startTime).toLocaleString()}\n`;
    transcript += `Ended: ${session.endTime ? new Date(session.endTime).toLocaleString() : 'In progress'}\n\n`;

    transcript += `--- CONVERSATION ---\n\n`;

    session.turns.forEach((turn, index) => {
      const speaker = turn.role === 'user' ? 'CANDIDATE' : 'INTERVIEWER';
      const timestamp = new Date(turn.timestamp).toLocaleTimeString();
      const content = turn.content.transcript || turn.content.text || '[Audio only]';

      transcript += `[${timestamp}] ${speaker}: ${content}\n\n`;
    });

    return transcript;
  }

  /**
   * Generate structured data for AI processing
   */
  private static generateStructuredData(session: ConversationSession) {
    const turns = session.turns.map(turn => ({
      speaker: turn.role,
      text: turn.content.transcript || turn.content.text || '',
      timestamp: turn.timestamp,
      duration: turn.content.audio?.duration
    }));

    const screenshots = session.screenCaptures.map(capture => ({
      timestamp: capture.timestamp,
      imageData: capture.data,
      description: `Screenshot captured at ${new Date(capture.timestamp).toLocaleTimeString()}`
    }));

    return {
      turns,
      screenshots
    };
  }

  /**
   * Generate analytics for the conversation
   */
  private static generateAnalytics(session: ConversationSession) {
    const duration = session.duration || 0;
    const userTurns = session.turns.filter(t => t.role === 'user');
    const aiTurns = session.turns.filter(t => t.role === 'assistant');

    // Estimate speaking time based on transcript length
    const userTranscriptLength = userTurns
      .map(t => t.content.transcript?.length || 0)
      .reduce((sum, len) => sum + len, 0);

    const aiTranscriptLength = aiTurns
      .map(t => t.content.transcript?.length || 0)
      .reduce((sum, len) => sum + len, 0);

    const totalTranscriptLength = userTranscriptLength + aiTranscriptLength;

    const userSpeakingPercentage = totalTranscriptLength > 0
      ? (userTranscriptLength / totalTranscriptLength) * 100
      : 0;

    const aiSpeakingPercentage = totalTranscriptLength > 0
      ? (aiTranscriptLength / totalTranscriptLength) * 100
      : 0;

    // Extract potential topics from transcripts
    const topicsDiscussed = this.extractTopics(session.turns);

    return {
      sessionDuration: duration,
      totalTurns: session.turns.length,
      userSpeakingPercentage: Math.round(userSpeakingPercentage),
      aiSpeakingPercentage: Math.round(aiSpeakingPercentage),
      averageResponseTime: session.analytics.averageResponseTime,
      topicsDiscussed
    };
  }

  /**
   * Extract topics from conversation turns
   */
  private static extractTopics(turns: any[]): string[] {
    const allText = turns
      .map(turn => turn.content.transcript || turn.content.text || '')
      .join(' ')
      .toLowerCase();

    // Simple keyword extraction for technical topics
    const techKeywords = [
      'python', 'javascript', 'react', 'node', 'sql', 'database',
      'api', 'frontend', 'backend', 'machine learning', 'ai',
      'data science', 'algorithm', 'programming', 'development',
      'testing', 'deployment', 'cloud', 'aws', 'docker',
      'git', 'agile', 'scrum', 'typescript', 'css', 'html'
    ];

    const foundTopics = techKeywords.filter(keyword =>
      allText.includes(keyword)
    );

    return [...new Set(foundTopics)]; // Remove duplicates
  }

  /**
   * Export conversation as JSON for external processing
   */
  static exportAsJSON(session: ConversationSession): string {
    const exportedData = this.exportForAnalysis(session);
    return JSON.stringify(exportedData, null, 2);
  }

  /**
   * Export conversation as markdown
   */
  static exportAsMarkdown(session: ConversationSession): string {
    const exported = this.exportForAnalysis(session);
    let markdown = `# Interview Session Analysis\n\n`;

    markdown += `**Session ID:** ${session.sessionId}\n`;
    markdown += `**Duration:** ${exported.analytics.sessionDuration} seconds\n`;
    markdown += `**Total Turns:** ${exported.analytics.totalTurns}\n`;
    markdown += `**Model Used:** ${session.model}\n\n`;

    markdown += `## Analytics\n\n`;
    markdown += `- **User Speaking:** ${exported.analytics.userSpeakingPercentage}%\n`;
    markdown += `- **AI Speaking:** ${exported.analytics.aiSpeakingPercentage}%\n`;
    markdown += `- **Average Response Time:** ${exported.analytics.averageResponseTime.toFixed(2)}s\n`;
    markdown += `- **Topics Discussed:** ${exported.analytics.topicsDiscussed.join(', ')}\n\n`;

    markdown += `## Screenshots Captured\n\n`;
    exported.structuredData.screenshots.forEach((screenshot, index) => {
      markdown += `### Screenshot ${index + 1}\n`;
      markdown += `**Time:** ${new Date(screenshot.timestamp).toLocaleTimeString()}\n`;
      markdown += `**Data:** \`${screenshot.imageData.substring(0, 50)}...\`\n\n`;
    });

    markdown += `## Full Transcript\n\n`;
    exported.structuredData.turns.forEach((turn, index) => {
      const speaker = turn.speaker === 'user' ? '🧑 **Candidate**' : '🤖 **Interviewer**';
      const time = new Date(turn.timestamp).toLocaleTimeString();
      markdown += `### ${speaker} (${time})\n\n`;
      markdown += `${turn.text}\n\n`;
    });

    return markdown;
  }

  /**
   * Create a prompt for AI analysis of the conversation
   */
  static createAnalysisPrompt(session: ConversationSession): string {
    const exported = this.exportForAnalysis(session);

    return `Please analyze this technical interview conversation and provide detailed feedback.

**Session Details:**
- Duration: ${exported.analytics.sessionDuration} seconds
- Total exchanges: ${exported.analytics.totalTurns}
- Topics covered: ${exported.analytics.topicsDiscussed.join(', ')}

**Conversation Transcript:**
${exported.fullTranscript}

**Screenshots Available:** ${exported.structuredData.screenshots.length} screenshots were captured during the session.

Please provide:
1. **Overall Performance Assessment** (1-10 scale)
2. **Technical Knowledge Evaluation**
3. **Communication Skills Analysis**
4. **Areas for Improvement**
5. **Strengths Demonstrated**
6. **Specific Feedback on Answers**
7. **Questions the candidate should have asked**
8. **Recommendation** (hire/no-hire with reasoning)

Focus on technical accuracy, problem-solving approach, and communication clarity.`;
  }
}