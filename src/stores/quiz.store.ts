import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Quiz } from "../models/Quiz";
import { Question } from "../models/Question";

interface QuizWithQuestions extends Quiz {
  queston: Question[];
}

interface IQuizState {
  quiz: QuizWithQuestions | null;
  numberOfQuestions: number;
  currentQuestionIndex: number;
  setQuiz: (quizData: QuizWithQuestions) => void;
  setNumberOfQuestions: (totalQuestions: number) => void;
  setCurrentQuestionIndex: (index: number) => void;
}

export const useQuizStore = create<IQuizState>()(
  devtools(set => ({
    quiz: null,
    numberOfQuestions: 0,
    currentQuestionIndex: 1,
    setQuiz: quizData =>
      set({
        quiz: quizData,
        currentQuestionIndex: 0,
      }),
    setNumberOfQuestions: totalQuestions =>
      set({ numberOfQuestions: totalQuestions }),
    setCurrentQuestionIndex: index => set({ currentQuestionIndex: index }),
  }))
);
