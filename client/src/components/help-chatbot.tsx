import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Languages } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface HelpChatbotProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Language = 'en' | 'ms' | 'ta' | 'zh';

// Language detection
const detectLanguage = (text: string): Language | null => {
  const lower = text.toLowerCase();
  
  // Tamil detection
  if (lower.includes('tamil') || lower.includes('speak tamil') || /[\u0B80-\u0BFF]/.test(text)) {
    return 'ta';
  }
  
  // Malay detection
  if (lower.includes('malay') || lower.includes('bahasa') || lower.includes('speak malay')) {
    return 'ms';
  }
  
  // Chinese detection
  if (lower.includes('chinese') || lower.includes('mandarin') || /[\u4E00-\u9FFF]/.test(text)) {
    return 'zh';
  }
  
  // English detection
  if (lower.includes('english') || lower.includes('speak english')) {
    return 'en';
  }
  
  return null;
};

// Multi-language responses
const languageResponses = {
  en: {
    welcome: "👋 Hi! I'm your Route4VM assistant. Ask me anything about the app!",
    languageChanged: "✓ Language changed to English. How can I help you?",
  },
  ms: {
    welcome: "👋 Hai! Saya pembantu Route4VM. Tanya saya apa-apa tentang aplikasi ini!",
    languageChanged: "✓ Bahasa ditukar ke Bahasa Melayu. Apa yang boleh saya bantu?",
  },
  ta: {
    welcome: "👋 வணக்கம்! நான் Route4VM உதவியாளர். இந்த செயலி பற்றி என்ன வேண்டுமானாலும் கேளுங்கள்!",
    languageChanged: "✓ மொழி தமிழ் மாற்றப்பட்டது. நான் எவ்வாறு உதவ முடியும்?",
  },
  zh: {
    welcome: "👋 你好！我是 Route4VM 助手。请问我关于此应用的任何问题！",
    languageChanged: "✓ 语言已更改为中文。我能帮你什么？",
  },
};

