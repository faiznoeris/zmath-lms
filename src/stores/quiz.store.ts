import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { QuizWithQuestions } from "../types";

interface IQuizState {
  quiz: QuizWithQuestions | null;
  currentQuestionIndex: number;
  attemptId: string;
  userAnswers: Record<string, string>;
  setQuiz: (quizData: QuizWithQuestions) => void;
  setAttemptId: (id: string) => void;
  setCurrentQuestionIndex: (index: number) => void;
  setUserAnswer: (questionId: string, answer: string) => void;
}

export const useQuizStore = create<IQuizState>()(
  devtools(set => ({
    quiz: null,
    attemptId: null,
    userAnswers: {},
    currentQuestionIndex: 0,
    setQuiz: quizData =>
      set({
        quiz: quizData,
        currentQuestionIndex: 0,
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
  }))
);
