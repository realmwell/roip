export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-navy dark:text-teal mb-4">
        ROIP
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 text-center max-w-2xl">
        RAG Operations Intelligence Platform — Enterprise RAG troubleshooting
        demo
      </p>
      <div className="flex gap-4">
        <a
          href="/chat"
          className="px-6 py-3 bg-teal text-white rounded-lg hover:bg-blue transition-colors font-medium"
        >
          Open Chatbot
        </a>
        <a
          href="/corpus"
          className="px-6 py-3 bg-navy text-white rounded-lg hover:bg-navy-light transition-colors font-medium"
        >
          Browse Corpus
        </a>
        <a
          href="/eval"
          className="px-6 py-3 border border-teal text-teal rounded-lg hover:bg-teal hover:text-white transition-colors font-medium"
        >
          Run Evaluation
        </a>
      </div>
    </main>
  );
}