// Knowledge base about the app
const getResponse = (question: string, language: Language = 'en'): string => {
  const q = question.toLowerCase();
  
  // Language-specific responses
  const responses = {
    en: {
      editMode: "To enable Edit Mode:\n1. Click the 'Edit Mode' button in the navigation\n2. Enter your password\n3. Once authenticated, you can:\n   • Drag & drop rows to reorder\n   • Edit cells inline\n   • Add/delete rows\n   • Add/delete columns\n   • Upload images",
      drag: "To reorder rows:\n1. Enable Edit Mode first\n2. Click and hold the grip icon (⋮⋮) on the left of each row\n3. Drag the row up or down\n4. Release to drop in the new position\n\nChanges are saved automatically to the database.",
      filter: "Filtering options:\n\n🔍 Search: Type in the search box to filter by any column\n\n📍 Route Filter: Click the filter button, select routes (KL 1, KL 2, SL 1, etc.)\n\n🚚 Delivery Filter: Filter by delivery type (Daily, Weekday, Alt 1, Alt 2)\n\nActive filters are shown as badges. Click 'Clear All' to remove filters.",
      default: "I'm here to help! You can ask me about:\n\n📝 Edit Mode & Data Entry\n🔍 Filters & Search\n📊 Columns & Customization\n📷 Image Management\n🗺️ Route Optimization\n📏 Distance Calculation\n🔗 Sharing Tables\n🚚 Delivery Schedules\n💳 Toll Calculation\n\nTry asking:\n• 'How to edit data?'\n• 'How to filter routes?'\n• 'How to add images?'\n• 'How to optimize route?'"
    },
    ms: {
      editMode: "Untuk aktifkan Edit Mode:\n1. Klik butang 'Edit Mode' di navigasi\n2. Masukkan kata laluan\n3. Selepas berjaya, anda boleh:\n   • Drag & drop baris untuk susun semula\n   • Edit sel secara terus\n   • Tambah/padam baris\n   • Tambah/padam kolum\n   • Muat naik gambar",
      drag: "Untuk susun semula baris:\n1. Aktifkan Edit Mode dahulu\n2. Klik dan tahan ikon grip (⋮⋮) di sebelah kiri setiap baris\n3. Drag baris ke atas atau ke bawah\n4. Lepaskan untuk drop di posisi baru\n\nPerubahan disimpan automatik ke database.",
      filter: "Pilihan penapis:\n\n🔍 Carian: Taip di kotak carian untuk tapis mengikut mana-mana kolum\n\n📍 Penapis Laluan: Klik butang penapis, pilih laluan (KL 1, KL 2, SL 1, dll.)\n\n🚚 Penapis Penghantaran: Tapis mengikut jenis penghantaran (Daily, Weekday, Alt 1, Alt 2)\n\nPenapis aktif ditunjukkan sebagai badge. Klik 'Clear All' untuk buang penapis.",
      default: "Saya di sini untuk membantu! Anda boleh tanya saya tentang:\n\n📝 Edit Mode & Kemasukan Data\n🔍 Penapis & Carian\n📊 Penyesuaian Kolum\n📷 Pengurusan Gambar\n🗺️ Pengoptimuman Laluan\n📏 Pengiraan Jarak\n🔗 Perkongsian Jadual\n🚚 Jadual Penghantaran\n💳 Pengiraan Tol\n\nCuba tanya:\n• 'Macam mana nak edit data?'\n• 'Macam mana nak filter laluan?'\n• 'Macam mana nak tambah gambar?'\n• 'Macam mana nak optimize laluan?'"
    },
    ta: {
      editMode: "Edit Mode ஐ இயக்க:\n1. வழிசெலுத்தலில் 'Edit Mode' பொத்தானைக் கிளிக் செய்யவும்\n2. உங்கள் கடவுச்சொல்லை உள்ளிடவும்\n3. அங்கீகரிக்கப்பட்டவுடன், நீங்கள் முடியும்:\n   • வரிசைகளை மறுவரிசைப்படுத்த drag & drop செய்யலாம்\n   • நேரடியாக செல்களை திருத்தலாம்\n   • வரிசைகளை சேர்க்கலாம்/நீக்கலாம்\n   • நெடுவரிசைகளை சேர்க்கலாம்/நீக்கலாம்\n   • படங்களை பதிவேற்றலாம்",
      drag: "வரிசைகளை மறுவரிசைப்படுத்த:\n1. முதலில் Edit Mode ஐ இயக்கவும்\n2. ஒவ்வொரு வரிசையின் இடது பக்கத்தில் உள்ள grip ஐகானை (⋮⋮) கிளிக் செய்து பிடிக்கவும்\n3. வரிசையை மேலே அல்லது கீழே drag செய்யவும்\n4. புதிய இடத்தில் drop செய்ய விடவும்\n\nமாற்றங்கள் தானாக database இல் சேமிக்கப்படும்.",
      filter: "வடிகட்டி விருப்பங்கள்:\n\n🔍 தேடல்: எந்த நெடுவரிசையையும் வடிகட்ட தேடல் பெட்டியில் தட்டச்சு செய்யவும்\n\n📍 பாதை வடிகட்டி: வடிகட்டி பொத்தானைக் கிளிக் செய்து, பாதைகளைத் தேர்ந்தெடுக்கவும் (KL 1, KL 2, SL 1, போன்றவை)\n\n🚚 விநியோக வடிகட்டி: விநியோக வகையால் வடிகட்டவும் (Daily, Weekday, Alt 1, Alt 2)\n\nசெயலில் உள்ள வடிகட்டிகள் badges ஆக காட்டப்படும். வடிகட்டிகளை அகற்ற 'Clear All' கிளிக் செய்யவும்.",
      default: "நான் உதவ இங்கு இருக்கிறேன்! நீங்கள் என்னிடம் கேட்கலாம்:\n\n📝 Edit Mode & தரவு உள்ளீடு\n🔍 வடிகட்டிகள் & தேடல்\n📊 நெடுவரிசை தனிப்பயனாக்கம்\n📷 படம் மேலாண்மை\n🗺️ பாதை உகப்பாக்கம்\n📏 தூர கணக்கீடு\n🔗 அட்டவணை பகிர்வு\n🚚 விநியோக அட்டவணைகள்\n💳 சுங்க கணக்கீடு\n\nகேட்க முயற்சிக்கவும்:\n• 'தரவை எவ்வாறு திருத்துவது?'\n• 'பாதைகளை எவ்வாறு வடிகட்டுவது?'\n• 'படங்களை எவ்வாறு சேர்ப்பது?'\n• 'பாதையை எவ்வாறு உகப்பாக்குவது?'"
    },
    zh: {
      editMode: "启用编辑模式：\n1. 点击导航中的'编辑模式'按钮\n2. 输入您的密码\n3. 验证后，您可以：\n   • 拖放行以重新排序\n   • 直接编辑单元格\n   • 添加/删除行\n   • 添加/删除列\n   • 上传图片",
      drag: "重新排序行：\n1. 首先启用编辑模式\n2. 点击并按住每行左侧的抓取图标 (⋮⋮)\n3. 将行向上或向下拖动\n4. 释放以放置在新位置\n\n更改会自动保存到数据库。",
      filter: "筛选选项：\n\n🔍 搜索：在搜索框中输入以按任何列筛选\n\n📍 路线筛选：点击筛选按钮，选择路线（KL 1, KL 2, SL 1等）\n\n🚚 配送筛选：按配送类型筛选（Daily, Weekday, Alt 1, Alt 2）\n\n活动筛选显示为徽章。点击'Clear All'删除筛选。",
      default: "我在这里帮助您！您可以问我关于：\n\n📝 编辑模式和数据输入\n🔍 筛选和搜索\n📊 列自定义\n📷 图片管理\n🗺️ 路线优化\n📏 距离计算\n🔗 表格共享\n🚚 配送时间表\n💳 过路费计算\n\n尝试询问：\n• '如何编辑数据？'\n• '如何筛选路线？'\n• '如何添加图片？'\n• '如何优化路线？'"
    }
  };
  
  const lang = responses[language] || responses.en;
  
  // Edit Mode
  if (q.includes('edit') && (q.includes('mode') || q.includes('how') || q.includes('macam mana'))) {
    return lang.editMode;
  }
  
  // Drag & Drop
  if (q.includes('drag') || q.includes('reorder') || q.includes('move') || q.includes('susun')) {
    return lang.drag;
  }
  
  // Filters
  if (q.includes('filter') || q.includes('search') || q.includes('cari') || q.includes('penapis')) {
    return lang.filter;
  }
  
  // Default response
  return lang.default;
};

