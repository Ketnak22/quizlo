import QuizType from './QuizType';

interface FetchedGameData {
  type: QuizType;
  name: string;
  jsonData: string;
  svgData?: string | null;
  createdAt: number | Date;
}

export default FetchedGameData;
