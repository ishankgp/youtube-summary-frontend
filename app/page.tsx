"use client"

import { useState } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import SummaryOutput from '@/components/SummaryOutput'
import TranscriptDisplay from '@/components/TranscriptDisplay'

export default function Home() {
  const [urls, setUrls] = useState<string[]>([''])
  const [transcripts, setTranscripts] = useState<any[]>([])
  const [summary, setSummary] = useState('')
  const [prompt, setPrompt] = useState('Summarize the main points of the video')
  const [isProcessing, setIsProcessing] = useState(false)
  const [validationStatus, setValidationStatus] = useState<Record<number, 'valid' | 'invalid' | 'validating' | null>>({
    0: null
  })
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...urls]
    newUrls[index] = value
    setUrls(newUrls)
    
    // Reset validation for this URL
    const newValidationStatus = { ...validationStatus }
    newValidationStatus[index] = null
    setValidationStatus(newValidationStatus)
    
    // Clear any error messages
    setErrorMessage(null)
  }

  const addAnotherUrl = () => {
    setUrls([...urls, ''])
    setValidationStatus({
      ...validationStatus,
      [urls.length]: null
    })
  }

  const removeUrl = (index: number) => {
    const newUrls = urls.filter((_, i) => i !== index)
    setUrls(newUrls)
    
    // Clean up validation status
    const newValidationStatus = { ...validationStatus }
    delete newValidationStatus[index]
    // Reindex keys
    Object.keys(newValidationStatus).forEach((key) => {
      const numKey = parseInt(key)
      if (numKey > index) {
        newValidationStatus[numKey - 1] = newValidationStatus[numKey]
        delete newValidationStatus[numKey]
      }
    })
    
    setValidationStatus(newValidationStatus)
  }

  const validateUrl = async (url: string, index: number) => {
    if (!url) return false
    
    setValidationStatus(prev => ({
      ...prev,
      [index]: 'validating'
    }))
    
    try {
      // Try the first endpoint format
      try {
        const response = await axios.post('/api/validate-url', { url })
        setValidationStatus(prev => ({
          ...prev,
          [index]: response.data.valid ? 'valid' : 'invalid'
        }))
        return response.data.valid
      } catch (error: any) {
        if (error.response?.status === 404) {
          // If first endpoint not found, try alternative endpoint
          try {
            const response = await axios.post('/api/validate', { url })
            setValidationStatus(prev => ({
              ...prev,
              [index]: response.data.valid ? 'valid' : 'invalid'
            }))
            return response.data.valid
          } catch (secondError: any) {
            // If both attempts fail, try a direct validation without API
            // Simple YouTube URL validation
            const isValidYoutubeUrl = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/).+$/.test(url);
            setValidationStatus(prev => ({
              ...prev,
              [index]: isValidYoutubeUrl ? 'valid' : 'invalid'
            }))
            return isValidYoutubeUrl;
          }
        } else {
          throw error; // Re-throw if it's not a 404
        }
      }
    } catch (error: any) {
      console.error('Error validating URL:', error)
      setErrorMessage(`API Error: ${error.response?.data?.message || error.message || 'Failed to validate URL'}`)
      setValidationStatus(prev => ({
        ...prev,
        [index]: 'invalid'
      }))
      return false
    }
  }

  const processVideos = async () => {
    setIsProcessing(true)
    setErrorMessage(null)
    
    try {
      // First validate all URLs
      const validUrls = urls.filter(url => url.trim())
      if (validUrls.length === 0) {
        setErrorMessage("Please enter at least one YouTube URL")
        setIsProcessing(false)
        return
      }
      
      // Client-side validation as a quick check
      const isValidYoutubeUrl = (url: string) => {
        return /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/).+$/.test(url);
      };
      
      const invalidUrls = validUrls.filter(url => !isValidYoutubeUrl(url));
      if (invalidUrls.length > 0) {
        setErrorMessage(`Some URLs don't appear to be valid YouTube URLs. Please check and try again.`);
        setIsProcessing(false);
        return;
      }
      
      console.log("Fetching transcripts for URLs:", validUrls);
      
      // Step 1: Fetch transcripts using the correct endpoint
      const transcriptsResponse = await axios.post('/api/transcripts', {
        urls: validUrls,
        preferred_language: "auto"
      });
      
      console.log("Transcripts response:", transcriptsResponse.data);
      
      if (!transcriptsResponse.data.transcripts) {
        throw new Error("No transcripts returned from API");
      }
      
      // Prepare transcripts for summarization
      const transcriptsMap: Record<string, string> = {};
      Object.entries(transcriptsResponse.data.transcripts).forEach(([url, data]: [string, any]) => {
        transcriptsMap[url] = data.transcript;
      });
      
      // Store the transcript data for display
      const transcriptsList = Object.entries(transcriptsResponse.data.transcripts).map(([url, data]: [string, any]) => {
        return {
          url,
          videoId: url.includes('v=') ? url.split('v=')[1] : url,
          language: data.language,
          lines: data.transcript.split('\n').map((line: string) => {
            const match = line.match(/\[(.*?)\] (.*)/);
            return match ? { timestamp: match[1], text: match[2] } : { timestamp: "", text: line };
          })
        };
      });
      
      setTranscripts(transcriptsList);
      
      // Step 2: Generate summary
      console.log("Generating summary with transcripts");
      const summaryResponse = await axios.post('/api/summarize', {
        transcripts: transcriptsMap,
        prompt: prompt,
        language: "en"
      });
      
      console.log("Summary response:", summaryResponse.data);
      
      if (summaryResponse.data.summary) {
        setSummary(summaryResponse.data.summary);
      } else {
        throw new Error("No summary returned from API");
      }
      
    } catch (error: any) {
      console.error('Error processing videos:', error);
      let errorMessage = 'Failed to process videos. Please try again.';
      
      if (error.response) {
        console.log('Error response data:', error.response.data);
        console.log('Error response status:', error.response.status);
        errorMessage = `API Error (${error.response.status}): ${error.response.data?.detail || error.response.data?.message || errorMessage}`;
      } else if (error.request) {
        console.log('Error request:', error.request);
        errorMessage = 'No response received from API. Please check your connection.';
      } else {
        console.log('Error message:', error.message);
        errorMessage = `Error: ${error.message}`;
      }
      
      setErrorMessage(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }

  const handleRefineSummary = async (feedback: string) => {
    setIsProcessing(true);
    try {
      console.log("Refining summary with feedback:", feedback);
      const response = await axios.post('/api/refine', {
        summary: summary,
        feedback: feedback
      });
      
      console.log("Refinement response:", response.data);
      
      if (response.data && response.data.summary) {
        setSummary(response.data.summary);
        return Promise.resolve();
      } else {
        throw new Error("Invalid response from refinement API");
      }
    } catch (error: any) {
      console.error('Error refining summary:', error);
      let errorMessage = 'Failed to refine summary. Please try again.';
      
      if (error.response) {
        console.log('Error response data:', error.response.data);
        console.log('Error response status:', error.response.status);
        errorMessage = `API Error (${error.response.status}): ${error.response.data?.detail || error.response.data?.message || errorMessage}`;
      } else if (error.request) {
        errorMessage = 'No response received from API. Please check your connection.';
      } else {
        errorMessage = `Error: ${error.message}`;
      }
      
      setErrorMessage(errorMessage);
      return Promise.reject(error);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <main className="container py-10 max-w-5xl">
      <Card className="p-6">
        <h1 className="text-2xl font-bold text-purple-600 mb-1">YouTube Transcript Processor</h1>
        <p className="text-muted-foreground mb-6">Enter YouTube URLs to process and summarize transcripts</p>
        
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
            {errorMessage}
          </div>
        )}
        
        <div className="space-y-4">
          {urls.map((url, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => handleUrlChange(index, e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
                <span className="absolute right-3 top-2 text-sm text-muted-foreground">
                  URL {index + 1}
                </span>
              </div>
              
              {/* Validation indicator */}
              <div className="w-20 text-right">
                {validationStatus[index] === 'validating' && (
                  <span className="text-yellow-500">Checking...</span>
                )}
                {validationStatus[index] === 'valid' && (
                  <span className="text-green-500">Valid</span>
                )}
                {validationStatus[index] === 'invalid' && (
                  <span className="text-red-500">Invalid</span>
                )}
              </div>
              
              {/* Remove button for all but the first URL */}
              {index > 0 && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => removeUrl(index)}
                  className="hover:bg-red-50 hover:text-red-500"
                >
                  —
                </Button>
              )}
            </div>
          ))}
          
          <div className="flex justify-center border border-dashed rounded-md py-3 cursor-pointer hover:bg-slate-50 transition-colors"
               onClick={addAnotherUrl}>
            <span className="flex items-center gap-2 text-muted-foreground">
              <span>+</span> Add Another URL
            </span>
          </div>
        </div>
        
        <Button
          className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white py-6 flex items-center justify-center gap-2"
          onClick={processVideos}
          disabled={urls.every(url => !url.trim())}
          isLoading={isProcessing}
        >
          <span className="flex items-center gap-2">
            Process Videos
          </span>
        </Button>
      </Card>
      
      {(transcripts.length > 0 || summary) && (
        <div className="mt-8">
          <Tabs defaultValue="transcript" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
            </TabsList>
            
            <TabsContent value="transcript" className="mt-4">
              <TranscriptDisplay transcripts={transcripts} />
            </TabsContent>
            
            <TabsContent value="summary" className="mt-4">
              <SummaryOutput
                summary={summary}
                prompt={prompt}
                onRefine={handleRefineSummary}
                onPromptChange={setPrompt}
                isLoading={isProcessing}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </main>
  )
} 