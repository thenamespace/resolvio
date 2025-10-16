import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Shield, Globe, Code2, Layers, TrendingUp } from "lucide-react";
import { API_CONFIG } from "@/config/api";

const features = [
  {
    icon: <Zap className="w-8 h-8" />,
    title: "Lightning Fast",
    description: "Sub-100ms response times with intelligent caching and optimized resolution paths.",
    color: "from-yellow-400 to-orange-500",
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: "Rock Solid",
    description: "99.9% uptime guarantee with automatic failover and redundant infrastructure.",
    color: "from-green-400 to-emerald-500",
  },
  {
    icon: <Globe className="w-8 h-8" />,
    title: "Multi-Chain",
    description: "Support for ENS, DNS, and other naming systems across multiple blockchain networks.",
    color: "from-blue-400 to-cyan-500",
  },
  {
    icon: <Code2 className="w-8 h-8" />,
    title: "Developer First",
    description: "RESTful API with comprehensive documentation, SDKs, and code examples.",
    color: "from-purple-400 to-pink-500",
  },
  {
    icon: <Layers className="w-8 h-8" />,
    title: "Flexible Queries",
    description: "Fetch exactly what you need - addresses, text records, content hashes, or everything.",
    color: "from-indigo-400 to-purple-500",
  },
  {
    icon: <TrendingUp className="w-8 h-8" />,
    title: "Always Growing",
    description: "Continuously adding support for new naming systems and blockchain protocols.",
    color: "from-rose-400 to-red-500",
  },
];

const FeaturesSection = () => {
  return (
    <div className="py-20 bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-white">
            Why Resolvio?
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            The most powerful and developer-friendly Web3 name resolution service
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="group h-full border border-orange-500/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gray-800/60 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div
                    className="w-16 h-16 rounded-2xl bg-white border-2 border-orange-500 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300"
                  >
                    <div className="text-orange-500">
                      {feature.icon}
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-orange-400 transition-colors duration-300">
                    {feature.title}
                  </h3>

                  <p className="text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <div className="bg-gray-800 rounded-lg p-12 shadow-xl border-2 border-orange-500">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to get started?
            </h3>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join developers building the future of Web3 with Resolvio
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  document.getElementById("playground")?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
                className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Try it
              </button>
              <button
                onClick={() => window.open(`${API_CONFIG.baseUrl}/api/docs`, "_blank")}
                className="px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Read the Docs
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FeaturesSection;
