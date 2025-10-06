
import React from 'react';
import type { JobDescription } from '../types';
// FIX: Removed unused and non-existent icons from import.
import { BriefcaseIcon } from './Icons';

interface JobDescriptionFormProps {
  jobDescription: JobDescription;
  setJobDescription: React.Dispatch<React.SetStateAction<JobDescription>>;
}

const Section: React.FC<{ title: string, icon: React.ReactNode, children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-gray-800/50 p-6 rounded-xl shadow-md border border-gray-700">
        <div className="flex items-center mb-4">
            <span className="text-green-400 mr-3">{icon}</span>
            <h3 className="text-xl font-semibold text-white">{title}</h3>
        </div>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

// FIX: Added 'name' to props to allow passing it to the input element.
const InputField: React.FC<{ label: string, value: string | number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string, placeholder?: string, name: string }> = ({ label, value, onChange, type = 'text', placeholder, name }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
        />
    </div>
);


export const JobDescriptionForm: React.FC<JobDescriptionFormProps> = ({ jobDescription, setJobDescription }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setJobDescription(prev => ({ ...prev, [name]: name === 'experience' ? parseInt(value) || 0 : value }));
  };

  return (
    <Section title="Step 1: Provide Job Details" icon={<BriefcaseIcon />}>
        <InputField
            label="Job Title"
            name="title"
            value={jobDescription.title}
            onChange={handleChange}
            placeholder="e.g., Senior Frontend Developer"
        />
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Job Description</label>
            <textarea
                name="description"
                value={jobDescription.description}
                onChange={handleChange}
                rows={8}
                placeholder="Paste the full job description here..."
                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
            />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <InputField
                label="Required Skills (comma-separated)"
                name="requiredSkills"
                value={jobDescription.requiredSkills}
                onChange={handleChange}
                placeholder="e.g., React, TypeScript, Node.js"
            />
             <InputField
                label="Desirable Skills (comma-separated)"
                name="desirableSkills"
                value={jobDescription.desirableSkills}
                onChange={handleChange}
                placeholder="e.g., GraphQL, Docker, AWS"
            />
        </div>
         <InputField
            label="Minimum Years of Experience"
            name="experience"
            type="number"
            value={jobDescription.experience}
            onChange={handleChange}
        />
    </Section>
  );
};