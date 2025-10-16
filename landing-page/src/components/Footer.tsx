import { Github, Twitter, Mail, BookOpen } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-orange-500 mb-4">
              Resolvio
            </h3>
            <p className="text-gray-400 mb-4 max-w-md">
              Universal Web3 name resolution service. Resolve ENS, DNS, and other naming systems through a single, powerful API.
            </p>
            <div className="flex gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-orange-600 flex items-center justify-center transition-colors duration-300"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-orange-600 flex items-center justify-center transition-colors duration-300"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="mailto:arti@namespace.ninja"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-orange-600 flex items-center justify-center transition-colors duration-300"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#playground"
                  className="hover:text-orange-400 transition-colors duration-300"
                >
                  Playground
                </a>
              </li>
              <li>
                <a
                  href="/api/docs"
                  target="_blank"
                  className="hover:text-indigo-400 transition-colors duration-300 flex items-center gap-1"
                >
                  API Docs
                  <BookOpen className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-orange-400 transition-colors duration-300"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-orange-400 transition-colors duration-300"
                >
                  Status
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="hover:text-orange-400 transition-colors duration-300"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-orange-400 transition-colors duration-300"
                >
                  Guides
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-orange-400 transition-colors duration-300"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-orange-400 transition-colors duration-300"
                >
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} Resolvio. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-300">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-300">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-300">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
