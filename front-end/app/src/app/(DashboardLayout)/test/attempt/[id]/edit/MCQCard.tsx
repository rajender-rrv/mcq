"use client";

import {
  Card,
  CardContent,
  Typography,
  FormControlLabel,
  Radio,
  FormControl,
} from "@mui/material";

type Option = {
  id: number;
  text: string;
};

type Props = {
  data: {
    id: number;
    question: string;
    options: Option[];
  };
  index: number;
  onAnswer: (key: string, optionId: number) => void;
  selectedAnswer?: number;
  uniqueKey: string;
};

export default function MCQCard({
  data,
  index,
  onAnswer,
  selectedAnswer,
  uniqueKey,
}: Props) {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6">
          Q{index + 1}. {data.question}
        </Typography>

        <FormControl>
          {data.options.map((opt) => (
            <FormControlLabel
              key={opt.id}
              control={
                <Radio
                  name={`question-${uniqueKey}`}
                  checked={selectedAnswer === opt.id}
                  onChange={() => onAnswer(uniqueKey, opt.id)}
                />
              }
              label={opt.text}
            />
          ))}
        </FormControl>
      </CardContent>
    </Card>
  );
}