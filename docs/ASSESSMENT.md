# Interview Assessment Database Schema Documentation

## Overview

This document describes the database schema for storing interview assessments in Skillvee. It defines the exact data structure that must be populated after an interview is completed, allowing the feedback page to display assessment results to users.

## Purpose

The assessment system stores structured feedback data that includes:
- Overall performance metrics
- Timestamped behavioral feedback items
- Skill proficiency scores by category
- Links to interview recordings and metadata

## Database Tables

### 1. InterviewAssessment Table

The main table that stores the overall assessment for an interview.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | String (CUID) | Yes | Auto-generated unique identifier |
| `userId` | String | Yes | References the User who took the interview |
| `interviewId` | String | Yes | References the Interview record (UNIQUE constraint) |
| `caseId` | String | Yes | References the InterviewCase used |
| `overallScore` | Integer | Yes | Score from 1 to 5 |
| `performanceLabel` | String | Yes | Label corresponding to the score (see mapping below) |
| `whatYouDidBest` | String | Yes | Summary paragraph of strengths (200-500 characters) |
| `topOpportunitiesForGrowth` | String | Yes | Summary paragraph of improvements (200-500 characters) |
| `videoUrl` | String | No | URL to the recorded interview video |
| `videoDurationSeconds` | Integer | No | Duration of the video in seconds |
| `videoThumbnailUrl` | String | No | URL to video thumbnail image |
| `startedAt` | DateTime | Yes | When the interview started |
| `completedAt` | DateTime | Yes | When the interview ended |
| `interviewDurationSeconds` | Integer | Yes | Total interview duration in seconds |
| `createdAt` | DateTime | Yes | Auto-generated timestamp |
| `updatedAt` | DateTime | Yes | Auto-generated timestamp |

#### Score to Performance Label Mapping
- Score 1 → "Building Foundation"
- Score 2 → "Developing Skills"
- Score 3 → "Strong Foundation"
- Score 4 → "Impressive Performance"
- Score 5 → "Exceptional Mastery"

### 2. AssessmentFeedback Table

Stores individual feedback items (strengths and growth areas) with timestamps.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | String (CUID) | Yes | Auto-generated unique identifier |
| `assessmentId` | String | Yes | References the parent InterviewAssessment |
| `feedbackType` | Enum | Yes | Either "STRENGTH" or "GROWTH_AREA" |
| `timestampDisplay` | String | Yes | Human-readable timestamp format "MM:SS" (e.g., "2:15") |
| `timestampSeconds` | Integer | Yes | Timestamp in seconds for sorting |
| `behaviorTitle` | String | Yes | Short descriptive title (20-50 characters) |
| `whatYouDid` | String | Yes | Description of what the user did (100-300 characters) |
| `whyItWorked` | String | Conditional | For STRENGTH items: why this was effective (100-300 characters) |
| `whatWasMissing` | String | Conditional | For GROWTH_AREA items: what could improve (100-300 characters) |
| `actionableNextStep` | String | Conditional | For GROWTH_AREA items: specific improvement advice (100-300 characters) |
| `impactStatement` | String | Yes | Statement about competency level (50-100 characters) |
| `displayOrder` | Integer | Yes | Order within the feedback type group (1, 2, 3...) |
| `createdAt` | DateTime | Yes | Auto-generated timestamp |

#### Requirements
- Minimum 3 STRENGTH items per assessment
- Minimum 3 GROWTH_AREA items per assessment
- Timestamps should be distributed throughout the interview

### 3. AssessmentSkillScore Table

Stores individual skill scores organized by category.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | String (CUID) | Yes | Auto-generated unique identifier |
| `assessmentId` | String | Yes | References the parent InterviewAssessment |
| `categoryName` | String | Yes | Name of the skill category |
| `categoryIcon` | String | Yes | Icon identifier for the category |
| `categoryOrder` | Integer | Yes | Display order of the category (1, 2, 3...) |
| `skillName` | String | Yes | Name of the individual skill |
| `skillScore` | Integer | Yes | Score from 1 to 5 |
| `isFocusArea` | Boolean | Yes | If true, displays "↑ Focus" indicator |
| `skillOrder` | Integer | Yes | Display order within the category (1, 2, 3...) |
| `createdAt` | DateTime | Yes | Auto-generated timestamp |

## Data Requirements

### Character Limits
- `behaviorTitle`: 20-50 characters
- `whatYouDid`: 100-300 characters
- `whyItWorked`: 100-300 characters (STRENGTH items only)
- `whatWasMissing`: 100-300 characters (GROWTH_AREA items only)
- `actionableNextStep`: 100-300 characters (GROWTH_AREA items only)
- `impactStatement`: 50-100 characters
- `whatYouDidBest`: 200-500 characters
- `topOpportunitiesForGrowth`: 200-500 characters

### Skill Categories by Role

Different roles have different skill categories that need to be scored:

#### Product Manager
- **Statistics and Experimentation** (icon: "bar-chart")
  - Data Visualization
  - Statistics
  - Hypothesis Testing
  - A/B Testing
  - Experimental Design

