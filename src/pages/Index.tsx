import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Share2, Globe, Volume2, VolumeX, Sparkles, Instagram } from "lucide-react";
import { toast } from "sonner";
import { useSound } from "@/hooks/use-sound";
import boxLogo from "@/assets/box-of-u-logo.png";
import confetti from "canvas-confetti";

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

interface ChatMessage {
  type: "question" | "answer";
  content: string;
  questionId: number;
  answerType?: PersonalityType;
  isTyping?: boolean;
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
  const [userName, setUserName] = useState("");
  const [age, setAge] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<PersonalityType[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { playSound, isMuted, toggleMute } = useSound();

  useEffect(() => {
    if (stage === "quiz" && chatMessages.length === 0) {
      // Show first question with typing animation
      showNextQuestion();
    }
  }, [stage]);

  useEffect(() => {
    // Auto scroll to bottom when new messages appear
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [chatMessages, isTyping]);

  const startQuiz = () => {
    if (!userName.trim()) {
      toast.error(language === "en" ? "Please tell me your name! 💕" : "Kasih tau nama kamu dong! 💕");
      return;
    }
    if (!age || parseInt(age) < 1 || parseInt(age) > 120) {
      toast.error(language === "en" ? "Please enter a valid age" : "Masukkan usia yang valid");
      return;
    }
    playSound("start");
    setStage("quiz");
    setChatMessages([]);
    setCurrentQuestion(0);
  };

  const showNextQuestion = () => {
    setIsTyping(true);
    
    // Add greeting for first question
    if (currentQuestion === 0) {
      const greeting = language === "en"
        ? `Haii ${userName}! 💕 Let's discover your vibe together, okay? ✨`
        : `Haii ${userName}! 💕 Yuk kita cari tau vibe kamu bareng-bareng yaa ✨`;
      
      setChatMessages([{
        type: "question",
        content: greeting,
        questionId: -1,
        isTyping: false
      }]);
      
      // Show actual first question after greeting
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          const questionText = language === "en" 
            ? questions[currentQuestion].en 
            : questions[currentQuestion].idText;
          
          setChatMessages(prev => [
            ...prev,
            {
              type: "question",
              content: questionText,
              questionId: currentQuestion,
              isTyping: false
            }
          ]);
          setIsTyping(false);
        }, 1000);
      }, 500);
    } else {
      // For subsequent questions
      setTimeout(() => {
        const questionText = language === "en" 
          ? questions[currentQuestion].en 
          : questions[currentQuestion].idText;
        
        setChatMessages(prev => [
          ...prev,
          {
            type: "question",
            content: questionText,
            questionId: currentQuestion,
            isTyping: false
          }
        ]);
        setIsTyping(false);
      }, 1000);
    }
  };

  const handleAnswer = (type: PersonalityType, answerText: string) => {
    playSound("click");
    
    // Add answer to chat
    setChatMessages(prev => [
      ...prev,
      {
        type: "answer",
        content: answerText,
        questionId: currentQuestion,
        answerType: type
      }
    ]);

    const newAnswers = [...answers, type];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      // Show next question after a short delay
      setTimeout(() => {
        showNextQuestion();
      }, 500);
    } else {
      calculateResult(newAnswers);
    }
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
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F5A3B8', '#E8C4A8', '#A8D5E5', '#D4B5E0']
      });
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
    setChatMessages([]);
    setResult(null);
    setUserName("");
    setAge("");
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center p-4">
      {/* Fixed Header Buttons */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            playSound("click");
            setLanguage(language === "en" ? "id" : "en");
          }}
          className="rounded-full w-11 h-11 hover:scale-110 transition-transform bg-card/80 backdrop-blur-sm shadow-md"
          aria-label="Switch language"
        >
          <Globe className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            playSound("click");
            toggleMute();
          }}
          className="rounded-full w-11 h-11 hover:scale-110 transition-transform bg-card/80 backdrop-blur-sm shadow-md"
          aria-label={isMuted ? "Unmute sounds" : "Mute sounds"}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </Button>
      </div>

      <div className="w-full max-w-2xl">
        {stage === "landing" && (
          <Card className="rounded-3xl shadow-2xl border-2 animate-scale-in overflow-hidden backdrop-blur-sm bg-card/95">
            <CardHeader className="text-center space-y-4 pb-4 pt-8">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary to-chart-2 mx-auto mb-2 shadow-lg">
                <img src={boxLogo} alt="Box of You" className="w-16 h-16 object-contain" />
              </div>
              <CardTitle className="text-5xl font-bold bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
                Box of You
              </CardTitle>
              <p className="text-xl text-muted-foreground flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5" />
                {language === "en" ? "Discover Your Vibe" : "Temukan Vibes Kamu"}
                <Sparkles className="w-5 h-5" />
              </p>
            </CardHeader>
            <CardContent className="space-y-5 pb-8">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  {language === "en" ? "What should I call you? 💕" : "Panggil kamu siapa? 💕"}
                </label>
                <Input
                  type="text"
                  placeholder={language === "en" ? "Your name..." : "Nama kamu..."}
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="text-lg rounded-2xl border-2 focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  {language === "en" ? "Your age ✨" : "Usia kamu ✨"}
                </label>
                <Input
                  type="number"
                  placeholder={language === "en" ? "How old are you?" : "Berapa usia kamu?"}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="text-lg rounded-2xl border-2 focus:ring-2 focus:ring-primary/50"
                  min="1"
                  max="120"
                />
              </div>

              <Button
                onClick={startQuiz}
                className="w-full py-7 text-lg font-semibold transition-all hover:scale-105 rounded-2xl shadow-lg bg-gradient-to-r from-primary to-chart-2 hover:shadow-xl"
                size="lg"
              >
                {language === "en" ? "Let's Start! 🚀" : "Yuk Mulai! 🚀"}
              </Button>
            </CardContent>
          </Card>
        )}

        {stage === "quiz" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  {language === "en" ? "Question" : "Pertanyaan"} {currentQuestion + 1}/{questions.length}
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Chat Interface */}
            <Card className="rounded-3xl shadow-2xl border-2 overflow-hidden backdrop-blur-sm bg-card/95">
              <ScrollArea ref={scrollAreaRef} className="h-[600px]">
                <div className="p-6 space-y-4">
                  {chatMessages.map((message, index) => (
                    <div key={index}>
                      {message.type === "question" ? (
                        // Question Bubble (Left - Received Message from Boxie)
                        <div className="flex justify-start gap-3 animate-fade-in">
                          <Avatar className="w-11 h-11 flex-shrink-0 shadow-md ring-2 ring-primary/20">
                            <AvatarImage src={boxLogo} alt="Boxie" />
                            <AvatarFallback className="bg-gradient-to-br from-primary to-chart-2">📦</AvatarFallback>
                          </Avatar>
                          <div className="boxie-bubble rounded-3xl rounded-tl-sm px-6 py-4 max-w-[75%] shadow-md border border-primary/10">
                            <p className="text-base font-medium text-foreground leading-relaxed">
                              {message.content}
                            </p>
                          </div>
                        </div>
                      ) : (
                        // Answer Bubble (Right - Sent Message)
                        <div className="flex justify-end animate-fade-in">
                          <div className="user-bubble rounded-3xl rounded-tr-sm px-6 py-4 max-w-[75%]">
                            <p className="text-base font-medium leading-relaxed">
                              {message.content}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex justify-start gap-3 animate-fade-in">
                      <Avatar className="w-11 h-11 flex-shrink-0 shadow-md ring-2 ring-primary/20">
                        <AvatarImage src={boxLogo} alt="Boxie" />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-chart-2">📦</AvatarFallback>
                      </Avatar>
                      <div className="boxie-bubble rounded-3xl rounded-tl-sm px-6 py-4 shadow-md border border-primary/10">
                        <div className="flex gap-1.5">
                          <span className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                          <span className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                          <span className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Answer Options - Fixed at Bottom */}
              {!isTyping && currentQuestion < questions.length && (
                <div className="border-t border-border/50 bg-background/50 backdrop-blur-sm p-4 space-y-2.5">
                  {questions[currentQuestion].options.map((option, index) => (
                    <button
                      key={option.label}
                      onClick={() => handleAnswer(option.type, language === "en" ? option.en : option.idText)}
                      className="w-full bg-gradient-to-r from-primary/10 to-chart-2/10 hover:from-primary/20 hover:to-chart-2/20 text-foreground rounded-2xl px-5 py-4 text-left transition-all hover:scale-[1.02] active:scale-[0.98] border-2 border-primary/20 hover:border-primary/40 shadow-sm hover:shadow-md animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <span className="font-bold text-primary mr-2">{option.label}.</span>
                      <span className="text-sm font-medium">
                        {language === "en" ? option.en : option.idText}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {stage === "result" && result && (
          <Card className="rounded-3xl shadow-2xl border-2 animate-scale-in overflow-hidden backdrop-blur-sm bg-gradient-to-br from-card/95 to-secondary/30">
            <CardHeader className="text-center space-y-5 pt-10 pb-6">
              <div className="relative inline-flex items-center justify-center mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-chart-2 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                <div className={`relative inline-flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-${result.personality} to-${result.personality}/60 shadow-2xl ring-4 ring-${result.personality}/20`}>
                  <span className="text-6xl">
                    {result.personality === "jolly" && "😄"}
                    {result.personality === "slick" && "😌"}
                    {result.personality === "buck" && "🎨"}
                    {result.personality === "snip" && "🎯"}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <p className="text-sm font-medium text-primary flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  {language === "en" ? `${userName}, you're a...` : `${userName}, kamu tuh...`}
                  <Sparkles className="w-4 h-4" />
                </p>
                <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary via-chart-2 to-primary bg-clip-text text-transparent">
                  {language === "en"
                    ? personalityInfo[result.personality].en.name
                    : personalityInfo[result.personality].idText.name}
                </CardTitle>
              </div>
              
              <p className="text-lg text-foreground/80 leading-relaxed px-4 font-medium">
                {language === "en"
                  ? personalityInfo[result.personality].en.description
                  : personalityInfo[result.personality].idText.description}
              </p>
            </CardHeader>
            <CardContent className="space-y-7 pb-8">
              <div className="space-y-4 bg-background/50 backdrop-blur-sm rounded-2xl p-5 border-2 border-primary/10">
                <h3 className="font-bold text-lg text-center flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  {language === "en" ? "Your Vibe Breakdown" : "Breakdown Vibe Kamu"}
                </h3>
                {Object.entries(result.percentages).map(([type, percentage]) => (
                  <div key={type} className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="capitalize text-foreground/80">{type}</span>
                      <span className="font-bold text-primary">{percentage}%</span>
                    </div>
                    <div className="h-3 bg-muted/50 rounded-full overflow-hidden shadow-inner">
                      <div
                        className={`h-full bg-${type} rounded-full transition-all duration-1000 shadow-lg`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-br from-primary/10 to-chart-2/10 rounded-2xl p-6 border-2 border-primary/20 text-center space-y-3">
                <p className="text-sm font-medium text-muted-foreground">
                  {language === "en" ? "Perfect gift box for you:" : "Gift box yang cocok buat kamu:"}
                </p>
                <p className="text-lg font-bold text-foreground">
                  {language === "en" ? "✨ Personalized Box of You ✨" : "✨ Box of You Khusus Kamu ✨"}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => window.open('https://www.instagram.com/boxofu', '_blank')}
                  className="w-full gap-2 py-7 text-base font-semibold transition-all hover:scale-105 rounded-2xl shadow-lg bg-gradient-to-r from-primary to-chart-2 hover:shadow-xl"
                >
                  <Instagram className="w-5 h-5" />
                  {language === "en" ? "Discover Your Gift Box 🎁" : "Temukan Gift Box Kamu 🎁"}
                </Button>
                
                <div className="flex gap-3">
                  <Button
                    onClick={shareResult}
                    variant="outline"
                    className="flex-1 gap-2 py-6 text-base font-medium transition-all hover:scale-105 rounded-2xl border-2 hover:border-primary/50"
                  >
                    <Share2 className="w-4 h-4" />
                    {language === "en" ? "Share" : "Bagikan"}
                  </Button>
                  <Button
                    onClick={resetQuiz}
                    variant="outline"
                    className="flex-1 py-6 text-base font-medium transition-all hover:scale-105 rounded-2xl border-2 hover:border-primary/50"
                  >
                    {language === "en" ? "Take Again" : "Ulangi"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
