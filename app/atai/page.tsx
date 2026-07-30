import Link from "next/link";
import Image from "next/image";

export default function ATAIPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-gray-800 sticky top-0 bg-background/80 backdrop-blur-lg z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center border border-primary/30">
              <span className="text-primary font-bold text-xl">V</span>
            </div>
            <span className="text-xl font-bold">
              VETTCODE <span className="text-primary">CLI</span>
            </span>
          </Link>
          <Link
            href="/"
            className="text-gray-400 hover:text-primary transition text-sm"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 py-20">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-sm font-medium text-primary">
              Advanced Technologies and AI
            </span>
          </div>

          {/* Logo - Place your logo at: public/atai-logo.png */}
          <div className="mb-8 flex justify-center">
            <div className="relative w-32 h-32 md:w-40 md:h-40">
              {/* Placeholder - Replace with actual logo */}
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-2xl border-2 border-primary/30 flex items-center justify-center backdrop-blur-sm">
                <span className="text-6xl md:text-7xl font-bold text-transparent bg-gradient-to-r from-primary via-purple-400 to-blue-400 bg-clip-text">
                  A
                </span>
              </div>
              {/* Uncomment when you add logo to public/atai-logo.png */}
              {/* <Image
                src="/atai-logo.png"
                alt="ATAI Enterprises Logo"
                fill
                className="object-contain"
                priority
              /> */}
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-primary to-purple-400 bg-clip-text text-transparent">
            ATAI Enterprises
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Shaping the Future of Intelligence
          </p>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            A technology-driven organization dedicated to designing, building, and scaling intelligent systems that solve real-world problems.
          </p>
        </div>
      </section>

      {/* About Section */}
      <section className="px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-2xl border border-primary/20 p-8 md:p-12 backdrop-blur-sm">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 flex items-center gap-3">
              <div className="w-1 h-10 bg-primary rounded-full" />
              About ATAI Enterprises
            </h2>
            
            <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
              <p>
                <span className="font-semibold text-white">ATAI Enterprises</span> (Advanced Technologies and AI) is a technology-driven organization dedicated to designing, building, and scaling intelligent systems that solve real-world problems. As a parent brand, ATAI serves as the foundation for a growing ecosystem of innovative products, tools, and platforms focused on software development, artificial intelligence, and digital transformation.
              </p>
              
              <p>
                At its core, ATAI Enterprises exists to push the boundaries of what modern technology can achieve. We are driven by a vision to create systems that are not only functional, but <span className="text-white font-semibold">deeply intelligent</span>—capable of understanding context, improving performance, and supporting decision-making at every level. Our work combines advanced engineering, AI-driven insights, and practical usability to deliver solutions that are both powerful and accessible.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* VettCode Ecosystem Highlight */}
      <section className="px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-purple-500/10 to-blue-500/10 p-8 md:p-12">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 mb-6">
                <span className="text-xs font-semibold text-primary">FLAGSHIP ECOSYSTEM</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                VettCode: Our Premier Platform
              </h2>
              
              <div className="space-y-5 text-gray-300 text-lg leading-relaxed">
                <p>
                  One of the flagship ecosystems under ATAI Enterprises is <span className="text-primary font-semibold">VettCode</span>—a next-generation code analysis and developer intelligence platform. VettCode reflects our commitment to improving how software is built, tested, and deployed by identifying hidden vulnerabilities, performance bottlenecks, and production risks that traditional tools often miss.
                </p>
                
                <p>
                  Through this ecosystem, ATAI Enterprises is actively contributing to a future where developers ship more reliable, secure, and scalable software with confidence.
                </p>
              </div>

              <Link
                href="/"
                className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-primary hover:bg-primary/90 rounded-lg font-semibold transition group"
              >
                Explore VettCode CLI
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Beyond VettCode */}
      <section className="px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
            Beyond VettCode
          </h2>
          
          <div className="bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-2xl border border-purple-500/20 p-8 md:p-12">
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              Beyond VettCode, ATAI Enterprises is continuously exploring new frontiers in artificial intelligence, automation, and enterprise-grade systems. Our approach is rooted in building technology that aligns with real user needs—whether it's empowering developers, supporting institutions, or enabling businesses to operate more efficiently in a rapidly evolving digital landscape.
            </p>
            
            <p className="text-gray-300 text-lg leading-relaxed">
              We believe that the future belongs to <span className="text-white font-semibold">intelligent systems</span>—technology that not only executes tasks, but enhances human capability. This belief drives everything we create, from early-stage innovations to fully realized platforms.
            </p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            What Drives Us
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Innovation */}
            <div className="bg-gradient-to-br from-primary/10 to-transparent rounded-xl border border-primary/20 p-8 hover:border-primary/40 transition-all hover:scale-105 group">
              <div className="w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <svg
                  className="w-7 h-7 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Innovation</h3>
              <p className="text-gray-400 leading-relaxed">
                Pushing boundaries and creating systems that are deeply intelligent, context-aware, and adaptive to real-world needs.
              </p>
            </div>

            {/* Reliability */}
            <div className="bg-gradient-to-br from-purple-500/10 to-transparent rounded-xl border border-purple-500/20 p-8 hover:border-purple-500/40 transition-all hover:scale-105 group">
              <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <svg
                  className="w-7 h-7 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Reliability</h3>
              <p className="text-gray-400 leading-relaxed">
                Building unified brands and products that stand for quality, dependability, and purposeful technology engineered for impact.
              </p>
            </div>

            {/* Forward-Thinking */}
            <div className="bg-gradient-to-br from-blue-500/10 to-transparent rounded-xl border border-blue-500/20 p-8 hover:border-blue-500/40 transition-all hover:scale-105 group">
              <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <svg
                  className="w-7 h-7 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Forward-Thinking</h3>
              <p className="text-gray-400 leading-relaxed">
                Exploring new frontiers in AI, automation, and enterprise systems to shape the future of intelligent technology.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Commitment */}
      <section className="px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-primary/5 to-blue-500/5 rounded-2xl border border-primary/20 p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Our Commitment
            </h2>
            
            <p className="text-gray-300 text-lg leading-relaxed">
              As we grow, ATAI Enterprises remains committed to building a strong, unified brand that stands for innovation, reliability, and forward-thinking design. Every product under ATAI reflects a shared standard: <span className="text-white font-semibold">purposeful technology, engineered for impact</span>.
            </p>
          </div>
        </div>
      </section>

      {/* Tagline */}
      <section className="px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/20 to-blue-500/20 blur-3xl" />
            <div className="relative bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-2xl border border-primary/30 p-12">
              <blockquote className="text-2xl md:text-3xl font-bold text-transparent bg-gradient-to-r from-primary via-purple-400 to-blue-400 bg-clip-text">
                "ATAI Enterprises — Shaping the Future of Intelligence"
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* Back to Home CTA */}
      <section className="px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary/90 rounded-lg font-semibold transition group"
          >
            <svg
              className="w-5 h-5 group-hover:-translate-x-1 transition"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to VettCode CLI
          </Link>
        </div>
      </section>
    </div>
  );
}
