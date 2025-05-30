"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { analyzeNotesAction, generateQuizAction, generateStudyPlanAction } from "../actions/ai-actions"
import { Brain, FileText, Target, Zap, Loader2, CheckCircle, XCircle } from "lucide-react"

interface AIAssistantProps {
  videoId: string
  dbVideoId: string
}

interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface NoteAnalysis {
  summary: string
  keyPoints: string[]
  knowledgeGaps: string[]
  suggestions: string[]
  comprehensionScore: number
}

export function AIAssistant({ videoId, dbVideoId }: AIAssistantProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [analysis, setAnalysis] = useState<NoteAnalysis | null>(null)
  const [quiz, setQuiz] = useState<{ questions: QuizQuestion[] } | null>(null)
  const [studyPlan, setStudyPlan] = useState<string | null>(null)
  const [quizAnswers, setQuizAnswers] = useState<{ [key: number]: number }>({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [quizScore, setQuizScore] = useState<number | null>(null)
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium")
  const [learningGoals, setLearningGoals] = useState("")
  const { toast } = useToast()

  const handleAnalyzeNotes = async () => {
    setIsLoading(true)
    try {
      const result = await analyzeNotesAction(dbVideoId)
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        setAnalysis(result.analysis)
        toast({
          title: "Analysis Complete",
          description: "Your notes have been analyzed successfully",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze notes",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateQuiz = async () => {
    setIsLoading(true)
    try {
      const result = await generateQuizAction(dbVideoId, difficulty)
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        setQuiz(result.quiz)
        setQuizAnswers({})
        setQuizSubmitted(false)
        setQuizScore(null)
        toast({
          title: "Quiz Generated",
          description: "Your personalized quiz is ready",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate quiz",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateStudyPlan = async () => {
    if (!learningGoals.trim()) {
      toast({
        title: "Learning Goals Required",
        description: "Please enter your learning goals first",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const goals = learningGoals.split("\n").filter((goal) => goal.trim())
      const result = await generateStudyPlanAction(dbVideoId, goals)
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        setStudyPlan(result.studyPlan)
        toast({
          title: "Study Plan Created",
          description: "Your personalized study plan is ready",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate study plan",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuizSubmit = () => {
    if (!quiz) return

    let correct = 0
    quiz.questions.forEach((question, index) => {
      if (quizAnswers[index] === question.correctAnswer) {
        correct++
      }
    })

    const score = Math.round((correct / quiz.questions.length) * 100)
    setQuizScore(score)
    setQuizSubmitted(true)

    toast({
      title: "Quiz Completed",
      description: `You scored ${score}% (${correct}/${quiz.questions.length} correct)`,
      variant: score >= 70 ? "default" : "destructive",
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Learning Assistant
        </CardTitle>
        <CardDescription>Get personalized insights, quizzes, and study plans based on your notes</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="analysis">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="quiz">Quiz</TabsTrigger>
            <TabsTrigger value="study-plan">Study Plan</TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="space-y-4">
            <Button onClick={handleAnalyzeNotes} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Notes...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Analyze My Notes
                </>
              )}
            </Button>

            {analysis && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Note Analysis</h3>
                  <Badge variant="outline" className={getScoreColor(analysis.comprehensionScore)}>
                    {analysis.comprehensionScore}% Comprehension
                  </Badge>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{analysis.summary}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Key Points</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {analysis.keyPoints.map((point, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {analysis.knowledgeGaps.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base text-orange-600">Knowledge Gaps</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1">
                        {analysis.knowledgeGaps.map((gap, index) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <span className="text-orange-500 mt-1">⚠</span>
                            {gap}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base text-green-600">Suggestions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {analysis.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <span className="text-green-500 mt-1">💡</span>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="quiz" className="space-y-4">
            <div className="flex gap-2">
              <Select value={difficulty} onValueChange={(value: "easy" | "medium" | "hard") => setDifficulty(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleGenerateQuiz} disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Quiz...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Generate Quiz
                  </>
                )}
              </Button>
            </div>

            {quiz && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Quiz</h3>
                  {quizSubmitted && quizScore !== null && (
                    <Badge variant="outline" className={getScoreColor(quizScore)}>
                      Score: {quizScore}%
                    </Badge>
                  )}
                </div>

                {quiz.questions.map((question, questionIndex) => (
                  <Card key={questionIndex}>
                    <CardHeader>
                      <CardTitle className="text-base">Question {questionIndex + 1}</CardTitle>
                      <CardDescription>{question.question}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id={`q${questionIndex}_o${optionIndex}`}
                            name={`question_${questionIndex}`}
                            value={optionIndex}
                            checked={quizAnswers[questionIndex] === optionIndex}
                            onChange={() =>
                              setQuizAnswers((prev) => ({
                                ...prev,
                                [questionIndex]: optionIndex,
                              }))
                            }
                            disabled={quizSubmitted}
                            className="w-4 h-4"
                          />
                          <label
                            htmlFor={`q${questionIndex}_o${optionIndex}`}
                            className={`text-sm cursor-pointer ${
                              quizSubmitted
                                ? optionIndex === question.correctAnswer
                                  ? "text-green-600 font-medium"
                                  : quizAnswers[questionIndex] === optionIndex && optionIndex !== question.correctAnswer
                                    ? "text-red-600"
                                    : ""
                                : ""
                            }`}
                          >
                            {quizSubmitted && optionIndex === question.correctAnswer && (
                              <CheckCircle className="inline w-4 h-4 mr-1" />
                            )}
                            {quizSubmitted &&
                              quizAnswers[questionIndex] === optionIndex &&
                              optionIndex !== question.correctAnswer && <XCircle className="inline w-4 h-4 mr-1" />}
                            {option}
                          </label>
                        </div>
                      ))}
                      {quizSubmitted && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-md">
                          <p className="text-sm font-medium text-blue-800">Explanation:</p>
                          <p className="text-sm text-blue-700">{question.explanation}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {!quizSubmitted && (
                  <Button
                    onClick={handleQuizSubmit}
                    disabled={Object.keys(quizAnswers).length !== quiz.questions.length}
                    className="w-full"
                  >
                    Submit Quiz
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="study-plan" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Learning Goals</label>
              <Textarea
                placeholder="Enter your learning goals (one per line)&#10;Example:&#10;- Master React hooks&#10;- Understand state management&#10;- Build a complete project"
                value={learningGoals}
                onChange={(e) => setLearningGoals(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <Button onClick={handleGenerateStudyPlan} disabled={isLoading || !learningGoals.trim()} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Study Plan...
                </>
              ) : (
                <>
                  <Target className="mr-2 h-4 w-4" />
                  Generate Study Plan
                </>
              )}
            </Button>

            {studyPlan && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Your Personalized Study Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap text-sm">{studyPlan}</pre>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
