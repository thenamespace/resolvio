import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Code,
  ArrowRight,
  ArrowLeftRight,
  Plus,
  Trash2,
} from "lucide-react";
import { useResolvio } from "@/hooks/useResolvio";
import { useReverseResolvio } from "@/hooks/useReverseResolvio";
import { createPublicClient, http } from "viem";
import { normalize } from "viem/ens";
import { mainnet } from "viem/chains";

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

interface AddressInput {
  value: string;
  resolvedAddress?: string;
  isResolving: boolean;
  error?: string;
}

const isEnsName = (value: string): boolean => {
  const trimmed = value.trim().toLowerCase();
  return /^[a-z0-9-]+\.[a-z]{2,}$/.test(trimmed) || trimmed.includes(".eth");
};

const isAddress = (value: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(value.trim());
};

const PlaygroundSection = () => {
  const [ensName, setEnsName] = useState("");
  const [includeAddresses, setIncludeAddresses] = useState(true);
  const [includeTexts, setIncludeTexts] = useState(true);
  const [includeContenthash, setIncludeContenthash] = useState(false);

  const [addressInputs, setAddressInputs] = useState<AddressInput[]>([
    { value: "", isResolving: false },
  ]);

  const debounceTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(
    new Map()
  );

  const { data: result, error, loading, resolve } = useResolvio();
  const {
    data: reverseResult,
    error: reverseError,
    loading: reverseLoading,
    resolve: reverseResolve,
  } = useReverseResolvio();

  const resolveEnsToAddress = useCallback(
    async (ensName: string): Promise<string | null> => {
      try {
        const address = await publicClient.getEnsAddress({
          name: normalize(ensName),
        });
        return address;
      } catch {
        return null;
      }
    },
    []
  );

  const updateAddressInput = useCallback(
    (index: number, value: string) => {
      setAddressInputs((prev) => {
        const newInputs = [...prev];
        newInputs[index] = {
          ...newInputs[index],
          value,
          resolvedAddress: undefined,
          error: undefined,
        };
        return newInputs;
      });

      // Clear existing debounce timer for this index
      const existingTimer = debounceTimers.current.get(index);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // Check if it looks like an ENS name and debounce the resolution
      if (isEnsName(value) && !isAddress(value)) {
        setAddressInputs((prev) => {
          const newInputs = [...prev];
          newInputs[index] = { ...newInputs[index], isResolving: true };
          return newInputs;
        });

        const timer = setTimeout(async () => {
          const address = await resolveEnsToAddress(value);

          setAddressInputs((prev) => {
            const newInputs = [...prev];
            if (newInputs[index]?.value === value) {
              newInputs[index] = {
                ...newInputs[index],
                isResolving: false,
                resolvedAddress: address || undefined,
                error: address ? undefined : "Could not resolve ENS name",
              };
            }
            return newInputs;
          });

          debounceTimers.current.delete(index);
        }, 500);

        debounceTimers.current.set(index, timer);
      }
    },
    [resolveEnsToAddress]
  );

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      debounceTimers.current.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const handleResolve = async () => {
    await resolve(ensName, {
      includeAddresses,
      includeTexts,
      includeContenthash,
    });
  };

  const handleReverseResolve = async () => {
    // Use resolved addresses where available, otherwise use the raw value
    const addressesToResolve = addressInputs
      .map((input) => input.resolvedAddress || input.value)
      .filter((addr) => addr.trim() && isAddress(addr));

    if (addressesToResolve.length === 0) {
      return;
    }

    await reverseResolve(addressesToResolve);
  };

  const addAddressField = () => {
    setAddressInputs([...addressInputs, { value: "", isResolving: false }]);
  };

  const removeAddressField = (index: number) => {
    if (addressInputs.length > 1) {
      // Clear any pending timer
      const timer = debounceTimers.current.get(index);
      if (timer) {
        clearTimeout(timer);
        debounceTimers.current.delete(index);
      }
      setAddressInputs(addressInputs.filter((_, i) => i !== index));
    }
  };

  const hasValidAddresses = addressInputs.some((input) => {
    const addr = input.resolvedAddress || input.value;
    return addr.trim() && isAddress(addr);
  });

  const addExample = (value: string) => {
    // Find the first empty input or add a new one
    const emptyIndex = addressInputs.findIndex((input) => !input.value.trim());

    if (emptyIndex !== -1) {
      // Use the empty slot
      updateAddressInput(emptyIndex, value);
    } else {
      // Add a new input with the value
      const newIndex = addressInputs.length;
      setAddressInputs((prev) => [
        ...prev,
        { value, isResolving: false },
      ]);
      // Trigger resolution after state update
      setTimeout(() => updateAddressInput(newIndex, value), 0);
    }
  };

  return (
    <div id="playground" className="py-20 bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Forward Resolution Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-white flex items-center justify-center gap-4">
            <ArrowRight className="w-10 h-10 sm:w-12 sm:h-12 text-orange-500" />
            Forward Resolution
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Resolve ENS names to addresses and records. Enter any .eth name and
            see the results.
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
                  <Label
                    htmlFor="ens-name"
                    className="text-base font-semibold text-gray-700"
                  >
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
                      onCheckedChange={(checked) =>
                        setIncludeAddresses(checked as boolean)
                      }
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
                      onCheckedChange={(checked) =>
                        setIncludeTexts(checked as boolean)
                      }
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
                      onCheckedChange={(checked) =>
                        setIncludeContenthash(checked as boolean)
                      }
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
                    <AlertDescription className="whitespace-pre-line">
                      {error}
                    </AlertDescription>
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
          <p className="text-sm text-gray-400 mb-3 font-medium">
            Try these examples:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {["vitalik.eth", "nick.eth", "brantly.eth", "ens.eth"].map(
              (example) => (
                <Button
                  key={example}
                  variant="outline"
                  size="sm"
                  onClick={() => setEnsName(example)}
                  className="rounded-full hover:bg-orange-50 hover:border-orange-300 transition-colors"
                >
                  {example}
                </Button>
              )
            )}
          </div>
        </motion.div>

        {/* Reverse Resolution Section */}
        <motion.div
          className="text-center mt-32 mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-white flex items-center justify-center gap-4">
            <ArrowLeftRight className="w-10 h-10 sm:w-12 sm:h-12 text-purple-500" />
            Reverse Resolution
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Resolve Ethereum addresses back to their primary ENS names. Enter
            one or more addresses or ENS names.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Reverse Input Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Card className="shadow-xl border-0 bg-white">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Addresses to Resolve
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {addressInputs.map((input, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          type="text"
                          placeholder="Enter address or ENS name (e.g., vitalik.eth)"
                          value={input.value}
                          onChange={(e) =>
                            updateAddressInput(index, e.target.value)
                          }
                          className={`text-sm h-12 border-2 transition-colors font-mono pr-10 ${
                            input.error
                              ? "border-red-300 focus:border-red-500"
                              : input.resolvedAddress
                                ? "border-green-300 focus:border-green-500"
                                : "focus:border-purple-500"
                          }`}
                        />
                        {input.isResolving && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
                          </div>
                        )}
                        {input.resolvedAddress && !input.isResolving && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          </div>
                        )}
                      </div>
                      {addressInputs.length > 1 && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeAddressField(index)}
                          className="h-12 w-12 text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {input.resolvedAddress && (
                      <p className="text-xs text-green-600 font-mono pl-1">
                        → {input.resolvedAddress}
                      </p>
                    )}
                    {input.error && !input.isResolving && (
                      <p className="text-xs text-red-500 pl-1">{input.error}</p>
                    )}
                  </div>
                ))}

                <Button
                  variant="outline"
                  onClick={addAddressField}
                  className="w-full h-10 text-purple-600 border-purple-300 hover:bg-purple-50"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Another Address
                </Button>

                <Button
                  onClick={handleReverseResolve}
                  disabled={
                    reverseLoading ||
                    !hasValidAddresses ||
                    addressInputs.some((i) => i.isResolving)
                  }
                  className="w-full h-12 text-lg font-semibold bg-purple-500 hover:bg-purple-600 transition-all duration-200"
                >
                  {reverseLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Resolving...
                    </>
                  ) : (
                    "Reverse Resolve"
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Reverse Result Card */}
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
                {reverseError && (
                  <Alert variant="destructive" className="mb-4">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription className="whitespace-pre-line">
                      {reverseError}
                    </AlertDescription>
                  </Alert>
                )}

                {reverseResult && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert className="mb-4 border-green-200 bg-green-50">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        Successfully resolved {reverseResult.length} address
                        {reverseResult.length !== 1 ? "es" : ""}
                      </AlertDescription>
                    </Alert>

                    <div className="bg-gray-900 rounded-lg p-6 overflow-auto max-h-[500px]">
                      <pre className="text-sm text-green-400 font-mono">
                        {JSON.stringify(reverseResult, null, 2)}
                      </pre>
                    </div>
                  </motion.div>
                )}

                {!reverseResult && !reverseError && !reverseLoading && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="text-6xl mb-4">🔄</div>
                    <p className="text-gray-500 text-lg">
                      Enter addresses and click Reverse Resolve to see results
                    </p>
                  </div>
                )}

                {reverseLoading && (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="w-12 h-12 animate-spin text-purple-600 mb-4" />
                    <p className="text-gray-600">Resolving addresses...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Example Addresses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-gray-400 mb-3 font-medium">
            Try these examples:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {["artii.eth", "thecap.eth", "vitalik.eth", "nick.eth"].map(
              (example) => (
                <Button
                  key={example}
                  variant="outline"
                  size="sm"
                  onClick={() => addExample(example)}
                  className="rounded-full hover:bg-purple-50 hover:border-purple-300 transition-colors"
                >
                  {example}
                </Button>
              )
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PlaygroundSection;
