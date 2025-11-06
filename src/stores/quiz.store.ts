import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { QuizWithQuestions } from "../types";

interface IQuizState {
  quiz: QuizWithQuestions | null;
  currentQuestionIndex: number;
  setQuiz: (quizData: QuizWithQuestions) => void;
  setCurrentQuestionIndex: (index: number) => void;
}

export const useQuizStore = create<IQuizState>()(
  devtools(set => ({
    quiz: null,
    currentQuestionIndex: 1,
    setQuiz: quizData =>
      set({
        quiz: quizData,
        currentQuestionIndex: 0,
      }),
    setCurrentQuestionIndex: index => set({ currentQuestionIndex: index }),
  }))
);
