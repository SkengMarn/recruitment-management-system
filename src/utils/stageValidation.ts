// Stage Validation Rules for Candidate Journey Management
import { toast } from 'sonner';

export interface StageRequirement {
  field: string;
  label: string;
  required: boolean;
  validator?: (value: any) => boolean;
  errorMessage?: string;
}

export interface DocumentRequirement {
  type: string;
  label: string;
  required: boolean;
}

export interface StageValidationRule {
  stage: string;
  label: string;
  requirements: StageRequirement[];
  documentRequirements: DocumentRequirement[];
  allowedNextStages: string[];
}

// Define validation rules for each stage
export const STAGE_VALIDATION_RULES: StageValidationRule[] = [
  {
    stage: 'passport',
    label: 'Passport Stage',
    requirements: [
      { field: 'full_name', label: 'Full Name', required: true },
      { field: 'email', label: 'Email', required: true, validator: (value) => /\S+@\S+\.\S+/.test(value), errorMessage: 'Valid email required' },
      { field: 'phone', label: 'Phone Number', required: true },
      { field: 'date_of_birth', label: 'Date of Birth', required: true },
      { field: 'nationality', label: 'Nationality', required: true },
      { field: 'passport_number', label: 'Passport Number', required: true },
      { field: 'agent_id', label: 'Agent', required: true },
      { field: 'receiving_company_id', label: 'Receiving Company', required: true }
    ],
    documentRequirements: [
      { type: 'passport', label: 'Passport Copy', required: true },
      { type: 'photo', label: 'Passport Photo', required: true }
    ],
    allowedNextStages: ['interview']
  },
  {
    stage: 'interview',
    label: 'Interview Stage',
    requirements: [
      { field: 'education_level', label: 'Education Level', required: true },
      { field: 'work_experience', label: 'Work Experience', required: true },
      { field: 'skills', label: 'Skills', required: true }
    ],
    documentRequirements: [
      { type: 'cv', label: 'CV/Resume', required: true },
      { type: 'certificates', label: 'Educational Certificates', required: true }
    ],
    allowedNextStages: ['medical']
  },
  {
    stage: 'medical',
    label: 'Medical Stage',
    requirements: [],
    documentRequirements: [
      { type: 'medical_certificate', label: 'Medical Certificate', required: true },
      { type: 'vaccination_record', label: 'Vaccination Record', required: true }
    ],
    allowedNextStages: ['training']
  },
  {
    stage: 'training',
    label: 'Training Stage',
    requirements: [],
    documentRequirements: [
      { type: 'training_certificate', label: 'Training Certificate', required: true }
    ],
    allowedNextStages: ['visa']
  },
  {
    stage: 'visa',
    label: 'Visa Stage',
    requirements: [],
    documentRequirements: [
      { type: 'visa', label: 'Visa Document', required: true },
      { type: 'work_permit', label: 'Work Permit', required: false }
    ],
    allowedNextStages: ['deployed']
  },
  {
    stage: 'deployed',
    label: 'Deployed Stage',
    requirements: [],
    documentRequirements: [
      { type: 'deployment_confirmation', label: 'Deployment Confirmation', required: true }
    ],
    allowedNextStages: ['completed']
  },
  {
    stage: 'completed',
    label: 'Completed Stage',
    requirements: [],
    documentRequirements: [],
    allowedNextStages: []
  }
];

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  missingRequirements: string[];
  missingDocuments: string[];
}

export class StageValidator {
  static getStageRule(stage: string): StageValidationRule | null {
    return STAGE_VALIDATION_RULES.find(rule => rule.stage === stage) || null;
  }

