import React, { useState } from 'react';
import { useSetting } from "../../hooks/Setting";
import { useI18n } from "../../hooks/I18n";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';

const CEFR_LEVELS = [
  { value: 0, label: "Unknown" },
  { value: 1, label: "A1 (Beginner)" },
  { value: 2, label: "A2 (Elementary)" },
  { value: 3, label: "B1 (Intermediate)" },
  { value: 4, label: "B2 (Upper Intermediate)" },
  { value: 5, label: "C1 (Advanced)" },
  { value: 6, label: "C2 (Proficient)" }
];

const QUIZ_QUESTIONS = [
  { q: "Choose the correct word: 'I ____ to the store yesterday.'", options: ["go", "went", "gone", "going"], answer: "went", level: 1 },
  { q: "Choose the correct word: 'If I ____ a millionaire, I would buy a mansion.'", options: ["am", "was", "were", "be"], answer: "were", level: 3 },
  { q: "Choose the correct word: 'The scientist\'s research was so ____ that it revolutionized the field.'", options: ["ubiquitous", "ephemeral", "profound", "ambiguous"], answer: "profound", level: 5 }
];

export default function CEFRSetting() {
  const i18n = useI18n();
  const { setting, updateSetting } = useSetting();
  const cefrSetting = setting.cefrSetting || { enabled: false, level: 0 };
  const [quizOpen, setQuizOpen] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);

  const handleEnableChange = (e) => {
    updateSetting({ ...setting, cefrSetting: { ...cefrSetting, enabled: e.target.checked } });
  };

  const handleLevelChange = (e) => {
    updateSetting({ ...setting, cefrSetting: { ...cefrSetting, level: e.target.value } });
  };

  const startQuiz = () => {
    setCurrentQIndex(0);
    setScore(0);
    setQuizOpen(true);
  };

  const handleAnswer = (selected) => {
    const q = QUIZ_QUESTIONS[currentQIndex];
    let newScore = score;
    if (selected === q.answer) {
      newScore += q.level;
    }
    
    if (currentQIndex < QUIZ_QUESTIONS.length - 1) {
      setScore(newScore);
      setCurrentQIndex(currentQIndex + 1);
    } else {
      let finalLevel = 1;
      if (newScore > 6) finalLevel = 5;
      else if (newScore > 3) finalLevel = 3;
      else if (newScore > 0) finalLevel = 2;
      
      updateSetting({ ...setting, cefrSetting: { ...cefrSetting, level: finalLevel } });
      setQuizOpen(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mt: 2 }}>
      <Typography variant="h5" gutterBottom>
        CEFR Vocabulary Learning
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Learn English words by assessing your level (A1-C2) and annotating difficult words during page translation.
      </Typography>
      
      <Box sx={{ my: 3 }}>
        <FormControlLabel
          control={<Switch checked={cefrSetting.enabled} onChange={handleEnableChange} />}
          label="Enable CEFR Vocabulary Learning"
        />
      </Box>

      {cefrSetting.enabled && (
        <Stack spacing={3}>
          <FormControl fullWidth>
            <InputLabel>Your Current CEFR Level</InputLabel>
            <Select
              value={cefrSetting.level}
              label="Your Current CEFR Level"
              onChange={handleLevelChange}
            >
              {CEFR_LEVELS.map(lvl => (
                <MenuItem key={lvl.value} value={lvl.value}>{lvl.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button variant="contained" onClick={startQuiz}>
            Take Assessment Quiz
          </Button>
        </Stack>
      )}

      {/* Quiz Dialog */}
      <Dialog open={quizOpen} onClose={() => setQuizOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>CEFR Assessment Quiz</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom sx={{ mt: 1 }}>
            {QUIZ_QUESTIONS[currentQIndex]?.q}
          </Typography>
          <RadioGroup onChange={(e) => handleAnswer(e.target.value)}>
            {QUIZ_QUESTIONS[currentQIndex]?.options.map((opt) => (
              <FormControlLabel key={opt} value={opt} control={<Radio />} label={opt} />
            ))}
          </RadioGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuizOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
