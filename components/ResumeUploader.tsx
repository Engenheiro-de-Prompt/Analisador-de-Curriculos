
import React, { useCallback, useState } from 'react';
import { UploadIcon, DocumentIcon, XCircleIcon } from './Icons';

interface ResumeUploaderProps {
  resumes: File[];
  setResumes: React.Dispatch<React.SetStateAction<File[]>>;
}

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({ resumes, setResumes }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files).slice(0, 10 - resumes.length);
      setResumes(prev => [...prev, ...newFiles]);
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  }, [resumes.length]);

  const removeFile = (index: number) => {
    setResumes(prev => prev.filter((_, i) => i !== index));
  };
  
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }


  return (
    <div className="bg-gray-800/50 p-6 rounded-xl shadow-md border border-gray-700">
      <div className="flex items-center mb-4">
        <span className="text-green-400 mr-3"><UploadIcon /></span>
        <h3 className="text-xl font-semibold text-white">Step 2: Upload Resumes (up to 10)</h3>
      </div>
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`border-2 border-dashed ${isDragging ? 'border-green-400 bg-gray-700/50' : 'border-gray-600'} rounded-lg p-8 text-center cursor-pointer transition-all duration-300`}
      >
        <input
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt"
          onChange={(e) => handleFileChange(e.target.files)}
          className="hidden"
          id="resume-upload"
          disabled={resumes.length >= 10}
        />
        <label htmlFor="resume-upload" className="flex flex-col items-center justify-center space-y-2 cursor-pointer">
          <div className="w-12 h-12 text-gray-400">
            <UploadIcon />
          </div>
          <p className="text-gray-300">
            <span className="font-semibold text-green-400">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500">PDF, DOCX, or TXT (Max 10 files)</p>
        </label>
      </div>
      {resumes.length > 0 && (
        <div className="mt-4 space-y-2">
            <h4 className="font-semibold text-gray-300">Selected Files:</h4>
            <ul className="space-y-2">
                {resumes.map((file, index) => (
                    <li key={index} className="flex items-center justify-between bg-gray-700 p-2 rounded-md">
                        <div className="flex items-center space-x-2 overflow-hidden">
                            <span className="text-gray-400"><DocumentIcon /></span>
                            <span className="text-sm text-gray-200 truncate">{file.name}</span>
                            <span className="text-xs text-gray-400 flex-shrink-0">({formatBytes(file.size)})</span>
                        </div>
                        <button onClick={() => removeFile(index)} className="text-gray-400 hover:text-red-400 transition-colors duration-200">
                           <XCircleIcon />
                        </button>
                    </li>
                ))}
            </ul>
        </div>
      )}
    </div>
  );
};