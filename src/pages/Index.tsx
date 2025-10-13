import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Share2, Globe, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { useSound } from "@/hooks/use-sound";

type Language = "en" | "id";
type PersonalityType = "jolly" | "slick" | "buck" | "snip";

interface Question {
  id: number;
  en: string;
  idText: string;
  options: {
    label: string;
    type: PersonalityType;
    en: string;
    idText: string;
  }[];
  weight: number;
}

interface QuizResult {
  personality: PersonalityType;
  percentages: Record<PersonalityType, number>;
  age: number;
  answers: PersonalityType[];
  timestamp: string;
}

const questions: Question[] = [
  {
    id: 1,
    en: "Who are you giving the gift to?",
    idText: "Siapa yang mau kamu kasih hadiah?",
    weight: 1,
    options: [
      { label: "A", type: "jolly", en: "Male", idText: "Laki-laki" },
      { label: "B", type: "slick", en: "Female", idText: "Perempuan" },
    ],
  },
  {
    id: 2,
    en: "What kind of gift would they like most? 🎁",
    idText: "Hadiah kayak apa yang paling doi suka? 🎁",
    weight: 1,
    options: [
      { label: "A", type: "jolly", en: "Fun, makes them laugh", idText: "Yang seru, bikin ketawa" },
      { label: "B", type: "snip", en: "Functional and useful", idText: "Yang fungsional dan berguna" },
      { label: "C", type: "slick", en: "Comforting, soothing", idText: "Yang menenangkan" },
      { label: "D", type: "buck", en: "Keeps memories", idText: "Yang menyimpan kenangan" },
    ],
  },
  {
    id: 3,
    en: "How would they feel if the gift doesn't match their taste?",
    idText: "Gimana perasaan doi kalau hadiahnya nggak sesuai?",
    weight: 1,
    options: [
      { label: "A", type: "jolly", en: "Still special, no problem", idText: "Tetap istimewa, no problem" },
      { label: "B", type: "snip", en: "A bit off, but thank you", idText: "Agak kurang pas, tapi makasih" },
      { label: "C", type: "slick", en: "I value the effort", idText: "Yang penting usahanya" },
      { label: "D", type: "buck", en: "Keep it, doesn't suit me", idText: "Simpen aja, kurang cocok" },
    ],
  },
  {
    id: 4,
    en: "Which type of item would they choose?",
    idText: "Kira-kira, doi bakal milih jenis barang yang mana?",
    weight: 1,
    options: [
      { label: "A", type: "jolly", en: "Fun and ready-to-use", idText: "Yang seru dan siap pakai" },
      { label: "B", type: "snip", en: "Supports productivity", idText: "Yang mendukung produktivitas" },
      { label: "C", type: "slick", en: "Shows my care", idText: "Yang menunjukkan perhatian" },
      { label: "D", type: "buck", en: "Emotional, sentimental", idText: "Yang emosional, berkesan" },
    ],
  },
  {
    id: 5,
    en: "What do they usually do when bored?",
    idText: "Doi kalo lagi gabut biasanya ngapain?",
    weight: 1,
    options: [
      { label: "A", type: "jolly", en: "Hang out with friends, fun", idText: "Nongkrong sama temen, seru-seruan" },
      { label: "B", type: "snip", en: "Tinker/learn new things", idText: "Utak-atik/belajar hal baru" },
      { label: "C", type: "slick", en: "Watch movies/read books", idText: "Nonton film/baca buku" },
      { label: "D", type: "buck", en: "Make art + sad music", idText: "Bikin karya + denger lagu sedih" },
    ],
  },
  {
    id: 6,
    en: "Which gift would they dislike the most?",
    idText: "Hadiah kayak apa yang doi paling nggak suka?",
    weight: 3,
    options: [
      { label: "A", type: "jolly", en: "Boring or mainstream", idText: "Yang membosankan atau mainstream" },
      { label: "B", type: "snip", en: "Useless decoration", idText: "Hiasan yang nggak guna" },
      { label: "C", type: "slick", en: "Overly flashy", idText: "Yang terlalu mencolok" },
      { label: "D", type: "buck", en: "Careless gift", idText: "Hadiah yang asal-asalan" },
    ],
  },
  {
    id: 7,
    en: "Which of these matches them the most?",
    idText: "Kira-kira, dari semua ini mana yang doi banget?",
    weight: 3,
    options: [
      { label: "A", type: "jolly", en: "Loves crowds, cheerful", idText: "Suka keramaian, ceria" },
      { label: "B", type: "snip", en: "Serious, explorative", idText: "Serius, eksploratif" },
      { label: "C", type: "slick", en: "Peaceful, chill", idText: "Damai, santai" },
      { label: "D", type: "buck", en: "Emotional, artistic", idText: "Emosional, artistik" },
    ],
  },
];

