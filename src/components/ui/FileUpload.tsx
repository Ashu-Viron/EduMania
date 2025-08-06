import React, { useRef } from 'react';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

interface FileUploadProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

export default function FileUpload({ onFileSelect, isLoading, ...props }: FileUploadProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <label htmlFor="file-upload" className="w-3/4  relative cursor-pointer transition-colors hover:bg-gray-100">
      <input
        id="file-upload"
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="sr-only " // sr-only hides the element visually but keeps it accessible
        accept="image/*"
        disabled={isLoading}
        {...props}
      />
      <div className="flex items-center justify-center space-x-2 rounded-full bg-primary-100 py-2  text-sm font-medium text-primary-600 shadow-sm transition-colors hover:bg-primary-200">
        <PhotoIcon className="h-4 w-4" />
        <span >{t('profile.uploadPhoto')}</span>
      </div>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
        </div>
      )}
    </label>
  );
}