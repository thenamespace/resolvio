import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Code, Terminal, Rocket } from "lucide-react";
import { API_CONFIG } from "@/config/api";

const API_URL = API_CONFIG.baseUrl;

const codeExamples = [
  {
    title: "Basic Resolution",
    language: "bash",
    code: `curl ${API_URL}/api/v1/resolve/ens/name/vitalik.eth/profile`,
  },
  {
    title: "With Specific Records",
    language: "bash",
    code: `curl "${API_URL}/api/v1/resolve/ens/name/vitalik.eth/profile?addresses=true&texts=true"`,
  },
  {
    title: "JavaScript / TypeScript",
    language: "javascript",
    code: `const response = await fetch(
  '${API_URL}/api/v1/resolve/ens/name/vitalik.eth/profile'
);
const profile = await response.json();
console.log(profile);`,
  },
  {
    title: "Python",
    language: "python",
    code: `import requests

response = requests.get(
  '${API_URL}/api/v1/resolve/ens/name/vitalik.eth/profile'
)
profile = response.json()
print(profile)`,
  },
];

const DevDocsSection = () => {
  return (
    <div className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Developer Documentation
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get started in minutes with our simple and powerful API
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Quick Start */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="h-full shadow-xl border-0 bg-gradient-to-br from-white to-indigo-50">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                    <Rocket className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Quick Start</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        No API Key Required
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Start using the API immediately without authentication
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        Make Your First Request
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Use any HTTP client to resolve ENS names
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        Integrate & Build
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Parse the JSON response and build amazing apps
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-white rounded-xl border-2 border-indigo-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Terminal className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-mono text-gray-500">Terminal</span>
                  </div>
                  <pre className="text-sm font-mono text-gray-800 overflow-x-auto">
                    <code>curl {API_URL}/api/v1/resolve/ens/name/vitalik.eth/profile</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* API Reference */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="h-full shadow-xl border-0 bg-gradient-to-br from-white to-purple-50">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">API Endpoints</h3>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-start gap-3">
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">
                        GET
                      </span>
                      <div className="flex-1 min-w-0">
                        <code className="text-sm font-mono text-gray-800 break-all">
                          /api/v1/resolve/ens/name/:name/profile
                        </code>
                        <p className="text-xs text-gray-600 mt-1">
                          Get complete ENS profile
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-start gap-3">
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">
                        GET
                      </span>
                      <div className="flex-1 min-w-0">
                        <code className="text-sm font-mono text-gray-800 break-all">
                          /api/v1/resolve/ens/name/:name/addresses
                        </code>
                        <p className="text-xs text-gray-600 mt-1">
                          Get cryptocurrency addresses
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-start gap-3">
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">
                        GET
                      </span>
                      <div className="flex-1 min-w-0">
                        <code className="text-sm font-mono text-gray-800 break-all">
                          /api/v1/resolve/ens/name/:name/texts
                        </code>
                        <p className="text-xs text-gray-600 mt-1">
                          Get text records
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => window.open(`${API_URL}/api/docs`, "_blank")}
                  className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105"
                >
                  View Full API Documentation
                </button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Code Examples */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
              <Code className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900">Code Examples</h3>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {codeExamples.map((example, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-0 shadow-lg rounded-xl overflow-hidden bg-white"
              >
                <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 text-left font-semibold text-lg">
                  {example.title}
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="bg-gray-900 rounded-lg p-6 overflow-x-auto">
                    <pre className="text-sm text-gray-100 font-mono">
                      <code>{example.code}</code>
                    </pre>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </div>
  );
};

export default DevDocsSection;