const personalityInfo = {
  jolly: {
    en: {
      name: "Jolly",
      description: "Fun-loving, cheerful, and loves being around people. They appreciate gifts that bring joy and laughter!",
    },
    idText: {
      name: "Jolly",
      description: "Ceria, suka bersenang-senang, dan menyukai keramaian. Mereka menghargai hadiah yang membawa kebahagiaan!",
    },
  },
  slick: {
    en: {
      name: "Slick",
      description: "Calm, peaceful, and thoughtful. They value comfort and gifts that show care and attention.",
    },
    idText: {
      name: "Slick",
      description: "Tenang, damai, dan bijaksana. Mereka menghargai kenyamanan dan hadiah yang menunjukkan perhatian.",
    },
  },
  buck: {
    en: {
      name: "Buck",
      description: "Deep, artistic, and emotional. They treasure gifts with meaning and sentimental value.",
    },
    idText: {
      name: "Buck",
      description: "Mendalam, artistik, dan emosional. Mereka menghargai hadiah yang bermakna dan berkesan.",
    },
  },
  snip: {
    en: {
      name: "Snip",
      description: "Practical, productive, and goal-oriented. They prefer functional gifts that serve a purpose.",
    },
    idText: {
      name: "Snip",
      description: "Praktis, produktif, dan terarah. Mereka lebih suka hadiah yang fungsional dan berguna.",
    },
  },
};

