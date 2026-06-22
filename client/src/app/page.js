import Link from "next/link";
import { FiMap, FiArrowRight } from "react-icons/fi";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-col items-center justify-center w-full max-w-4xl px-6 py-20 text-center">
        {/* Brand Icon / Logo Area */}
        <div className="mb-8 p-5 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-indigo-600 dark:text-indigo-400 shadow-sm animate-in zoom-in duration-500">
          <FiMap size={48} />
        </div>

        {/* Headline */}
        <div className="flex flex-col items-center gap-6 mb-10">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
            Plan Your Dream Trip <br className="hidden md:block" />
            <span className="text-indigo-600 dark:text-indigo-400">
              in Seconds with AI
            </span>
          </h1>
          <p className="max-w-2xl text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
            Instantly generate personalized itineraries, track your travel
            expenses, and keep all your packing lists organized in one smart
            dashboard.
          </p>
        </div>

        {/* Calls to Action */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4">
          <Link
            href="/dashboard"
            className="flex h-14 items-center justify-center gap-2 rounded-full bg-indigo-600 px-8 text-base font-bold text-white transition-all hover:bg-indigo-700 hover:scale-105 shadow-lg hover:shadow-indigo-600/20 sm:min-w-[200px]"
          >
            Go to Dashboard
            <FiArrowRight className="text-xl" />
          </Link>

          {/* <Link
            href="/about" // Optional secondary link (can be changed to anything)
            className="flex h-14 items-center justify-center rounded-full border border-gray-300 dark:border-gray-700 px-8 text-base font-bold text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 sm:min-w-[200px]"
          >
            Learn More
          </Link> */}
        </div>
      </main>
    </div>
  );
}
