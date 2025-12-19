import {
  Link2,
  Palette,
  BarChart3,
  Globe,
  Zap,
  Check,
  TrendingUp,
  Users,
  MousePointerClick,
} from "lucide-react";
import { useState } from "react";

export default function LandingPage() {
  const [username, setUsername] = useState("");

  const handleGetStarted = (e) => {
    e.preventDefault();
    if (username.trim()) {
      window.location.href = `/account/signup`;
    }
  };

  const features = [
    {
      icon: Link2,
      title: "All your links in one place",
      description:
        "Consolidate all your social media, content, and products into a single, shareable link",
    },
    {
      icon: BarChart3,
      title: "Powerful analytics",
      description:
        "Track clicks, views, and engagement to understand your audience better",
    },
    {
      icon: Palette,
      title: "Fully customizable",
      description:
        "Match your brand with custom colors, fonts, and themes that stand out",
    },
    {
      icon: Globe,
      title: "Custom domains",
      description: "Use your own domain for a professional, branded experience",
    },
  ];

  const stats = [
    { number: "10K+", label: "Active Users" },
    { number: "1M+", label: "Links Shared" },
    { number: "5M+", label: "Total Clicks" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A]">
      {/* Navigation */}
      <nav className="bg-white dark:bg-[#0A0A0A] border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Link2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                BioLink
              </span>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/account/signin"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Log in
              </a>
              <a
                href="/account/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-all"
              >
                Sign up free
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-[#0F1419] dark:via-[#1a1055] dark:to-[#2d1b3d]">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              One link for all your
              <span className="block mt-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                content & socials
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto">
              Share everything you create and sell online. All with one simple
              link.
            </p>

            {/* Input Section */}
            <form
              onSubmit={handleGetStarted}
              className="max-w-2xl mx-auto mb-8"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-3 flex flex-col md:flex-row gap-3">
                <div className="flex-1 flex items-center px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <span className="text-gray-500 dark:text-gray-400 text-sm mr-2">
                    biolink.com/
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="yourname"
                    className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                  Claim your link
                </button>
              </div>
            </form>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              🎉 Free forever. No credit card required.
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-[#0A0A0A] border-y border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-[#0F0F0F]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Everything you need to grow your audience
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Powerful features to help you connect with your followers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to grow your audience?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Join thousands of creators, brands, and influencers using BioLink
          </p>
          <a
            href="/account/signup"
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-all shadow-xl"
          >
            Get started for free
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white dark:bg-[#0A0A0A] border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Link2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                BioLink
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              © 2024 BioLink. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
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
}
