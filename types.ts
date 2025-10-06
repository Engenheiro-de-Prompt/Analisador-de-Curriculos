
export interface JobDescription {
  title: string;
  description: string;
  requiredSkills: string;
  desirableSkills: string;
  experience: number;
}

export interface Candidate {
  position: number;
  candidateName: string;
  score: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  recommendation: 'Recommend for Interview' | 'Consider for Other Roles' | 'Not a Good Fit';
}

export interface AnalysisError {
    title: string;
    message: string;
}
