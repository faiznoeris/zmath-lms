import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { QuizWithQuestions } from "../types";

interface IQuizState {
  quiz: QuizWithQuestions | null;
  currentQuestionIndex: number;
  attemptId: string;
  setQuiz: (quizData: QuizWithQuestions) => void;
  setAttemptId: (id: string) => void;
  setCurrentQuestionIndex: (index: number) => void;
}

export const useQuizStore = create<IQuizState>()(
  devtools(set => ({
    quiz: null,
    attemptId: null,
    currentQuestionIndex: 1,
    setQuiz: quizData =>
      set({
        quiz: quizData,
        currentQuestionIndex: 0,
      }),
    setAttemptId: id => set({ attemptId: id }),
    setCurrentQuestionIndex: index => set({ currentQuestionIndex: index }),
  }))
);
