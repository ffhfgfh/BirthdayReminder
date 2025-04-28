import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { toast } from "react-hot-toast";
import { FaGift, FaBirthdayCake, FaSmile } from "react-icons/fa";

const genAi = new GoogleGenerativeAI("AIzaSyAu3-x3T0-ZP8rHPKHuywK79EZ2PczcvXY");
const model = genAi.getGenerativeModel({ model: "gemini-1.5-pro" });

const LandingPage = () => {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const navigate = useNavigate();
  const heroText = "Never Miss a Birthday 🎉 & Find the Perfect Gift 🎁";

  useEffect(() => {
    let i = 0;
    setText("");
    const interval = setInterval(() => {
      setText(heroText.slice(0, i + 1));
      i++;
      if (i >= heroText.length) clearInterval(interval);
    }, 80);
    return () => clearInterval(interval);
  }, []);

  const isBirthdayRelated = (text) => {
    const keywords = [
      "gift", "birthday", "present", "remind", "reminder",
      "gift idea", "birthday gift", "upcoming birthday",
      "birthday suggestions", "what to gift", "buy", "purchase", "gift recommendation"
    ];
    const lowerText = text.toLowerCase();
    return keywords.some(keyword => lowerText.includes(keyword));
  };

  const handleSubmit = async () => {
    if (!input.trim()) {
      toast.error("Please type a birthday or gift query!");
      return;
    }

    if (!isBirthdayRelated(input)) {
      toast.error("Only birthday and gift related queries allowed! 🎂");
      setResponse({
        error: "This assistant is for BIRTHDAY gift ideas & reminders! 🎉\nTry asking:\n- 'Gift ideas for dad turning 50'\n- 'Remind me to buy a gift for my friend next week'"
      });
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      const includeLinks = input.toLowerCase().includes('buy') || input.toLowerCase().includes('purchase') || input.toLowerCase().includes('link');

      const prompt = `
You are an AI Personalized Birthday Reminder and Gift Suggestion Assistant.

Based on user input (recipient, relation, age, interests, upcoming birthday date), suggest gift ideas + optionally reminder suggestions.

Format:

{
  "recipient": "e.g., Best Friend (turning 25)",
  "occasion": "Birthday",
  "gift_recommendations": [
    {
      "gift": "Gift Name",
      "description": "Why it's a good fit",
      "estimated_price": "Price range",
      ${includeLinks ? '"link": "Sample direct buy link",' : ""}
    },
    ...
  ],
  "reminder_message": "Reminder to buy/make arrangements 1 week before the birthday!",
  "pro_tips": "Bonus tip to personalize the gift or event"
}

Provide clean JSON only.

USER QUERY: "${input}"
      `;

      const res = await model.generateContent(prompt);
      const responseText = res.response?.text();

      if (!responseText) {
        throw new Error("No ideas fetched. Try again!");
      }

      let jsonResponse;
      try {
        const jsonMatch = responseText.match(/(\{[\s\S]*\})/);
        if (jsonMatch) {
          jsonResponse = JSON.parse(jsonMatch[1]);
        } else {
          throw new Error("Unexpected AI response format.");
        }
      } catch (e) {
        console.error("JSON parsing failed:", e);
        throw new Error("Unexpected AI output.");
      }

      setResponse(jsonResponse);
      toast.success("Gift ideas and reminder generated! 🎂");
    } catch (error) {
      console.error(error.message);
      setResponse({ error: "Something went wrong. Try again later!" });
      toast.error("Error fetching data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-800 text-white font-sans">
      {/* Navbar */}
      <nav className="w-full py-6 px-8 flex justify-between items-center sticky top-0 z-50 backdrop-blur-md bg-black/60 shadow-lg">
        <div className="text-2xl font-bold text-yellow-400">🎉 Birthday Reminder</div>
        <div className="hidden md:flex space-x-6 text-lg">
          <a href="#home" className="hover:text-yellow-300">Home</a>
          <a href="#about" className="hover:text-yellow-300">About</a>
          <a href="#features" className="hover:text-yellow-300">Features</a>
          <button
            onClick={() => navigate("/chat")}
            className="bg-gradient-to-r from-yellow-400 via-pink-500 to-red-500 px-5 py-2 rounded-full font-bold hover:scale-105 transition"
          >
            Get Ideas
          </button>
        </div>
      </nav>

      {/* Home Section */}
      <section id="home" className="flex flex-col items-center justify-center py-24 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-yellow-400 via-pink-500 to-red-500 bg-clip-text text-transparent animate-pulse">
          {text}
        </h1>
        <p className="mt-6 max-w-xl text-gray-300">
          Personalized reminders and thoughtful birthday gift ideas 🎁✨
        </p>
        <div className="flex mt-8 space-x-4">
          <input
            type="text"
            className="w-64 md:w-96 p-3 rounded-full bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            placeholder="E.g., Gift ideas for sister turning 18"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            onClick={handleSubmit}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-yellow-400 text-black font-bold hover:scale-105 transition"
          >
            Suggest
          </button>
        </div>
      </section>

      {/* Response Section */}
      <section id="response" className="w-full max-w-4xl p-6 text-center">
        {loading ? (
          <p className="text-lg animate-pulse">Generating suggestions... 🎁</p>
        ) : response ? (
          response.error ? (
            <p className="text-red-400 text-lg">{response.error}</p>
          ) : (
            <div className="bg-gray-800 p-6 rounded-2xl shadow-lg mt-8">
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">
                Birthday for {response.recipient}
              </h2>
              <ul className="space-y-4 text-left">
                {response.gift_recommendations.map((gift, idx) => (
                  <li key={idx} className="border-b border-gray-600 pb-2">
                    <h3 className="text-lg font-semibold">{gift.gift}</h3>
                    <p className="text-gray-300">{gift.description}</p>
                    <p className="text-sm text-gray-400">Price: {gift.estimated_price}</p>
                    {gift.link && (
                      <a href={gift.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline hover:text-blue-600">
                        Buy Now
                      </a>
                    )}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-green-400"><strong>Reminder:</strong> {response.reminder_message}</p>
              <p className="mt-2 text-pink-400"><strong>Pro Tip:</strong> {response.pro_tips}</p>
            </div>
          )
        ) : null}
      </section>

      {/* About Section */}
      <section id="about" className="py-16 w-full max-w-5xl text-center px-6">
        <h2 className="text-4xl font-bold text-yellow-400 mb-6">About</h2>
        <p className="text-gray-300 leading-relaxed">
          Never miss another birthday! 🎈 Our AI not only reminds you ahead of time but also suggests thoughtful, personalized gift ideas for every special person in your life.
        </p>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 w-full bg-gray-900 rounded-3xl mt-10 px-6">
        <h2 className="text-4xl font-bold text-center text-yellow-400 mb-10">Features</h2>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="p-6 bg-gray-800 rounded-2xl hover:scale-105 transition shadow-lg">
            <FaGift className="text-5xl mx-auto text-yellow-400 mb-4" />
            <h3 className="text-2xl font-semibold mb-2">Perfect Gifts</h3>
            <p className="text-gray-400">Get gift ideas matched to age, interests, and relationships.</p>
          </div>
          <div className="p-6 bg-gray-800 rounded-2xl hover:scale-105 transition shadow-lg">
            <FaBirthdayCake className="text-5xl mx-auto text-pink-500 mb-4" />
            <h3 className="text-2xl font-semibold mb-2">Smart Reminders</h3>
            <p className="text-gray-400">Plan birthday celebrations on time, no last-minute rushes!</p>
          </div>
          <div className="p-6 bg-gray-800 rounded-2xl hover:scale-105 transition shadow-lg">
            <FaSmile className="text-5xl mx-auto text-yellow-400 mb-4" />
            <h3 className="text-2xl font-semibold mb-2">Spread Happiness</h3>
            <p className="text-gray-400">Make every birthday memorable with thoughtful gifts and timely wishes. 🎉</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