const Index = () => {
  const [language, setLanguage] = useState<Language>("en");
  const [stage, setStage] = useState<"landing" | "quiz" | "result">("landing");
  const [age, setAge] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<PersonalityType[]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { playSound, isMuted, toggleMute } = useSound();

  const startQuiz = () => {
    if (!age || parseInt(age) < 1 || parseInt(age) > 120) {
      toast.error(language === "en" ? "Please enter a valid age" : "Masukkan usia yang valid");
      return;
    }
    playSound("start");
    setStage("quiz");
  };

  const handleAnswer = (type: PersonalityType) => {
    playSound("click");
    setIsTransitioning(true);
    
    setTimeout(() => {
      const newAnswers = [...answers, type];
      setAnswers(newAnswers);

      if (currentQuestion < questions.length - 1) {
        playSound("transition");
        setCurrentQuestion(currentQuestion + 1);
        setIsTransitioning(false);
      } else {
        calculateResult(newAnswers);
      }
    }, 300);
  };

  const calculateResult = (finalAnswers: PersonalityType[]) => {
    const weightedCounts: Record<PersonalityType, number> = {
      jolly: 0,
      slick: 0,
      buck: 0,
      snip: 0,
    };

    finalAnswers.forEach((answer, index) => {
      const weight = questions[index].weight;
      weightedCounts[answer] += weight;
    });

    const totalWeight = finalAnswers.reduce((sum, _, index) => sum + questions[index].weight, 0);
    
    const percentages: Record<PersonalityType, number> = {
      jolly: Math.round((weightedCounts.jolly / totalWeight) * 100),
      slick: Math.round((weightedCounts.slick / totalWeight) * 100),
      buck: Math.round((weightedCounts.buck / totalWeight) * 100),
      snip: Math.round((weightedCounts.snip / totalWeight) * 100),
    };

    const maxCount = Math.max(...Object.values(weightedCounts));
    const topPersonalities = Object.keys(weightedCounts).filter(
      (key) => weightedCounts[key as PersonalityType] === maxCount
    ) as PersonalityType[];

    const personality = topPersonalities[Math.floor(Math.random() * topPersonalities.length)];

    const quizResult: QuizResult = {
      personality,
      percentages,
      age: parseInt(age),
      answers: finalAnswers,
      timestamp: new Date().toISOString(),
    };

    setResult(quizResult);
    
    // Save to localStorage
    const savedResults = JSON.parse(localStorage.getItem("quizResults") || "[]");
    savedResults.push(quizResult);
    localStorage.setItem("quizResults", JSON.stringify(savedResults));

    // Send to Google Sheets
    fetch("https://script.google.com/macros/s/AKfycbzHr2g30_qognYuIqs4IteIJgmF-mL32RL8xCgubgBPqEGEFI5MJUafS-e0sBf8uQQd/exec", {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        timestamp: quizResult.timestamp,
        personality: personality,
        age: parseInt(age),
        jollyPercentage: percentages.jolly,
        slickPercentage: percentages.slick,
        buckPercentage: percentages.buck,
        snipPercentage: percentages.snip,
        language: language,
        answers: finalAnswers.join(", "),
      }),
    }).catch((error) => {
      console.error("Error sending to Google Sheets:", error);
    });

    setTimeout(() => {
      playSound("success");
      setStage("result");
      setIsTransitioning(false);
    }, 300);
  };

  const shareResult = () => {
    playSound("click");
    const resultText = language === "en"
      ? `I got ${personalityInfo[result!.personality].en.name} in the Box of You Personality Quiz!`
      : `Aku dapat ${personalityInfo[result!.personality].idText.name} di Quiz Kepribadian Box of You!`;
    
    if (navigator.share) {
      navigator.share({
        title: "Box of You Quiz",
        text: resultText,
      });
    } else {
      navigator.clipboard.writeText(resultText);
      toast.success(language === "en" ? "Result copied to clipboard!" : "Hasil disalin ke clipboard!");
    }
  };

  const resetQuiz = () => {
    playSound("click");
    setStage("landing");
    setCurrentQuestion(0);
    setAnswers([]);
    setResult(null);
    setAge("");
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Mute/Unmute Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          playSound("click");
          toggleMute();
        }}
        className="fixed top-4 right-4 z-50 rounded-full w-12 h-12 hover:scale-110 transition-transform"
        aria-label={isMuted ? "Unmute sounds" : "Mute sounds"}
      >
        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </Button>

      <div className="w-full max-w-2xl">
        {stage === "landing" && (
          <Card className="rounded-2xl shadow-xl border-2 animate-scale-in">
            <CardHeader className="text-center space-y-4 pb-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary mx-auto mb-2">
                <span className="text-4xl">📦</span>
              </div>
              <CardTitle className="text-4xl font-bold text-primary">
                Box of You
              </CardTitle>
              <p className="text-xl text-muted-foreground">
                {language === "en" ? "Personality Quiz" : "Quiz Kepribadian"}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    playSound("click");
                    setLanguage(language === "en" ? "id" : "en");
                  }}
                  className="gap-2"
                >
                  <Globe className="w-4 h-4" />
                  {language === "en" ? "English" : "Bahasa Indonesia"}
                </Button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {language === "en" ? "Your Age" : "Usia Kamu"}
                </label>
                <Input
                  type="number"
                  placeholder={language === "en" ? "Enter your age" : "Masukkan usia"}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="text-lg"
                  min="1"
                  max="120"
                />
              </div>

              <Button
                onClick={startQuiz}
                className="w-full py-6 text-lg font-semibold transition-all hover:scale-105"
                size="lg"
              >
                {language === "en" ? "Start Quiz" : "Mulai Quiz"}
              </Button>
            </CardContent>
          </Card>
        )}

        {stage === "quiz" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  {language === "en" ? "Question" : "Pertanyaan"} {currentQuestion + 1}/{questions.length}
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <Card
              className={`rounded-2xl shadow-xl border-2 transition-all duration-300 ${
                isTransitioning ? "opacity-0 translate-x-8" : "opacity-100 translate-x-0 animate-slide-in"
              }`}
            >
              <CardHeader>
                <CardTitle className="text-2xl">
                  {language === "en" ? questions[currentQuestion].en : questions[currentQuestion].idText}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {questions[currentQuestion].options.map((option) => (
                  <Button
                    key={option.label}
                    onClick={() => handleAnswer(option.type)}
                    variant="outline"
                    className="w-full py-6 text-left justify-start text-lg font-medium transition-all hover:scale-[1.02] hover:shadow-lg hover:border-primary"
                  >
                    <span className="font-bold mr-3 text-primary">{option.label}.</span>
                    {language === "en" ? option.en : option.idText}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {stage === "result" && result && (
          <Card className={`rounded-2xl shadow-xl border-2 animate-scale-in`}>
            <CardHeader className="text-center space-y-4">
              <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-${result.personality} mx-auto`}>
                <span className="text-5xl">
                  {result.personality === "jolly" && "😄"}
                  {result.personality === "slick" && "😌"}
                  {result.personality === "buck" && "🎨"}
                  {result.personality === "snip" && "🎯"}
                </span>
              </div>
              <CardTitle className="text-3xl font-bold">
                {language === "en"
                  ? personalityInfo[result.personality].en.name
                  : personalityInfo[result.personality].idText.name}
              </CardTitle>
              <p className="text-lg text-muted-foreground">
                {language === "en"
                  ? personalityInfo[result.personality].en.description
                  : personalityInfo[result.personality].idText.description}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">
                  {language === "en" ? "Personality Breakdown" : "Persentase Kepribadian"}
                </h3>
                {Object.entries(result.percentages).map(([type, percentage]) => (
                  <div key={type} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{type}</span>
                      <span className="font-semibold">{percentage}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-${type} rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button onClick={shareResult} className="flex-1 gap-2" size="lg">
                  <Share2 className="w-4 h-4" />
                  {language === "en" ? "Share Result" : "Bagikan Hasil"}
                </Button>
                <Button onClick={resetQuiz} variant="outline" className="flex-1" size="lg">
                  {language === "en" ? "Try Again" : "Coba Lagi"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
