/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { SkillsArchetypesMatrix } from '../skills-archetypes-matrix';

// Mock data for testing
const mockMatrixData = {
  archetypes: [
    {
      id: '1',
      name: 'Data Engineer',
      description: 'Builds data pipelines and infrastructure',
      roles: [
        { id: '1', title: 'Senior Data Engineer' },
        { id: '2', title: 'Data Infrastructure Engineer' }
      ],
      roleSkillMappings: [
        {
          id: '1',
          importance: 'HIGH' as const,
          skill: {
            id: '1',
            name: 'Python',
            domain: { id: '1', name: 'Programming' },
            skillLevels: [
              {
                id: '1',
                level: 3,
                levelName: 'Advanced',
                generalDescription: 'Expert Python programming',
                observableBehaviors: 'Can architect complex systems',
                exampleResponses: 'Designs scalable solutions',
                commonMistakes: 'Rare syntax errors'
              }
            ]
          }
        }
      ]
    }
  ],
  domains: [
    {
      id: '1',
      name: 'Programming',
      order: 1,
      skills: [
        {
          id: '1',
          name: 'Python',
          skillLevels: [
            {
              id: '1',
              level: 3,
              levelName: 'Advanced',
              generalDescription: 'Expert Python programming',
              observableBehaviors: 'Can architect complex systems',
              exampleResponses: 'Designs scalable solutions',
              commonMistakes: 'Rare syntax errors'
            }
          ]
        }
      ]
    }
  ]
};

describe('SkillsArchetypesMatrix', () => {
  it('renders loading state correctly', () => {
    render(<SkillsArchetypesMatrix isLoading={true} />);
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('renders empty state when no data provided', () => {
    render(<SkillsArchetypesMatrix isLoading={false} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
    expect(screen.getByText(/Import your skills taxonomy/)).toBeInTheDocument();
  });

  it('renders matrix with data correctly', () => {
    render(<SkillsArchetypesMatrix data={mockMatrixData} isLoading={false} />);
    
    // Check for main title
    expect(screen.getByText('Skills-Archetypes Matrix')).toBeInTheDocument();
    
    // Check for legend
    expect(screen.getByText('Developing')).toBeInTheDocument();
    expect(screen.getByText('Proficient')).toBeInTheDocument();
    expect(screen.getByText('Advanced')).toBeInTheDocument();
    
    // Check for domain header
    expect(screen.getByText('Programming')).toBeInTheDocument();
    
    // Check for archetype name
    expect(screen.getByText('Data Engineer')).toBeInTheDocument();
    
    // Check for skill name (truncated in header)
    expect(screen.getByText('Python')).toBeInTheDocument();
    
    // Check for level indicator (should show "3" for HIGH importance)
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('displays correct job title count in archetype header', () => {
    render(<SkillsArchetypesMatrix data={mockMatrixData} isLoading={false} />);
    expect(screen.getByText('2 titles')).toBeInTheDocument();
  });

  it('renders table structure correctly', () => {
    render(<SkillsArchetypesMatrix data={mockMatrixData} isLoading={false} />);
    
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    
    // Check for proper table headers
    expect(screen.getByText('Role Archetype')).toBeInTheDocument();
  });
});