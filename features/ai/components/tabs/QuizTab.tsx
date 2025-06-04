import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Sparkles, Zap, Award, CheckCircle, XCircle, Lightbulb } from 'lucide-react';
import { QuizDifficulty, QuizQuestion } from '../../hooks/useAIAssistant';

type QuizTabProps = {
  isLoading: boolean;
  quiz: { questions: QuizQuestion[] } | null;
  difficulty: QuizDifficulty;
  quizAnswers: { [key: number]: number };
  quizSubmitted: boolean;
  quizScore: number | null;
  setDifficulty: (difficulty: QuizDifficulty) => void;
  handleGenerateQuiz: () => Promise<void>;
  handleQuizSubmit: () => void;
  setQuizAnswer: (questionIndex: number, optionIndex: number) => void;
  getScoreColor: (score: number) => string;
};

export const QuizTab = ({
  isLoading,
  quiz,
  difficulty,
  quizAnswers,
  quizSubmitted,
  quizScore,
  setDifficulty,
  handleGenerateQuiz,
  handleQuizSubmit,
  setQuizAnswer,
  getScoreColor,
}: QuizTabProps) => {
  return (
    <div className="space-y-6">
      <Card className="border border-neutral-stone bg-neutral-dust shadow-sm rounded-xl">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-neutral-dust" />
              <span className="font-semibold text-neutral-dust text-sm">Difficulty Level</span>
            </div>
            <div className="flex flex-col gap-3">
              <Select
                value={difficulty}
                onValueChange={(value: QuizDifficulty) => setDifficulty(value)}
              >
                <SelectTrigger className="w-full border-neutral-stone bg-neutral-pearl text-neutral-dust rounded-lg text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-neutral-pearl border-neutral-stone">
                  <SelectItem
                    value="easy"
                    className="text-neutral-dust focus:bg-neutral-sage focus:text-neutral-sage"
                  >
                    🟢 Easy
                  </SelectItem>
                  <SelectItem
                    value="medium"
                    className="text-neutral-dust focus:bg-neutral-sage focus:text-neutral-sage"
                  >
                    🟡 Medium
                  </SelectItem>
                  <SelectItem
                    value="hard"
                    className="text-neutral-dust focus:bg-neutral-sage focus:text-neutral-sage"
                  >
                    🔴 Hard
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleGenerateQuiz}
                disabled={isLoading}
                className="bg-primary px-6 py-2.5 text-sm font-medium rounded-xl shadow-lg transition-all duration-200 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                size="sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Quiz...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Quiz
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {quiz && (
        <div className="space-y-4">
          {/* Quiz Header */}
          <div className="text-center">
            <h3 className="text-lg font-bold text-neutral-dust">Knowledge Quiz</h3>
            {quizSubmitted && quizScore !== null && (
              <div className="inline-flex items-center px-4 py-2 bg-neutral-mist border border-neutral-stone rounded-xl mt-2">
                <Award className="h-4 w-4 mr-2 text-neutral-mist" />
                <span className="font-semibold text-neutral-mist text-sm">Score: {quizScore}%</span>
              </div>
            )}
          </div>

          {/* Quiz Questions */}
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {quiz.questions.map((question, questionIndex) => (
              <QuizQuestionCard
                key={questionIndex}
                question={question}
                questionIndex={questionIndex}
                selectedOption={quizAnswers[questionIndex]}
                isSubmitted={quizSubmitted}
                setQuizAnswer={setQuizAnswer}
              />
            ))}
          </div>

          {!quizSubmitted && (
            <div className="text-center pt-2">
              <Button
                onClick={handleQuizSubmit}
                disabled={Object.keys(quizAnswers).length !== quiz.questions.length}
                className="bg-neutral-mist hover:bg-neutral-stone text-neutral-mist px-6 py-2 text-sm font-medium rounded-xl shadow-lg transition-all duration-200 w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Award className="mr-2 h-4 w-4" />
                Submit Quiz
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

type QuizQuestionCardProps = {
  question: QuizQuestion;
  questionIndex: number;
  selectedOption: number | undefined;
  isSubmitted: boolean;
  setQuizAnswer: (questionIndex: number, optionIndex: number) => void;
};

function QuizQuestionCard({
  question,
  questionIndex,
  selectedOption,
  isSubmitted,
  setQuizAnswer,
}: QuizQuestionCardProps) {
  return (
    <Card className="border border-neutral-stone bg-neutral-dust shadow-sm rounded-xl">
      <CardHeader className="bg-neutral-pearl border-b border-neutral-stone rounded-t-xl p-4">
        <CardTitle className="flex items-center text-sm font-semibold text-neutral-dust">
          <div className="flex-shrink-0 w-6 h-6 bg-neutral-stone text-neutral-stone rounded-full flex items-center justify-center mr-2">
            <span className="text-xs font-bold">{questionIndex + 1}</span>
          </div>
          Question {questionIndex + 1}
        </CardTitle>
        <CardDescription className="text-sm leading-relaxed text-neutral-dust mt-1">
          {question.question}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {question.options.map((option, optionIndex) => (
            <div key={optionIndex}>
              <label
                className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  selectedOption === optionIndex
                    ? isSubmitted
                      ? optionIndex === question.correctAnswer
                        ? 'border-neutral-sage bg-neutral-sage'
                        : 'border-neutral-clay bg-neutral-clay'
                      : 'border-neutral-mist bg-neutral-mist'
                    : 'border-neutral-stone hover:border-neutral-mist hover:bg-neutral-pearl'
                }`}
              >
                <input
                  type="radio"
                  name={`question_${questionIndex}`}
                  value={optionIndex}
                  checked={selectedOption === optionIndex}
                  onChange={() => setQuizAnswer(questionIndex, optionIndex)}
                  disabled={isSubmitted}
                  className="w-4 h-4 mt-0.5 flex-shrink-0 text-neutral-mist focus:ring-neutral-mist focus:ring-2 focus:ring-offset-2"
                />
                <div className="flex items-start gap-2 flex-1">
                  {isSubmitted && optionIndex === question.correctAnswer && (
                    <CheckCircle className="w-4 h-4 text-neutral-sage mt-0.5 flex-shrink-0" />
                  )}
                  {isSubmitted &&
                    selectedOption === optionIndex &&
                    optionIndex !== question.correctAnswer && (
                      <XCircle className="w-4 h-4 text-neutral-clay mt-0.5 flex-shrink-0" />
                    )}
                  <span className="text-neutral-stone leading-relaxed text-sm">{option}</span>
                </div>
              </label>
            </div>
          ))}
        </div>
        {isSubmitted && (
          <div className="mt-4 p-3 bg-neutral-mist border border-neutral-stone rounded-lg">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-neutral-mist mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-neutral-mist mb-1 text-sm">Explanation:</p>
                <p className="text-neutral-mist leading-relaxed text-sm">{question.explanation}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