  static validateStageRequirements(
    candidateData: any, 
    currentStage: string
  ): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      missingRequirements: [],
      missingDocuments: []
    };

    const stageRule = this.getStageRule(currentStage);
    if (!stageRule) {
      result.isValid = false;
      result.errors.push(`Unknown stage: ${currentStage}`);
      return result;
    }

    // Check field requirements
    for (const requirement of stageRule.requirements) {
      const value = candidateData[requirement.field];
      
      if (requirement.required && (!value || value === '')) {
        result.isValid = false;
        result.missingRequirements.push(requirement.label);
        continue;
      }

      // Run custom validator if provided
      if (requirement.validator && value && !requirement.validator(value)) {
        result.isValid = false;
        result.errors.push(requirement.errorMessage || `Invalid ${requirement.label}`);
      }
    }

    return result;
  }

  static async validateDocumentRequirements(
    candidateId: string,
    currentStage: string,
    documents: any[]
  ): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      missingRequirements: [],
      missingDocuments: []
    };

    const stageRule = this.getStageRule(currentStage);
    if (!stageRule) {
      result.isValid = false;
      result.errors.push(`Unknown stage: ${currentStage}`);
      return result;
    }

    // Get candidate's documents
    const candidateDocuments = documents.filter(doc => 
      doc.candidate_id === candidateId && 
      (doc.status === 'verified' || doc.is_verified === true || doc.is_verified === 1)
    );

    // Check document requirements
    for (const docReq of stageRule.documentRequirements) {
      if (docReq.required) {
        const hasDocument = candidateDocuments.some(doc => 
          (doc.type || doc.doc_type || doc.document_type) === docReq.type
        );

        if (!hasDocument) {
          result.isValid = false;
          result.missingDocuments.push(docReq.label);
        }
      }
    }

    return result;
  }

  static canAdvanceToStage(
    currentStage: string, 
    targetStage: string
  ): boolean {
    const stageRule = this.getStageRule(currentStage);
    if (!stageRule) return false;

    return stageRule.allowedNextStages.includes(targetStage);
  }

  static getNextAllowedStages(currentStage: string): string[] {
    const stageRule = this.getStageRule(currentStage);
    return stageRule ? stageRule.allowedNextStages : [];
  }

  static async validateStageProgression(
    candidateData: any,
    currentStage: string,
    targetStage: string,
    documents: any[]
  ): Promise<ValidationResult> {
    // First check if stage progression is allowed
    if (!this.canAdvanceToStage(currentStage, targetStage)) {
      return {
        isValid: false,
        errors: [`Cannot advance from ${currentStage} to ${targetStage}. Invalid stage progression.`],
        missingRequirements: [],
        missingDocuments: []
      };
    }

    // Validate current stage requirements
    const fieldValidation = this.validateStageRequirements(candidateData, currentStage);
    const documentValidation = await this.validateDocumentRequirements(
      candidateData.id, 
      currentStage, 
      documents
    );

    // Combine results
    const result: ValidationResult = {
      isValid: fieldValidation.isValid && documentValidation.isValid,
      errors: [...fieldValidation.errors, ...documentValidation.errors],
      missingRequirements: fieldValidation.missingRequirements,
      missingDocuments: documentValidation.missingDocuments
    };

    return result;
  }

  static showValidationErrors(validation: ValidationResult): void {
    if (validation.missingRequirements.length > 0) {
      toast.error(`Missing required fields: ${validation.missingRequirements.join(', ')}`);
    }

    if (validation.missingDocuments.length > 0) {
      toast.error(`Missing required documents: ${validation.missingDocuments.join(', ')}`);
    }

    validation.errors.forEach(error => {
      toast.error(error);
    });
  }

  static getStageProgress(currentStage: string): number {
    const stages = ['passport', 'interview', 'medical', 'training', 'visa', 'deployed', 'completed'];
    const currentIndex = stages.indexOf(currentStage);
    return currentIndex >= 0 ? ((currentIndex + 1) / stages.length) * 100 : 0;
  }

  static getStageDescription(stage: string): string {
    const descriptions = {
      passport: 'Initial registration and passport documentation',
      interview: 'Candidate screening and skill assessment',
      medical: 'Health examinations and medical clearance',
      training: 'Skills development and preparation',
      visa: 'Legal documentation and visa processing',
      deployed: 'Final placement and travel arrangements',
      completed: 'Successfully deployed and settled'
    };
    return descriptions[stage as keyof typeof descriptions] || 'Unknown stage';
  }
}
