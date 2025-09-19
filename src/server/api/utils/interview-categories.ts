import { type LucideIcon } from "lucide-react";
import { 
  Code, 
  Brain, 
  BarChart3, 
  Target,
  Database,
  Cloud,
  Shield,
  LineChart,
  Users,
  Cog
} from "lucide-react";

export interface InterviewCategory {
  id: string;
  title: string;
  duration: string;
  priority: 'CRITICAL' | 'RECOMMENDED' | 'OPTIONAL';
  items?: string[];
  icon: LucideIcon;
}

export type ArchetypeWithSkills = {
  id: string;
  name: string;
  description: string;
  roleSkillMappings: {
    importance: 'HIGH' | 'MEDIUM' | 'LOW';
    skill: {
      name: string;
      domain: {
        id: string;
        name: string;
      };
    };
  }[];
};

// Icon mapping based on domain names
const DOMAIN_ICON_MAP: Record<string, LucideIcon> = {
  // Programming/Coding variations
  'Programming Languages': Code,
  'Software Development': Code,
  'Coding': Code,
  'Programming': Code,
  
  // AI/ML variations
  'Machine Learning': Brain,
  'Artificial Intelligence': Brain,
  'AI': Brain,
  'ML': Brain,
  'Deep Learning': Brain,
  
  // Statistics/Analytics variations
  'Statistics': BarChart3,
  'Data Analysis': BarChart3,
  'Analytics': BarChart3,
  'Statistical Analysis': BarChart3,
  'Experimentation': BarChart3,
  
  // Product/Business variations
  'Product Management': Target,
  'Business': Target,
  'Product': Target,
  'Business Sense': Target,
  'Strategy': Target,
  
  // Data Engineering variations
  'Data Engineering': Database,
  'Databases': Database,
  'SQL': Database,
  
  // Cloud/Infrastructure variations
  'Cloud Computing': Cloud,
  'Infrastructure': Cloud,
  'DevOps': Cloud,
  
  // Security variations
  'Security': Shield,
  'Cybersecurity': Shield,
  
  // Visualization variations
  'Data Visualization': LineChart,
  'Visualization': LineChart,
  
  // Communication/Soft Skills variations
  'Communication': Users,
  'Soft Skills': Users,
  'Leadership': Users,
  
  // Default fallback
  'Other': Cog,
};

function getDomainIcon(domainName: string): LucideIcon {
  // Try exact match first
  if (DOMAIN_ICON_MAP[domainName]) {
    return DOMAIN_ICON_MAP[domainName];
  }
  
  // Try partial matches (case insensitive)
  const lowerDomainName = domainName.toLowerCase();
  for (const [key, icon] of Object.entries(DOMAIN_ICON_MAP)) {
    if (lowerDomainName.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerDomainName)) {
      return icon;
    }
  }
  
  // Default fallback
  return Cog;
}

function calculateDomainPriority(skills: ArchetypeWithSkills['roleSkillMappings']): 'CRITICAL' | 'RECOMMENDED' | 'OPTIONAL' {
  // Option 1: Highest Importance Wins
  const hasHighImportance = skills.some(mapping => mapping.importance === 'HIGH');
  const hasMediumImportance = skills.some(mapping => mapping.importance === 'MEDIUM');
  
  if (hasHighImportance) return 'CRITICAL';
  if (hasMediumImportance) return 'RECOMMENDED';
  return 'OPTIONAL';
}

function calculateDuration(skillCount: number): string {
  // Base duration: 15 minutes per skill, with min/max bounds
  const minutes = Math.max(15, Math.min(60, skillCount * 15));
  const maxMinutes = minutes + 10; // Add some variance
  
  return `${minutes}-${maxMinutes} min`;
}

export function generateInterviewCategories(archetype: ArchetypeWithSkills | null): InterviewCategory[] {
  // Fallback to default categories if no archetype data
  if (!archetype || !archetype.roleSkillMappings?.length) {
    return getDefaultCategories();
  }
  
  // Group skills by domain
  const domainSkillsMap = new Map<string, {
    domainId: string;
    domainName: string;
    skills: { name: string; importance: 'HIGH' | 'MEDIUM' | 'LOW' }[];
  }>();
  
  archetype.roleSkillMappings.forEach(mapping => {
    const domainKey = mapping.skill.domain.id;
    
    if (!domainSkillsMap.has(domainKey)) {
      domainSkillsMap.set(domainKey, {
        domainId: mapping.skill.domain.id,
        domainName: mapping.skill.domain.name,
        skills: []
      });
    }
    
    domainSkillsMap.get(domainKey)!.skills.push({
      name: mapping.skill.name,
      importance: mapping.importance
    });
  });
  
  // Convert domains to interview categories
  const categories: InterviewCategory[] = [];
  
  domainSkillsMap.forEach((domainData, domainId) => {
    const priority = calculateDomainPriority(
      domainData.skills.map(skill => ({
        importance: skill.importance,
        skill: { name: skill.name, domain: { id: domainId, name: domainData.domainName } }
      }))
    );
    
    categories.push({
      id: domainId,
      title: domainData.domainName,
      duration: calculateDuration(domainData.skills.length),
      priority,
      items: domainData.skills.map(skill => skill.name),
      icon: getDomainIcon(domainData.domainName)
    });
  });
  
  // Sort by priority (Critical first, then Recommended, then Optional)
  const priorityOrder = { 'CRITICAL': 0, 'RECOMMENDED': 1, 'OPTIONAL': 2 };
  categories.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  
  return categories;
}

// Fallback categories for when no archetype is matched
function getDefaultCategories(): InterviewCategory[] {
  return [
    {
      id: 'coding',
      title: 'Coding & Programming',
      duration: '26-50 min',
      priority: 'CRITICAL',
      items: ['SQL', 'Python', 'R'],
      icon: Code
    },
    {
      id: 'ml-ai',
      title: 'Machine Learning & AI',
      duration: '26-50 min',
      priority: 'CRITICAL',
      items: ['Model Development', 'Deep Learning', 'MLOps'],
      icon: Brain
    },
    {
      id: 'stats',
      title: 'Statistics & Experimentation',
      duration: '26-50 min',
      priority: 'RECOMMENDED',
      items: [],
      icon: BarChart3
    },
    {
      id: 'product',
      title: 'Product & Business sense',
      duration: '26-50 min',
      priority: 'OPTIONAL',
      items: [],
      icon: Target
    }
  ];
}