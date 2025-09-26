interface ArchetypeInfo {
  id: string;
  simpleId: number;
  name: string;
  description: string;
  commonRoles: string[];
}

/**
 * Creates a detailed prompt for job description analysis
 * Includes archetype context and clear matching rules
 */
export function createJobAnalysisPrompt(
  description: string,
  archetypes: ArchetypeInfo[]
): string {
  const archetypeContext = archetypes.map(a => `
${a.simpleId}. ${a.name}
   Description: ${a.description}
   Common Roles: ${a.commonRoles.join(', ')}
   Key Indicators: ${getArchetypeIndicators(a.simpleId)}`
  ).join('\n');

  const exampleResponse = JSON.stringify({
    title: "AI Research Lead",
    company: "Perplexity",
    team: "Research",
    experience: "5+ years",
    difficulty: "SENIOR",
    archetypeId: 6,
    archetypeConfidence: 0.95,
    extractedInfo: {
      summary: "Leading AI research team to develop SOTA online LLMs",
      keyResponsibilities: [
        "Define macro research direction",
        "Lead development of Sonar models",
        "Mentor research team"
      ],
      requiredSkills: ["Python", "Deep Learning", "LLMs", "Reinforcement Learning"],
      preferredSkills: ["Publications", "Agent Systems", "Multi-modal Models"]
    },
    requirements: [
      "5+ years AI/ML experience",
      "3+ years technical leadership",
      "Deep expertise with LLMs"
    ],
    focusAreas: ["Machine Learning", "System Design", "Research Methods"]
  }, null, 2);

  return `Analyze this job description for a technical interview preparation system.

## ARCHETYPE MATCHING GUIDE

Match the job to ONE of these archetypes (return the number 1-6):

${archetypeContext}

## MATCHING RULES

Choose archetype based on PRIMARY job focus:
- If job mentions "research", "novel algorithms", "publications", "SOTA" → Research Science (6)
- If job mentions "production ML", "model deployment", "optimization" → ML Engineering (4)
- If job mentions "ML infrastructure", "MLOps", "model monitoring" → MLOps/ML Platform (5)
- If job mentions "A/B testing", "causal inference", "experimentation" → Decision Science (3)
- If job mentions "data pipelines", "ETL", "data architecture" → Data Infrastructure (2)
- If job mentions "dashboards", "reporting", "business metrics" → Analytics & BI (1)

## EXPECTED RESPONSE FORMAT

Return ONLY valid JSON matching this exact structure:
${exampleResponse}

## IMPORTANT INSTRUCTIONS

1. archetypeId: Must be a number from 1-6 (NOT a string)
2. archetypeConfidence: 0.8+ for clear matches, 0.5-0.8 for partial, below 0.5 for poor matches
3. difficulty: Based on years of experience:
   - 0-2 years → JUNIOR
   - 2-5 years → MEDIUM
   - 5-8 years → HARD
   - 8+ years → SENIOR
4. Extract actual skills mentioned in the description for requiredSkills/preferredSkills
5. focusAreas should map to interview domains like "Coding", "Machine Learning", "Statistics"

## JOB DESCRIPTION TO ANALYZE

${description}

Respond with valid JSON only. No additional text or markdown.`;
}

/**
 * Get key indicators for each archetype to help with matching
 */
function getArchetypeIndicators(simpleId: number): string {
  const indicators: Record<number, string> = {
    1: "Dashboards, Tableau, PowerBI, business reporting, KPIs, metrics visualization",
    2: "Spark, Airflow, ETL, data warehousing, Kafka, data quality, batch processing",
    3: "A/B testing, hypothesis testing, causal inference, p-values, experiment design",
    4: "Model serving, latency optimization, production ML, model deployment, scaling",
    5: "Kubeflow, MLflow, model registry, CI/CD for ML, model monitoring, infrastructure",
    6: "Research papers, novel methods, SOTA, publications, algorithm development, PhD"
  };

  return indicators[simpleId] || "";
}