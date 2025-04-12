/**
 * Common Types
 */
export type Language = 'python' | 'r';
export type Theme = 'light' | 'dark' | 'system';
export type Status = 'idle' | 'loading' | 'success' | 'error';

/**
 * Base Response Interface
 */
export interface BaseResponse {
  status: 'success' | 'error';
  error?: string;
}

/**
 * Visualization Types
 */
export type VisualizationType = 'static' | 'interactive';

export interface VisualizationConfig {
  width: number;
  height: number;
  theme: Theme;
  interactive: boolean;
  preserveAspectRatio: boolean;
}

export interface VisualizationRequest {
  code: string;
  language: Language;
  visualization_type: VisualizationType;
  config?: Partial<VisualizationConfig>;
}

export interface VisualizationResponse extends BaseResponse {
  output_url?: string;
  logs?: string;
  metadata?: {
    executionTime: number;
    memoryUsage: number;
    dimensions: [number, number];
  };
}

/**
 * Editor Types
 */
export interface EditorConfig {
  fontSize: number;
  tabSize: number;
  minimap: boolean;
  lineNumbers: boolean;
  wordWrap: 'on' | 'off';
  theme: string;
}

export interface EditorState {
  code: string;
  language: Language;
  cursorPosition: {
    line: number;
    column: number;
  };
  selection?: {
    startLine: number;
    endLine: number;
  };
}

/**
 * Health Check Types
 */
export interface ServiceStatus {
  docker: boolean;
  storage: boolean;
  api: boolean;
}

export interface HealthCheckResponse extends BaseResponse {
  version: string;
  services: ServiceStatus;
  environment: 'development' | 'staging' | 'production';
  lastChecked: string;
}

/**
 * Default Configuration Values
 */
export const DEFAULT_EDITOR_CONFIG: EditorConfig = {
  fontSize: 14,
  tabSize: 2,
  minimap: false,
  lineNumbers: true,
  wordWrap: 'on',
  theme: 'vs-dark'
};

export const DEFAULT_VISUALIZATION_CONFIG: VisualizationConfig = {
  width: 800,
  height: 600,
  theme: 'light',
  interactive: false,
  preserveAspectRatio: true
};