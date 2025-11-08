import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { QuizWithQuestions } from "../types";

interface IQuizState {
  quiz: QuizWithQuestions | null;
  currentQuestionIndex: number;
  sessionId: string;
  userAnswers: Record<string, string>;
  setQuiz: (quizData: QuizWithQuestions) => void;
  setSessionId: (id: string) => void;
  setCurrentQuestionIndex: (index: number) => void;
  setUserAnswer: (questionId: string, answer: string) => void;
}

export const useQuizStore = create<IQuizState>()(
  persist(
    devtools(set => ({
      quiz: null,
      sessionId: null,
      userAnswers: {},
      currentQuestionIndex: 0,
      setQuiz: quizData =>
        set({
          quiz: quizData,
          userAnswers: {},
          currentQuestionIndex: 0,
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
    })),
    {
      name: "quiz-data",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
