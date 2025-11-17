export interface QuestionOption {
  id: number;
  question_id: number;
  option_text: string;
  option_value: string;
  order: number;
}

export interface Question {
  id: number;
  question_key: string;
  question_text: string;
  category?: string;
  order: number;
  active: boolean;
  options: QuestionOption[];
  created_at: string;
  updated_at: string;
}
