"use client"

import React from 'react'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Transcript {
  videoId: string;
  title?: string;
  url: string;
  language: string;
  lines: {
    timestamp: string;
    text: string;
  }[];
}

interface TranscriptDisplayProps {
  transcripts: Transcript[];
}

export default function TranscriptDisplay({ transcripts }: TranscriptDisplayProps) {
  if (!transcripts || transcripts.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">No transcripts available</p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      {transcripts.map((transcript, index) => (
        <div key={index} className="mb-8 last:mb-0">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">
              Video {index + 1}: {transcript.url} 
              {transcript.language && <span className="text-sm text-muted-foreground ml-2">(Language: {transcript.language})</span>}
            </h2>
          </div>

          <ScrollArea className="h-[400px] rounded-md border p-4">
            <div className="space-y-1">
              {transcript.lines.map((line, lineIndex) => (
                <div key={lineIndex} className="flex">
                  <span className="text-xs font-mono text-muted-foreground w-20 shrink-0">[{line.timestamp}]</span>
                  <span>{line.text}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      ))}
    </Card>
  )
} 