export function HelpChatbot({ open, onOpenChange }: HelpChatbotProps) {
  const [language, setLanguage] = useState<Language>('en');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: languageResponses.en.welcome,
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;

    // Check for language change request
    const detectedLang = detectLanguage(input);
    if (detectedLang) {
      // Language change request
      const userMessage: Message = {
        id: Date.now().toString(),
        text: input,
        sender: 'user',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setInput('');
      setIsTyping(true);
      
      setTimeout(() => {
        setLanguage(detectedLang);
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: languageResponses[detectedLang].languageChanged,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 500);
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate bot thinking
    setTimeout(() => {
      const response = getResponse(input, language);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[600px] flex flex-col p-0 bg-white/70 dark:bg-black/30 backdrop-blur-2xl border-2 border-gray-200/60 dark:border-white/10 shadow-[0_20px_60px_0_rgba(0,0,0,0.25)] rounded-xl">
        {/* Frosted Glass Layer */}
        <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-white/60 via-white/40 to-white/50 dark:from-black/40 dark:via-black/20 dark:to-black/30 backdrop-blur-3xl" />
        
        <DialogHeader className="px-6 py-4 border-b border-border/20">
          <DialogTitle className="flex items-center gap-2 justify-between text-blue-600 dark:text-blue-400">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              Help Assistant
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Languages className="w-4 h-4" />
              <span>{language === 'en' ? 'EN' : language === 'ms' ? 'BM' : language === 'ta' ? 'தமிழ்' : '中文'}</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden px-6 py-4">
          <div className="h-full overflow-y-auto space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender === 'bot' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  <span className="text-[10px] opacity-70 mt-1 block">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {message.sender === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border/20">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about the app..."
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              size="icon"
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
