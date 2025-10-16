import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles, Zap } from "lucide-react";
import { API_CONFIG } from "@/config/api";

const HeroSection = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-5xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/80 backdrop-blur-sm rounded-full shadow-lg border border-orange-500/30 mb-8"
          >
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-semibold text-gray-200">
              Universal Web3 Name Resolution
            </span>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 text-white leading-tight tracking-tight"
          >
            Resolvio
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl sm:text-2xl md:text-3xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed font-medium"
          >
            Resolve any Web3 name instantly.
            <br className="hidden sm:block" />
            One API for ENS, DNS, and beyond.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="lg"
              className="group bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={() => {
                document.getElementById("playground")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
            >
              <Zap className="w-5 h-5 mr-2" />
              Try Playground
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="px-8 py-6 text-lg font-semibold rounded-lg border-2 border-orange-500 hover:bg-orange-500 hover:text-white text-orange-500 transition-all duration-200"
              onClick={() => {
                window.open(`${API_CONFIG.baseUrl}/api/docs`, "_blank");
              }}
            >
              View API Docs
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto"
          >
            {[
              { label: "Response Time", value: "<100ms", icon: "⚡" },
              { label: "Uptime", value: "99.9%", icon: "✨" },
              { label: "Networks", value: "Multi-chain", icon: "🌐" },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-orange-500/20"
              >
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-3xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="animate-bounce">
          <svg
            className="w-6 h-6 text-gray-400"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </motion.div>

      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default HeroSection;
