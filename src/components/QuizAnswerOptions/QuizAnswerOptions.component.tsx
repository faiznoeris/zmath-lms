import React from "react";
import {
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Skeleton,
} from "@mui/material";
import { updateUserAnswerState } from "@/src/services/quiz.service";

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
  const handleUserAnswer = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedAnswer = event.target.value;
    updateUserAnswerState(attemptId, questionId, selectedAnswer);
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
