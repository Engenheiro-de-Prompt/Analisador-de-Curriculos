
import React, { useState, useCallback } from 'react';
import { JobDescriptionForm } from './components/JobDescriptionForm';
import { ResumeUploader } from './components/ResumeUploader';
import { ResultsDashboard } from './components/ResultsDashboard';
import { Loader } from './components/Loader';
import { analyzeResumes } from './services/geminiService';
import type { JobDescription, Candidate, AnalysisError } from './types';
import { BrandIcon, GithubIcon } from './components/Icons';

const App: React.FC = () => {
  const [jobDescription, setJobDescription] = useState<JobDescription>({
    title: '',
    description: '',
    requiredSkills: '',
    desirableSkills: '',
    experience: 0,
  });
  const [resumes, setResumes] = useState<File[]>([]);
  const [analysisResult, setAnalysisResult] = useState<Candidate[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<AnalysisError | null>(null);
  const [progressMessage, setProgressMessage] = useState<string>('');

  const handleAnalyze = useCallback(async () => {
    if (resumes.length === 0 || !jobDescription.description) {
      setError({
        title: "Missing Information",
        message: "Please upload at least one resume and provide a job description before starting the analysis.",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setProgressMessage("Preparing files for analysis...");

    try {
      const result = await analyzeResumes(
        jobDescription,
        resumes,
        (progress: number, message: string) => {
          setProgressMessage(`${message} (${Math.round(progress * 100)}%)`);
        }
      );
      setAnalysisResult(result);
    } catch (err: any) {
       console.error("Analysis Error:", err);
       setError({
         title: "Analysis Failed",
         message: err.message || "An unexpected error occurred while communicating with the AI. Please check your API key and network connection, then try again."
       });
    } finally {
      setIsLoading(false);
      setProgressMessage('');
    }
  }, [resumes, jobDescription]);

  const resetState = () => {
    setJobDescription({
      title: '',
      description: '',
      requiredSkills: '',
      desirableSkills: '',
      experience: 0,
    });
    setResumes([]);
    setAnalysisResult(null);
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col">
      <header className="bg-gray-800/50 backdrop-blur-sm shadow-lg sticky top-0 z-20">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <BrandIcon />
            <h1 className="text-2xl font-bold text-white tracking-tight">AI Resume Screener</h1>
          </div>
          <a
            href="https://github.com/google-gemini-v2/create-gemini-app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors duration-300"
            aria-label="View source on GitHub"
          >
            <GithubIcon />
          </a>
        </nav>
      </header>

      <main className="container mx-auto px-6 py-8 flex-grow">
        {isLoading ? (
          <Loader message={progressMessage} />
        ) : analysisResult ? (
          <ResultsDashboard results={analysisResult} onReset={resetState} />
        ) : (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-white mb-2">Streamline Your Hiring Process</h2>
            <p className="text-center text-gray-400 mb-8">
              Let AI analyze resumes against your job description and provide a ranked list of candidates in seconds.
            </p>

            <div className="space-y-8">
              <JobDescriptionForm jobDescription={jobDescription} setJobDescription={setJobDescription} />
              <ResumeUploader resumes={resumes} setResumes={setResumes} />

              {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative" role="alert">
                  <strong className="font-bold">{error.title}</strong>
                  <span className="block sm:inline ml-2">{error.message}</span>
                </div>
              )}

              <div className="text-center pt-4">
                <button
                  onClick={handleAnalyze}
                  disabled={isLoading || resumes.length === 0 || !jobDescription.description}
                  className="bg-green-600 text-white font-bold py-3 px-12 rounded-lg hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-500/50 shadow-lg"
                >
                  Analyze Resumes
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="text-center py-4 text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} AI Resume Screener. All rights reserved.</p>
          <p className="mt-1">Powered by Google Gemini. This tool is for demonstrative purposes and should not replace human judgment.</p>
      </footer>
    </div>
  );
};

export default App;