/**
 * TypeScript interfaces for LTI Position Board API responses
 */

export interface InterviewStep {
  id: number;
  interviewFlowId: number;
  interviewTypeId: number;
  name: string;
  orderIndex: number;
}

export interface InterviewFlow {
  id: number;
  description: string;
  interviewSteps: InterviewStep[];
}

export interface PositionData {
  positionName: string;
  interviewFlow: InterviewFlow;
}

export interface Candidate {
  id: number;
  applicationId: number;
  fullName: string;
  currentInterviewStep: string;
  currentInterviewStepId: number;
  averageScore: number;
}

export interface UpdateStageRequest {
  applicationId: number;
  currentInterviewStep: number;
}

export interface UpdateStageResponse {
  message: string;
  data: {
    id: number;
    positionId: number;
    candidateId: number;
    applicationDate: string;
    currentInterviewStep: number;
    notes?: string;
  };
}

export interface ApiError {
  message: string;
  status?: number;
  statusText?: string;
}

/**
 * API service function types
 */
export type GetInterviewFlowFn = (positionId: number) => Promise<PositionData>;
export type GetCandidatesByPositionFn = (positionId: number) => Promise<Candidate[]>;
export type UpdateCandidateStageFn = (candidateId: number, updateData: UpdateStageRequest) => Promise<UpdateStageResponse>;

/**
 * Utility types for optimistic updates
 */
export type OptimisticUpdateCallback = (candidateId: number, updateData: UpdateStageRequest) => void;
export type SuccessCallback = (result: UpdateStageResponse) => void;
export type ErrorCallback = (error: ApiError, candidateId: number, updateData: UpdateStageRequest) => void;

/**
 * Retry and debounce utility types
 */
export type RetryableFn<T> = () => Promise<T>;
export type DebouncedFn<T extends (...args: any[]) => any> = T & {
  cancel?: () => void;
};

/**
 * API configuration types
 */
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  maxRetries: number;
  retryDelay: number;
}

/**
 * Request configuration types
 */
export interface RequestConfig {
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}

/**
 * Response wrapper for consistent error handling
 */
export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  status: number;
  success: boolean;
}
