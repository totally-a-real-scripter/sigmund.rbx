import { useState } from "react";
import { Button } from "@/components/ui/button";

interface DownloadButtonProps {
  version?: string;
  onError: (message: string) => void;
  disabled?: boolean;
}

export function DownloadButton({ version, onError, disabled }: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (isDownloading || !version) return;

    setIsDownloading(true);

    try {
      // Open download URL
      const downloadUrl = `http://setup.rbxcdn.com/mac/${version}-RobloxPlayer.zip`;
      window.open(downloadUrl, '_blank');

      // Reset after 3 seconds
      setTimeout(() => {
        setIsDownloading(false);
          }, 3000);

    } catch (error) {
      onError('Failed to initiate download. Please try again.');
      setIsDownloading(false);
      }
  };

  return (
    <div className="space-y-4">
      <Button 
        onClick={handleDownload}
        disabled={disabled || isDownloading}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 glow-effect download-progress flex items-center justify-center space-x-3"
        data-testid="button-download"
      >
        {isDownloading ? (
          <>
            <div className="animate-spin w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"></div>
            <span>Preparing Download...</span>
          </>
        ) : (
          <>
⬇️
            <span>Download Now</span>
          </>
        )}
      </Button>
    </div>
  );
}
