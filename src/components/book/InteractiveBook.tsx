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
            sizes="(max-width: 768px) 350px, 500px"
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

  useEffect(() => {
    const updateDimensions = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      // Maintain a 4:5 aspect ratio (width:height) to better accommodate tall images
      if (windowWidth < 768) {
        const width = Math.min(600, windowWidth - 40);
        setDimensions({ width, height: Math.floor(width * 1.25) });
      } else if (windowWidth < 1024) {
        setDimensions({ width: 700, height: 875 });
      } else if (windowWidth < 1400) {
        setDimensions({ width: 800, height: 1000 });
      } else {
        setDimensions({ width: 1000, height: 1250 });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen p-4">
      <div className="relative" role="application" aria-label="Interactive Book">
        <HTMLFlipBook
          ref={flipBookRef}
          width={dimensions.width}
          height={dimensions.height}
          minWidth={600}
          minHeight={750}
          maxWidth={1200}
          maxHeight={1500}
          size="stretch"
          showCover={false}
          flippingTime={1000}
          usePortrait={false}
          startZIndex={0}
          autoSize={false}
          maxShadowOpacity={0.5}
          showPageCorners={true}
          disableFlipByClick={false}
          style={{}}
          startPage={0}
          drawShadow={true}
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
          <div className="page">
            {renderPageContent({ imgUrl: bookData.coverUrl, alt: 'Book Cover' }, -1)}
          </div>
          {bookData.pages.map((page, index) => (
            <div key={index} className="page">
              {renderPageContent(page, index)}
            </div>
          ))}
        </HTMLFlipBook>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-full">
            Page {Math.floor(currentPage / 2) + 1} of {Math.ceil((bookData.pages.length + 1) / 2)}
          </p>
          <div className="mt-4 flex gap-2 justify-center">
            <button
              onClick={() => flipBookRef.current?.pageFlip().flipPrev()}
              disabled={currentPage === 0}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition-colors"
              aria-label="Previous page"
            >
              ← Previous
            </button>
            <button
              onClick={() => flipBookRef.current?.pageFlip().flipNext()}
              disabled={currentPage >= bookData.pages.length}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition-colors"
              aria-label="Next page"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .page {
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