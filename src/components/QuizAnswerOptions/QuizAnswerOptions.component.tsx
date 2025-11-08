import React from "react";
import {
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Skeleton,
} from "@mui/material";
import { updateUserAnswerState } from "@/src/services/quiz.service";
import { useQuizStore } from "@/src/stores";

interface QuizAnswerOptionsProps {
  attemptId: string;
  questionId: string;
  quizId: string;
  options: (string | undefined)[];
}

// Helper array to map an index to a letter
const optionLetters = ["A", "B", "C", "D"];

const QuizAnswerOptions = ({
  attemptId,
  questionId,
  quizId,
  options,
}: QuizAnswerOptionsProps) => {
  const { userAnswers, setUserAnswer } = useQuizStore();
  const selectedValue = userAnswers[questionId] || "";

  const handleUserAnswer = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedAnswer = event.target.value;

    // 1. Update the local state for immediate UI feedback
    setUserAnswer(questionId, selectedAnswer);

    // 2. Send the update to the database
    if (attemptId) {
      updateUserAnswerState(attemptId, questionId, quizId, selectedAnswer);
    }
  };

  return (
    <FormControl>
      <RadioGroup
        aria-labelledby="demo-radio-buttons-group-label"
        name="radio-buttons-group"
        value={selectedValue}
        onChange={handleUserAnswer}
      >
        {options.map((option, index) => {
          // Get the corresponding letter for the current option's index
          const letterValue = optionLetters[index];

          return option !== undefined ? (
            <FormControlLabel
              key={index}
              // The value submitted on change is now the letter (e.g., 'A')
              value={letterValue}
              control={<Radio />}
              // The label displayed to the user is still the full option text
              label={option}
            />
          ) : (
            <Skeleton key={index} variant="text" width="60%" height={40} />
          );
        })}
      </RadioGroup>
    </FormControl>
  );
};

export default QuizAnswerOptions;
