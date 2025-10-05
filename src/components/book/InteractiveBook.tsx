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

  const [dimensions, setDimensions] = useState({ width: 400, height: 550 });

  useEffect(() => {
    const updateDimensions = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      if (windowWidth < 480) {
        setDimensions({ width: Math.min(280, windowWidth - 40), height: 380 });
      } else if (windowWidth < 768) {
        setDimensions({ width: Math.min(350, windowWidth - 60), height: 450 });
      } else if (windowWidth < 1024) {
        setDimensions({ width: 400, height: 550 });
      } else {
        setDimensions({ width: 500, height: 650 });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="relative" role="application" aria-label="Interactive Book">
        <HTMLFlipBook
          ref={flipBookRef}
          width={dimensions.width}
          height={dimensions.height}
          minWidth={250}
          minHeight={300}
          maxWidth={600}
          maxHeight={800}
          size="stretch"
          showCover={true}
          flippingTime={1000}
          usePortrait={true}
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
          <p className="text-sm text-white/80 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full">
            Page {currentPage + 1} of {bookData.pages.length + 1}
          </p>
          <div className="mt-4 flex gap-2 justify-center">
            <button
              onClick={() => flipBookRef.current?.pageFlip().flipPrev()}
              disabled={currentPage === 0}
              className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg disabled:opacity-50 hover:bg-white/20 transition-colors"
              aria-label="Previous page"
            >
              ← Previous
            </button>
            <button
              onClick={() => flipBookRef.current?.pageFlip().flipNext()}
              disabled={currentPage >= bookData.pages.length}
              className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg disabled:opacity-50 hover:bg-white/20 transition-colors"
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
          border-radius: 4px;
          overflow: hidden;
        }
        
        .flip-book {
          filter: drop-shadow(0 10px 25px rgba(0,0,0,0.3));
        }
      `}</style>
    </div>
  );
};

export default InteractiveBook;