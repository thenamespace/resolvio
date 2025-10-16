import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, XCircle, Code } from "lucide-react";
import { useResolvio } from "@/hooks/useResolvio";

const PlaygroundSection = () => {
  const [ensName, setEnsName] = useState("");
  const [includeAddresses, setIncludeAddresses] = useState(true);
  const [includeTexts, setIncludeTexts] = useState(true);
  const [includeContenthash, setIncludeContenthash] = useState(false);
  
  const { data: result, error, loading, resolve } = useResolvio();

  const handleResolve = async () => {
    await resolve(ensName, {
      includeAddresses,
      includeTexts,
      includeContenthash,
    });
  };

  return (
    <div id="playground" className="py-20 bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-white">
            Try It Now
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Test ENS resolution with real-time results. Enter any .eth name and see the magic happen.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Card className="shadow-xl border-0 bg-white">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Resolution Request
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* ENS Name Input */}
                <div className="space-y-2">
                  <Label htmlFor="ens-name" className="text-base font-semibold text-gray-700">
                    ENS Name
                  </Label>
                  <Input
                    id="ens-name"
                    type="text"
                    placeholder="vitalik.eth"
                    value={ensName}
                    onChange={(e) => setEnsName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleResolve()}
                    className="text-lg h-12 border-2 focus:border-orange-500 transition-colors"
                  />
                </div>

                {/* Options */}
                <div className="space-y-3 pt-2">
                  <Label className="text-base font-semibold text-gray-700">
                    Include in Response
                  </Label>

                  <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-white/50 transition-colors">
                    <Checkbox
                      id="addresses"
                      checked={includeAddresses}
                      onCheckedChange={(checked) => setIncludeAddresses(checked as boolean)}
                    />
                    <label
                      htmlFor="addresses"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Addresses (ETH, BTC, etc.)
                    </label>
                  </div>

                  <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-white/50 transition-colors">
                    <Checkbox
                      id="texts"
                      checked={includeTexts}
                      onCheckedChange={(checked) => setIncludeTexts(checked as boolean)}
                    />
                    <label
                      htmlFor="texts"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Text Records (email, url, avatar, etc.)
                    </label>
                  </div>

                  <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-white/50 transition-colors">
                    <Checkbox
                      id="contenthash"
                      checked={includeContenthash}
                      onCheckedChange={(checked) => setIncludeContenthash(checked as boolean)}
                    />
                    <label
                      htmlFor="contenthash"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Content Hash (IPFS, Swarm)
                    </label>
                  </div>
                </div>

                {/* Resolve Button */}
                <Button
                  onClick={handleResolve}
                  disabled={loading || !ensName.trim()}
                  className="w-full h-12 text-lg font-semibold bg-orange-500 hover:bg-orange-600 transition-all duration-200"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Resolving...
                    </>
                  ) : (
                    "Resolve ENS"
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Result Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-purple-50 h-full">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Code className="w-6 h-6" />
                  Response
                </CardTitle>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
                  </Alert>
                )}

                {result && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert className="mb-4 border-green-200 bg-green-50">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        Successfully resolved {result.name}
                      </AlertDescription>
                    </Alert>

                    <div className="bg-gray-900 rounded-lg p-6 overflow-auto max-h-[500px]">
                      <pre className="text-sm text-green-400 font-mono">
                        {JSON.stringify(result, null, 2)}
                      </pre>
                    </div>
                  </motion.div>
                )}

                {!result && !error && !loading && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="text-6xl mb-4">🔍</div>
                    <p className="text-gray-500 text-lg">
                      Enter an ENS name and click Resolve to see results
                    </p>
                  </div>
                )}

                {loading && (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="w-12 h-12 animate-spin text-orange-600 mb-4" />
                    <p className="text-gray-600">Resolving ENS name...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Popular Examples */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-gray-600 mb-3 font-medium">Try these examples:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {["vitalik.eth", "nick.eth", "brantly.eth", "ens.eth"].map((example) => (
              <Button
                key={example}
                variant="outline"
                size="sm"
                onClick={() => setEnsName(example)}
                className="rounded-full hover:bg-orange-50 hover:border-orange-300 transition-colors"
              >
                {example}
              </Button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PlaygroundSection;
