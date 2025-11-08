import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { QuizWithQuestions } from "../types";

interface IQuizState {
  quiz: QuizWithQuestions | null;
  currentQuestionIndex: number;
  attemptId: string;
  userAnswers: Record<string, string>;
  timeRemaining: number | null; // Time remaining in seconds for resumed attempts
  setQuiz: (quizData: QuizWithQuestions) => void;
  setAttemptId: (id: string) => void;
  setCurrentQuestionIndex: (index: number) => void;
  setUserAnswer: (questionId: string, answer: string) => void;
  setTimeRemaining: (seconds: number | null) => void;
}

export const useQuizStore = create<IQuizState>()(
  devtools(set => ({
    quiz: null,
    attemptId: null,
    userAnswers: {},
    currentQuestionIndex: 0,
    timeRemaining: null,
    setQuiz: quizData =>
      set({
        quiz: quizData,
        userAnswers: {},
        currentQuestionIndex: 0,
        timeRemaining: null, // Reset time remaining when setting new quiz
      }),
    setAttemptId: id => set({ attemptId: id }),
    setUserAnswer: (questionId, answer) =>
      set(state => ({
        userAnswers: {
          ...state.userAnswers,
          [questionId]: answer,
        },
      })),
    setCurrentQuestionIndex: index => set({ currentQuestionIndex: index }),
    setTimeRemaining: seconds => set({ timeRemaining: seconds }),
  }))
);
