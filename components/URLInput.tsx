"use client"

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Minus, X } from 'lucide-react';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import Image from 'next/image';

interface URLInputProps {
  urls: string[];
  onChange: (urls: string[]) => void;
  disabled?: boolean;
}

const URLInput: React.FC<URLInputProps> = ({ urls, onChange, disabled }) => {
  const [thumbnails, setThumbnails] = useState<{[key: string]: string}>({});

  useEffect(() => {
    // Update thumbnails when URLs change
    const newThumbnails: {[key: string]: string} = {};
    urls.forEach(url => {
      if (validateUrl(url)) {
        const videoId = extractVideoId(url);
        if (videoId) {
          newThumbnails[url] = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
        }
      }
    });
    setThumbnails(newThumbnails);
  }, [urls]);

  const extractVideoId = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
        return urlObj.searchParams.get('v');
      } else if (urlObj.hostname === 'youtu.be') {
        return urlObj.pathname.slice(1);
      }
    } catch {
      return null;
    }
    return null;
  };

  const addURL = () => {
    onChange([...urls, '']);
  };

  const removeURL = (index: number) => {
    const newUrls = urls.filter((_, i) => i !== index);
    onChange(newUrls.length ? newUrls : ['']);
  };

  const updateURL = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    onChange(newUrls);
  };

  const validateUrl = (url: string) => {
    if (!url) return false;
    try {
      const urlObj = new URL(url);
      return urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com' || urlObj.hostname === 'youtu.be';
    } catch {
      return false;
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="w-full space-y-4">
        {urls.map((url, index) => {
          const isValid = validateUrl(url);
          const hasThumbnail = thumbnails[url];
          
          return (
            <div key={index} className="w-full">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-grow min-w-0 relative">
                  <Input
                    type="url"
                    value={url}
                    onChange={(e) => updateURL(index, e.target.value)}
                    placeholder="Enter YouTube URL"
                    disabled={disabled}
                    className="w-full pr-24 transition-all duration-200"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-sm text-muted-foreground">
                      URL {index + 1}
                    </span>
                  </div>
                </div>
                
                <Badge 
                  variant={isValid ? "secondary" : "destructive"} 
                  className="shrink-0 whitespace-nowrap"
                >
                  {isValid ? "Valid" : "Invalid"}
                </Badge>
                
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  onClick={() => removeURL(index)}
                  disabled={urls.length === 1 || disabled}
                  className="shrink-0 transition-all duration-200 hover:border-red-500/50 hover:text-red-500"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
              
              {hasThumbnail && (
                <div className="relative rounded-md overflow-hidden bg-slate-950/20 mt-1 mb-3">
                  <div className="flex items-center">
                    <div className="relative w-[160px] h-[90px] flex-shrink-0">
                      <Image
                        src={thumbnails[url]}
                        alt="Video thumbnail"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-3 flex-grow overflow-hidden">
                      <p className="text-sm font-medium truncate text-foreground/90">
                        {url.replace(/^https?:\/\/(www\.)?youtube\.com\/watch\?v=|^https?:\/\/youtu\.be\//, 'YouTube: ')}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {url}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addURL}
        disabled={disabled}
        className="w-full mt-2 border-dashed border-slate-800/40 bg-background/95 hover:border-indigo-500/50 hover:text-indigo-500 transition-all duration-200"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Another URL
      </Button>
    </div>
  );
};

export default URLInput;

