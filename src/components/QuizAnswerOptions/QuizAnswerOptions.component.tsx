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
  options: (string | undefined)[];
}

const QuizAnswerOptions = ({
  attemptId,
  questionId,
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
      updateUserAnswerState(attemptId, questionId, selectedAnswer);
    }
  };

  return (
    <FormControl>
      <RadioGroup
        aria-labelledby="demo-radio-buttons-group-label"
        name="radio-buttons-group"
      >
        {options.map((option, index) =>
          // Check if the option is defined
          option !== undefined ? (
            <FormControlLabel
              key={index}
              value={option}
              control={<Radio />}
              label={option}
              onChange={handleUserAnswer}
            />
          ) : (
            // If the option is undefined, render a Skeleton
            <Skeleton key={index} variant="text" width="60%" height={40} />
          )
        )}
      </RadioGroup>
    </FormControl>
  );
};

export default QuizAnswerOptions;
