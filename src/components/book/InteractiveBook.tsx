"use client";
import React, { useRef, useEffect, useState } from 'react';
import HTMLFlipBook from 'react-pageflip';
import Image from 'next/image';

interface ImagePage {
  imgUrl: string;
  alt: string;
}

interface VideoPage {
  videoUrl: string;
}

type Page = ImagePage | VideoPage;

interface BookData {
  coverUrl: string;
  pages: Page[];
}

interface InteractiveBookProps {
  bookData: BookData;
}

const InteractiveBook: React.FC<InteractiveBookProps> = ({ bookData }) => {
  const flipBookRef = useRef<any>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const videoRefs = useRef<{ [key: number]: HTMLIFrameElement }>({});

  const isImagePage = (page: Page): page is ImagePage => {
    return 'imgUrl' in page;
  };

  const isVideoPage = (page: Page): page is VideoPage => {
    return 'videoUrl' in page;
  };

  const convertYouTubeToEmbed = (url: string): string => {
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (videoIdMatch) {
      return `https://www.youtube.com/embed/${videoIdMatch[1]}?enablejsapi=1`;
    }
    return url;
  };

  const pauseAllVideos = () => {
    Object.values(videoRefs.current).forEach((iframe) => {
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      }
    });
  };

  const onFlip = (e: any) => {
    pauseAllVideos();
    setCurrentPage(e.data);
  };

  const renderPageContent = (page: Page, pageIndex: number) => {
    if (isImagePage(page)) {
      return (
        <div className="h-full w-full relative">
          <Image
            src={page.imgUrl}
            alt={page.alt}
            fill
            className="object-cover"
            priority={pageIndex <= 1}
            sizes="(max-width: 480px) 280px, (max-width: 768px) 380px, 550px"
          />
        </div>
      );
    } else {
      return (
        <div className="h-full w-full flex items-center justify-center p-4">
          <iframe
            ref={(el) => {
              if (el) videoRefs.current[pageIndex] = el;
            }}
            src={convertYouTubeToEmbed(page.videoUrl)}
            className="w-full h-full max-w-full max-h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={`Video page ${pageIndex}`}
          />
        </div>
      );
    }
  };

  const [dimensions, setDimensions] = useState({ width: 800, height: 1000 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateDimensions = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      // Maintain a 4:5 aspect ratio (width:height) to better accommodate tall images
      if (windowWidth < 768) {
        // Mobile devices - single page view
        setIsMobile(true);
        if (windowWidth < 480) {
          // Very small screens (phones in portrait) - ensure book fits with padding
          const width = Math.min(280, windowWidth - 32);
          setDimensions({ width, height: Math.floor(width * 1.3) });
        } else {
          // Small screens (phones in landscape, small tablets)
          const width = Math.min(380, windowWidth - 48);
          setDimensions({ width, height: Math.floor(width * 1.25) });
        }
      } else {
        // Desktop devices - two page spread
        setIsMobile(false);
        if (windowWidth < 1024) {
          setDimensions({ width: 550, height: 688 });
        } else if (windowWidth < 1400) {
          setDimensions({ width: 800, height: 1000 });
        } else {
          setDimensions({ width: 1000, height: 1250 });
        }
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen p-2 sm:p-4 w-full max-w-full overflow-hidden">
      <div className="relative w-full max-w-full flex justify-center mb-4 sm:mb-6" role="application" aria-label="Interactive Book">
        <HTMLFlipBook
          ref={flipBookRef}
          width={dimensions.width}
          height={dimensions.height}
          minWidth={300}
          minHeight={400}
          maxWidth={1200}
          maxHeight={1500}
          size="stretch"
          showCover={true}
          flippingTime={isMobile ? 100 : 1000}
          usePortrait={isMobile}
          startZIndex={0}
          autoSize={false}
          maxShadowOpacity={isMobile ? 0 : 0.5}
          showPageCorners={!isMobile}
          disableFlipByClick={false}
          style={{}}
          startPage={0}
          drawShadow={!isMobile}
          className="flip-book"
          useMouseEvents={true}
          swipeDistance={30}
          clickEventForward={true}
          onFlip={onFlip}
          onChangeOrientation={() => {}}
          onChangeState={() => {}}
          onInit={() => {}}
          onUpdate={() => {}}
        >
          {/* Cover page - will be displayed as single page */}
          <div className="page cover-page">
            {renderPageContent({ imgUrl: bookData.coverUrl, alt: 'Book Cover' }, -1)}
          </div>
          {/* Content pages */}
          {bookData.pages.map((page, index) => (
            <div key={index} className="page">
              {renderPageContent(page, index)}
            </div>
          ))}
        </HTMLFlipBook>
      </div>
      
      <div className="w-full text-center">
        <p className="text-xs sm:text-sm text-gray-300 bg-blue-900/30 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full inline-block mb-3 sm:mb-4">
          Page {currentPage + 1} of {bookData.pages.length + 1}
        </p>
        <div className="flex gap-2 justify-center flex-wrap">
          <button
            onClick={() => flipBookRef.current?.pageFlip().flipPrev()}
            disabled={currentPage === 0}
            className="px-4 py-2 sm:px-6 sm:py-3 bg-blue-900 text-white rounded-lg disabled:opacity-50 disabled:bg-gray-500 hover:bg-blue-950 transition-colors text-sm sm:text-base font-medium min-w-[100px] sm:min-w-[120px]"
            aria-label="Previous page"
          >
            ← Previous
          </button>
          <button
            onClick={() => flipBookRef.current?.pageFlip().flipNext()}
            disabled={currentPage >= bookData.pages.length}
            className="px-4 py-2 sm:px-6 sm:py-3 bg-blue-900 text-white rounded-lg disabled:opacity-50 disabled:bg-gray-500 hover:bg-blue-950 transition-colors text-sm sm:text-base font-medium min-w-[100px] sm:min-w-[120px]"
            aria-label="Next page"
          >
            Next →
          </button>
        </div>
      </div>

      <style jsx>{`
        .page {
          background: white;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          overflow: hidden;
        }
        
        .cover-page {
          background: white;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          overflow: hidden;
        }
        
        .flip-book {
          filter: drop-shadow(0 10px 25px rgba(0,0,0,0.2));
        }
      `}</style>
    </div>
  );
};

export default InteractiveBook;