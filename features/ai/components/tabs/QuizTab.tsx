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

interface QuizTabProps {
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
}

export function QuizTab({
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
}: QuizTabProps) {
  return (
    <div className="space-y-8">
      <Card className="border border-slate-200 shadow-sm rounded-2xl">
        <CardContent className="p-6">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-slate-600" />
              <span className="font-semibold text-slate-800">Difficulty Level</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Select
                value={difficulty}
                onValueChange={(value: QuizDifficulty) => setDifficulty(value)}
              >
                <SelectTrigger className="w-full sm:w-40 border-slate-300 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">🟢 Easy</SelectItem>
                  <SelectItem value="medium">🟡 Medium</SelectItem>
                  <SelectItem value="hard">🔴 Hard</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleGenerateQuiz}
                disabled={isLoading}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl shadow-lg transition-all duration-200"
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
        <div className="space-y-6">
          {/* Quiz Header */}
          <div className="text-center">
            <div className="flex flex-col items-center gap-4">
              <h3 className="text-2xl font-bold text-slate-800">Knowledge Quiz</h3>
              {quizSubmitted && quizScore !== null && (
                <div className="inline-flex items-center px-6 py-3 bg-slate-100 rounded-2xl border border-slate-200">
                  <Award className="h-5 w-5 mr-2 text-slate-600" />
                  <span className="font-semibold text-slate-800">Score: {quizScore}%</span>
                </div>
              )}
            </div>
          </div>

          {/* Quiz Questions */}
          <div className="space-y-6">
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
            <div className="text-center">
              <Button
                onClick={handleQuizSubmit}
                disabled={Object.keys(quizAnswers).length !== quiz.questions.length}
                className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 text-base font-medium rounded-2xl shadow-lg transition-all duration-200"
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
}

interface QuizQuestionCardProps {
  question: QuizQuestion;
  questionIndex: number;
  selectedOption: number | undefined;
  isSubmitted: boolean;
  setQuizAnswer: (questionIndex: number, optionIndex: number) => void;
}

function QuizQuestionCard({
  question,
  questionIndex,
  selectedOption,
  isSubmitted,
  setQuizAnswer,
}: QuizQuestionCardProps) {
  return (
    <Card className="border border-slate-200 shadow-sm rounded-2xl">
      <CardHeader className="bg-slate-50 border-b border-slate-200 rounded-t-2xl">
        <CardTitle className="flex items-center text-lg font-semibold text-slate-800">
          <div className="flex-shrink-0 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center mr-3">
            <span className="text-sm font-bold">{questionIndex + 1}</span>
          </div>
          Question {questionIndex + 1}
        </CardTitle>
        <CardDescription className="text-base leading-relaxed text-slate-700 mt-2">
          {question.question}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {question.options.map((option, optionIndex) => (
            <div key={optionIndex}>
              <label
                className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  selectedOption === optionIndex
                    ? isSubmitted
                      ? optionIndex === question.correctAnswer
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-red-500 bg-red-50'
                      : 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name={`question_${questionIndex}`}
                  value={optionIndex}
                  checked={selectedOption === optionIndex}
                  onChange={() => setQuizAnswer(questionIndex, optionIndex)}
                  disabled={isSubmitted}
                  className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-600"
                />
                <div className="flex items-start gap-3 flex-1">
                  {isSubmitted && optionIndex === question.correctAnswer && (
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  )}
                  {isSubmitted &&
                    selectedOption === optionIndex &&
                    optionIndex !== question.correctAnswer && (
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    )}
                  <span className="text-slate-700 leading-relaxed">{option}</span>
                </div>
              </label>
            </div>
          ))}
        </div>
        {isSubmitted && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-blue-900 mb-2">Explanation:</p>
                <p className="text-blue-800 leading-relaxed">{question.explanation}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
