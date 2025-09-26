/**
 * Creates a prompt for generating focus area suggestions based on job description and requirements
 */
export function createFocusAreaPrompt(description: string, requirements: string[]): string {
  return `
Based on this job description and requirements, suggest relevant technical focus areas for an interview.

Job Description: ${description}

Requirements: ${requirements.join(", ")}

Common focus areas include: Machine Learning, Data Analysis, Statistics, Python Programming, SQL, Data Visualization, Deep Learning, Natural Language Processing, Computer Vision, Big Data, Cloud Computing, A/B Testing, Business Intelligence, Data Engineering, MLOps, Product Sense, Problem Solving, System Design.

Return 5-8 most relevant focus areas in JSON format with the following structure:

{
  "focusAreas": ["Focus Area 1", "Focus Area 2", "Focus Area 3", ...]
}

Example response:
{
  "focusAreas": ["Machine Learning", "Python Programming", "Statistics", "Data Analysis", "SQL"]
}
`.trim();
}