- **Product & Business Sense** (icon: "target")
  - User Analysis
  - Product Analysis
  - User Experience
  - Business Strategy

- **System Design & Architecture** (icon: "brain")
  - Data Pipeline Design
  - Data Architecture
  - Scalability Design
  - Real-time Processing

#### Software Engineer
- **Technical Proficiency** (icon: "code")
  - Coding Quality
  - Algorithm Design
  - Data Structures
  - Code Optimization
  - Testing Strategy

- **System Design** (icon: "brain")
  - Architecture Design
  - Scalability Planning
  - Database Design
  - API Design
  - Security Considerations

- **Communication & Collaboration** (icon: "target")
  - Technical Communication
  - Problem Articulation
  - Trade-off Analysis
  - Team Collaboration

## Example Data Structure

```json
{
  "interviewAssessment": {
    "userId": "user_123",
    "interviewId": "interview_456",
    "caseId": "case_789",
    "overallScore": 3,
    "performanceLabel": "Strong Foundation",
    "whatYouDidBest": "You demonstrated strong strategic thinking by immediately structuring your response using the OKR framework. Your ability to connect business problems to measurable data points showed solid analytical skills.",
    "topOpportunitiesForGrowth": "Focus on adding specificity to your success metrics by defining concrete targets and timeframes. Strengthen your statistical analysis by incorporating sample size calculations.",
    "videoUrl": "https://storage.example.com/video_123.mp4",
    "videoDurationSeconds": 1422,
    "startedAt": "2024-01-26T10:00:00Z",
    "completedAt": "2024-01-26T10:23:42Z",
    "interviewDurationSeconds": 1422
  },

  "feedbackItems": [
    {
      "feedbackType": "STRENGTH",
      "timestampDisplay": "2:15",
      "timestampSeconds": 135,
      "behaviorTitle": "Structured Approach",
      "whatYouDid": "You immediately structured your response using the OKR framework.",
      "whyItWorked": "This systematic approach shows strategic thinking and aligns with industry practices.",
      "impactStatement": "Demonstrated Level 3/5 Strategic Thinking",
      "displayOrder": 1
    },
    {
      "feedbackType": "GROWTH_AREA",
      "timestampDisplay": "4:30",
      "timestampSeconds": 270,
      "behaviorTitle": "Vague Success Metrics",
      "whatYouDid": "You mentioned 'increase engagement' without defining specific targets.",
      "whatWasMissing": "Specific, measurable thresholds with timeframes",
      "actionableNextStep": "Use SMART criteria to define metrics with percentages and deadlines",
      "impactStatement": "Limited Level 2/5 Strategic Thinking",
      "displayOrder": 1
    }
  ],

  "skillScores": [
    {
      "categoryName": "Statistics and Experimentation",
      "categoryIcon": "bar-chart",
      "categoryOrder": 1,
      "skillName": "A/B Testing",
      "skillScore": 2,
      "isFocusArea": true,
      "skillOrder": 1
    },
    {
      "categoryName": "Product & Business Sense",
      "categoryIcon": "target",
      "categoryOrder": 2,
      "skillName": "User Analysis",
      "skillScore": 4,
      "isFocusArea": false,
      "skillOrder": 1
    }
  ]
}
```

## Important Constraints

1. **One Assessment Per Interview**: The `interviewId` field has a UNIQUE constraint
2. **Minimum Feedback Items**: Each assessment must have at least 3 STRENGTH and 3 GROWTH_AREA items
3. **All Skills Must Be Scored**: Every skill in the role's categories must have a score
4. **Timestamp Accuracy**: All timestamps in feedback items must be within the interview duration
5. **Score Consistency**: The `performanceLabel` must match the `overallScore` according to the mapping

## API Endpoints

The following tRPC endpoints are available for working with assessments:

- `assessment.getById` - Fetch assessment by ID
- `assessment.getByInterviewId` - Fetch assessment for a specific interview
- `assessment.getUserAssessments` - List all assessments for a user
- `assessment.create` - Create a new assessment
- `assessment.delete` - Delete an assessment (testing only)

## Viewing Assessments

The feedback page (`/practice/feedback`) accepts two URL parameters:
- `?assessmentId=xxx` - Direct assessment ID lookup
- `?interviewId=xxx` - Finds the assessment for that interview

## Database Relationships

```
User
  ↓ has many
Interview
  ↓ has one (unique)
InterviewAssessment
  ↓ has many
  ├── AssessmentFeedback (multiple items)
  └── AssessmentSkillScore (multiple scores)
```

## Notes for Implementation

When creating an assessment after an interview:

1. Ensure the interview has status = "COMPLETED"
2. Check that no assessment already exists for that interviewId
3. Populate all required fields in InterviewAssessment
4. Create at least 6 AssessmentFeedback items (3 of each type)
5. Create AssessmentSkillScore entries for all skills in the role's categories
6. Use appropriate performance label based on overall score
7. Ensure all timestamps are within the interview duration range