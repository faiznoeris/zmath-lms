import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { QuizWithQuestions } from "../types";

interface IQuizState {
  quiz: QuizWithQuestions | null;
  currentQuestionIndex: number;
  sessionId: string;
  userAnswers: Record<string, string>;
  timeRemaining: number | null; // Time remaining in seconds for resumed attempts
  setQuiz: (quizData: QuizWithQuestions) => void;
  setSessionId: (id: string) => void;
  setCurrentQuestionIndex: (index: number) => void;
  setUserAnswer: (questionId: string, answer: string) => void;
  setTimeRemaining: (seconds: number | null) => void;
  resetQuizState: () => void; // Reset all quiz-related state for new attempts
}

export const useQuizStore = create<IQuizState>()(
  persist(
    devtools(set => ({
      quiz: null,
      sessionId: null,
      userAnswers: {},
      currentQuestionIndex: 0,
      timeRemaining: null,
      setQuiz: quizData =>
        set({
          quiz: quizData,
          // Don't reset userAnswers, currentQuestionIndex, or timeRemaining
          // These may have been set when resuming a session
        }),
      setSessionId: id => set({ sessionId: id }),
      setUserAnswer: (questionId, answer) =>
        set(state => ({
          userAnswers: {
            ...state.userAnswers,
            [questionId]: answer,
          },
        })),
      setCurrentQuestionIndex: index => set({ currentQuestionIndex: index }),
      setTimeRemaining: seconds => set({ timeRemaining: seconds }),
      resetQuizState: () =>
        set({
          userAnswers: {},
          currentQuestionIndex: 0,
          timeRemaining: null,
          sessionId: "",
        }),
    })),
    {
      name: "quiz-data",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
